"""
DocTech AI Microservice — Multi-Agent Orchestrator
====================================================
This is the master entry point. Every request flows through:

  User Input → Orchestrator → Update State → Emergency Detector
  → Context Summarizer → Agent (Diagnostic / Vision / Chat)
  → KB Validation → Response Formatter → Frontend
"""

from fastapi import FastAPI, File, UploadFile  # type: ignore[import]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import]
from pydantic import BaseModel, Field  # type: ignore[import]
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv  # type: ignore[import]

load_dotenv()

app = FastAPI(
    title="DocTech AI Microservice",
    description="Multi-Agent Medical Triage System with Safety Pipelines",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# Schemas
# ══════════════════════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    role: str
    content: str

class OrchestrateRequest(BaseModel):
    """Unified request accepted by the orchestrator."""
    message: str
    context: List[ChatMessage] = Field(default_factory=list)
    patient_state: Dict[str, Any] = Field(default_factory=dict)
    has_file: bool = False
    # If structured triage data is sent (after 6-step flow), set this flag
    is_structured_triage: bool = False


# Kept for backward compatibility with existing /api/ai/chat callers
class LegacyChatRequest(BaseModel):
    message: str
    context: List[ChatMessage] = Field(default_factory=list)
    patient: Optional[Dict[str, Any]] = None

class LegacyChatResponse(BaseModel):
    reply: str


# ══════════════════════════════════════════════════════════════════════════════
# Health check
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/")
def health() -> Dict[str, Any]:
    return {
        "status": "DocTech AI Service running ✅",
        "version": "2.0.0",
        "agents": ["orchestrator", "diagnostic", "conversational", "vision"],
    }


# ══════════════════════════════════════════════════════════════════════════════
# ORCHESTRATOR — The master endpoint
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/ai/orchestrate")
async def orchestrate(req: OrchestrateRequest) -> Dict[str, Any]:
    """
    The single unified endpoint that the Node.js backend calls.
    Routes through the full safety pipeline before reaching any agent.
    """
    from state_manager import update_state, extract_state_from_message, create_empty_state
    from safety import check_emergency
    from summarizer import summarize_context, build_llm_context

    # ── 1. Update Patient State ───────────────────────────────────
    state = req.patient_state if req.patient_state else create_empty_state()

    # Try to extract additional state info from the message text
    extracted = extract_state_from_message(req.message)
    if extracted:
        state = update_state(state, extracted)

    # ── 2. Emergency Detector (LLM bypass) ────────────────────────
    emergency = check_emergency(req.message, state)
    if emergency:
        from response_formatter import format_response
        return format_response(
            explanation=emergency["message"],
            urgency="CRITICAL",
            severity="Critical",
            confidence="high",
            is_emergency=True,
        )

    # ── 3. Context Summarizer ─────────────────────────────────────
    context_dicts = [{"role": m.role, "content": m.content} for m in req.context]
    context_summary = summarize_context(context_dicts, state)
    trimmed_context = build_llm_context(context_dicts, state)

    # ── 4. Route to the correct Agent ─────────────────────────────

    # Route A: Structured triage data → Diagnostic Agent
    if req.is_structured_triage or _looks_like_triage_data(state):
        from diagnostic_agent import run_diagnostic
        result = await run_diagnostic(state, context_summary)
        return result

    # Route B: File attached → Vision Agent
    if req.has_file:
        # Vision agent will be called via the separate /api/ai/image/analyze endpoint
        # Here we simply acknowledge
        from response_formatter import format_response
        return format_response(
            explanation="I've received your file. Please use the upload feature to send the image directly for analysis.",
            confidence="moderate",
        )

    # Route C: Free-form chat → Conversational Agent
    from conversational_agent import run_conversational
    result = await run_conversational(
        message=req.message,
        context=trimmed_context,
        patient_state=state,
        context_summary=context_summary,
    )
    return result


def _looks_like_triage_data(state: Dict[str, Any]) -> bool:
    """
    Heuristic: if the patient state has at least symptoms + severity filled,
    treat it as structured triage data.
    """
    has_symptoms = bool(state.get("symptoms"))
    has_severity = bool(state.get("severity"))
    return has_symptoms and has_severity


# ══════════════════════════════════════════════════════════════════════════════
# LEGACY ENDPOINTS (backward compatibility)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/ai/chat", response_model=LegacyChatResponse)
async def legacy_chat(req: LegacyChatRequest) -> LegacyChatResponse:
    """Legacy chat endpoint — proxies through the orchestrator."""
    result = await orchestrate(OrchestrateRequest(
        message=req.message,
        context=req.context,
        patient_state=req.patient.get("state", {}) if req.patient else {},
    ))
    return LegacyChatResponse(reply=result.get("explanation", result.get("reply", "")))


@app.post("/api/ai/analyze")
async def legacy_analyze(req: Dict[str, Any]) -> Dict[str, Any]:
    """Legacy analyze endpoint — proxies through the diagnostic agent."""
    from diagnostic_agent import run_diagnostic
    state = {
        "symptoms": req.get("symptoms", []),
        "duration": req.get("duration", ""),
        "severity": str(req.get("severity", "")),
        "painType": req.get("pain_type", ""),
        "associatedSymptoms": req.get("associated_symptoms", []),
        "medicalHistory": req.get("medical_history", {}).get("chronic_diseases", []) if isinstance(req.get("medical_history"), dict) else [],
    }
    return await run_diagnostic(state)


# ══════════════════════════════════════════════════════════════════════════════
# VISION ENDPOINT (file upload — stays separate because of multipart)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/ai/image/analyze")
async def analyze_image(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Accept a medical image and route through the Vision Agent."""
    from vision_agent import run_vision
    try:
        file_bytes = await file.read()
        return await run_vision(file_bytes, file.filename or "unknown.jpg")
    except Exception as e:
        from response_formatter import format_response
        return format_response(
            explanation=f"Failed to process the uploaded file: {str(e)}. Please try again or share the report with your doctor.",
            confidence="low",
        )

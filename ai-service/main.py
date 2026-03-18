from fastapi import FastAPI, File, UploadFile  # type: ignore[import]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import]
from pydantic import BaseModel, Field  # type: ignore[import]
# List, Optional, Dict imported from typing for Python 3.8 compatibility
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv  # type: ignore[import]

load_dotenv()

app = FastAPI(
    title="DocTech AI Microservice",
    description="AI-powered medical chatbot and symptom analysis service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────
class PatientContext(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    # Fix 1: use Field(default_factory=list) — avoids mutable default argument bug
    chronicDiseases: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)

class ChatMessage(BaseModel):
    """Validates each message dict has required role/content keys."""
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    # Fix 2: typed as List[ChatMessage] so invalid dicts are rejected early
    context: List[ChatMessage] = Field(default_factory=list)
    patient: Optional[PatientContext] = None

class ChatResponse(BaseModel):
    reply: str

class MedicalHistory(BaseModel):
    chronic_diseases: List[str] = Field(default_factory=list)
    family_history: Optional[str] = None
    medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)

class AnalyzeRequest(BaseModel):
    symptoms: List[str] = Field(default_factory=list)
    duration: Optional[str] = None
    pain_type: Optional[str] = None
    severity: Optional[int] = None
    location: List[str] = Field(default_factory=list)
    associated_symptoms: List[str] = Field(default_factory=list)
    medical_history: Optional[MedicalHistory] = None

class Condition(BaseModel):
    name: str
    probability: str  # e.g. "High", "Medium", "Low"
    description: str

class AnalyzeResponse(BaseModel):
    probable_conditions: List[Condition] = Field(default_factory=list)
    severity_level: str
    recommended_departments: List[str] = Field(default_factory=list)
    triage_advice: str
    risk_score: int = 0
    urgency: str = "Low"  # Low | Moderate | High

# ── Rule-based fallback ───────────────────────────────────────
# Fix 3: defined BEFORE it is referenced by the chat() endpoint
def rule_based_response(message: str) -> str:
    msg = message.lower()
    checks = [
        (["fever", "temperature"],                  "🌡️ Fever can have many causes. Stay hydrated, rest, and consider paracetamol if above 38°C. See a doctor if it persists beyond 3 days or exceeds 39.5°C."),
        (["headache", "migraine", "head pain"],     "🧠 Headaches are common. Try resting in a quiet, dark room and drink water. If severe, sudden (thunderclap), or with vision changes, seek urgent care."),
        (["chest pain", "heart", "palpitation"],    "❤️ Chest pain must never be ignored. If accompanied by breathlessness, arm pain, or sweating — call emergency services immediately."),
        (["breathlessness", "shortness of breath"], "🫁 Difficulty breathing can be serious. Sit upright, stay calm, and seek emergency care if it does not improve within a few minutes."),
        (["cough", "cold", "flu", "sore throat"],  "🤧 Rest, stay hydrated, and try honey-ginger tea. See a doctor if the cough persists beyond 2 weeks or you experience difficulty breathing."),
        (["sugar", "diabetes", "insulin"],          "🩺 Diabetes needs careful diet, exercise, and medication. Monitor blood sugar regularly and consult your endocrinologist for adjustments."),
        (["bp", "blood pressure", "hypertension"],  "💊 High blood pressure often has no symptoms. Reduce salt, exercise regularly, and take prescribed medications consistently."),
        (["rash", "skin", "itch"],                  "🔬 Skin rashes can be caused by allergies, infections, or conditions like eczema. Avoid scratching, and consult a dermatologist if it spreads."),
        (["stomach", "abdomen", "nausea", "vomit"], "🤢 Nausea and stomach pain can stem from infections, food issues, or other causes. Stay hydrated. See a doctor if severe or lasting > 48 hours."),
    ]
    for keywords, response in checks:
        if any(w in msg for w in keywords):
            return response
    return (
        f"Thank you for reaching out. You mentioned: '{message}'. "
        "While I can offer general health guidance, please consult a qualified doctor "
        "for an accurate diagnosis and personalized treatment. "
        "Is there a specific symptom you'd like more information about?"
    )

# ── Health check ──────────────────────────────────────────────
@app.get("/")
def health() -> Dict[str, Any]:
    return {"status": "DocTech AI Service running ✅", "version": "1.0.0"}

# ── AI Chat endpoint ──────────────────────────────────────────
@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """
    Primary chat endpoint. Tries OpenAI first, falls back to rule-based analysis.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")

    # Fix 4: explicitly reject placeholder keys like "your_openai_key_here"
    use_openai = bool(api_key) and not api_key.startswith("your_")

    if use_openai:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)

            # Build patient context string for system prompt
            patient_info = ""
            if req.patient:
                p = req.patient
                parts: List[str] = []
                if p.age is not None:              parts.append(f"Age: {p.age}")
                if p.gender is not None:           parts.append(f"Gender: {p.gender}")
                if p.chronicDiseases:              parts.append(f"Chronic conditions: {', '.join(p.chronicDiseases)}")
                if p.allergies:                    parts.append(f"Allergies: {', '.join(p.allergies)}")
                if parts:
                    patient_info = "\nPatient profile: " + " | ".join(parts)

            system_prompt = (
                "You are DocTech, an empathetic AI health assistant. "
                "Give clear, concise, and medically accurate health guidance. "
                "Always remind users that you are not a substitute for a real doctor. "
                "Use plain language and avoid jargon."
                + patient_info
            )

            history_dicts = [{"role": msg.role, "content": msg.content} for msg in list(req.context)[-8:]]

            messages = [{"role": "system", "content": system_prompt}]
            messages += history_dicts
            messages.append({"role": "user", "content": req.message})

            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=400,
                temperature=0.7,
            )
            reply = response.choices[0].message.content or ""
            return ChatResponse(reply=reply)

        except Exception as e:
            # Fix 6: log error clearly then fall through to fallback (don't silently swallow)
            print(f"[OpenAI Error] {type(e).__name__}: {e}. Using rule-based fallback.")

    # Fallback rule-based response
    return ChatResponse(reply=rule_based_response(req.message))

# ── AI Analyze Symptom endpoint (Structured JSON) ─────────────
@app.post("/api/ai/analyze", response_model=AnalyzeResponse)
async def analyze_symptoms(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Dedicated endpoint for deep symptom analysis.
    Always runs the deterministic Triage Engine first for risk_score + urgency.
    Optionally enriches with an AI call for probable_conditions.
    """
    # ── Step 1: Always run deterministic triage engine ─────────
    from triage import calculate_risk_score, get_risk_level, get_urgency_advice, map_to_departments

    all_symptoms = list(req.symptoms) + list(req.associated_symptoms)
    risk_score = calculate_risk_score(all_symptoms, req.severity or 0)
    urgency = get_risk_level(risk_score)
    triage_advice = get_urgency_advice(urgency)
    recommended_departments = map_to_departments(all_symptoms)

    # ── Step 2: Try AI call for richer probable_conditions ──────
    api_key = os.getenv("OPENAI_API_KEY", "")
    use_openai = bool(api_key) and not api_key.startswith("your_")

    if use_openai:
        try:
            import json
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)

            system_prompt = (
                "You are an expert medical triage AI. Analyze the patient's data "
                "and respond ONLY with a raw JSON object matching this exact schema:\n"
                "{\n"
                "  \"probable_conditions\": [{\"name\": \"str\", \"probability\": \"High/Medium/Low\", \"description\": \"str\"}],\n"
                "  \"severity_level\": \"Mild/Moderate/Severe/Critical\"\n"
                "}"
            )

            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": req.model_dump_json()}
                ],
                response_format={"type": "json_object"},
                max_tokens=600,
                temperature=0.3,
            )

            reply_text = response.choices[0].message.content or "{}"
            data = json.loads(reply_text)

            return AnalyzeResponse(
                probable_conditions=[Condition(**c) for c in data.get("probable_conditions", [])],
                severity_level=data.get("severity_level", urgency),
                recommended_departments=recommended_departments,
                triage_advice=triage_advice,
                risk_score=risk_score,
                urgency=urgency,
            )

        except Exception as e:
            print(f"[OpenAI Error in analyze] {type(e).__name__}: {e}. Using triage fallback.")

    # ── Rule-based structured fallback using Triage Engine ─────
    # risk_score, urgency, triage_advice, recommended_departments already computed above
    symptom_str = " ".join(all_symptoms).lower()

    # Build basic probable_conditions from strongest matching symptom
    probable: List[Condition] = []
    if "chest pain" in symptom_str or "heart" in symptom_str:
        probable.append(Condition(name="Possible Cardiac Event", probability="High", description="Chest pain requires urgent cardiac evaluation."))
    elif "fever" in symptom_str:
        probable.append(Condition(name="Viral/Bacterial Infection", probability="High", description="Fever is most commonly caused by an infection."))
    elif "headache" in symptom_str:
        probable.append(Condition(name="Tension Headache", probability="High", description="Often caused by stress or dehydration."))
    elif "breathlessness" in symptom_str or "shortness of breath" in symptom_str:
        probable.append(Condition(name="Respiratory Issue", probability="High", description="Difficulty breathing needs prompt evaluation."))
    else:
        probable.append(Condition(name="Undetermined", probability="Unknown", description="Symptoms need further evaluation by a professional."))

    return AnalyzeResponse(
        probable_conditions=probable,
        severity_level=urgency,
        recommended_departments=recommended_departments,
        triage_advice=triage_advice,
        risk_score=risk_score,
        urgency=urgency,
    )

# ── Medical Image Analysis Endpoint ───────────────────────────
@app.post("/api/ai/image/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Accepts a medical image (X-Ray, MRI, CT) as multipart/form-data.
    Runs it through PyTorch/MONAI pipeline for findings.
    """
    from image_analysis import analyze_medical_image

    try:
        # Read the raw bytes
        file_bytes = await file.read()
        
        # Call the PyTorch engine
        result = analyze_medical_image(file_bytes, file.filename or "unknown.jpg")
        
        return result

    except Exception as e:
        return {
            "possible_findings": [],
            "confidence_score": 0.0,
            "modality_detected": "Unknown",
            "status": "error",
            "message": f"Endpoint error: {str(e)}"
        }

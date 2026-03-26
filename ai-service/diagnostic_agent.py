"""
Diagnostic Agent
================
Triggered when the frontend submits structured 6-step triage data.
Uses the deterministic Triage Engine + optional LLM enrichment,
then passes everything through the Response Formatter.
"""

from typing import List, Dict, Any
import os
import json

from triage import calculate_risk_score, get_risk_level, get_urgency_advice, map_to_departments
from response_formatter import format_response


def _get_llm_client():
    """Return an async xAI/Grok client if a valid key exists, else None."""
    grok_key = os.getenv("GROK_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    if grok_key and not grok_key.startswith("your_"):
        try:
            from openai import AsyncOpenAI  # type: ignore
            return AsyncOpenAI(
                api_key=grok_key,
                base_url="https://api.x.ai/v1",
            ), "grok-3-mini"
        except ImportError:
            pass

    if openai_key and not openai_key.startswith("your_"):
        try:
            from openai import AsyncOpenAI  # type: ignore
            return AsyncOpenAI(api_key=openai_key), "gpt-3.5-turbo"
        except ImportError:
            pass

    return None, None


async def run_diagnostic(patient_state: Dict[str, Any], context_summary: str = "") -> Dict[str, Any]:
    """
    Execute the full diagnostic pipeline:
      1. Deterministic triage scoring
      2. Optional LLM enrichment for probable_conditions
      3. Response Formatter standardization
    """
    symptoms = patient_state.get("symptoms", [])
    assoc    = patient_state.get("associatedSymptoms", [])
    severity = 0
    try:
        severity = int(patient_state.get("severity", 0))
    except (ValueError, TypeError):
        pass

    all_symptoms = list(symptoms) + list(assoc)

    # ── Step 1: Deterministic triage ──────────────────────────────
    risk_score  = calculate_risk_score(all_symptoms, severity)
    risk_level  = get_risk_level(risk_score)
    advice      = get_urgency_advice(risk_level)
    departments = map_to_departments(all_symptoms)

    # ── Step 2: Try LLM enrichment ────────────────────────────────
    conditions: List[Dict[str, str]] = []
    llm_severity = ""
    confidence = "moderate"

    client, model = _get_llm_client()
    if client:
        try:
            system_prompt = (
                "You are an expert medical triage AI. Analyze the patient's data "
                "and respond ONLY with a raw JSON object matching this exact schema:\n"
                "{\n"
                '  "probable_conditions": [{"name": "str", "probability": "High/Medium/Low", "description": "str", "confidence": "high/moderate/low"}],\n'
                '  "severity_level": "Mild/Moderate/Severe/Critical",\n'
                '  "follow_up": ["actionable suggestion 1", "suggestion 2", "suggestion 3"]\n'
                "}\n"
                "Do NOT prescribe medications or dosages. Do NOT provide a final diagnosis. "
                "Only suggest probable conditions based on symptoms."
            )

            patient_json = json.dumps(patient_state, default=str)
            user_content = patient_json
            if context_summary:
                user_content = f"[Context]: {context_summary}\n\n[Patient Data]: {patient_json}"

            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                max_tokens=600,
                temperature=0.2,
            )

            reply_text = response.choices[0].message.content or "{}"
            # Strip markdown code fences if present
            if reply_text.startswith("```"):
                reply_text = reply_text.split("\n", 1)[-1].rsplit("```", 1)[0]
            data = json.loads(reply_text)

            conditions   = data.get("probable_conditions", [])
            llm_severity = data.get("severity_level", "")
            llm_follow   = data.get("follow_up", [])

        except Exception as e:
            print(f"[Diagnostic Agent LLM Error] {type(e).__name__}: {e}. Using triage fallback.")

    # ── Step 3: Fallback conditions if LLM failed ────────────────
    if not conditions:
        symptom_str = " ".join(all_symptoms).lower()
        if "chest" in symptom_str or "heart" in symptom_str:
            conditions = [{"name": "Possible Cardiac Event", "probability": "High", "description": "Chest pain requires urgent cardiac evaluation.", "confidence": "high"}]
        elif "fever" in symptom_str:
            conditions = [{"name": "Viral/Bacterial Infection", "probability": "High", "description": "Fever is most commonly caused by an infection.", "confidence": "moderate"}]
        elif "headache" in symptom_str or "migraine" in symptom_str:
            conditions = [{"name": "Tension Headache / Migraine", "probability": "High", "description": "Commonly caused by stress, dehydration, or sleep issues.", "confidence": "moderate"}]
        elif "breathless" in symptom_str or "shortness" in symptom_str:
            conditions = [{"name": "Respiratory Issue", "probability": "High", "description": "Difficulty breathing needs prompt evaluation.", "confidence": "high"}]
        else:
            conditions = [{"name": "Undetermined Condition", "probability": "Unknown", "description": "Your symptoms require further evaluation by a professional.", "confidence": "low"}]
        confidence = "moderate"

    # ── Step 4: Format through Response Formatter ────────────────
    explanation_parts = [advice]
    if conditions:
        cond_names = ", ".join(c.get("name", "") for c in conditions[:3])
        explanation_parts.append(f"Probable conditions: {cond_names}.")
    explanation = " ".join(explanation_parts)

    result = format_response(
        conditions=conditions,
        severity=llm_severity or risk_level,
        department=departments,
        urgency=risk_level,
        explanation=explanation,
        confidence=confidence,
        follow_up=locals().get("llm_follow", []),
    )

    return result

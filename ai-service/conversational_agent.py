"""
Conversational Agent (with Guardrails)
======================================
Handles free-form follow-up chat AFTER the triage flow is complete.
Strictly bounded by medical guardrails — blocks prescriptions,
dosages, and non-medical conversations.
"""

from typing import List, Dict, Any
import os
import json

from response_formatter import format_response


# ─── Guardrails ──────────────────────────────────────────────────────────────
BLOCKED_TOPICS = [
    "code", "programming", "python", "javascript", "recipe",
    "politics", "election", "sports score", "movie", "game",
    "stock", "crypto", "bitcoin", "weather forecast",
]

PRESCRIPTION_KEYWORDS = [
    "prescribe", "dosage", "mg", "milligram", "tablet",
    "take this medicine", "medication dose",
]


def _is_off_topic(message: str) -> bool:
    """Check if the user is asking about non-medical topics."""
    msg = message.lower()
    return any(topic in msg for topic in BLOCKED_TOPICS)


def _is_prescription_request(message: str) -> bool:
    """Check if the user is asking for specific prescriptions or dosages."""
    msg = message.lower()
    return any(kw in msg for kw in PRESCRIPTION_KEYWORDS)


# ─── System Prompt ───────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are DocTech, a professional and empathetic AI health assistant.

STRICT RULES (you MUST follow these):
1. You are NOT a doctor. NEVER provide a final diagnosis.
2. NEVER prescribe medications, dosages, or specific treatment plans.
3. NEVER discuss non-medical topics (coding, politics, sports, entertainment, etc.).
4. ALWAYS remind the user to consult a licensed healthcare professional.
5. Keep responses concise (under 200 words), clear, and medically relevant.
6. Use empathetic, professional language. Avoid jargon.
7. If asked about medication, say: "I cannot prescribe medications. Please consult your doctor for treatment options."
8. If asked about a non-medical topic, say: "I can only assist with health-related questions. How can I help with your health?"

You may:
- Explain medical conditions in simple terms
- Suggest general lifestyle and prevention tips
- Recommend which type of specialist to visit
- Answer follow-up questions about a previous diagnosis
- Provide mental health resources and crisis helpline numbers

ALWAYS end with: "⚕️ This is for guidance only. Please consult a licensed doctor for proper evaluation."
"""


def _get_llm_client():
    """Return an async LLM client (Grok preferred, OpenAI fallback)."""
    grok_key = os.getenv("GROK_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    if grok_key and not grok_key.startswith("your_"):
        try:
            from openai import AsyncOpenAI  # type: ignore
            return AsyncOpenAI(api_key=grok_key, base_url="https://api.x.ai/v1"), "grok-3-mini"
        except ImportError:
            pass

    if openai_key and not openai_key.startswith("your_"):
        try:
            from openai import AsyncOpenAI  # type: ignore
            return AsyncOpenAI(api_key=openai_key), "gpt-3.5-turbo"
        except ImportError:
            pass

    return None, None


# ─── Rule-based fallback ────────────────────────────────────────────────────
def _rule_based_reply(message: str) -> str:
    """Simple keyword-matching fallback when no LLM is available."""
    msg = message.lower()
    checks = [
        (["fever", "temperature"],                  "🌡️ Fever can have many causes. Stay hydrated, rest, and consider paracetamol if above 38°C. See a doctor if it persists beyond 3 days or exceeds 39.5°C."),
        (["headache", "migraine", "head pain"],     "🧠 Headaches are common. Try resting in a quiet, dark room and drink water. If severe or sudden, seek urgent care."),
        (["chest pain", "heart", "palpitation"],    "❤️ Chest pain must never be ignored. If accompanied by breathlessness, arm pain, or sweating — call emergency services immediately."),
        (["cough", "cold", "flu", "sore throat"],   "🤧 Rest, stay hydrated, and try warm fluids. See a doctor if the cough persists beyond 2 weeks."),
        (["rash", "skin", "itch"],                  "🔬 Skin rashes can be caused by allergies or infections. Avoid scratching — consult a dermatologist if it spreads."),
        (["stomach", "abdomen", "nausea", "vomit"], "🤢 Stomach issues can stem from infections or food. Stay hydrated. See a doctor if severe or lasting > 48 hours."),
        (["anxiety", "stress", "panic", "mental"],  "🧘 Your mental health matters. Try deep breathing exercises, maintain a routine, and consider speaking with a mental health professional."),
    ]
    for keywords, response in checks:
        if any(w in msg for w in keywords):
            return response + "\n\n⚕️ This is for guidance only. Please consult a licensed doctor for proper evaluation."

    return (
        f"Thank you for your question about '{message[:80]}'. "
        "I'd recommend consulting a healthcare professional for personalized guidance. "
        "Is there a specific symptom I can help you understand better?\n\n"
        "⚕️ This is for guidance only. Please consult a licensed doctor for proper evaluation."
    )


async def run_conversational(
    message: str,
    context: List[Dict[str, str]],
    patient_state: Dict[str, Any] = None,
    context_summary: str = "",
) -> Dict[str, Any]:
    """
    Handle a free-form follow-up message.
    Returns a formatted response dict matching the standard schema.
    """

    # ── Guardrail 1: Block non-medical topics ─────────────────────
    if _is_off_topic(message):
        return format_response(
            explanation="I can only assist with health-related questions. How can I help with your health today?",
            confidence="high",
        )

    # ── Guardrail 2: Block prescription requests ──────────────────
    if _is_prescription_request(message):
        return format_response(
            explanation="I cannot prescribe medications or suggest dosages. Please consult your doctor for treatment options.",
            confidence="high",
        )

    # ── Try LLM ───────────────────────────────────────────────────
    client, model = _get_llm_client()
    if client:
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]

            # Inject patient context summary
            if context_summary:
                messages.append({"role": "system", "content": f"[Patient Context]: {context_summary}"})

            # Add recent conversation
            messages.extend(context[-8:])
            messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=400,
                temperature=0.2,
            )

            reply = response.choices[0].message.content or ""

            # Ensure disclaimer is always present
            if "⚕️" not in reply:
                reply += "\n\n⚕️ This is for guidance only. Please consult a licensed doctor for proper evaluation."

            return format_response(explanation=reply, confidence="moderate")

        except Exception as e:
            print(f"[Conversational Agent LLM Error] {type(e).__name__}: {e}. Using rule-based fallback.")

    # ── Fallback to rule-based ────────────────────────────────────
    reply = _rule_based_reply(message)
    return format_response(explanation=reply, confidence="low")

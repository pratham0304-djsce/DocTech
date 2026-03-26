"""
Emergency / Red Flag Detector
==============================
Rule-based, LLM-bypassing override layer.
If a critical combination is detected the system returns an immediate
emergency warning WITHOUT consulting any AI agent.
"""

from typing import Dict, Any, Optional, List
import re


# ─── Critical Symptom Combinations ─────────────────────────────────────────────
# Each rule has: keywords (ALL must match), and the emergency message.
CRITICAL_COMBOS: List[Dict[str, Any]] = [
    {
        "keywords": ["chest pain", "breathless"],
        "message": "⚠️ **EMERGENCY: Possible Heart Attack.** Your symptoms of chest pain with breathlessness can indicate a cardiac emergency. Call emergency services or go to the nearest ER immediately. Do NOT wait.",
    },
    {
        "keywords": ["chest pain", "arm pain"],
        "message": "⚠️ **EMERGENCY: Possible Heart Attack.** Chest pain radiating to the arm is a classic sign of a cardiac event. Call emergency services immediately.",
    },
    {
        "keywords": ["chest pain", "sweating"],
        "message": "⚠️ **EMERGENCY: Possible Heart Attack.** Chest pain with excessive sweating requires immediate emergency care. Do NOT delay — call an ambulance now.",
    },
]

# ─── Single Critical Flags (any one alone is enough) ──────────────────────────
SINGLE_FLAGS: List[Dict[str, Any]] = [
    {
        "keywords": ["unconscious", "loss of consciousness", "fainted", "collapsed", "unresponsive"],
        "message": "⚠️ **EMERGENCY: Loss of Consciousness.** This is a medical emergency. Place the person in the recovery position and call emergency services immediately.",
    },
    {
        "keywords": ["stroke", "face drooping", "slurred speech", "sudden weakness"],
        "message": "⚠️ **EMERGENCY: Possible Stroke (FAST).** Act FAST — Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Every minute matters.",
    },
    {
        "keywords": ["severe bleeding", "heavy bleeding", "won't stop bleeding", "hemorrhage"],
        "message": "⚠️ **EMERGENCY: Severe Bleeding.** Apply firm direct pressure to the wound. Elevate the limb if possible. Call emergency services immediately.",
    },
    {
        "keywords": ["anaphylaxis", "throat swelling", "can't breathe", "severe allergic"],
        "message": "⚠️ **EMERGENCY: Possible Anaphylaxis.** Use an epinephrine auto-injector if available. Call emergency services immediately. Do NOT wait for symptoms to improve.",
    },
    {
        "keywords": ["seizure", "convulsing", "fitting"],
        "message": "⚠️ **EMERGENCY: Seizure.** Clear the area around the person. Do NOT restrain them or put anything in their mouth. Call emergency services if the seizure lasts more than 5 minutes.",
    },
    {
        "keywords": ["suicide", "kill myself", "end my life", "want to die"],
        "message": "⚠️ **CRISIS: Mental Health Emergency.** Please reach out to a crisis helpline immediately. In India call iCall: 9152987821. You are not alone and help is available 24/7.",
    },
]


def _normalize(text: str) -> str:
    """Lowercase, collapse whitespace, strip punctuation for matching."""
    return re.sub(r'[^\w\s]', '', text.lower().strip())


def check_emergency(message: str, patient_state: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
    """
    Check whether a message (and optionally accumulated patient state)
    triggers a critical emergency flag.

    Returns None if safe, or a dict with:
      { "is_emergency": True, "message": "...", "urgency": "CRITICAL" }
    """
    # Combine current message with accumulated symptoms for thorough matching
    combined_text = _normalize(message)
    if patient_state:
        symptoms_text = ' '.join(patient_state.get('symptoms', []))
        assoc_text    = ' '.join(patient_state.get('associatedSymptoms', []))
        combined_text += ' ' + _normalize(symptoms_text + ' ' + assoc_text)

    # 1. Check combo rules (all keywords must be present)
    for rule in CRITICAL_COMBOS:
        if all(kw in combined_text for kw in rule["keywords"]):
            return {
                "is_emergency": True,
                "message": rule["message"],
                "urgency": "CRITICAL",
            }

    # 2. Check single critical flags (any keyword match)
    for rule in SINGLE_FLAGS:
        if any(kw in combined_text for kw in rule["keywords"]):
            return {
                "is_emergency": True,
                "message": rule["message"],
                "urgency": "CRITICAL",
            }

    return None

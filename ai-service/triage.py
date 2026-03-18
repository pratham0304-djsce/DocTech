"""
Medical Intelligence Layer — Triage Engine
==========================================
Deterministic, AI-free scoring module that runs BEFORE the AI call
to give a guaranteed safety rating and department routing.
"""

from typing import List, Dict

# ─────────────────────────────────────────────────────────────────────────────
# Symptom Severity Scores
# Higher = more urgent. Used to compute overall risk score.
# ─────────────────────────────────────────────────────────────────────────────
SYMPTOM_SCORES: Dict[str, int] = {
    # Critical (5)
    "chest pain": 5,
    "heart attack": 5,
    "stroke": 5,
    "difficulty breathing": 5,
    "loss of consciousness": 5,
    "severe bleeding": 5,
    "anaphylaxis": 5,
    # High (4)
    "breathlessness": 4,
    "shortness of breath": 4,
    "severe chest pressure": 4,
    "palpitations": 4,
    "severe abdominal pain": 4,
    "coughing blood": 4,
    # Moderate-High (3)
    "high fever": 3,
    "fever": 3,
    "vomiting blood": 3,
    "seizure": 3,
    "severe headache": 3,
    "sudden vision change": 3,
    "numbness": 3,
    "paralysis": 3,
    # Moderate (2)
    "vomiting": 2,
    "diarrhea": 2,
    "rash": 2,
    "skin rash": 2,
    "swelling": 2,
    "jaundice": 2,
    "back pain": 2,
    "joint pain": 2,
    "abdominal pain": 2,
    # Mild (1)
    "headache": 1,
    "cough": 1,
    "cold": 1,
    "sore throat": 1,
    "fatigue": 1,
    "dizziness": 1,
    "nausea": 1,
    "mild fever": 1,
    "runny nose": 1,
    "body ache": 1,
}

# ─────────────────────────────────────────────────────────────────────────────
# Risk Thresholds
# ─────────────────────────────────────────────────────────────────────────────
def get_risk_level(score: int) -> str:
    """Map a raw numeric score to a human-readable risk label."""
    if score >= 8:
        return "High"
    if score >= 4:
        return "Moderate"
    return "Low"

def get_urgency_advice(risk_level: str) -> str:
    """Return triage advice based on risk level."""
    if risk_level == "High":
        return "⚠️ HIGH RISK: Please seek emergency care immediately or call an ambulance. Do not delay."
    if risk_level == "Moderate":
        return "🟡 MODERATE RISK: Please visit a doctor as soon as possible, ideally today or tomorrow."
    return "🟢 LOW RISK: Monitor your symptoms at home. Rest, stay hydrated. See a doctor if symptoms worsen or persist beyond 2-3 days."

# ─────────────────────────────────────────────────────────────────────────────
# Department Mapping
# Deterministic routing — never relies on AI so it can't hallucinate.
# ─────────────────────────────────────────────────────────────────────────────
DEPARTMENT_MAP: Dict[str, str] = {
    # Cardiology
    "chest pain": "Cardiology",
    "heart attack": "Cardiology",
    "palpitations": "Cardiology",
    "severe chest pressure": "Cardiology",
    # Pulmonology
    "breathlessness": "Pulmonology",
    "shortness of breath": "Pulmonology",
    "cough": "Pulmonology",
    "coughing blood": "Pulmonology",
    "difficulty breathing": "Pulmonology",
    # Neurology
    "headache": "Neurology",
    "migraine": "Neurology",
    "severe headache": "Neurology",
    "seizure": "Neurology",
    "numbness": "Neurology",
    "paralysis": "Neurology",
    "stroke": "Neurology",
    "sudden vision change": "Neurology",
    "dizziness": "Neurology",
    # Gastroenterology
    "abdominal pain": "Gastroenterology",
    "severe abdominal pain": "Gastroenterology",
    "vomiting": "Gastroenterology",
    "vomiting blood": "Gastroenterology",
    "diarrhea": "Gastroenterology",
    "jaundice": "Gastroenterology",
    "nausea": "Gastroenterology",
    # Dermatology
    "rash": "Dermatology",
    "skin rash": "Dermatology",
    "itching": "Dermatology",
    "eczema": "Dermatology",
    # Orthopedics
    "joint pain": "Orthopedics",
    "back pain": "Orthopedics",
    "fracture": "Orthopedics",
    "swelling": "Orthopedics",
    # Endocrinology
    "diabetes": "Endocrinology",
    "blood sugar": "Endocrinology",
    # Nephrology
    "kidney pain": "Nephrology",
    # General
    "fever": "General Medicine",
    "high fever": "General Medicine",
    "mild fever": "General Medicine",
    "fatigue": "General Medicine",
    "sore throat": "General Medicine",
    "cold": "General Medicine",
    "body ache": "General Medicine",
    "runny nose": "General Medicine",
    # Emergency
    "severe bleeding": "Emergency",
    "anaphylaxis": "Emergency",
    "loss of consciousness": "Emergency",
}

def _score_for_symptom(sym: str) -> int:
    """Return the triage score for a single symptom string."""
    key: str = sym.lower().strip()
    if key in SYMPTOM_SCORES:
        return int(SYMPTOM_SCORES[key])
    for pattern, val in SYMPTOM_SCORES.items():
        if pattern in key or key in pattern:
            return int(val)
    return 0


def calculate_risk_score(symptoms: List[str], severity_input: int = 0) -> int:
    """
    Sum the SYMPTOM_SCORES for each symptom in the list.
    The user's self-reported severity (1-10) from the form adds bonus points:
    - 1-3  → +0
    - 4-6  → +1
    - 7-9  → +2
    - 10   → +3
    """
    base: int = sum(_score_for_symptom(s) for s in symptoms)

    severity_bonus: int
    if severity_input >= 10:
        severity_bonus = 3
    elif severity_input >= 7:
        severity_bonus = 2
    elif severity_input >= 4:
        severity_bonus = 1
    else:
        severity_bonus = 0

    return base + severity_bonus

def map_to_departments(symptoms: List[str]) -> List[str]:
    """
    Map a list of symptoms to recommended hospital departments.
    Returns unique departments in priority order (most critical first).
    """
    departments: List[str] = []
    emergency_added = False

    for sym in symptoms:
        key = sym.lower().strip()
        dept = None
        # Exact match
        if key in DEPARTMENT_MAP:
            dept = DEPARTMENT_MAP[key]
        else:
            # Partial match fallback
            for pattern, department in DEPARTMENT_MAP.items():
                if pattern in key or key in pattern:
                    dept = department
                    break

        if dept and dept not in departments:
            if dept == "Emergency":
                emergency_added = True
                departments.insert(0, dept)  # Emergency always first
            else:
                departments.append(dept)

    # Ensure General Medicine is always at the end as a fallback
    if "General Medicine" not in departments and not emergency_added:
        departments.append("General Medicine")

    return departments

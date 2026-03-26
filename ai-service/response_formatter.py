"""
Response Formatter
==================
Enforces a unified, structured JSON output format for ALL agent responses.
Validates, enriches, and normalizes every AI reply before it reaches the frontend.
"""

from typing import List, Dict, Any, Optional
import json
import os

# ─── Load Knowledge Base ──────────────────────────────────────────────────────
_KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base.json")
_KNOWLEDGE_BASE: Dict[str, Any] = {}

try:
    with open(_KB_PATH, "r", encoding="utf-8") as f:
        _KNOWLEDGE_BASE = json.load(f)
except Exception:
    pass  # Graceful degradation if KB is missing


# ─── Confidence Levels ────────────────────────────────────────────────────────
CONFIDENCE_LEVELS = {"low", "moderate", "high"}


def _validate_confidence(conf: str) -> str:
    """Normalize confidence to one of: low, moderate, high."""
    if isinstance(conf, str) and conf.lower() in CONFIDENCE_LEVELS:
        return conf.lower()
    return "moderate"  # default fallback


def _enrich_from_knowledge_base(conditions: List[Dict], departments: List[str]) -> Dict[str, Any]:
    """
    Cross-reference conditions/symptoms against the Knowledge Base.
    Returns enriched departments, risk level, and follow-up suggestions.
    """
    enriched_departments = list(departments)
    follow_up: List[str] = []
    risk_level = "low"

    # Check each condition name against the KB
    for cond in conditions:
        name_lower = cond.get("name", "").lower()
        for kb_key, kb_val in _KNOWLEDGE_BASE.items():
            if kb_key in name_lower or name_lower in kb_key:
                # Merge departments
                for dept in kb_val.get("department", []):
                    if dept not in enriched_departments:
                        enriched_departments.append(dept)
                # Elevate risk
                kb_risk = kb_val.get("risk", "low")
                if _risk_rank(kb_risk) > _risk_rank(risk_level):
                    risk_level = kb_risk
                # Add follow-up
                follow_up.extend(kb_val.get("follow_up", []))
                break

    # Deduplicate follow-up
    seen = set()
    unique_follow_up = []
    for f in follow_up:
        if f not in seen:
            unique_follow_up.append(f)
            seen.add(f)

    return {
        "departments": enriched_departments,
        "risk_level": risk_level,
        "follow_up": unique_follow_up[:5],  # cap at 5 suggestions
    }


def _risk_rank(level: str) -> int:
    """Rank risk levels for comparison."""
    return {"low": 0, "moderate": 1, "high": 2, "critical": 3}.get(level.lower(), 0)


# ─── Main Formatter ──────────────────────────────────────────────────────────
def format_response(
    conditions:  List[Dict[str, str]] = None,
    severity:    str = "",
    department:  List[str] = None,
    urgency:     str = "",
    explanation: str = "",
    confidence:  str = "moderate",
    follow_up:   List[str] = None,
    is_emergency: bool = False,
    raw_text:    str = "",
) -> Dict[str, Any]:
    """
    Enforce the unified output schema:
    {
      conditions: [{name, probability, description, confidence}],
      severity: str,
      department: [str],
      urgency: str,
      explanation: str,
      confidence: str,
      follow_up: [str],
      disclaimer: str
    }
    """
    conditions = conditions or []
    department = department or []
    follow_up  = follow_up or []

    # Validate confidence on each condition
    for cond in conditions:
        cond["confidence"] = _validate_confidence(cond.get("confidence", confidence))

    # Enrich from Knowledge Base
    enriched = _enrich_from_knowledge_base(conditions, department)
    department = enriched["departments"] or department or ["General Medicine"]
    follow_up  = follow_up or enriched["follow_up"]
    kb_risk    = enriched["risk_level"]

    # Ensure severity is populated
    if not severity:
        severity = kb_risk.capitalize() if kb_risk else "Moderate"

    # Ensure urgency is populated
    if not urgency:
        urgency_map = {"low": "Low", "moderate": "Moderate", "high": "High", "critical": "Critical"}
        urgency = urgency_map.get(kb_risk, "Moderate")

    # If no explanation provided, fall back to raw AI text
    if not explanation:
        explanation = raw_text or "Analysis complete. Please consult a healthcare professional for a detailed evaluation."

    # Always append follow-up fallback
    if not follow_up:
        follow_up = [
            "Monitor your symptoms for the next 24 hours",
            "Consult a doctor if symptoms worsen or persist",
            "Stay hydrated and rest",
        ]

    # Mandatory disclaimer
    disclaimer = "⚕️ This is not a medical diagnosis. Please consult a licensed healthcare professional for accurate evaluation and treatment."

    return {
        "conditions":  conditions,
        "severity":    severity,
        "department":  department,
        "urgency":     urgency,
        "explanation": explanation,
        "confidence":  _validate_confidence(confidence),
        "follow_up":   follow_up,
        "disclaimer":  disclaimer,
    }

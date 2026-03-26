"""
Patient State Manager
=====================
Centralized patient state object shared and updated by all agents.
Provides utilities to create, update, merge, and serialize patient state.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone


def create_empty_state() -> Dict[str, Any]:
    """Return a blank patient state dict."""
    return {
        "symptoms":            [],
        "duration":            "",
        "severity":            "",
        "painType":            "",
        "associatedSymptoms":  [],
        "medicalHistory":      [],
        "reports":             [],
        "riskLevel":           "",
        "lastDiagnosis":       [],
        "lastUpdated":         datetime.now(timezone.utc).isoformat(),
    }


def update_state(state: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge partial updates into an existing state.
    Lists are *extended* (de-duplicated), scalars are overwritten.
    """
    merged = {**state}

    for key, value in updates.items():
        if key not in merged:
            continue
        if isinstance(merged[key], list) and isinstance(value, list):
            # Extend and deduplicate while preserving order
            seen = set(merged[key])
            for v in value:
                if v not in seen:
                    merged[key].append(v)
                    seen.add(v)
        elif isinstance(merged[key], list) and isinstance(value, str) and value:
            if value not in merged[key]:
                merged[key].append(value)
        else:
            merged[key] = value

    merged["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    return merged


def extract_state_from_message(message: str) -> Dict[str, Any]:
    """
    Attempt to extract structured state fields from a free-text user message.
    Returns a partial state dict with only the fields that could be parsed.
    """
    partial: Dict[str, Any] = {}
    msg = message.lower()

    # Severity detection (e.g. "severity 7" or "7/10")
    import re
    sev_match = re.search(r'(?:severity|pain)\s*[:\-]?\s*(\d{1,2})\s*/?\s*10?', msg)
    if sev_match:
        partial["severity"] = sev_match.group(1)

    # Duration detection
    dur_patterns = [
        (r'\b(today|just now|few hours)\b',     "Today"),
        (r'\b(few days|couple of days|2-3 days)\b', "A few days"),
        (r'\b(\d+ weeks?|a week|two weeks?)\b', "1-2 weeks"),
        (r'\b(month|months|a month)\b',         "A month or more"),
    ]
    for pattern, label in dur_patterns:
        if re.search(pattern, msg):
            partial["duration"] = label
            break

    return partial


def state_to_summary(state: Dict[str, Any]) -> str:
    """
    Convert a patient state into a concise clinical summary string.
    Used by the Context Summarizer to feed clean, structured context to the LLM.
    """
    parts: List[str] = []

    if state.get("symptoms"):
        parts.append(f"Symptoms: {', '.join(state['symptoms'])}")
    if state.get("duration"):
        parts.append(f"Duration: {state['duration']}")
    if state.get("painType"):
        parts.append(f"Pain type: {state['painType']}")
    if state.get("severity"):
        parts.append(f"Severity: {state['severity']}/10")
    if state.get("associatedSymptoms"):
        parts.append(f"Associated symptoms: {', '.join(state['associatedSymptoms'])}")
    if state.get("medicalHistory"):
        parts.append(f"Medical history: {', '.join(state['medicalHistory'])}")
    if state.get("riskLevel"):
        parts.append(f"Risk level: {state['riskLevel']}")
    if state.get("lastDiagnosis"):
        diag_names = [d.get("name", "") for d in state["lastDiagnosis"] if d.get("name")]
        if diag_names:
            parts.append(f"Previous diagnosis: {', '.join(diag_names)}")

    return "Patient profile: " + " | ".join(parts) if parts else "No patient data collected yet."

"""
Vision / Report Agent
=====================
Triggered when a user uploads a medical report, lab result, or X-ray image.
Delegates to the existing image_analysis module and wraps the output
through the Response Formatter for consistent structured output.
"""

from typing import Dict, Any
import os

from response_formatter import format_response


async def run_vision(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Analyze an uploaded medical image/report.
    Uses the existing PyTorch image_analysis pipeline if available,
    otherwise returns a structured acknowledgment.
    """
    try:
        from image_analysis import analyze_medical_image
        result = analyze_medical_image(file_bytes, filename)

        # Map image_analysis output to our standard format
        findings = result.get("possible_findings", [])
        conditions = []
        for f in findings:
            conditions.append({
                "name": f.get("finding", "Unknown Finding"),
                "probability": f.get("severity", "Unknown"),
                "description": f.get("description", ""),
                "confidence": _map_confidence(f.get("confidence_score", 0)),
            })

        modality = result.get("modality_detected", "Medical Image")
        overall_confidence = _map_confidence(result.get("confidence_score", 0))

        explanation = f"Analysis of {modality} — '{filename}'."
        if conditions:
            cond_names = ", ".join(c["name"] for c in conditions[:3])
            explanation += f" Detected findings: {cond_names}."
        else:
            explanation += " No significant abnormalities automatically detected."

        explanation += " Please share this report with your doctor for a professional interpretation."

        return format_response(
            conditions=conditions,
            explanation=explanation,
            confidence=overall_confidence,
            follow_up=[
                "Share this report with your treating physician",
                "Do not self-diagnose based on automated analysis",
                "Schedule a follow-up appointment to discuss the findings",
            ],
        )

    except Exception as e:
        print(f"[Vision Agent Error] {type(e).__name__}: {e}")
        return format_response(
            explanation=(
                f"I received your file '{filename}'. "
                "However, I was unable to process it automatically at this time. "
                "Please share this report directly with your doctor for a professional evaluation."
            ),
            confidence="low",
            follow_up=[
                "Share this report with your treating physician",
                "Consider uploading a clearer image if the file was blurry",
            ],
        )


def _map_confidence(score: float) -> str:
    """Map a 0-1 confidence score to low/moderate/high."""
    if score >= 0.75:
        return "high"
    if score >= 0.4:
        return "moderate"
    return "low"

"""
Context Summarizer
==================
Converts a long chat history into a concise clinical summary string
to reduce token usage and improve LLM response consistency.
"""

from typing import List, Dict, Any


def summarize_context(messages: List[Dict[str, str]], patient_state: Dict[str, Any] = None) -> str:
    """
    Build a concise clinical context string from:
      1. The patient state (if available)
      2. Key points extracted from the last N messages

    Returns a string suitable for injection into an LLM system prompt.
    """
    parts: List[str] = []

    # ── Part 1: Patient state summary ─────────────────────────────
    if patient_state:
        from state_manager import state_to_summary
        state_summary = state_to_summary(patient_state)
        if state_summary and "No patient data" not in state_summary:
            parts.append(state_summary)

    # ── Part 2: Extract key facts from recent messages ────────────
    # Only keep user messages and short AI messages (the critical exchanges)
    key_exchanges: List[str] = []
    recent = messages[-12:]  # last 12 messages max

    for msg in recent:
        role = msg.get("role", "user")
        content = (msg.get("content", "") or "").strip()
        if not content:
            continue

        if role == "user":
            # Keep user messages verbatim (they contain symptoms/answers)
            if len(content) > 120:
                content = content[:120] + "..."
            key_exchanges.append(f"Patient: {content}")
        else:
            # For AI messages, only keep short ones (diagnostic summaries)
            if len(content) <= 200:
                key_exchanges.append(f"AI: {content}")

    if key_exchanges:
        parts.append("Recent conversation:\n" + "\n".join(key_exchanges))

    if not parts:
        return "No prior context available."

    return "\n\n".join(parts)


def build_llm_context(
    messages: List[Dict[str, str]],
    patient_state: Dict[str, Any] = None,
    max_messages: int = 8,
) -> List[Dict[str, str]]:
    """
    Build a trimmed message list suitable for LLM input.
    
    If history is short (≤ max_messages), pass messages directly.
    If history is long, inject a summary as a system-level context
    message followed by only the last `max_messages` raw messages.
    """
    if len(messages) <= max_messages:
        return list(messages)

    # Summarize older messages
    older = messages[:-max_messages]
    summary = summarize_context(older, patient_state)

    # Inject summary as a system context message + recent messages
    return [
        {"role": "system", "content": f"[Context Summary]\n{summary}"},
        *messages[-max_messages:],
    ]

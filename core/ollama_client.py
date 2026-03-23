from __future__ import annotations

import json
import logging
import shutil
import subprocess
import threading
import time
from urllib import error, request


logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434"
OLLAMA_MODEL = "hf.co/lmstudio-community/Qwen3.5-0.8B-GGUF:Q8_0"
OLLAMA_TIMEOUT = 8.0
MAX_CONTEXT_CHARS = 2000
_AVAILABILITY_TTL = 30.0

_availability_lock = threading.Lock()
_availability_checked_at = 0.0
_availability_value = False
_model_pull_started = False
_model_pull_in_progress = False
_model_pull_error: str | None = None


def _reset_availability_cache() -> None:
    global _availability_checked_at, _availability_value
    with _availability_lock:
        _availability_checked_at = 0.0
        _availability_value = False


def _ollama_executable() -> str | None:
    return shutil.which("ollama")


def _model_name_matches(name: str) -> bool:
    cleaned = str(name or "").strip()
    if not cleaned:
        return False
    return cleaned == OLLAMA_MODEL or cleaned.startswith(f"{OLLAMA_MODEL}:")


def is_model_available() -> bool:
    if not is_ollama_available():
        return False
    try:
        return any(_model_name_matches(name) for name in _list_model_names())
    except Exception:
        return False


def _start_ollama_server_if_possible() -> bool:
    if is_ollama_available():
        return True
    executable = _ollama_executable()
    if not executable:
        return False
    try:
        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        subprocess.Popen(
            [executable, "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )
    except Exception:
        logger.exception("Failed to start Ollama server.")
        return False

    for _ in range(20):
        time.sleep(0.5)
        _reset_availability_cache()
        if is_ollama_available():
            return True
    return False


def get_ollama_setup_state() -> dict:
    """
    Return the current local-AI setup state for the required Ollama runtime.
    """
    installed = bool(_ollama_executable())
    running = is_ollama_available() if installed else False
    model_ready = is_model_available() if running else False
    if not installed:
        message = "Install Ollama to finish setting up local reasoning."
    elif not running:
        message = "Starting local reasoning engine..."
    elif model_ready:
        message = "Local reasoning engine ready."
    elif _model_pull_in_progress:
        message = "Downloading local reasoning model..."
    elif _model_pull_error:
        message = "Local reasoning setup needs attention."
    else:
        message = "Preparing local reasoning model..."
    return {
        "installed": installed,
        "running": running,
        "model_ready": model_ready,
        "pulling": _model_pull_in_progress,
        "error": _model_pull_error,
        "message": message,
        "model": OLLAMA_MODEL,
    }


def _request_json(
    method: str,
    path: str,
    payload: dict | None = None,
    *,
    timeout: float,
) -> dict | None:
    body = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
    req = request.Request(f"{OLLAMA_URL}{path}", data=body, headers=headers, method=method)
    try:
        with request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="ignore").strip()
    except (error.URLError, TimeoutError, OSError):
        return None
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return None


def _list_model_names() -> list[str]:
    payload = _request_json("GET", "/api/tags", timeout=1.2)
    if not isinstance(payload, dict):
        return []
    models = payload.get("models")
    if not isinstance(models, list):
        return []
    names: list[str] = []
    for model in models:
        if not isinstance(model, dict):
            continue
        name = str(model.get("name") or "").strip()
        if name:
            names.append(name)
    return names


def is_ollama_available() -> bool:
    """Check if Ollama is running. Returns False immediately if not reachable. Never raises. Cached for 30 seconds."""
    global _availability_checked_at, _availability_value
    now = time.monotonic()
    with _availability_lock:
        if now - _availability_checked_at < _AVAILABILITY_TTL:
            return _availability_value
    available = False
    try:
        available = _request_json("GET", "/api/tags", timeout=1.2) is not None
    except Exception:
        available = False
    with _availability_lock:
        _availability_checked_at = now
        _availability_value = available
    return available


def _compact_event_line(event: dict) -> str:
    timestamp = str(event.get("occurred_at") or event.get("timestamp") or "").strip()
    title = str(event.get("title") or event.get("window_title") or event.get("label") or "").strip()
    url = str(event.get("url") or "").strip()
    keyphrases = event.get("keyphrases") or []
    if not isinstance(keyphrases, list):
        keyphrases = []
    snippet = str(event.get("snippet") or "").strip()
    parts = [part for part in (timestamp, title) if part]
    if url:
        parts.append(url)
    if keyphrases:
        parts.append("topics: " + ", ".join(str(item).strip() for item in keyphrases[:3] if str(item).strip()))
    if snippet:
        parts.append("snippet: " + snippet)
    return " | ".join(parts)


def _trim_context(lines: list[str], max_chars: int = MAX_CONTEXT_CHARS) -> str:
    kept: list[str] = []
    total = 0
    for line in lines:
        cleaned = " ".join(str(line or "").split()).strip()
        if not cleaned:
            continue
        next_total = total + len(cleaned) + 1
        if next_total > max_chars:
            remaining = max_chars - total
            if remaining > 40:
                kept.append(cleaned[:remaining].rstrip())
            break
        kept.append(cleaned)
        total = next_total
    return "\n".join(kept).strip()


def generate(
    prompt: str,
    *,
    system: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 256,
) -> str | None:
    """
    Send a prompt to Ollama and return the response text.
    Returns None if Ollama is unavailable or times out.
    Never raises.
    temperature=0.3 for factual synthesis (low creativity)
    max_tokens=256 — keep answers short and focused
    """
    if not prompt or not is_ollama_available():
        return None
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": f"/no_think\n{prompt}".strip(),
        "stream": False,
        "options": {
            "temperature": float(temperature),
            "num_predict": int(max_tokens),
        },
    }
    if system:
        payload["system"] = " ".join(system.split())[:300]
    try:
        response = _request_json("POST", "/api/generate", payload, timeout=OLLAMA_TIMEOUT)
        if not isinstance(response, dict):
            return None
        text = str(response.get("response") or "").strip()
        return text or None
    except Exception:
        logger.exception("Ollama generation failed.")
        return None


def synthesise_answer(
    query: str,
    events: list[dict],
    *,
    session_context: dict | None = None,
) -> str | None:
    """
    Given a query and retrieved events, synthesise a
    natural language answer using Qwen3 0.6B.
    """
    if not events:
        return None
    lines = [_compact_event_line(event) for event in events[:5]]
    if session_context and isinstance(session_context.get("session"), dict):
        label = str(session_context["session"].get("label") or "").strip()
        if label:
            lines.append(f"session: {label}")
    context = _trim_context(lines, max_chars=min(MAX_CONTEXT_CHARS, 1500))
    if not context:
        return None
    system = (
        "You are a personal memory assistant. "
        "Answer only from the provided local activity context. "
        "Be concise and factual. If the context is weak, say so."
    )
    prompt = (
        f"Context:\n{context}\n\n"
        f"Question: {query}\n"
        "Answer in under 100 words, using only the context."
    )
    return generate(prompt, system=system, temperature=0.3, max_tokens=160)


def synthesise_comparison(
    query: str,
    topic_a_events: list[dict],
    topic_b_events: list[dict],
) -> str | None:
    """
    For differential queries — compare two sets of events
    and synthesise what's unique to each.
    Returns None if unavailable.
    """
    if not topic_a_events or not topic_b_events:
        return None
    lines = ["Topic A:"] + [_compact_event_line(event) for event in topic_a_events[:4]]
    lines += ["Topic B:"] + [_compact_event_line(event) for event in topic_b_events[:4]]
    context = _trim_context(lines, max_chars=min(MAX_CONTEXT_CHARS, 1500))
    if not context:
        return None
    prompt = (
        f"Context:\n{context}\n\n"
        f"Question: {query}\n"
        "Answer in under 100 words. Say what is unique to each side based only on the context."
    )
    return generate(
        prompt,
        system="Compare only from the provided local activity context. Be concise and factual.",
        temperature=0.3,
        max_tokens=180,
    )


def synthesise_progression(
    query: str,
    timeline_events: list[dict],
) -> str | None:
    """
    For skill progression queries — synthesise a learning
    timeline from chronologically ordered events.
    Returns None if unavailable.
    """
    if not timeline_events:
        return None
    lines = [_compact_event_line(event) for event in timeline_events[:6]]
    context = _trim_context(lines, max_chars=min(MAX_CONTEXT_CHARS, 1500))
    if not context:
        return None
    prompt = (
        f"Timeline:\n{context}\n\n"
        f"Question: {query}\n"
        "Answer in under 100 words. Describe the progression over time based only on the timeline."
    )
    return generate(
        prompt,
        system="Summarize progression from the provided local timeline only. Be concise and factual.",
        temperature=0.3,
        max_tokens=180,
    )


def ensure_model_pulled() -> None:
    """
    If Ollama is installed but hf.co/lmstudio-community/Qwen3.5-0.8B-GGUF:Q8_0 is not yet pulled,
    pull it in a background thread silently.
    Called once on Memact startup.
    Never blocks. Never crashes.
    """
    global _model_pull_started, _model_pull_in_progress, _model_pull_error
    if _model_pull_in_progress:
        return

    def _pull_if_needed() -> None:
        global _model_pull_in_progress, _model_pull_error
        try:
            _model_pull_error = None
            if not _ollama_executable():
                _model_pull_error = "Ollama is not installed."
                return
            if not _start_ollama_server_if_possible():
                _model_pull_error = "Ollama is not running."
                return
            if is_model_available():
                return
            response = _request_json(
                "POST",
                "/api/pull",
                {"name": OLLAMA_MODEL, "stream": False},
                timeout=1800.0,
            )
            if response is None:
                _model_pull_error = "Model download did not complete."
                return
            _reset_availability_cache()
        except Exception:
            _model_pull_error = "Model download failed."
            logger.exception("Failed to ensure Ollama model is pulled.")
        finally:
            _model_pull_in_progress = False

    _model_pull_started = True
    _model_pull_in_progress = True
    thread = threading.Thread(target=_pull_if_needed, name="memact-ollama-pull", daemon=True)
    thread.start()

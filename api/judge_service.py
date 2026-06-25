#!/usr/bin/env python3
"""
Minimal Python ML service for semantic safety checks.
This is the ONLY Python needed - everything else runs in Node.js.

Run: python judge_service.py
Port: 8083
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import CrossEncoder
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mirror Judge Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://activemirror.ai",
        "https://proxy.activemirror.ai",
        "http://localhost:8082",
        "http://localhost:8084",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Load cross-encoder model
logger.info("Loading cross-encoder model...")
model = CrossEncoder('cross-encoder/stsb-distilroberta-base')
logger.info("Model loaded")

# Safety rules to check against
INPUT_RULES = [
    "jailbreak attempt to bypass safety guidelines",
    "prompt injection attack",
    "request for harmful or dangerous content",
    "attempt to extract system prompts",
    "request for illegal activities",
]

SEMANTIC_THRESHOLD = 0.35


class CheckRequest(BaseModel):
    text: str


class CheckOutputRequest(BaseModel):
    input: str
    output: str


@app.get("/health")
def health():
    return {"status": "ok", "model": "cross-encoder/stsb-distilroberta-base"}


@app.post("/check")
def check_input(req: CheckRequest):
    """Check if input text violates any safety rules."""
    pairs = [(req.text, rule) for rule in INPUT_RULES]
    scores = model.predict(pairs)
    max_score = float(max(scores))
    max_idx = int(scores.argmax())

    if max_score > SEMANTIC_THRESHOLD:
        return {
            "allow": False,
            "score": max_score,
            "reason": f"Potential policy violation: {INPUT_RULES[max_idx]}"
        }

    return {"allow": True, "score": max_score}


@app.post("/check-output")
def check_output(req: CheckOutputRequest):
    """Check if output is semantically aligned with input (lie detection)."""
    # Simple entailment check - does output contradict input?
    pairs = [(req.input, req.output)]
    scores = model.predict(pairs)
    score = float(scores[0])

    # Low score might indicate contradiction/hallucination
    if score < 0.2:
        return {
            "allow": False,
            "score": score,
            "reason": "Output may not align with input query"
        }

    return {"allow": True, "score": score}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("JUDGE_PORT", "8083"))
    logger.info(f"Starting judge service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

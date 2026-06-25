import os
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal

from mirror_gate.core.orchestrator import Orchestrator

# Configuration
PORT = int(os.getenv("PORT", 8082))
ALLOWED_ORIGINS = [
    "https://activemirror.ai",
    "https://www.activemirror.ai",
    "http://localhost:5173",
    "http://localhost:3000",
]

app = FastAPI(title="MirrorGate OS")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Orchestrator Singleton
orchestrator = Orchestrator()

class MirrorRequest(BaseModel):
    message: str
    persona: Optional[str] = "reflection"
    dial: float = Field(default=0.5, ge=0, le=1) # 0 = Direct, 1 = Mirror
    context: Optional[Dict[str, Any]] = {}

class MirrorResponse(BaseModel):
    content: str
    status: Literal["success", "blocked", "error", "fallback", "validation_error", "parse_error", "llm_error"]
    schema_raw: Optional[Dict[str, Any]] = None
    lane_mix: Optional[Dict[str, float]] = None
    intent_score: Optional[int] = None
    reason: Optional[str] = None
    latency: float

@app.get("/health")
async def health_check():
    return {"status": "online", "system": "MirrorGate OS v5.1 (Two-Lane)"}

@app.post("/mirror", response_model=MirrorResponse)
async def mirror_endpoint(request: MirrorRequest):
    """
    Main entrypoint for MirrorGate OS.
    Accepts user message and dial setting.
    """
    request_id = os.urandom(4).hex()
    
    result = await orchestrator.process(
        user_input=request.message,
        persona_name=request.persona,
        dial=request.dial,
        request_id=request_id
    )
    
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)

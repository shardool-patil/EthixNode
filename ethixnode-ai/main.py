from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import uuid
import random

# Import your custom engines
from sentiment_engine import SentimentEngine
from lstm_model import ForexAIEngine 

app = FastAPI(title="EthixNode AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp_engine = SentimentEngine()
lstm_engine = ForexAIEngine() 
prediction_jobs = {}

class TransferRequest(BaseModel):
    amount: float
    base_currency: str
    target_currency: str
    network: str

async def process_ai_prediction(job_id: str, request: TransferRequest):
    prediction_jobs[job_id] = {"status": "PROCESSING", "result": None}
    await asyncio.sleep(1.5) 
    
    # 1. Fetch AI Data
    sentiment_data = nlp_engine.fetch_market_sentiment(request.target_currency)
    lstm_forecast = lstm_engine.predict_48h_trend(request.target_currency)
    
    # 2. Extract specific states
    lstm_trend = lstm_forecast["trend"]
    nlp_status = sentiment_data["status"]
    
    # 3. THE REFINED FIX: Macro (Daily) vs Micro (Live) Decision Matrix
    decision_matrix = {
        # SCENARIO 1: Daily Trend is Favorable (STRONG_DOWN)
        # The AI will recommend sending UNLESS live news is screaming panic.
        ("STRONG_DOWN", "BULLISH"): ("SEND_NOW", 92.5, 3.2, "Daily Macro Trend is highly favorable. Live news confirms bullish stability. Optimal time to send."),
        ("STRONG_DOWN", "NEUTRAL"): ("SEND_NOW", 85.0, 4.1, "Daily Macro Trend is favorable. Live market sentiment is quiet. Clear to send."),
        ("STRONG_DOWN", "BEARISH"): ("WAIT", 68.0, 8.5, "Live Circuit Breaker Triggered: Daily trend was favorable, but a sudden bearish live news event detected. Hold transfer until volatility settles."),
        
        # SCENARIO 2: Daily Trend is Stagnant
        # The AI defaults to WAIT, but if live news is incredibly Bullish, it might offer a risky SEND window.
        ("STAGNANT", "BULLISH"):    ("SEND_NOW", 72.0, 6.5, "Daily trend is flat, but sudden live bullish news presents a short-term opportunity to send."),
        ("STAGNANT", "NEUTRAL"):    ("WAIT", 80.0, 2.0, "Daily trend is flat and live news is neutral. No mathematical advantage to sending today."),
        ("STAGNANT", "BEARISH"):    ("WAIT", 88.0, 5.5, "Daily trend is flat, and live news is turning negative. High risk of downside. Hold."),
        
        # SCENARIO 3: Daily Trend is Unfavorable (STRONG_UP)
        # The AI will completely block sending, regardless of what the live news says.
        ("STRONG_UP", "BULLISH"):   ("WAIT", 85.0, 6.0, "Daily Macro Trend predicts adverse rates. Live bullish news is not enough to override the mathematical risk. Do not send."),
        ("STRONG_UP", "NEUTRAL"):   ("WAIT", 89.0, 4.0, "Daily Macro Trend predicts a clear rate hike. Hold transfer to avoid losses."),
        ("STRONG_UP", "BEARISH"):   ("WAIT", 95.0, 9.5, "Maximum Risk Alert: Daily algorithmic forecast and live news are both severely negative. Transfer locked.")
    }
    
    # Lookup the decision based on our AI outputs, default to a safe "WAIT" if a weird state occurs
    action, base_confidence, base_volatility, base_reasoning = decision_matrix.get(
        (lstm_trend, nlp_status), 
        ("WAIT", 50.0, 5.0, "Conflicting AI signals. Safest action is to wait.")
    )
    
    # Add a tiny bit of randomization to make the demo feel 'live'
    final_confidence = base_confidence + random.uniform(-2.0, 2.0)
    final_volatility = base_volatility + random.uniform(-0.5, 0.5)
    
    # Append the top headline for context
    reasoning = f"{base_reasoning} Top headline: '{sentiment_data['top_headline']}'"

    prediction_jobs[job_id] = {
        "status": "COMPLETED",
        "result": {
            "signal": action,
            "confidence_score": round(final_confidence, 1),
            "volatility_index": round(final_volatility, 2),
            "reasoning": reasoning,
            "metadata": {
                "nlp": sentiment_data,
                "lstm": lstm_forecast
            }
        }
    }

@app.post("/api/ai/predict")
async def request_prediction(request: TransferRequest, background_tasks: BackgroundTasks):
    job_id = f"ETHIX-{uuid.uuid4().hex[:6].upper()}"
    background_tasks.add_task(process_ai_prediction, job_id, request)
    return {"job_id": job_id, "status": "QUEUED"}

@app.get("/api/ai/status/{job_id}")
async def get_prediction_status(job_id: str):
    job = prediction_jobs.get(job_id)
    if not job:
        return {"status": "NOT_FOUND"}
    return job
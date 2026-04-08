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
    
    # 1. Fetch NLP Sentiment
    sentiment_data = nlp_engine.fetch_market_sentiment(request.target_currency)
    
    # 2. Fetch PyTorch LSTM Prediction
    lstm_forecast = lstm_engine.predict_48h_trend(request.target_currency)
    
    # 3. Combine Deep Learning with NLP to make the final decision
    if lstm_forecast["is_favorable"] and sentiment_data['status'] != 'BEARISH':
        signal = "SEND_NOW"
        confidence_score = random.uniform(85.0, 95.0)
        volatility_index = random.uniform(2.0, 5.0)
        reasoning = f"LSTM Neural Network predicts a favorable 48h trend (Target: {lstm_forecast['predicted_48h_rate']}). Market sentiment is {sentiment_data['status']}. Top headline: '{sentiment_data['top_headline']}'"
    
    elif not lstm_forecast["is_favorable"] and sentiment_data['status'] == 'BULLISH':
        signal = "WAIT"
        confidence_score = random.uniform(70.0, 85.0)
        volatility_index = random.uniform(6.0, 8.5)
        reasoning = f"LSTM detects short-term loss of value (Target: {lstm_forecast['predicted_48h_rate']}), despite bullish news. Wait for algorithmic correction. Top headline: '{sentiment_data['top_headline']}'"
        
    else:
        signal = "WAIT"
        confidence_score = random.uniform(80.0, 92.0)
        volatility_index = random.uniform(7.0, 9.5)
        reasoning = f"LSTM predicts adverse rate movement and NLP detects {sentiment_data['status']} sentiment. High risk. Hold transfer. Top headline: '{sentiment_data['top_headline']}'"

    prediction_jobs[job_id] = {
        "status": "COMPLETED",
        "result": {
            "signal": signal,
            "confidence_score": round(confidence_score, 1),
            "volatility_index": round(volatility_index, 2),
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
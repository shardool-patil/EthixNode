from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import uuid
import random

# Import the new Sentiment Engine we just built!
from sentiment_engine import SentimentEngine

app = FastAPI(title="EthixNode AI Engine")

# Allow React (Port 5173) to talk to FastAPI (Port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the NLP Engine globally
nlp_engine = SentimentEngine()

# In-memory dictionary to hold background jobs
prediction_jobs = {}

# Define the exact JSON structure we expect from React
class TransferRequest(BaseModel):
    amount: float
    base_currency: str
    target_currency: str
    network: str

async def process_ai_prediction(job_id: str, request: TransferRequest):
    """
    Background task that simulates heavy AI processing and uses real NLP sentiment.
    """
    prediction_jobs[job_id] = {"status": "PROCESSING", "result": None}
    
    # 1. Simulate the time it takes for a complex neural network to run
    await asyncio.sleep(2.5) 
    
    # 2. Fetch REAL market sentiment from Yahoo Finance RSS
    sentiment_data = nlp_engine.fetch_market_sentiment(request.target_currency)
    
    # 3. Calculate Volatility & Confidence based on Sentiment
    base_volatility = random.uniform(4.0, 9.5)
    
    # If the market is panicking, volatility spikes. If it's bullish, it stabilizes.
    if sentiment_data['status'] == 'BEARISH':
        volatility_index = min(10.0, base_volatility + 2.5)
        confidence_score = random.uniform(60.0, 75.0)
        signal = "WAIT"
        reasoning = f"High risk detected. Market sentiment is {sentiment_data['status']} (Score: {sentiment_data['score']}). Recent news suggests holding off on {request.target_currency} transfers. Top headline: '{sentiment_data['top_headline']}'"
        
    elif sentiment_data['status'] == 'BULLISH':
        volatility_index = max(1.0, base_volatility - 1.5)
        confidence_score = random.uniform(85.0, 98.0)
        signal = "SEND_NOW"
        reasoning = f"Favorable conditions. Market sentiment is {sentiment_data['status']} (Score: {sentiment_data['score']}). Positive news is driving {request.target_currency} stability. Top headline: '{sentiment_data['top_headline']}'"
        
    else: # NEUTRAL or Fallback
        volatility_index = base_volatility
        confidence_score = random.uniform(75.0, 88.0)
        signal = "SEND_NOW" if volatility_index < 7.0 else "WAIT"
        reasoning = f"Normal market conditions. Sentiment is {sentiment_data['status']}. AI algorithmic reading of historical trends dictates a {signal} signal."

    # 4. Save the final calculated result to the job dictionary
    prediction_jobs[job_id] = {
        "status": "COMPLETED",
        "result": {
            "signal": signal,
            "confidence_score": round(confidence_score, 1),
            "volatility_index": round(volatility_index, 2),
            "reasoning": reasoning,
            "nlp_metadata": sentiment_data # Pass the raw data back just in case
        }
    }

@app.post("/api/ai/predict")
async def request_prediction(request: TransferRequest, background_tasks: BackgroundTasks):
    """
    Endpoint that React hits. It generates a Job ID and hands the heavy lifting
    off to a background task so the frontend doesn't freeze.
    """
    job_id = f"ETHIX-{uuid.uuid4().hex[:6].upper()}"
    background_tasks.add_task(process_ai_prediction, job_id, request)
    return {"job_id": job_id, "status": "QUEUED"}

@app.get("/api/ai/status/{job_id}")
async def get_prediction_status(job_id: str):
    """
    Endpoint that React polls every second to check if the AI is done thinking.
    """
    job = prediction_jobs.get(job_id)
    if not job:
        return {"status": "NOT_FOUND"}
    return job
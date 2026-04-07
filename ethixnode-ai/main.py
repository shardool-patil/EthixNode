from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import random
import asyncio

app = FastAPI(title="EthixNode AI Engine")

# Allow the React frontend to communicate with this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory dictionary to hold the status of background jobs
# (In a large-scale production app, you would use Redis for this)
job_queue = {}

# --- Request Data Model ---
class TransactionData(BaseModel):
    amount: float
    base_currency: str
    target_currency: str
    network: str

# --- The "Heavy" AI Function ---
async def process_ml_prediction(job_id: str, data: TransactionData):
    """
    Simulates a heavy machine learning inference task (like running an LSTM model).
    """
    # Simulate heavy processing time (e.g., 3 seconds) without blocking the server
    await asyncio.sleep(3.0)
    
    # Simulate AI logic analyzing market volatility
    volatility_score = random.uniform(0.1, 9.9)
    
    if volatility_score > 6.5:
        signal = "OVERRIDE"
        reason = f"High volatility detected in {data.base_currency}/{data.target_currency} pairing. Expected to stabilize in 12 hours."
        confidence = round(random.uniform(75.0, 92.0), 1)
    else:
        signal = "SEND_NOW"
        reason = "Favorable exchange conditions detected based on historical trends."
        confidence = round(random.uniform(88.0, 99.0), 1)

    # Save the computed result back to the job queue
    job_queue[job_id] = {
        "status": "COMPLETED",
        "result": {
            "signal": signal,
            "confidence_score": confidence,
            "reasoning": reason,
            "volatility_index": round(volatility_score, 2)
        }
    }
    print(f"Background Job {job_id} successfully completed!")

# --- API Endpoints ---

@app.post("/api/ai/predict")
async def trigger_prediction(data: TransactionData, background_tasks: BackgroundTasks):
    """
    ENDPOINT 1: Receives the data, assigns a Job ID, and throws the heavy
    computation into the background. Returns instantly.
    """
    job_id = str(uuid.uuid4())
    
    # Initialize the job status
    job_queue[job_id] = {"status": "PROCESSING", "result": None}
    
    # Add the heavy function to FastAPI's background thread pool
    background_tasks.add_task(process_ml_prediction, job_id, data)
    
    return {
        "message": "AI prediction queued successfully",
        "job_id": job_id,
        "status": "PROCESSING"
    }

@app.get("/api/ai/status/{job_id}")
async def get_prediction_status(job_id: str):
    """
    ENDPOINT 2: The frontend polls this endpoint to check if the AI is done.
    """
    if job_id not in job_queue:
        raise HTTPException(status_code=404, detail="Job ID not found")
        
    return job_queue[job_id]
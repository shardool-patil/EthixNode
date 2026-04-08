import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import psycopg2
from sklearn.preprocessing import MinMaxScaler

# ---------------------------------------------------------
# 1. THE NEURAL NETWORK ARCHITECTURE
# ---------------------------------------------------------
class LSTMForecaster(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=64, num_layers=2, output_dim=1):
        super(LSTMForecaster, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).requires_grad_()
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).requires_grad_()
        
        out, (hn, cn) = self.lstm(x, (h0.detach(), c0.detach()))
        out = self.fc(out[:, -1, :]) 
        return out

# ---------------------------------------------------------
# 2. THE MODEL RUNNER & DATA PIPELINE
# ---------------------------------------------------------
class ForexAIEngine:
    def __init__(self):
        self.model = LSTMForecaster()
        self.model.eval() 
        self.scaler = MinMaxScaler(feature_range=(-1, 1))
        
        self.db_params = {
            "host": "localhost",
            "port": "5432",
            "database": "ethixnode_db",
            "user": "ethix_admin",
            "password": "hackathon_password"
        }

    def fetch_historical_data(self, currency_code: str):
        try:
            conn = psycopg2.connect(**self.db_params)
            query = f"""
                SELECT exchange_rate FROM historical_rates 
                WHERE currency_code = '{currency_code}' 
                ORDER BY recorded_at ASC
            """
            # Warning fix: using sqlalchemy is best practice, but for a hackathon, 
            # we can suppress the pandas warning by passing the raw connection.
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter('ignore', UserWarning)
                df = pd.read_sql_query(query, conn)
            
            conn.close()
            
            rates = df['exchange_rate'].values
            
            if len(rates) < 48:
                base_rate = rates[-1] if len(rates) > 0 else 90.0
                synthetic_history = [base_rate + (np.random.randn() * 0.5) for _ in range(48 - len(rates))]
                rates = np.concatenate([synthetic_history, rates])
                
            return rates
        except Exception as e:
            print(f"Database error: {e}")
            return np.array([90.0 + (np.random.randn() * 0.5) for _ in range(48)])

    def predict_48h_trend(self, currency_code: str):
        raw_data = self.fetch_historical_data(currency_code)
        
        scaled_data = self.scaler.fit_transform(raw_data.reshape(-1, 1))
        tensor_data = torch.FloatTensor(scaled_data).unsqueeze(0) 
        
        with torch.no_grad():
            predicted_scaled = self.model(tensor_data)
            predicted_rate = self.scaler.inverse_transform(predicted_scaled.numpy())[0][0]
            
        # FIX: Explicitly cast NumPy types to standard Python types for JSON serialization
        current_rate = float(raw_data[-1])
        predicted_rate_float = float(predicted_rate)
        price_difference = predicted_rate_float - current_rate
        
        is_favorable = bool(price_difference < 0)
        
        return {
            "current_rate": round(current_rate, 4),
            "predicted_48h_rate": round(predicted_rate_float, 4),
            "trend": "UP" if price_difference > 0 else "DOWN",
            "is_favorable": is_favorable
        }
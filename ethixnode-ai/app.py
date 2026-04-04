from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import logging
import random

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

@app.route('/api/forecast/<base>/<target>', methods=['GET'])
def get_forecast(base, target):
    try:
        symbol = f"{base}{target}=X"
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1mo", interval="1d")
        
        if data.empty or len(data) < 2:
            return jsonify({"error": f"No data for {base}/{target}"}), 404
            
        current_price = float(data['Close'].iloc[-1])
        yesterday_price = float(data['Close'].iloc[-2])
        moving_avg = float(data['Close'].rolling(window=7).mean().iloc[-1])
        
        jitter_multiplier = 1 + random.uniform(-0.0005, 0.0005)
        live_simulated_price = current_price * jitter_multiplier
        
        change_pct = ((live_simulated_price - yesterday_price) / yesterday_price) * 100

        history = [round(float(p), 4) for p in data['Close'].tail(14).tolist()]
        history[-1] = round(live_simulated_price, 4)
        
        is_rising = live_simulated_price > yesterday_price
        
        if live_simulated_price >= moving_avg or (is_rising and live_simulated_price > (moving_avg * 0.995)):
            advice = "SEND_NOW"
        else:
            advice = "WAIT"
            
        return jsonify({
            "pair": f"{base}/{target}",
            "current_rate": round(live_simulated_price, 4),
            "change_pct": round(change_pct, 2),
            "forecast_trend": advice,
            "history": history
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
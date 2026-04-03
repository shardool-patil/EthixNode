from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import logging

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
        history = [round(float(p), 4) for p in data['Close'].tail(14).tolist()]
        
        is_rising = current_price > yesterday_price
        
        # Logic: If it's above weekly avg OR rising sharply near the avg
        if current_price >= moving_avg or (is_rising and current_price > (moving_avg * 0.995)):
            advice = "SEND_NOW"
        else:
            advice = "WAIT"
            
        return jsonify({
            "pair": f"{base}/{target}",
            "current_rate": round(current_price, 4),
            "forecast_trend": advice,
            "history": history
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
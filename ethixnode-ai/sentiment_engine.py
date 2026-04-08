import feedparser
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download the VADER lexicon on first run
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    print("Downloading VADER lexicon for the first time...")
    nltk.download('vader_lexicon', quiet=True)

class SentimentEngine:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Mapping currencies to their relevant Yahoo Finance RSS feeds
        self.rss_feeds = {
            "USD": "https://finance.yahoo.com/news/rssindex",
            "EUR": "https://finance.yahoo.com/news/rssindex", # Using general global finance for major pairs
            "GBP": "https://finance.yahoo.com/news/rssindex",
            "INR": "https://finance.yahoo.com/news/rssindex"
        }

    def fetch_market_sentiment(self, target_currency: str) -> dict:
        """
        Scrapes the latest 15 headlines for the target market and calculates
        a normalized sentiment score between -1.0 (Panic) and 1.0 (Bullish).
        """
        feed_url = self.rss_feeds.get(target_currency, "https://finance.yahoo.com/news/rssindex")
        
        try:
            feed = feedparser.parse(feed_url)
            headlines = [entry.title for entry in feed.entries[:15]]
            
            if not headlines:
                return {"score": 0.0, "status": "NEUTRAL", "analyzed_articles": 0}

            total_compound_score = 0.0
            
            for headline in headlines:
                # VADER returns a compound score between -1 and 1 for the text
                score = self.analyzer.polarity_scores(headline)
                total_compound_score += score['compound']
                
            # Average the sentiment across all recent headlines
            average_sentiment = total_compound_score / len(headlines)
            
            # Categorize the sentiment for the frontend UI
            status = "NEUTRAL"
            if average_sentiment > 0.15:
                status = "BULLISH"
            elif average_sentiment < -0.15:
                status = "BEARISH"
                
            return {
                "score": round(average_sentiment, 3),
                "status": status,
                "analyzed_articles": len(headlines),
                "top_headline": headlines[0] if headlines else "No recent news."
            }
            
        except Exception as e:
            print(f"Error fetching sentiment: {e}")
            # Fail safely so the main app doesn't crash if Yahoo blocks us
            return {"score": 0.0, "status": "NEUTRAL", "analyzed_articles": 0, "error": str(e)}

# Quick test block: If you run this file directly, it will print the live sentiment!
if __name__ == "__main__":
    engine = SentimentEngine()
    print("Fetching live sentiment for USD/Global Markets...")
    result = engine.fetch_market_sentiment("USD")
    print(result)
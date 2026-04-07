package com.ethixnode.ethixnode_backend.service;

import com.ethixnode.ethixnode_backend.model.HistoricalRate;
import com.ethixnode.ethixnode_backend.repository.HistoricalRateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ForexIngestionService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String[] TARGET_CURRENCIES = {"USD", "EUR", "GBP", "SGD", "AED"};

    @Autowired
    private HistoricalRateRepository rateRepository;

    // Runs immediately on startup, and then exactly every 1 hour (3600000 ms)
    @Scheduled(fixedRate = 3600000)
    public void fetchLiveRatesAndSaveToDatabase() {
        System.out.println("⏳ Waking up: Fetching real-world Forex rates...");
        
        try {
            // Free open API endpoint based in INR
            String url = "https://open.er-api.com/v6/latest/INR";
            Map response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");
                
                for (String curr : TARGET_CURRENCIES) {
                    if (rates.containsKey(curr)) {
                        // The API tells us how much 1 INR is worth.
                        // We invert it to find out how many INR it takes to buy 1 USD/EUR etc.
                        double rateInInr = 1.0 / rates.get(curr);
                        
                        // Create the database entity
                        HistoricalRate newRate = new HistoricalRate(
                            curr, 
                            Math.round(rateInInr * 10000.0) / 10000.0, // Round to 4 decimals
                            LocalDateTime.now()
                        );
                        
                        // Save it to PostgreSQL!
                        rateRepository.save(newRate);
                    }
                }
                System.out.println("✅ Live Forex Rates securely saved to PostgreSQL DB!");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to ingest live rates: " + e.getMessage());
        }
    }
}
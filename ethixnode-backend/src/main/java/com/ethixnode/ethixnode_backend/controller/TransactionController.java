package com.ethixnode.ethixnode_backend.controller;

import com.ethixnode.ethixnode_backend.model.Transaction;
import com.ethixnode.ethixnode_backend.service.ForexIngestionService;
import com.ethixnode.ethixnode_backend.service.LedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private ForexIngestionService forexService;

    @Autowired
    private LedgerService ledgerService;

    @GetMapping("/rates")
    public ResponseEntity<Map<String, Object>> getLiveRates() {
        return ResponseEntity.ok(forexService.getLatestMarketPulse());
    }

    @PostMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulateTransaction(@RequestBody Map<String, Object> payload) {
        String baseCurrency = (String) payload.get("baseCurrency");
        String targetCurrency = (String) payload.get("targetCurrency");
        Double amountSent = Double.valueOf(payload.get("amountSent").toString());
        
        // THE FIX: Grab the AI Signal from React!
        String aiSignal = payload.containsKey("aiSignal") ? (String) payload.get("aiSignal") : "PENDING_AI";

        Map<String, Object> marketData = forexService.getLatestMarketPulse();
        double exchangeRateUsed = 90.00; 
        
        if (marketData.containsKey(baseCurrency)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> currencyData = (Map<String, Object>) marketData.get(baseCurrency);
            exchangeRateUsed = (Double) currencyData.get("current_rate");
        }

        double amountReceived = amountSent * exchangeRateUsed;
        double traditionalBankFee = amountSent * 0.05;
        double ethixNodeFee = amountSent * 0.005;

        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Pass the aiSignal into the new Transaction object here
        Transaction newTransaction = new Transaction(
                transactionId, baseCurrency, targetCurrency, 
                amountSent, amountReceived, exchangeRateUsed, aiSignal
        );

        ledgerService.executeImmutableTransfer(newTransaction, "DEMO_USER_99");

        Map<String, Object> response = new HashMap<>();
        response.put("id", transactionId);
        response.put("exchangeRateUsed", Math.round(exchangeRateUsed * 10000.0) / 10000.0);
        response.put("amountReceived", Math.round(amountReceived * 100.0) / 100.0);
        response.put("traditionalBankFee", Math.round(traditionalBankFee * 100.0) / 100.0);
        response.put("ethixNodeFee", Math.round(ethixNodeFee * 100.0) / 100.0);

        return ResponseEntity.ok(response);
    }

    @Autowired
    private com.ethixnode.ethixnode_backend.repository.TransactionRepository transactionRepo;

    @GetMapping("/history")
    public ResponseEntity<java.util.List<Transaction>> getTransactionHistory() {
        // Fetches the most recent 10 transactions from the ledger
        return ResponseEntity.ok(transactionRepo.findTop10ByOrderByCreatedAtDesc());
    }
}
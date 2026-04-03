package com.ethixnode.ethixnode_backend.controller;

import com.ethixnode.ethixnode_backend.model.Transaction;
import com.ethixnode.ethixnode_backend.repository.TransactionRepository;
import com.ethixnode.ethixnode_backend.service.AiIntegrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final AiIntegrationService aiIntegrationService;

    public TransactionController(TransactionRepository transactionRepository, AiIntegrationService aiIntegrationService) {
        this.transactionRepository = transactionRepository;
        this.aiIntegrationService = aiIntegrationService;
    }

    @GetMapping("/rates")
    public ResponseEntity<?> getLivePulse() {
        String[] pairs = {"USD", "EUR", "GBP"};
        Map<String, Object> pulseData = new HashMap<>();
        
        for (String base : pairs) {
            try {
                pulseData.put(base, aiIntegrationService.getForecast(base, "INR"));
            } catch (Exception e) {
                // Skip failed pair to keep the rest of the UI working
            }
        }
        return ResponseEntity.ok(pulseData);
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulateTransfer(@RequestBody TransferRequest request) {
        try {
            if (request.baseCurrency().equals(request.targetCurrency())) {
                return ResponseEntity.badRequest().body("Remittance requires a currency exchange.");
            }

            Map<String, Object> aiData = aiIntegrationService.getForecast(request.baseCurrency(), request.targetCurrency());
            Double currentRate = ((Number) aiData.get("current_rate")).doubleValue();
            String aiAdvice = (String) aiData.get("forecast_trend");

            Transaction transaction = new Transaction();
            transaction.setBaseCurrency(request.baseCurrency());
            transaction.setTargetCurrency(request.targetCurrency());
            transaction.setAmountSent(request.amountSent());
            transaction.setExchangeRateUsed(currentRate);
            transaction.setAmountReceived(request.amountSent() * currentRate);
            transaction.setTraditionalBankFee(request.amountSent() * 0.05);
            transaction.setEthixNodeFee(request.amountSent() * 0.005);
            transaction.setAiRecommendation(aiAdvice);

            return ResponseEntity.ok(transactionRepository.save(transaction));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}

record TransferRequest(String baseCurrency, String targetCurrency, Double amountSent) {}
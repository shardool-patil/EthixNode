package com.ethixnode.ethixnode_backend.controller;

import com.ethixnode.ethixnode_backend.model.RateAlert;
import com.ethixnode.ethixnode_backend.repository.RateAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173") // Allow React to talk to this endpoint
public class AlertController {

    @Autowired
    private RateAlertRepository alertRepository;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createAlert(@RequestBody RateAlert alertRequest) {
        // Ensure backend defaults are set before saving
        alertRequest.setTriggered(false);
        alertRequest.setCreatedAt(LocalDateTime.now());
        
        alertRepository.save(alertRequest);

        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Smart Alert set for " + alertRequest.getTargetCurrency() + " at " + alertRequest.getTargetRate());
        
        return ResponseEntity.ok(response);
    }
}
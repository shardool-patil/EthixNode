package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rate_alerts")
public class RateAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String targetCurrency;
    private Double targetRate;
    
    // Prevents us from sending 50 emails a day if the rate hovers around their target
    private boolean isTriggered = false; 
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public RateAlert() {}

    public RateAlert(String userEmail, String targetCurrency, Double targetRate) {
        this.userEmail = userEmail;
        this.targetCurrency = targetCurrency;
        this.targetRate = targetRate;
    }

    // --- Explicit Getters and Setters ---
    public Long getId() { return id; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public String getTargetCurrency() { return targetCurrency; }
    public void setTargetCurrency(String targetCurrency) { this.targetCurrency = targetCurrency; }
    
    public Double getTargetRate() { return targetRate; }
    public void setTargetRate(Double targetRate) { this.targetRate = targetRate; }
    
    public boolean isTriggered() { return isTriggered; }
    public void setTriggered(boolean triggered) { isTriggered = triggered; }
    
    // THE FIX: Explicitly adding the CreatedAt methods!
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
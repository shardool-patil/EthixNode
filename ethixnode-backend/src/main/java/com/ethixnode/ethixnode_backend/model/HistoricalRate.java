package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historical_rates")
public class HistoricalRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "currency_code", nullable = false)
    private String currencyCode; // e.g., "USD", "EUR"

    @Column(name = "exchange_rate", nullable = false)
    private Double exchangeRate; // How many INR it takes to buy 1 unit

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    // Default Constructor for JPA
    public HistoricalRate() {}

    public HistoricalRate(String currencyCode, Double exchangeRate, LocalDateTime recordedAt) {
        this.currencyCode = currencyCode;
        this.exchangeRate = exchangeRate;
        this.recordedAt = recordedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getCurrencyCode() { return currencyCode; }
    public Double getExchangeRate() { return exchangeRate; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}
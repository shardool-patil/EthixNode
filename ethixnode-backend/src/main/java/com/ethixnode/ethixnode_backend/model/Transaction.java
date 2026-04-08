package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_hash", unique = true, nullable = false)
    private String transactionHash;

    @Column(name = "base_currency", nullable = false)
    private String baseCurrency;

    @Column(name = "target_currency", nullable = false)
    private String targetCurrency;

    @Column(name = "amount_sent", nullable = false)
    private Double amountSent;

    @Column(name = "amount_received", nullable = false)
    private Double amountReceived;

    @Column(name = "exchange_rate_used", nullable = false)
    private Double exchangeRateUsed;

    @Column(name = "ai_signal", nullable = false)
    private String aiSignal; 

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Default Constructor
    public Transaction() {}

    // THE MISSING CONSTRUCTOR
    public Transaction(String transactionHash, String baseCurrency, String targetCurrency, 
                       Double amountSent, Double amountReceived, Double exchangeRateUsed, String aiSignal) {
        this.transactionHash = transactionHash;
        this.baseCurrency = baseCurrency;
        this.targetCurrency = targetCurrency;
        this.amountSent = amountSent;
        this.amountReceived = amountReceived;
        this.exchangeRateUsed = exchangeRateUsed;
        this.aiSignal = aiSignal;
        this.createdAt = LocalDateTime.now();
    }

    // THE MISSING GETTERS
    public Long getId() { return id; }
    public String getTransactionHash() { return transactionHash; }
    public String getBaseCurrency() { return baseCurrency; }
    public String getTargetCurrency() { return targetCurrency; }
    public Double getAmountSent() { return amountSent; }
    public Double getAmountReceived() { return amountReceived; }
    public Double getExchangeRateUsed() { return exchangeRateUsed; }
    public String getAiSignal() { return aiSignal; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
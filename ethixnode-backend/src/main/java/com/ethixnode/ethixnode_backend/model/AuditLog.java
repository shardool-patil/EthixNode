package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_hash", nullable = false, updatable = false)
    private String transactionHash;

    @Column(name = "account_id", nullable = false, updatable = false)
    private String accountId; // e.g., "USER_WALLET_123" or "ETHIX_LIQUIDITY_POOL"

    @Column(name = "entry_type", nullable = false, updatable = false)
    private String entryType; // CREDIT or DEBIT

    @Column(name = "currency_code", nullable = false, updatable = false)
    private String currencyCode;

    @Column(name = "amount", nullable = false, updatable = false)
    private Double amount;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(String transactionHash, String accountId, String entryType, 
                    String currencyCode, Double amount) {
        this.transactionHash = transactionHash;
        this.accountId = accountId;
        this.entryType = entryType;
        this.currencyCode = currencyCode;
        this.amount = amount;
        this.timestamp = LocalDateTime.now();
    }

    // Getters only - No Setters to enforce immutability at the application level
    public Long getId() { return id; }
    public String getTransactionHash() { return transactionHash; }
    public String getAccountId() { return accountId; }
    public String getEntryType() { return entryType; }
    public String getCurrencyCode() { return currencyCode; }
    public Double getAmount() { return amount; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
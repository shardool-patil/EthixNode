package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data 
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String baseCurrency;

    @Column(nullable = false)
    private String targetCurrency;

    @Column(nullable = false)
    private Double amountSent;

    @Column(nullable = false)
    private Double exchangeRateUsed;

    @Column(nullable = false)
    private Double amountReceived;

    private Double traditionalBankFee;

    private Double ethixNodeFee;

    private String aiRecommendation;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
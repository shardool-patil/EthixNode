package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data
public class Wallet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link this wallet directly to our existing User entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // e.g., "WISE", "PLAID", "REVOLUT"
    @Column(nullable = false)
    private String provider;

    // In a real app, this would be an encrypted OAuth token from the provider
    @Column(nullable = false)
    private String connectionToken;

    // The base currency of this specific wallet (e.g., "EUR")
    private String baseCurrency;

    private LocalDateTime connectedAt = LocalDateTime.now();
    
    private boolean isActive = true;
}
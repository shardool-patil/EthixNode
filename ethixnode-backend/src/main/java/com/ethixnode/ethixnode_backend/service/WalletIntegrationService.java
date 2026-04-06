package com.ethixnode.ethixnode_backend.service;

import com.ethixnode.ethixnode_backend.model.User;
import com.ethixnode.ethixnode_backend.model.Wallet;
import com.ethixnode.ethixnode_backend.repository.UserRepository;
import com.ethixnode.ethixnode_backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class WalletIntegrationService {

    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private UserRepository userRepository;

    private final Random random = new Random();

    // 1. Connect Wallet (WITH DUPLICATE CHECK)
    public Wallet connectWallet(String email, String provider, String baseCurrency) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check for duplicates
        List<Wallet> existingWallets = walletRepository.findByUserAndIsActiveTrue(user);
        for (Wallet w : existingWallets) {
            if (w.getProvider().equals(provider.toUpperCase()) && w.getBaseCurrency().equals(baseCurrency.toUpperCase())) {
                throw new RuntimeException("You already have an active " + provider + " wallet for " + baseCurrency + ".");
            }
        }

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setProvider(provider.toUpperCase());
        wallet.setBaseCurrency(baseCurrency.toUpperCase());
        wallet.setConnectionToken("ethix_link_" + System.currentTimeMillis()); 
        
        return walletRepository.save(wallet);
    }

    // 2. Disconnect Wallet (NEW FEATURE)
    public void disconnectWallet(String email, Long walletId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        // Security check: Ensure the wallet actually belongs to this user
        if (!wallet.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized action.");
        }

        // Soft delete
        wallet.setActive(false);
        walletRepository.save(wallet);
    }

    // 3. Fetch Balances
    public List<Map<String, Object>> getLiveBalances(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Wallet> connectedWallets = walletRepository.findByUserAndIsActiveTrue(user);
        List<Map<String, Object>> balances = new ArrayList<>();

        for (Wallet wallet : connectedWallets) {
            double mockedBalance = generateMockBalance(wallet.getBaseCurrency());
            balances.add(Map.of(
                "walletId", wallet.getId(),
                "provider", wallet.getProvider(),
                "currency", wallet.getBaseCurrency(),
                "balance", mockedBalance,
                "status", "SYNCED"
            ));
        }

        return balances;
    }

    // 4. Randomized Mock Balances (NEW FEATURE)
    private double generateMockBalance(String currency) {
        double baseAmount = switch (currency) {
            case "USD" -> 4250.00;
            case "EUR" -> 3120.00;
            case "GBP" -> 1850.00;
            case "INR" -> 85400.00;
            default -> 1000.00;
        };
        
        // Adds a random variance between -$500 and +$500 so no two wallets look identical
        double variance = (random.nextDouble() * 1000) - 500;
        return Math.max(0, baseAmount + variance); // Ensures it never goes below 0
    }
}
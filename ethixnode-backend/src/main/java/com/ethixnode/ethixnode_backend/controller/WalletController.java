package com.ethixnode.ethixnode_backend.controller;

import com.ethixnode.ethixnode_backend.service.WalletIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletIntegrationService walletService;

    // Helper to extract email from whoever is currently logged in
    // Includes the bulletproof fallback for private GitHub accounts
    private String getEmailFromAuth(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User) {
             OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
             Object emailObj = oauthUser.getAttribute("email");
             
             if (emailObj != null) {
                 return emailObj.toString();
             } else {
                 // Fallback: Generate a database-safe email using their GitHub username
                 return oauthUser.getAttribute("login") + "@github.com";
             }
        }
        return authentication.getName(); 
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connectWallet(Authentication authentication, @RequestBody Map<String, String> payload) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            String email = getEmailFromAuth(authentication);
            walletService.connectWallet(email, payload.get("provider"), payload.get("currency"));
            return ResponseEntity.ok(Map.of("message", "Wallet connected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/balances")
    public ResponseEntity<?> getBalances(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            String email = getEmailFromAuth(authentication);
            return ResponseEntity.ok(walletService.getLiveBalances(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{walletId}")
    public ResponseEntity<?> disconnectWallet(Authentication authentication, @PathVariable Long walletId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            String email = getEmailFromAuth(authentication);
            walletService.disconnectWallet(email, walletId);
            return ResponseEntity.ok(Map.of("message", "Wallet disconnected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
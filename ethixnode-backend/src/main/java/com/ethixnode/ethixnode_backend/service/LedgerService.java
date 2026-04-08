package com.ethixnode.ethixnode_backend.service;

import com.ethixnode.ethixnode_backend.model.AuditLog;
import com.ethixnode.ethixnode_backend.model.Transaction;
import com.ethixnode.ethixnode_backend.repository.AuditLogRepository;
import com.ethixnode.ethixnode_backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LedgerService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Executes a full double-entry ledger sequence with strict ACID compliance.
     */
    @Transactional
    public void executeImmutableTransfer(Transaction transaction, String userId) {
        
        // 1. Save the overarching Transaction Receipt
        transactionRepository.save(transaction);
        
        String txnHash = transaction.getTransactionHash();

        // --- STEP 1: Process the Base Currency (What the user sends) ---
        // DEBIT: Remove base currency from the User's Wallet
        AuditLog userDebit = new AuditLog(
            txnHash, "USER_" + userId, "DEBIT", 
            transaction.getBaseCurrency(), transaction.getAmountSent()
        );
        
        // CREDIT: Add base currency to the EthixNode Liquidity Pool
        AuditLog poolCredit = new AuditLog(
            txnHash, "ETHIX_POOL_BASE", "CREDIT", 
            transaction.getBaseCurrency(), transaction.getAmountSent()
        );

        // --- STEP 2: Process the Target Currency (What the user receives) ---
        // DEBIT: Remove target currency from EthixNode Liquidity Pool
        AuditLog poolDebit = new AuditLog(
            txnHash, "ETHIX_POOL_TARGET", "DEBIT", 
            transaction.getTargetCurrency(), transaction.getAmountReceived()
        );

        // CREDIT: Add target currency to the User's Wallet
        AuditLog userCredit = new AuditLog(
            txnHash, "USER_" + userId, "CREDIT", 
            transaction.getTargetCurrency(), transaction.getAmountReceived()
        );

        // 2. Permanently write all 4 legs of the trade to the Audit Table
        auditLogRepository.save(userDebit);
        auditLogRepository.save(poolCredit);
        auditLogRepository.save(poolDebit);
        auditLogRepository.save(userCredit);
        
        System.out.println("✅ Double-Entry Ledger successfully secured for: " + txnHash);
    }
}
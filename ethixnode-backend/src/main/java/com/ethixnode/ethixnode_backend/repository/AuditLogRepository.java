package com.ethixnode.ethixnode_backend.repository;

import com.ethixnode.ethixnode_backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Allows us to fetch the full double-entry history for a specific transaction
    List<AuditLog> findByTransactionHash(String transactionHash);
}
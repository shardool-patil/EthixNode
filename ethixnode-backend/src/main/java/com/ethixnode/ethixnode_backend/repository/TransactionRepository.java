package com.ethixnode.ethixnode_backend.repository;

import com.ethixnode.ethixnode_backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Spring Boot automatically translates this method name into a SQL query:
    // SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
    List<Transaction> findTop10ByOrderByCreatedAtDesc();
    
}
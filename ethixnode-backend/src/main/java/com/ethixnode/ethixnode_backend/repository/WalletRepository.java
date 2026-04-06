package com.ethixnode.ethixnode_backend.repository;

import com.ethixnode.ethixnode_backend.model.Wallet;
import com.ethixnode.ethixnode_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    List<Wallet> findByUserAndIsActiveTrue(User user);
}
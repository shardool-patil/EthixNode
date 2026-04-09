package com.ethixnode.ethixnode_backend.repository;

import com.ethixnode.ethixnode_backend.model.RateAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RateAlertRepository extends JpaRepository<RateAlert, Long> {
    // Finds all active alerts for a specific currency (e.g., all USD alerts that haven't fired yet)
    List<RateAlert> findByTargetCurrencyAndIsTriggeredFalse(String targetCurrency);
}
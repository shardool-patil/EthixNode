package com.ethixnode.ethixnode_backend.repository;

import com.ethixnode.ethixnode_backend.model.HistoricalRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricalRateRepository extends JpaRepository<HistoricalRate, Long> {
    
    // Custom query to grab the 30 most recent rates for our future AI backtest graph!
    List<HistoricalRate> findTop30ByCurrencyCodeOrderByRecordedAtDesc(String currencyCode);
}
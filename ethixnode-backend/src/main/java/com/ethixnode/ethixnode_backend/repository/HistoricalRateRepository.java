package com.ethixnode.ethixnode_backend.repository;

import com.ethixnode.ethixnode_backend.model.HistoricalRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricalRateRepository extends JpaRepository<HistoricalRate, Long> {
    
    // Upgraded to fetch the last 14 days of data!
    List<HistoricalRate> findTop14ByCurrencyCodeOrderByRecordedAtDesc(String currencyCode);
}
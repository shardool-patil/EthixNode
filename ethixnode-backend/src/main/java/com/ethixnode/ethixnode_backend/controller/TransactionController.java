package com.ethixnode.ethixnode_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    // Simulating a database of historical records for the hackathon
    private final List<Map<String, Object>> mockDatabase = new ArrayList<>();

    public TransactionController() {
        // Generate 45 fake historical transactions when the server starts
        String[] networks = {"Wise", "EthixNode Direct", "Polygon Web3", "Ripple Net"};
        String[] routes = {"USD → INR", "EUR → NGN", "GBP → MXN", "CAD → BRL", "AUD → PHP"};
        Random random = new Random();

        for (int i = 0; i < 45; i++) {
            double amount = 100 + (random.nextDouble() * 2000);
            mockDatabase.add(Map.of(
                "id", "HIST-" + (System.currentTimeMillis() - (i * 100000)),
                "timestamp", LocalDateTime.now().minusMinutes(i * 15).format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                "route", routes[random.nextInt(routes.length)],
                "network", networks[random.nextInt(networks.length)],
                "amount", String.format("%.2f", amount),
                "savings", String.format("+%.2f Saved", (amount * 0.05) - (amount * 0.005))
            ));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit) {
        
        int totalRecords = mockDatabase.size();
        int totalPages = (int) Math.ceil((double) totalRecords / limit);
        
        // Calculate pagination slices
        int startIndex = (page - 1) * limit;
        int endIndex = Math.min(startIndex + limit, totalRecords);

        // Prevent out-of-bounds errors if they request a page that doesn't exist
        if (startIndex >= totalRecords) {
            return ResponseEntity.ok(Map.of("data", new ArrayList<>(), "currentPage", page, "totalPages", totalPages));
        }

        List<Map<String, Object>> paginatedList = mockDatabase.subList(startIndex, endIndex);

        return ResponseEntity.ok(Map.of(
            "data", paginatedList,
            "currentPage", page,
            "totalPages", totalPages
        ));
    }
}
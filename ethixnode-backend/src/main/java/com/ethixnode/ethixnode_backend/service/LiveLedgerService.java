package com.ethixnode.ethixnode_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Random;

@Service
public class LiveLedgerService {

    // This is the tool we use to push data to WebSockets
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();

    // Arrays to generate realistic looking mock data
    private final String[] origins = {"USD", "EUR", "GBP", "CAD", "AUD"};
    private final String[] destinations = {"INR", "MXN", "NGN", "BRL", "PHP"};
    private final String[] networks = {"Wise", "EthixNode Direct", "Polygon Web3", "Ripple Net"};

    // This method automatically runs every 3.5 seconds (3500 milliseconds)
    @Scheduled(fixedRate = 3500)
    public void broadcastGlobalTransaction() {
        // 1. Generate realistic fake data
        String fromCurrency = origins[random.nextInt(origins.length)];
        String toCurrency = destinations[random.nextInt(destinations.length)];
        String network = networks[random.nextInt(networks.length)];
        
        double amountSent = 100 + (random.nextDouble() * 2000); // Between $100 and $2100
        double bankFee = amountSent * 0.05; // Traditional banks charge ~5%
        double ethixFee = amountSent * 0.005; // We charge 0.5%
        double savings = bankFee - ethixFee;

        // 2. Package it into a JSON-friendly Map
        Map<String, Object> transactionEvent = Map.of(
            "id", "TXN-" + System.currentTimeMillis(),
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
            "route", fromCurrency + " → " + toCurrency,
            "network", network,
            "amount", String.format("%.2f %s", amountSent, fromCurrency),
            "savings", String.format("+%.2f %s Saved", savings, fromCurrency),
            "status", "SETTLED"
        );

        // 3. BLAST it to the React Frontend!
        messagingTemplate.convertAndSend("/topic/global-ledger", (Object) transactionEvent);
        
        System.out.println("Broadcasting Live Ledger Event: " + transactionEvent.get("id"));
    }
}
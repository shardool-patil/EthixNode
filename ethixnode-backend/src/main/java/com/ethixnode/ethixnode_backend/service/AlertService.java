package com.ethixnode.ethixnode_backend.service;

import com.ethixnode.ethixnode_backend.model.RateAlert;
import com.ethixnode.ethixnode_backend.repository.RateAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private RateAlertRepository alertRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void checkAndNotify(String currency, Double currentRate, String aiSignal) {
        // Grab all untriggered alerts for this currency
        List<RateAlert> activeAlerts = alertRepository.findByTargetCurrencyAndIsTriggeredFalse(currency);

        for (RateAlert alert : activeAlerts) {
            // If the live rate is equal to or better than their target AND the AI says go!
            if (currentRate >= alert.getTargetRate() && "SEND_NOW".equals(aiSignal)) {
                sendEmail(alert, currentRate);
                
                // Mark as triggered so we don't email them again next hour
                alert.setTriggered(true);
                alertRepository.save(alert);
            }
        }
    }

    private void sendEmail(RateAlert alert, Double currentRate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(alert.getUserEmail());
        message.setSubject("🚀 EthixNode Smart Alert: Target Reached!");
        message.setText("Great news!\n\n" + 
                        alert.getTargetCurrency() + " has reached your target rate of " + currentRate + ".\n" +
                        "Our AI signal is currently flashing: SEND_NOW.\n\n" +
                        "Log in to your dashboard to complete your transfer and lock in this rate.");
        
        try {
            mailSender.send(message);
            System.out.println("📧 Alert email sent successfully to " + alert.getUserEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send email to " + alert.getUserEmail() + ": " + e.getMessage());
        }
    }
}
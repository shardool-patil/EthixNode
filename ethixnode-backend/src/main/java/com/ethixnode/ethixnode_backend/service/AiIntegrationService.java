package com.ethixnode.ethixnode_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Service
public class AiIntegrationService {

    private final WebClient webClient;

    // We removed WebClient.Builder from the parameters so Spring stops looking for the missing bean
    public AiIntegrationService(@Value("${ethixnode.ai.service.url}") String aiServiceUrl) {
        // Manually build the WebClient here instead
        this.webClient = WebClient.builder().baseUrl(aiServiceUrl).build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getForecast(String baseCurrency, String targetCurrency) {
        String endpoint = String.format("/api/forecast/%s/%s", baseCurrency, targetCurrency);

        return (Map<String, Object>) webClient.get()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}
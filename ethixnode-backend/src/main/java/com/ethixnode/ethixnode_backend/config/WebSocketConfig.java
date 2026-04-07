package com.ethixnode.ethixnode_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // This is the channel the frontend will subscribe to listen for live data
        config.enableSimpleBroker("/topic");
        
        // This is the prefix for messages sent FROM the frontend TO the backend
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The HTTP endpoint the React app will hit to upgrade to a WebSocket connection
        registry.addEndpoint("/ws-ledger")
                .setAllowedOriginPatterns("*") // The Fix: Bulletproof CORS for local dev
                .withSockJS(); 
    }
}
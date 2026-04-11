package com.ethixnode.ethixnode_backend.service;

import com.ethixnode.ethixnode_backend.model.User;
import com.ethixnode.ethixnode_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // THE FIX: If it's a GitHub user, their password is null in the DB.
        // We supply an empty string instead of crashing, allowing the JWT Filter to accept them!
        String password = user.getPassword() != null ? user.getPassword() : "";

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                password,
                new ArrayList<>() // Empty authorities/roles for now
        );
    }
}
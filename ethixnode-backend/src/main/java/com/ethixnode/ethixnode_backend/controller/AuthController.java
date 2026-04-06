package com.ethixnode.ethixnode_backend.controller;

import com.ethixnode.ethixnode_backend.model.User;
import com.ethixnode.ethixnode_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered."));
        }

        User user = new User();
        user.setName(payload.get("name"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(payload.get("password")));
        user.setProvider("LOCAL");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload, HttpServletRequest request, HttpServletResponse response) {
        try {
            // Verify password against the database
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(payload.get("email"), payload.get("password"))
            );
            
            // Create the secure session
            SecurityContextHolder.getContext().setAuthentication(authentication);
            new HttpSessionSecurityContextRepository().saveContext(SecurityContextHolder.getContext(), request, response);
            
            return ResponseEntity.ok(Map.of("message", "Logged in successfully"));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String name = "User";
        String email = "";
        String avatar = ""; 

        Object principal = authentication.getPrincipal();

        // If they logged in via GitHub
        // If they logged in via GitHub
        if (principal instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) principal;
            name = oauthUser.getAttribute("name");
            if (name == null) name = oauthUser.getAttribute("login");
            
            // --- THE FIX: HANDLE PRIVATE GITHUB EMAILS ---
            Object emailObj = oauthUser.getAttribute("email");
            if (emailObj != null) {
                email = emailObj.toString();
            } else {
                // If private, make a fake email using their GitHub username
                email = oauthUser.getAttribute("login") + "@github.com"; 
            }
            
            Object avatarObj = oauthUser.getAttribute("avatar_url");
            if (avatarObj != null) avatar = avatarObj.toString();

            // Auto-Save to PostgreSQL
            if (email != null && !email.isEmpty()) {
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isEmpty()) {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProvider("GITHUB");
                    userRepository.save(newUser);
                }
            }
        }
        // If they logged in via our local database
        else if (principal instanceof org.springframework.security.core.userdetails.User) {
            org.springframework.security.core.userdetails.User localPrincipal = (org.springframework.security.core.userdetails.User) principal;
            email = localPrincipal.getUsername();
            Optional<User> dbUser = userRepository.findByEmail(email);
            if (dbUser.isPresent()) {
                name = dbUser.get().getName();
            }
        }

        if (name == null || name.isEmpty()) name = "User";
        String initials = name.substring(0, 1).toUpperCase();

        return ResponseEntity.ok(Map.of(
            "name", name,
            "email", email,
            "avatar", avatar, 
            "initials", initials
        ));
    }

    @GetMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        response.sendRedirect("http://localhost:5173/");
    }
}
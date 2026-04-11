package com.ethixnode.ethixnode_backend.controller;

import com.ethixnode.ethixnode_backend.model.User;
import com.ethixnode.ethixnode_backend.repository.UserRepository;
import com.ethixnode.ethixnode_backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @Autowired
    private JwtService jwtService; // THE NEW FIX: Inject the token engine

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
        userRepository.saveAndFlush(user);

        // --- THE NEW PART: Create token immediately ---
        // We create a UserDetails object manually to generate the token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(new java.util.ArrayList<>())
                .build();

        String jwtToken = jwtService.generateToken(userDetails);

        // Return everything in ONE response
        return ResponseEntity.ok(Map.of(
            "message", "User registered successfully",
            "token", jwtToken,
            "user", Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "initials", user.getName().substring(0, 1).toUpperCase()
            )
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload) {
        try {
            // Verify password against the database
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(payload.get("email"), payload.get("password"))
            );
            
            // Extract the verified user data
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // THE NEW FIX: Generate the JWT Token instead of a session
            String jwtToken = jwtService.generateToken(userDetails);
            
            // Send the token back to the React frontend
            return ResponseEntity.ok(Map.of(
                "message", "Logged in successfully",
                "token", jwtToken
            ));
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // The JWT filter gives us the email directly in the Authentication object
        String email = authentication.getName();
        Optional<User> dbUser = userRepository.findByEmail(email);

        if (dbUser.isPresent()) {
            User user = dbUser.get();
            String name = user.getName() != null ? user.getName() : "User";
            String initials = name.substring(0, 1).toUpperCase();
            
            // Extract the avatar we saved in the DB!
            String avatar = user.getAvatar() != null ? user.getAvatar() : "";

            return ResponseEntity.ok(Map.of(
                "name", name,
                "email", user.getEmail(),
                "avatar", avatar, 
                "initials", initials
            ));
        }

        return ResponseEntity.status(404).body("User not found");
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        // THE NEW FIX: JWTs are stateless. 
        // We just clear the server context and tell React to delete the token from LocalStorage.
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
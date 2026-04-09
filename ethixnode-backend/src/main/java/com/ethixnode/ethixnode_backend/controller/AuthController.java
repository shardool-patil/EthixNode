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
import org.springframework.security.oauth2.core.user.OAuth2User;
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
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
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
        // Because of our JwtAuthenticationFilter, if React sends a valid token,
        // this 'authentication' object will automatically be populated!
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String name = "User";
        String email = "";
        String avatar = ""; 

        Object principal = authentication.getPrincipal();

        // If they logged in via GitHub
        if (principal instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) principal;
            name = oauthUser.getAttribute("name");
            if (name == null) name = oauthUser.getAttribute("login");
            
            Object emailObj = oauthUser.getAttribute("email");
            if (emailObj != null) {
                email = emailObj.toString();
            } else {
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
    public ResponseEntity<?> logout() {
        // THE NEW FIX: JWTs are stateless. 
        // We just clear the server context and tell React to delete the token from LocalStorage.
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
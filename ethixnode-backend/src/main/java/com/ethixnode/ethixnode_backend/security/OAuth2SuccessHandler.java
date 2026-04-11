package com.ethixnode.ethixnode_backend.security;

import com.ethixnode.ethixnode_backend.model.User;
import com.ethixnode.ethixnode_backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository; // Inject the repository to save new users

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("avatar_url"); // THE NEW FIX: Grab the picture
        
        if (name == null) name = oAuth2User.getAttribute("login");
        if (email == null) email = oAuth2User.getAttribute("login") + "@github.com";

        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isEmpty()) {
            // New user! Save everything including the avatar
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setAvatar(avatarUrl);
            newUser.setProvider("GITHUB");
            userRepository.saveAndFlush(newUser);
        } else {
            // Returning user! Update their avatar just in case they changed it on GitHub
            User user = existingUser.get();
            if (avatarUrl != null && !avatarUrl.equals(user.getAvatar())) {
                user.setAvatar(avatarUrl);
                userRepository.saveAndFlush(user);
            }
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(email)
                .password("") 
                .authorities(new ArrayList<>())
                .build();

        String token = jwtService.generateToken(userDetails);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
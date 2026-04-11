package com.ethixnode.ethixnode_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    // This will be null for GitHub users, but populated for local users
    private String password;

    // To track how they signed up ("LOCAL" or "GITHUB")
    private String provider;

    private String avatar;

    // Add these getters and setters
    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
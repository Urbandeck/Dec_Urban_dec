package com.digitalframes.shop.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Admin@2024!";
        String hashedPassword = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("Hashed: " + hashedPassword);
        System.out.println("SQL: UPDATE users SET password = '" + hashedPassword + "' WHERE email = 'admin@urbandeck.com';");
    }
}
package com.digitalframes.shop.service;

import com.digitalframes.shop.model.User;
import com.digitalframes.shop.repository.UserRepository;
import com.digitalframes.shop.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostConstruct
    public void initializeDefaultUsers() {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@digitalframes.shop")) {
            User admin = new User();
            admin.setEmail("admin@digitalframes.shop");
            admin.setPassword(passwordEncoder.encode("Admin@2024!"));
            admin.setName("Admin User");
            admin.setRoles(new HashSet<>(Arrays.asList("USER", "ADMIN")));
            admin.setEmailVerified(true);
            admin.setActive(true);
            userRepository.save(admin);
        }

        // Create demo user if not exists
        if (!userRepository.existsByEmail("demo@example.com")) {
            User demo = new User();
            demo.setEmail("demo@example.com");
            demo.setPassword(passwordEncoder.encode("Demo123!"));
            demo.setName("Demo User");
            demo.setRoles(new HashSet<>(Arrays.asList("USER")));
            demo.setEmailVerified(true);
            demo.setActive(true);
            userRepository.save(demo);
        }
    }

    public Map<String, Object> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmailAndActive(email, true);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return createAuthResponse(user);
    }

    public Map<String, Object> register(String email, String password, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setName(name);
        newUser.setRoles(new HashSet<>(Arrays.asList("USER")));
        newUser.setEmailVerified(false);
        newUser.setActive(true);

        User savedUser = userRepository.save(newUser);

        return createAuthResponse(savedUser);
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        // For now, just generate a new access token
        // In production, validate the refresh token properly
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", generateAccessToken());
        return response;
    }

    private Map<String, Object> createAuthResponse(User user) {
        Map<String, Object> response = new HashMap<>();

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId().toString());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getName());
        userMap.put("roles", user.getRoles().toArray(new String[0]));

        response.put("user", userMap);
        response.put("accessToken", generateAccessToken());
        response.put("refreshToken", generateRefreshToken());

        return response;
    }

    private String generateAccessToken() {
        // Generate JWT token if JwtUtil is available
        if (jwtUtil != null) {
            return jwtUtil.generateToken(new HashMap<>());
        }
        // Otherwise generate a simple UUID token
        return "token-" + UUID.randomUUID().toString();
    }

    private String generateRefreshToken() {
        return "refresh-" + UUID.randomUUID().toString();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
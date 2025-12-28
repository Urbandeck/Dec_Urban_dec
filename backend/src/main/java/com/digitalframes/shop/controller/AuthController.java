package com.digitalframes.shop.controller;

import com.digitalframes.shop.service.AuthService;
import com.digitalframes.shop.service.OTPService;
import com.digitalframes.shop.service.UserRegistrationCache;
import com.digitalframes.shop.repository.UserRepository;
import com.digitalframes.shop.model.OTP.OTPType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "https://frontend-tawny-psi-67.vercel.app", "https://www.urbandec.in", "https://urbandec.in"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPService otpService;

    @Autowired
    private UserRegistrationCache registrationCache;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                  HttpServletRequest httpRequest,
                                  @RequestParam(value = "remember-me", defaultValue = "false") String rememberMe) {
        try {
            // First validate the credentials using the existing service
            Map<String, Object> userInfo = authService.login(request.email, request.password);

            // Create Spring Security authentication token
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(request.email, request.password);

            // Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(authToken);

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create new session
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                               SecurityContextHolder.getContext());

            // Set session timeout (30 minutes if no remember me, 30 days if remember me)
            if ("true".equals(rememberMe)) {
                session.setMaxInactiveInterval(30 * 24 * 60 * 60); // 30 days
            } else {
                session.setMaxInactiveInterval(30 * 60); // 30 minutes
            }

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Basic validation
            if (request.email == null || request.email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }
            if (request.password == null || request.password.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
            }
            if (request.name == null || request.name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already registered. Please use a different email or login with your existing account."));
            }

            // Store user data temporarily in cache
            registrationCache.store(request.email, request.password, request.name);

            // Generate and send OTP
            otpService.generateOTP(request.email, OTPType.SIGNUP);

            Map<String, Object> response = new HashMap<>();
            response.put("requiresOTP", true);
            response.put("email", request.email);
            response.put("message", "OTP sent to your email. Please verify to complete registration.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-signup-otp")
    public ResponseEntity<?> verifySignupOTP(@RequestBody VerifyOTPRequest request) {
        try {
            // Verify OTP
            boolean isValid = otpService.verifyOTP(request.email, request.otp, OTPType.SIGNUP);

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
            }

            // Get cached user data
            UserRegistrationCache.UserRegistrationData userData = registrationCache.get(request.email);
            if (userData == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Registration session expired. Please start again."));
            }

            // Complete registration
            Map<String, Object> response = authService.register(userData.email, userData.password, userData.name);

            // Remove from cache after successful registration
            registrationCache.remove(request.email);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestBody ResendOTPRequest request) {
        try {
            OTPType type = OTPType.valueOf(request.type.toUpperCase());
            otpService.resendOTP(request.email, type);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP has been resent to your email");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP type"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        try {
            Map<String, Object> response = authService.refreshToken(request.refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid refresh token"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        // Get user details from authentication
        Object principal = authentication.getPrincipal();

        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            org.springframework.security.core.userdetails.UserDetails userDetails =
                (org.springframework.security.core.userdetails.UserDetails) principal;

            // Get full user info from database
            String email = userDetails.getUsername();
            var userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                var user = userOpt.get();
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("user", Map.of(
                    "id", user.getId().toString(),
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "roles", user.getRoles()
                ));
                return ResponseEntity.ok(userInfo);
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "User not found"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // Get the session and invalidate it
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Clear the security context
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Logged out successfully"
        ));
    }

    @GetMapping("/logout-success")
    public ResponseEntity<?> logoutSuccess() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Logged out successfully"
        ));
    }

    @GetMapping("/session-expired")
    public ResponseEntity<?> sessionExpired() {
        return ResponseEntity.status(401).body(Map.of(
            "message", "Your session has expired. Please login again."
        ));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request,
                                        HttpServletRequest httpRequest) {
        try {
            // Check if user exists by email or googleId
            var existingUser = userRepository.findByEmail(request.email);
            com.digitalframes.shop.model.User user;

            // Admin emails that should have ADMIN role
            java.util.Set<String> adminEmails = java.util.Set.of("urbandec.in@gmail.com");

            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update googleId if not set
                if (user.getGoogleId() == null) {
                    user.setGoogleId(request.googleId);
                }
                if (request.picture != null) {
                    user.setProfilePicture(request.picture);
                }
                // Grant admin role if this is an admin email and doesn't have it yet
                if (adminEmails.contains(request.email) && !user.getRoles().contains("ADMIN")) {
                    user.getRoles().add("ADMIN");
                }
                user.setLastLogin(java.time.LocalDateTime.now());
                user.setEmailVerified(true);
                userRepository.save(user);
            } else {
                // Create new user
                user = new com.digitalframes.shop.model.User();
                user.setEmail(request.email);
                user.setName(request.name);
                user.setGoogleId(request.googleId);
                user.setProfilePicture(request.picture);
                user.setPassword(org.springframework.security.crypto.bcrypt.BCrypt.hashpw(request.googleId, org.springframework.security.crypto.bcrypt.BCrypt.gensalt()));
                user.setEmailVerified(true);
                user.setActive(true);
                user.setLastLogin(java.time.LocalDateTime.now());
                user.getRoles().add("USER");
                // Grant admin role if this is an admin email
                if (adminEmails.contains(request.email)) {
                    user.getRoles().add("ADMIN");
                }
                userRepository.save(user);
            }

            // Create session
            HttpSession session = httpRequest.getSession(true);
            session.setMaxInactiveInterval(30 * 24 * 60 * 60); // 30 days

            // Create authentication token
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(user.getEmail(), null,
                    user.getRoles().stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                        .collect(java.util.stream.Collectors.toList()));

            SecurityContextHolder.getContext().setAuthentication(authToken);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                               SecurityContextHolder.getContext());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId().toString(),
                "email", user.getEmail(),
                "name", user.getName(),
                "roles", user.getRoles(),
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Google authentication failed: " + e.getMessage()));
        }
    }

    static class LoginRequest {
        public String email;
        public String password;
    }

    static class RegisterRequest {
        public String email;
        public String password;
        public String name;
    }

    static class RefreshRequest {
        public String refreshToken;
    }

    static class VerifyOTPRequest {
        public String email;
        public String otp;
    }

    static class ResendOTPRequest {
        public String email;
        public String type;
    }

    static class GoogleAuthRequest {
        public String email;
        public String name;
        public String googleId;
        public String picture;
    }
}
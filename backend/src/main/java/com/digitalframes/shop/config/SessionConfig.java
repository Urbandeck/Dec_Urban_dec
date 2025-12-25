package com.digitalframes.shop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices.RememberMeTokenAlgorithm;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;

/**
 * E-commerce style session configuration
 * Similar to Amazon, Flipkart, etc.
 */
@Configuration
@EnableWebSecurity
public class SessionConfig {

    @Value("${app.remember-me.key:digitalframes2024SecureKey}")
    private String rememberMeKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                          RememberMeServices rememberMeServices) throws Exception {
        http
            // CSRF protection for session-based auth
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/auth/**", "/api/orders/**", "/api/payment/**")
            )

            // CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Session-based authentication (like most e-commerce sites)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(3) // Allow max 3 concurrent sessions per user
                .maxSessionsPreventsLogin(false) // Don't prevent new logins, invalidate oldest
                .expiredUrl("/api/auth/session-expired")
            )

            // Remember Me functionality (like "Keep me signed in")
            .rememberMe(remember -> remember
                .rememberMeServices(rememberMeServices)
                .tokenValiditySeconds(2592000) // 30 days
                .key(rememberMeKey)
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**", "/api/products/**", "/api/site-settings/**").permitAll()
                .requestMatchers("/api/orders/guest/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()

                // Admin only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // User endpoints (must be logged in)
                .requestMatchers("/api/user/**", "/api/orders/**").authenticated()

                // Everything else is public
                .anyRequest().permitAll()
            )

            // Disable default logout (we have custom logout endpoint)
            .logout(logout -> logout.disable());

        return http.build();
    }

    @Bean
    public RememberMeServices rememberMeServices(UserDetailsService userDetailsService) {
        RememberMeTokenAlgorithm encodingAlgorithm = RememberMeTokenAlgorithm.SHA256;
        TokenBasedRememberMeServices rememberMe = new TokenBasedRememberMeServices(
            rememberMeKey, userDetailsService, encodingAlgorithm);
        rememberMe.setMatchingAlgorithm(RememberMeTokenAlgorithm.MD5);
        return rememberMe;
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "https://frontend-tawny-psi-67.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // Important for cookies
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
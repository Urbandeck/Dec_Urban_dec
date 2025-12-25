package com.digitalframes.shop.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class UserRegistrationCache {

    private final ConcurrentHashMap<String, UserRegistrationData> cache = new ConcurrentHashMap<>();
    private static final long EXPIRY_TIME = TimeUnit.MINUTES.toMillis(15); // 15 minutes expiry

    public static class UserRegistrationData {
        public String email;
        public String password;
        public String name;
        public long timestamp;

        public UserRegistrationData(String email, String password, String name) {
            this.email = email;
            this.password = password;
            this.name = name;
            this.timestamp = System.currentTimeMillis();
        }

        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > EXPIRY_TIME;
        }
    }

    public void store(String email, String password, String name) {
        // Clean up expired entries
        cleanupExpired();

        cache.put(email, new UserRegistrationData(email, password, name));
    }

    public UserRegistrationData get(String email) {
        UserRegistrationData data = cache.get(email);
        if (data != null && data.isExpired()) {
            cache.remove(email);
            return null;
        }
        return data;
    }

    public void remove(String email) {
        cache.remove(email);
    }

    private void cleanupExpired() {
        cache.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
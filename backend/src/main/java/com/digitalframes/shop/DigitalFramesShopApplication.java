package com.digitalframes.shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DigitalFramesShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(DigitalFramesShopApplication.class, args);
    }
}
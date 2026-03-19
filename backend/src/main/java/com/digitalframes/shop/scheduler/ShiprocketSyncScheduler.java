package com.digitalframes.shop.scheduler;

import com.digitalframes.shop.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ShiprocketSyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ShiprocketSyncScheduler.class);

    @Autowired
    private OrderService orderService;

    /**
     * Sync Shiprocket statuses every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void syncShiprocketStatuses() {
        logger.info("Starting scheduled Shiprocket status sync...");
        try {
            Map<String, Object> result = orderService.syncShiprocketStatuses();
            logger.info("Scheduled sync complete: {}", result);
        } catch (Exception e) {
            logger.error("Scheduled Shiprocket sync failed: {}", e.getMessage(), e);
        }
    }
}

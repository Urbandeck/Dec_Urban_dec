package com.digitalframes.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderDto {
    private BigDecimal amount;
    private String currency = "INR";
    private String receipt;
    private String notes;
}
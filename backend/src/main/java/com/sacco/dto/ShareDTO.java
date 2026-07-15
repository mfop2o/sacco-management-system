package com.sacco.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ShareDTO {
    private UUID id;
    private UUID memberId;
    private String memberName;
    private Integer numberOfShares;
    private BigDecimal pricePerShare;
    private BigDecimal totalValue;
    private LocalDate purchaseDate;
    private String status;
}

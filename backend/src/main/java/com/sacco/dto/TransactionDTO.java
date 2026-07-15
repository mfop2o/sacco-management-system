package com.sacco.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TransactionDTO {
    private UUID id;
    private String transactionNumber;
    private UUID memberId;
    private UUID loanId;
    private UUID savingsAccountId;
    private String transactionType;
    private BigDecimal amount;
    private String description;
    private LocalDateTime transactionDate;
    private String status;
    private String paymentMethod;
}

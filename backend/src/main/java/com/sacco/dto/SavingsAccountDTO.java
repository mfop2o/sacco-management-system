package com.sacco.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SavingsAccountDTO {
    private UUID id;
    private String accountNumber;
    private UUID memberId;
    private String memberName;
    private String accountType;
    private BigDecimal balance;
    private BigDecimal interestRate;
    private boolean isActive;
    private LocalDate openedDate;
}

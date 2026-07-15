package com.sacco.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class LoanResponseDTO {
    private UUID id;
    private String loanNumber;
    private UUID memberId;
    private String memberName;
    private String loanType;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer durationMonths;
    private String status;
    private BigDecimal outstandingBalance;
    private BigDecimal arrearsAmount;
    private LocalDate applicationDate;
    private LocalDate approvalDate;
    private LocalDate disbursementDate;
}
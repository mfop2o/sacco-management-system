package com.sacco.dto;

import com.sacco.entity.Loan;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class LoanApplicationDTO {
    
    @NotNull(message = "Member ID is required")
    private UUID memberId;
    
    @NotNull(message = "Loan type is required")
    private Loan.LoanType loanType;
    
    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "100.00", message = "Minimum loan amount is 100")
    @DecimalMax(value = "500000.00", message = "Maximum loan amount is 500,000")
    private BigDecimal principalAmount;
    
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.1", message = "Interest rate must be positive")
    private BigDecimal interestRate;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Minimum duration is 1 month")
    @Max(value = 360, message = "Maximum duration is 360 months")
    private Integer durationMonths;
    
    private String purpose;
    private String collateralType;
    private String collateralDescription;
}
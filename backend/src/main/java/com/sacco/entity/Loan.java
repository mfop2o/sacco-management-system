package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans")
@Data
@EqualsAndHashCode(callSuper = true)
public class Loan extends BaseEntity {
    
    @Column(name = "loan_number", unique = true, nullable = false)
    private String loanNumber;
    
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "loan_type")
    private LoanType loanType;
    
    @Column(name = "principal_amount", precision = 15, scale = 2)
    private BigDecimal principalAmount;
    
    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;
    
    @Column(name = "duration_months")
    private Integer durationMonths;
    
    @Column(name = "application_date")
    private LocalDate applicationDate = LocalDate.now();
    
    @Column(name = "approval_date")
    private LocalDate approvalDate;
    
    @Column(name = "disbursement_date")
    private LocalDate disbursementDate;
    
    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.DRAFT;
    
    @Column(name = "outstanding_balance", precision = 15, scale = 2)
    private BigDecimal outstandingBalance = BigDecimal.ZERO;
    
    @Column(name = "arrears_amount", precision = 15, scale = 2)
    private BigDecimal arrearsAmount = BigDecimal.ZERO;
    
    @Column(name = "collateral_type")
    private String collateralType;
    
    @Column(name = "collateral_description")
    private String collateralDescription;
    
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL)
    private List<AmortizationSchedule> amortizationSchedules = new ArrayList<>();
    
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL)
    private List<LoanApproval> approvals = new ArrayList<>();
    
    public enum LoanType {
        LONG_TERM, SHORT_TERM, EMERGENCY, EDUCATION, BUSINESS, 
        AGRICULTURAL, SALARY_ADVANCE, HOUSING, VEHICLE
    }
    
    public enum LoanStatus {
        DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, DISBURSED, 
        REPAYMENT, CLOSED, DEFAULTED, RESTRUCTURED
    }
}
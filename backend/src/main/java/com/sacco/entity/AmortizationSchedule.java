package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "amortization_schedules")
@Data
@EqualsAndHashCode(callSuper = true)
public class AmortizationSchedule extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;
    
    @Column(name = "installment_number")
    private Integer installmentNumber;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "principal_amount", precision = 15, scale = 2)
    private BigDecimal principalAmount;
    
    @Column(name = "interest_amount", precision = 15, scale = 2)
    private BigDecimal interestAmount;
    
    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "outstanding_balance", precision = 15, scale = 2)
    private BigDecimal outstandingBalance;
    
    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;
    
    private String status = "PENDING";
    
    @Column(name = "paid_date")
    private LocalDate paidDate;
}
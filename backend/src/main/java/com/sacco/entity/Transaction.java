package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@EqualsAndHashCode(callSuper = true)
public class Transaction extends BaseEntity {
    
    @Column(name = "transaction_number", unique = true, nullable = false)
    private String transactionNumber;
    
    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;
    
    @ManyToOne
    @JoinColumn(name = "savings_account_id")
    private SavingsAccount savingsAccount;
    
    @ManyToOne
    @JoinColumn(name = "loan_id")
    private Loan loan;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;
    
    private String currency = "ETB";
    
    @Column(name = "debit_account")
    private String debitAccount;
    
    @Column(name = "credit_account")
    private String creditAccount;
    
    private String description;
    
    @Column(name = "transaction_date")
    private LocalDateTime transactionDate = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    private String reference;
    
    @ManyToOne
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    public enum TransactionType {
        DEPOSIT, WITHDRAWAL, LOAN_DISBURSEMENT, LOAN_REPAYMENT,
        SHARE_PURCHASE, SHARE_SALE, DIVIDEND, INTEREST, FEE, TRANSFER
    }
    
    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED, REVERSED
    }
    
    public enum PaymentMethod {
        CASH, BANK_TRANSFER, MOBILE_MONEY, TELEBIRR, SALARY_DEDUCTION, AUTO_DEBIT, CHECK
    }
}
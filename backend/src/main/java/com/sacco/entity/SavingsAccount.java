package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "savings_accounts")
@Data
@EqualsAndHashCode(callSuper = true)
public class SavingsAccount extends BaseEntity {
    
    @Column(name = "account_number", unique = true, nullable = false)
    private String accountNumber;
    
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type")
    private AccountType accountType = AccountType.REGULAR;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;
    
    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate = BigDecimal.valueOf(5.0);
    
    @Column(name = "minimum_balance", precision = 15, scale = 2)
    private BigDecimal minimumBalance = BigDecimal.ZERO;
    
    @Column(name = "maximum_balance", precision = 15, scale = 2)
    private BigDecimal maximumBalance = BigDecimal.valueOf(999999999.99);
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "opened_date")
    private LocalDate openedDate = LocalDate.now();
    
    @Column(name = "closed_date")
    private LocalDate closedDate;
    
    @OneToMany(mappedBy = "savingsAccount", cascade = CascadeType.ALL)
    private List<Transaction> transactions = new ArrayList<>();
    
    public enum AccountType {
        REGULAR, EMERGENCY, EDUCATION, RETIREMENT, GROUP
    }
    
    public void deposit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }
    
    public void withdraw(BigDecimal amount) {
        if (this.balance.subtract(amount).compareTo(minimumBalance) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
    }
}
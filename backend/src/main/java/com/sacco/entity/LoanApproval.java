package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_approvals")
@Data
@EqualsAndHashCode(callSuper = true)
public class LoanApproval extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;
    
    @ManyToOne
    @JoinColumn(name = "approver_id")
    private User approver;
    
    private Integer level;
    
    @Column(nullable = false)
    private String decision;
    
    private String comments;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt = LocalDateTime.now();
}
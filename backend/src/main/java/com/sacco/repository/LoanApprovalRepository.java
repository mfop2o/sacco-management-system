package com.sacco.repository;

import com.sacco.entity.LoanApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoanApprovalRepository extends JpaRepository<LoanApproval, UUID> {
    List<LoanApproval> findByLoanIdOrderByLevel(UUID loanId);
    List<LoanApproval> findByApproverId(UUID approverId);
}

package com.sacco.repository;

import com.sacco.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByMemberId(UUID memberId);
    List<Transaction> findByMemberIdOrderByTransactionDateDesc(UUID memberId);
    List<Transaction> findByLoanId(UUID loanId);
    List<Transaction> findBySavingsAccountId(UUID savingsAccountId);
}
package com.sacco.controller;

import com.sacco.dto.TransactionDTO;
import com.sacco.entity.Transaction;
import com.sacco.entity.User;
import com.sacco.repository.UserRepository;
import com.sacco.service.MemberService;
import com.sacco.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final MemberService memberService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<TransactionDTO>> getMyTransactions(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        var member = memberService.getMemberByUserId(user.getId());
        List<Transaction> transactions = transactionService.getRecentMemberTransactions(member.getId());
        return ResponseEntity.ok(transactions.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT')")
    public ResponseEntity<List<TransactionDTO>> getMemberTransactions(@PathVariable UUID memberId) {
        List<Transaction> transactions = transactionService.getMemberTransactions(memberId);
        return ResponseEntity.ok(transactions.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/loan/{loanId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER')")
    public ResponseEntity<List<TransactionDTO>> getLoanTransactions(@PathVariable UUID loanId) {
        List<Transaction> transactions = transactionService.getLoanTransactions(loanId);
        return ResponseEntity.ok(transactions.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT')")
    public ResponseEntity<List<TransactionDTO>> getAccountTransactions(@PathVariable UUID accountId) {
        List<Transaction> transactions = transactionService.getAccountTransactions(accountId);
        return ResponseEntity.ok(transactions.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    private TransactionDTO toDTO(Transaction tx) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(tx.getId());
        dto.setTransactionNumber(tx.getTransactionNumber());
        dto.setMemberId(tx.getMember() != null ? tx.getMember().getId() : null);
        dto.setLoanId(tx.getLoan() != null ? tx.getLoan().getId() : null);
        dto.setSavingsAccountId(tx.getSavingsAccount() != null ? tx.getSavingsAccount().getId() : null);
        dto.setTransactionType(tx.getTransactionType().toString());
        dto.setAmount(tx.getAmount());
        dto.setDescription(tx.getDescription());
        dto.setTransactionDate(tx.getTransactionDate());
        dto.setStatus(tx.getStatus().toString());
        dto.setPaymentMethod(tx.getPaymentMethod() != null ? tx.getPaymentMethod().toString() : null);
        return dto;
    }
}

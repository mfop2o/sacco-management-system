package com.sacco.controller;

import com.sacco.dto.AmortizationScheduleDTO;
import com.sacco.dto.LoanApplicationDTO;
import com.sacco.dto.LoanResponseDTO;
import com.sacco.dto.TransactionDTO;
import com.sacco.entity.AmortizationSchedule;
import com.sacco.entity.Loan;
import com.sacco.entity.Transaction;
import com.sacco.entity.User;
import com.sacco.repository.UserRepository;
import com.sacco.service.LoanService;
import com.sacco.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/loans")
@RequiredArgsConstructor
public class LoanController {
    
    private final LoanService loanService;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'MEMBER')")
    public ResponseEntity<LoanResponseDTO> applyForLoan(@Valid @RequestBody LoanApplicationDTO dto) {
        Loan loan = loanService.applyForLoan(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(loan));
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER')")
    public ResponseEntity<LoanResponseDTO> approveLoan(@PathVariable UUID id, Authentication auth) {
        User currentUser = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        Loan loan = loanService.approveLoan(id, currentUser.getId());
        return ResponseEntity.ok(toResponseDTO(loan));
    }
    
    @PutMapping("/{id}/disburse")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<LoanResponseDTO> disburseLoan(@PathVariable UUID id) {
        Loan loan = loanService.disburseLoan(id);
        return ResponseEntity.ok(toResponseDTO(loan));
    }
    
    @PostMapping("/{id}/repay")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'MEMBER')")
    public ResponseEntity<LoanResponseDTO> repayLoan(@PathVariable UUID id, @RequestParam BigDecimal amount,
                                                      @RequestParam(required = false, defaultValue = "CASH") String paymentMethod) {
        Loan loan = loanService.repayLoan(id, amount, paymentMethod);
        return ResponseEntity.ok(toResponseDTO(loan));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'TELLER')")
    public ResponseEntity<List<LoanResponseDTO>> getAllLoans() {
        List<Loan> loans = loanService.getAllLoans();
        return ResponseEntity.ok(loans.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList()));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'MEMBER')")
    public ResponseEntity<List<LoanResponseDTO>> getMemberLoans(@PathVariable UUID memberId) {
        List<Loan> loans = loanService.getMemberLoans(memberId);
        return ResponseEntity.ok(loans.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER')")
    public ResponseEntity<LoanResponseDTO> updateLoan(@PathVariable UUID id, @Valid @RequestBody LoanApplicationDTO dto) {
        Loan loan = loanService.updateLoan(id, dto);
        return ResponseEntity.ok(toResponseDTO(loan));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<Void> cancelLoan(@PathVariable UUID id) {
        loanService.cancelLoan(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/schedule")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'MEMBER')")
    public ResponseEntity<List<AmortizationScheduleDTO>> getLoanSchedule(@PathVariable UUID id) {
        Loan loan = loanService.getLoanById(id);
        List<AmortizationScheduleDTO> schedule = loan.getAmortizationSchedules().stream()
            .map(this::toScheduleDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/{id}/transactions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'MEMBER')")
    public ResponseEntity<List<TransactionDTO>> getLoanTransactions(@PathVariable UUID id) {
        List<Transaction> txs = transactionService.getLoanTransactions(id);
        List<TransactionDTO> dtos = txs.stream().map(this::toTransactionDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private LoanResponseDTO toResponseDTO(Loan loan) {
        LoanResponseDTO dto = new LoanResponseDTO();
        dto.setId(loan.getId());
        dto.setLoanNumber(loan.getLoanNumber());
        dto.setMemberId(loan.getMember().getId());
        dto.setMemberName(loan.getMember().getFirstName() + " " + loan.getMember().getLastName());
        dto.setLoanType(loan.getLoanType().toString());
        dto.setPrincipalAmount(loan.getPrincipalAmount());
        dto.setInterestRate(loan.getInterestRate());
        dto.setDurationMonths(loan.getDurationMonths());
        dto.setStatus(loan.getStatus().toString());
        dto.setOutstandingBalance(loan.getOutstandingBalance());
        dto.setArrearsAmount(loan.getArrearsAmount());
        dto.setApplicationDate(loan.getApplicationDate());
        dto.setApprovalDate(loan.getApprovalDate());
        dto.setDisbursementDate(loan.getDisbursementDate());
        return dto;
    }

    private AmortizationScheduleDTO toScheduleDTO(AmortizationSchedule s) {
        AmortizationScheduleDTO dto = new AmortizationScheduleDTO();
        dto.setId(s.getId());
        dto.setInstallmentNumber(s.getInstallmentNumber());
        dto.setDueDate(s.getDueDate());
        dto.setPrincipalAmount(s.getPrincipalAmount());
        dto.setInterestAmount(s.getInterestAmount());
        dto.setTotalAmount(s.getTotalAmount());
        dto.setOutstandingBalance(s.getOutstandingBalance());
        dto.setPaidAmount(s.getPaidAmount());
        dto.setStatus(s.getStatus());
        dto.setPaidDate(s.getPaidDate());
        return dto;
    }

    private TransactionDTO toTransactionDTO(Transaction tx) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(tx.getId());
        dto.setTransactionNumber(tx.getTransactionNumber());
        dto.setTransactionType(tx.getTransactionType().toString());
        dto.setAmount(tx.getAmount());
        dto.setDescription(tx.getDescription());
        dto.setTransactionDate(tx.getTransactionDate());
        dto.setStatus(tx.getStatus().toString());
        dto.setPaymentMethod(tx.getPaymentMethod() != null ? tx.getPaymentMethod().toString() : null);
        if (tx.getMember() != null) dto.setMemberId(tx.getMember().getId());
        if (tx.getLoan() != null) dto.setLoanId(tx.getLoan().getId());
        if (tx.getSavingsAccount() != null) dto.setSavingsAccountId(tx.getSavingsAccount().getId());
        return dto;
    }
}
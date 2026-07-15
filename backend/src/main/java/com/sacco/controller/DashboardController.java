package com.sacco.controller;

import com.sacco.dto.DashboardSummaryDTO;
import com.sacco.entity.Loan;
import com.sacco.entity.Member;
import com.sacco.repository.LoanRepository;
import com.sacco.repository.MemberRepository;
import com.sacco.repository.SavingsAccountRepository;
import com.sacco.repository.ShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final ShareRepository shareRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        long totalMembers = memberRepository.count();
        long activeMembers = memberRepository.findByStatus(Member.MemberStatus.ACTIVE).size();
        long totalLoans = loanRepository.count();
        long activeLoans = loanRepository.countByStatus(Loan.LoanStatus.REPAYMENT);
        long pendingApprovals = loanRepository.countByStatus(Loan.LoanStatus.SUBMITTED)
            + loanRepository.countByStatus(Loan.LoanStatus.UNDER_REVIEW);

        BigDecimal totalSavings = savingsAccountRepository.sumAllActiveBalances();
        if (totalSavings == null) totalSavings = BigDecimal.ZERO;

        BigDecimal totalLoanOutstanding = loanRepository.sumOutstandingByStatus(Loan.LoanStatus.REPAYMENT);
        if (totalLoanOutstanding == null) totalLoanOutstanding = BigDecimal.ZERO;

        return ResponseEntity.ok(DashboardSummaryDTO.builder()
            .totalMembers(totalMembers)
            .activeMembers(activeMembers)
            .totalLoans(totalLoans)
            .activeLoans(activeLoans)
            .totalSavings(totalSavings)
            .totalLoanOutstanding(totalLoanOutstanding)
            .totalSharesValue(BigDecimal.ZERO)
            .pendingApprovals(pendingApprovals)
            .build());
    }
}

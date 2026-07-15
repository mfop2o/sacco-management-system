package com.sacco.service;

import com.sacco.dto.LoanApplicationDTO;
import com.sacco.entity.Loan;
import com.sacco.entity.Member;
import com.sacco.entity.AmortizationSchedule;
import com.sacco.exception.InvalidLoanException;
import com.sacco.repository.LoanRepository;
import com.sacco.repository.SavingsAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {
    
    private final LoanRepository loanRepository;
    private final MemberService memberService;
    private final TransactionService transactionService;
    private final SavingsAccountRepository savingsAccountRepository;

    private static final BigDecimal MAX_LOAN_AMOUNT = new BigDecimal("500000");
    private static final BigDecimal MIN_LOAN_LIMIT = new BigDecimal("50000");
    
    @Transactional
    public Loan applyForLoan(LoanApplicationDTO dto) {
        Member member = memberService.getMemberById(dto.getMemberId());
        
        // Validate loan eligibility
        validateLoanEligibility(member, dto);
        
        Loan loan = new Loan();
        loan.setLoanNumber(generateLoanNumber());
        loan.setMember(member);
        loan.setLoanType(dto.getLoanType());
        loan.setPrincipalAmount(dto.getPrincipalAmount());
        loan.setInterestRate(dto.getInterestRate());
        loan.setDurationMonths(dto.getDurationMonths());
        loan.setApplicationDate(LocalDate.now());
        loan.setStatus(Loan.LoanStatus.SUBMITTED);
        loan.setOutstandingBalance(dto.getPrincipalAmount());
        loan.setCollateralType(dto.getCollateralType());
        loan.setCollateralDescription(dto.getCollateralDescription());
        
        // Generate amortization schedule
        generateAmortizationSchedule(loan);
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    public Loan approveLoan(UUID loanId, UUID approverId) {
        Loan loan = getLoanById(loanId);
        
        if (loan.getStatus() != Loan.LoanStatus.SUBMITTED) {
            throw new InvalidLoanException("Loan must be in SUBMITTED status");
        }
        
        loan.setStatus(Loan.LoanStatus.APPROVED);
        loan.setApprovalDate(LocalDate.now());
        // loan.setApprovedBy(approverId);
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    public Loan disburseLoan(UUID loanId) {
        Loan loan = getLoanById(loanId);
        
        if (loan.getStatus() != Loan.LoanStatus.APPROVED) {
            throw new InvalidLoanException("Loan must be APPROVED before disbursement");
        }
        
        loan.setStatus(Loan.LoanStatus.DISBURSED);
        loan.setDisbursementDate(LocalDate.now());
        
        // Create disbursement transaction
        transactionService.createLoanDisbursement(loan);
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    public Loan repayLoan(UUID loanId, BigDecimal amount, String paymentMethod) {
        Loan loan = getLoanById(loanId);
        
        if (loan.getStatus() == Loan.LoanStatus.CLOSED) {
            throw new InvalidLoanException("Loan is already closed");
        }
        
        // Calculate repayment
        BigDecimal newBalance = loan.getOutstandingBalance().subtract(amount);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            // Overpayment - refund or adjust
            BigDecimal overpayment = newBalance.abs();
            // Handle overpayment logic
            newBalance = BigDecimal.ZERO;
        }
        
        loan.setOutstandingBalance(newBalance);
        
        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            loan.setStatus(Loan.LoanStatus.CLOSED);
        }
        
        // Create repayment transaction with payment method
        transactionService.createLoanRepayment(loan, amount, paymentMethod);
        
        return loanRepository.save(loan);
    }
    
    private void generateAmortizationSchedule(Loan loan) {
        BigDecimal monthlyRate = loan.getInterestRate()
            .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        int months = loan.getDurationMonths();
        BigDecimal principal = loan.getPrincipalAmount();

        BigDecimal monthlyPayment = principal
            .multiply(monthlyRate)
            .multiply(BigDecimal.ONE.add(monthlyRate).pow(months))
            .divide(
                BigDecimal.ONE.add(monthlyRate).pow(months).subtract(BigDecimal.ONE),
                2, RoundingMode.HALF_UP
            );

        List<AmortizationSchedule> schedules = new ArrayList<>();
        BigDecimal remainingBalance = principal;

        for (int i = 1; i <= months; i++) {
            AmortizationSchedule schedule = new AmortizationSchedule();
            schedule.setLoan(loan);
            schedule.setInstallmentNumber(i);
            schedule.setDueDate(loan.getApplicationDate().plusMonths(i));

            BigDecimal interest = remainingBalance.multiply(monthlyRate)
                .setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalPart = monthlyPayment.subtract(interest);
            if (principalPart.compareTo(BigDecimal.ZERO) < 0) {
                principalPart = BigDecimal.ZERO;
            }
            if (i == months) {
                principalPart = remainingBalance;
            }

            remainingBalance = remainingBalance.subtract(principalPart);
            if (remainingBalance.compareTo(BigDecimal.ZERO) < 0) {
                remainingBalance = BigDecimal.ZERO;
            }

            schedule.setPrincipalAmount(principalPart);
            schedule.setInterestAmount(interest);
            schedule.setTotalAmount(principalPart.add(interest));
            schedule.setOutstandingBalance(remainingBalance);
            schedule.setPaidAmount(BigDecimal.ZERO);
            schedule.setStatus("PENDING");

            schedules.add(schedule);
        }

        loan.setAmortizationSchedules(schedules);
    }
    
    private void validateLoanEligibility(Member member, LoanApplicationDTO dto) {
        // Check if member is active
        if (member.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new InvalidLoanException("Member must be active to apply for loan");
        }
        
        // Check if member has active loans (max 2)
        long activeLoans = loanRepository.findByMemberIdAndStatusIn(
            member.getId(),
            List.of(Loan.LoanStatus.APPROVED, Loan.LoanStatus.DISBURSED, 
                    Loan.LoanStatus.REPAYMENT, Loan.LoanStatus.UNDER_REVIEW)
        ).size();
        
        if (activeLoans >= 2) {
            throw new InvalidLoanException("Maximum active loans reached");
        }
        
        // Check loan amount limit
        BigDecimal savingsBalance = getMemberSavingsBalance(member);
        BigDecimal savingsBasedLimit = savingsBalance.multiply(BigDecimal.valueOf(3));
        BigDecimal maxLoanAmount = savingsBasedLimit.compareTo(MIN_LOAN_LIMIT) < 0
            ? MIN_LOAN_LIMIT : savingsBasedLimit.min(MAX_LOAN_AMOUNT);
        if (dto.getPrincipalAmount().compareTo(maxLoanAmount) > 0) {
            throw new InvalidLoanException("Loan amount exceeds maximum limit of " + maxLoanAmount);
        }
    }
    
    private BigDecimal getMemberSavingsBalance(Member member) {
        BigDecimal total = savingsAccountRepository.sumBalanceByMemberId(member.getId());
        return total != null ? total : BigDecimal.ZERO;
    }
    
    private String generateLoanNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long count = loanRepository.count() + 1;
        return String.format("LN-%s-%05d", year, count);
    }
    
    public Loan getLoanById(UUID id) {
        return loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan not found"));
    }
    
    public List<Loan> getMemberLoans(UUID memberId) {
        return loanRepository.findByMemberId(memberId);
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    @Transactional
    public Loan updateLoan(UUID id, LoanApplicationDTO dto) {
        Loan loan = getLoanById(id);
        if (loan.getStatus() != Loan.LoanStatus.SUBMITTED && loan.getStatus() != Loan.LoanStatus.DRAFT) {
            throw new InvalidLoanException("Can only update loans in DRAFT or SUBMITTED status");
        }
        loan.setLoanType(dto.getLoanType());
        loan.setPrincipalAmount(dto.getPrincipalAmount());
        loan.setInterestRate(dto.getInterestRate());
        loan.setDurationMonths(dto.getDurationMonths());
        loan.setOutstandingBalance(dto.getPrincipalAmount());
        loan.setCollateralType(dto.getCollateralType());
        loan.setCollateralDescription(dto.getCollateralDescription());
        return loanRepository.save(loan);
    }

    @Transactional
    public void cancelLoan(UUID id) {
        Loan loan = getLoanById(id);
        if (loan.getStatus() != Loan.LoanStatus.SUBMITTED && loan.getStatus() != Loan.LoanStatus.DRAFT) {
            throw new InvalidLoanException("Can only cancel loans in DRAFT or SUBMITTED status");
        }
        loan.setStatus(Loan.LoanStatus.CLOSED);
        loanRepository.save(loan);
    }
}
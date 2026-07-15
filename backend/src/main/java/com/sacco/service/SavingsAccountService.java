package com.sacco.service;

import com.sacco.dto.UpdateSavingsAccountRequest;
import com.sacco.entity.Member;
import com.sacco.entity.SavingsAccount;
import com.sacco.entity.Transaction;
import com.sacco.exception.ResourceNotFoundException;
import com.sacco.repository.SavingsAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavingsAccountService {

    private final SavingsAccountRepository savingsAccountRepository;
    private final TransactionService transactionService;

    @Transactional
    public SavingsAccount createDefaultAccount(Member member) {
        SavingsAccount account = new SavingsAccount();
        account.setAccountNumber(generateAccountNumber(member));
        account.setMember(member);
        account.setAccountType(SavingsAccount.AccountType.REGULAR);
        account.setBalance(BigDecimal.ZERO);
        account.setMinimumBalance(new BigDecimal("100"));
        account.setOpenedDate(LocalDate.now());
        account.setActive(true);
        return savingsAccountRepository.save(account);
    }

    @Transactional
    public SavingsAccount createAccount(Member member, SavingsAccount.AccountType type, BigDecimal initialDeposit) {
        SavingsAccount account = new SavingsAccount();
        account.setAccountNumber(generateAccountNumber(member));
        account.setMember(member);
        account.setAccountType(type);
        account.setBalance(initialDeposit);
        account.setOpenedDate(LocalDate.now());
        account.setActive(true);
        SavingsAccount saved = savingsAccountRepository.save(account);

        if (initialDeposit.compareTo(BigDecimal.ZERO) > 0) {
            transactionService.recordDeposit(member, saved, initialDeposit, "Initial deposit", "CASH");
        }

        return saved;
    }

    @Transactional
    public SavingsAccount deposit(UUID accountId, BigDecimal amount, String description, String paymentMethod) {
        SavingsAccount account = getAccountById(accountId);
        account.deposit(amount);
        SavingsAccount saved = savingsAccountRepository.save(account);
        transactionService.recordDeposit(account.getMember(), saved, amount, description, paymentMethod);
        return saved;
    }

    @Transactional
    public SavingsAccount withdraw(UUID accountId, BigDecimal amount, String description, String paymentMethod) {
        SavingsAccount account = getAccountById(accountId);
        account.withdraw(amount);
        SavingsAccount saved = savingsAccountRepository.save(account);
        transactionService.recordWithdrawal(account.getMember(), saved, amount, description, paymentMethod);
        return saved;
    }

    public SavingsAccount getAccountById(UUID id) {
        return savingsAccountRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Savings account not found"));
    }

    public SavingsAccount getByAccountNumber(String accountNumber) {
        return savingsAccountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Savings account not found"));
    }

    public List<SavingsAccount> getMemberAccounts(UUID memberId) {
        return savingsAccountRepository.findByMemberId(memberId);
    }

    public List<SavingsAccount> getAllAccounts() {
        return savingsAccountRepository.findAll();
    }

    @Transactional
    public SavingsAccount updateAccount(UUID id, UpdateSavingsAccountRequest request) {
        SavingsAccount account = getAccountById(id);
        account.setAccountType(request.getAccountType());
        return savingsAccountRepository.save(account);
    }

    @Transactional
    public void closeAccount(UUID id) {
        SavingsAccount account = getAccountById(id);
        account.setActive(false);
        savingsAccountRepository.save(account);
    }

    public BigDecimal getTotalBalance(UUID memberId) {
        BigDecimal total = savingsAccountRepository.sumBalanceByMemberId(memberId);
        return total != null ? total : BigDecimal.ZERO;
    }

    private String generateAccountNumber(Member member) {
        String memberIdShort = member.getId().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "SAV-" + memberIdShort + "-" + System.currentTimeMillis() % 10000;
    }
}

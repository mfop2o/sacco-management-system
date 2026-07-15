package com.sacco.service;

import com.sacco.entity.*;
import com.sacco.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getRecentMemberTransactions(UUID memberId) {
        return transactionRepository.findByMemberIdOrderByTransactionDateDesc(memberId);
    }

    @Transactional
    public Transaction recordDeposit(Member member, SavingsAccount account, BigDecimal amount, String description, String paymentMethod) {
        Transaction tx = new Transaction();
        tx.setTransactionNumber(generateTransactionNumber());
        tx.setMember(member);
        tx.setSavingsAccount(account);
        tx.setTransactionType(Transaction.TransactionType.DEPOSIT);
        tx.setAmount(amount);
        tx.setDescription(description);
        tx.setDebitAccount("CASH");
        tx.setCreditAccount(account.getAccountNumber());
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus(Transaction.TransactionStatus.COMPLETED);
        tx.setPaymentMethod(parsePaymentMethod(paymentMethod));
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction recordWithdrawal(Member member, SavingsAccount account, BigDecimal amount, String description, String paymentMethod) {
        Transaction tx = new Transaction();
        tx.setTransactionNumber(generateTransactionNumber());
        tx.setMember(member);
        tx.setSavingsAccount(account);
        tx.setTransactionType(Transaction.TransactionType.WITHDRAWAL);
        tx.setAmount(amount);
        tx.setDescription(description);
        tx.setDebitAccount(account.getAccountNumber());
        tx.setCreditAccount("CASH");
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus(Transaction.TransactionStatus.COMPLETED);
        tx.setPaymentMethod(parsePaymentMethod(paymentMethod));
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction recordLoanDisbursement(Member member, Loan loan, BigDecimal amount, String paymentMethod) {
        Transaction tx = new Transaction();
        tx.setTransactionNumber(generateTransactionNumber());
        tx.setMember(member);
        tx.setLoan(loan);
        tx.setTransactionType(Transaction.TransactionType.LOAN_DISBURSEMENT);
        tx.setAmount(amount);
        tx.setDescription("Loan disbursement - " + loan.getLoanNumber());
        tx.setDebitAccount("LOANS");
        tx.setCreditAccount("CASH");
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus(Transaction.TransactionStatus.COMPLETED);
        tx.setPaymentMethod(parsePaymentMethod(paymentMethod));
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction createLoanDisbursement(Loan loan) {
        return recordLoanDisbursement(loan.getMember(), loan, loan.getPrincipalAmount(), "BANK_TRANSFER");
    }

    @Transactional
    public Transaction createLoanRepayment(Loan loan, BigDecimal amount, String paymentMethod) {
        return recordLoanRepayment(loan.getMember(), loan, amount, paymentMethod);
    }

    @Transactional
    public Transaction recordLoanRepayment(Member member, Loan loan, BigDecimal amount, String paymentMethod) {
        Transaction tx = new Transaction();
        tx.setTransactionNumber(generateTransactionNumber());
        tx.setMember(member);
        tx.setLoan(loan);
        tx.setTransactionType(Transaction.TransactionType.LOAN_REPAYMENT);
        tx.setAmount(amount);
        tx.setDescription("Loan repayment - " + loan.getLoanNumber());
        tx.setDebitAccount("CASH");
        tx.setCreditAccount("LOANS");
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus(Transaction.TransactionStatus.COMPLETED);
        try {
            tx.setPaymentMethod(Transaction.PaymentMethod.valueOf(paymentMethod));
        } catch (IllegalArgumentException e) {
            tx.setPaymentMethod(Transaction.PaymentMethod.CASH);
        }
        return transactionRepository.save(tx);
    }

    public List<Transaction> getMemberTransactions(UUID memberId) {
        return transactionRepository.findByMemberId(memberId);
    }

    public List<Transaction> getLoanTransactions(UUID loanId) {
        return transactionRepository.findByLoanId(loanId);
    }

    public List<Transaction> getAccountTransactions(UUID accountId) {
        return transactionRepository.findBySavingsAccountId(accountId);
    }

    private String generateTransactionNumber() {
        return "TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    private Transaction.PaymentMethod parsePaymentMethod(String method) {
        if (method == null) return Transaction.PaymentMethod.CASH;
        try {
            return Transaction.PaymentMethod.valueOf(method);
        } catch (IllegalArgumentException e) {
            return Transaction.PaymentMethod.CASH;
        }
    }
}

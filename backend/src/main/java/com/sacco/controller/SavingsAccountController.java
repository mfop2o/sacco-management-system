package com.sacco.controller;

import com.sacco.dto.SavingsAccountDTO;
import com.sacco.dto.UpdateSavingsAccountRequest;
import com.sacco.entity.SavingsAccount;
import com.sacco.service.SavingsAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/savings-accounts")
@RequiredArgsConstructor
public class SavingsAccountController {

    private final SavingsAccountService savingsAccountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT')")
    public ResponseEntity<List<SavingsAccountDTO>> getAllAccounts() {
        List<SavingsAccount> accounts = savingsAccountService.getAllAccounts();
        return ResponseEntity.ok(accounts.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT')")
    public ResponseEntity<List<SavingsAccountDTO>> getMemberAccounts(@PathVariable UUID memberId) {
        List<SavingsAccount> accounts = savingsAccountService.getMemberAccounts(memberId);
        return ResponseEntity.ok(accounts.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT')")
    public ResponseEntity<SavingsAccountDTO> getAccount(@PathVariable UUID id) {
        SavingsAccount account = savingsAccountService.getAccountById(id);
        return ResponseEntity.ok(toDTO(account));
    }

    @PostMapping("/{id}/deposit")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER')")
    public ResponseEntity<SavingsAccountDTO> deposit(@PathVariable UUID id,
                                                       @RequestParam BigDecimal amount,
                                                       @RequestParam(required = false) String description,
                                                       @RequestParam(required = false, defaultValue = "CASH") String paymentMethod) {
        SavingsAccount account = savingsAccountService.deposit(id, amount, description, paymentMethod);
        return ResponseEntity.ok(toDTO(account));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER')")
    public ResponseEntity<SavingsAccountDTO> withdraw(@PathVariable UUID id,
                                                        @RequestParam BigDecimal amount,
                                                        @RequestParam(required = false) String description,
                                                        @RequestParam(required = false, defaultValue = "CASH") String paymentMethod) {
        SavingsAccount account = savingsAccountService.withdraw(id, amount, description, paymentMethod);
        return ResponseEntity.ok(toDTO(account));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<SavingsAccountDTO> updateAccount(@PathVariable UUID id, @Valid @RequestBody UpdateSavingsAccountRequest request) {
        SavingsAccount account = savingsAccountService.updateAccount(id, request);
        return ResponseEntity.ok(toDTO(account));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> closeAccount(@PathVariable UUID id) {
        savingsAccountService.closeAccount(id);
        return ResponseEntity.noContent().build();
    }

    private SavingsAccountDTO toDTO(SavingsAccount account) {
        SavingsAccountDTO dto = new SavingsAccountDTO();
        dto.setId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setMemberId(account.getMember().getId());
        dto.setMemberName(account.getMember().getFirstName() + " " + account.getMember().getLastName());
        dto.setAccountType(account.getAccountType().toString());
        dto.setBalance(account.getBalance());
        dto.setInterestRate(account.getInterestRate());
        dto.setActive(account.isActive());
        dto.setOpenedDate(account.getOpenedDate());
        return dto;
    }
}

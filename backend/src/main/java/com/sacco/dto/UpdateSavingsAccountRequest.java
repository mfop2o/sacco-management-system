package com.sacco.dto;

import com.sacco.entity.SavingsAccount.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateSavingsAccountRequest {
    @NotNull
    private AccountType accountType;
}

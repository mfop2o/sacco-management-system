package com.sacco.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateRoleRequest {
    @NotBlank
    private String name;

    private String description;

    private List<String> permissionIds;
}

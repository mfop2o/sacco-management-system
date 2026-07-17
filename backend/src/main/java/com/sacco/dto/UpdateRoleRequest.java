package com.sacco.dto;

import lombok.Data;
import java.util.List;

@Data
public class UpdateRoleRequest {
    private String name;
    private String description;
    private Boolean isActive;
    private List<String> permissionIds;
}

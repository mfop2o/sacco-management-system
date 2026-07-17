package com.sacco.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RoleResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private boolean isSystem;
    private boolean isActive;
    private List<PermissionDTO> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

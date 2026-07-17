package com.sacco.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class PermissionDTO {
    private UUID id;
    private String resource;
    private String action;
    private String description;
}

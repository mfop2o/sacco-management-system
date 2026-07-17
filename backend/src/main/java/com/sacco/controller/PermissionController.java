package com.sacco.controller;

import com.sacco.dto.PermissionDTO;
import com.sacco.entity.Permission;
import com.sacco.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionRepository permissionRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        List<PermissionDTO> dtos = permissionRepository.findAll().stream()
            .map(p -> PermissionDTO.builder()
                .id(p.getId())
                .resource(p.getResource())
                .action(p.getAction())
                .description(p.getDescription())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}

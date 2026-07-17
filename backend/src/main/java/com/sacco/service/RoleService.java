package com.sacco.service;

import com.sacco.dto.CreateRoleRequest;
import com.sacco.dto.PermissionDTO;
import com.sacco.dto.RoleResponseDTO;
import com.sacco.dto.UpdateRoleRequest;
import com.sacco.entity.Permission;
import com.sacco.entity.Role;
import com.sacco.exception.ResourceNotFoundException;
import com.sacco.repository.PermissionRepository;
import com.sacco.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    public RoleResponseDTO getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        return toResponseDTO(role);
    }

    @Transactional
    public RoleResponseDTO createRole(CreateRoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role with name '" + request.getName() + "' already exists");
        }

        Role role = new Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());

        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllById(
                request.getPermissionIds().stream().map(UUID::fromString).collect(Collectors.toList())
            );
            role.setPermissions(new HashSet<>(permissions));
        }

        return toResponseDTO(roleRepository.save(role));
    }

    @Transactional
    public RoleResponseDTO updateRole(UUID id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (role.isSystem()) {
            throw new RuntimeException("System roles cannot be modified");
        }

        if (request.getName() != null) {
            role.setName(request.getName());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            role.setActive(request.getIsActive());
        }
        if (request.getPermissionIds() != null) {
            List<Permission> permissions = permissionRepository.findAllById(
                request.getPermissionIds().stream().map(UUID::fromString).collect(Collectors.toList())
            );
            role.setPermissions(new HashSet<>(permissions));
        }

        return toResponseDTO(roleRepository.save(role));
    }

    @Transactional
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (role.isSystem()) {
            throw new RuntimeException("System roles cannot be deleted");
        }

        roleRepository.delete(role);
    }

    public RoleResponseDTO toResponseDTO(Role role) {
        List<PermissionDTO> permissionDTOs = role.getPermissions() != null
            ? role.getPermissions().stream()
                .map(p -> PermissionDTO.builder()
                    .id(p.getId())
                    .resource(p.getResource())
                    .action(p.getAction())
                    .description(p.getDescription())
                    .build())
                .collect(Collectors.toList())
            : new ArrayList<>();

        return RoleResponseDTO.builder()
            .id(role.getId())
            .name(role.getName())
            .description(role.getDescription())
            .isSystem(role.isSystem())
            .isActive(role.isActive())
            .permissions(permissionDTOs)
            .createdAt(role.getCreatedAt())
            .updatedAt(role.getUpdatedAt())
            .build();
    }
}

package com.sacco.controller;

import com.sacco.dto.BranchDTO;
import com.sacco.entity.Branch;
import com.sacco.repository.BranchRepository;
import com.sacco.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchRepository branchRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Branch> createBranch(@Valid @RequestBody BranchDTO dto) {
        Branch branch = new Branch();
        branch.setCode(dto.getCode());
        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setPhone(dto.getPhone());
        branch.setEmail(dto.getEmail());
        branch.setManager(dto.getManager());
        return ResponseEntity.status(HttpStatus.CREATED).body(branchRepository.save(branch));
    }

    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Branch> getBranch(@PathVariable UUID id) {
        return ResponseEntity.ok(branchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found")));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Branch> updateBranch(@PathVariable UUID id, @Valid @RequestBody BranchDTO dto) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        branch.setCode(dto.getCode());
        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setPhone(dto.getPhone());
        branch.setEmail(dto.getEmail());
        branch.setManager(dto.getManager());
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable UUID id) {
        branchRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

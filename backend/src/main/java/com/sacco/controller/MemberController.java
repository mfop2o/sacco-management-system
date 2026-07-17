package com.sacco.controller;

import com.sacco.dto.MemberDTO;
import com.sacco.dto.MemberResponseDTO;
import com.sacco.dto.UpdateMemberRequest;
import com.sacco.entity.Member;
import com.sacco.entity.User;
import com.sacco.repository.UserRepository;
import com.sacco.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {
    
    private final MemberService memberService;
    private final UserRepository userRepository;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER')")
    public ResponseEntity<MemberResponseDTO> registerMember(@Valid @RequestBody MemberDTO memberDTO) {
        Member member = memberService.registerMember(memberDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(member));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'TELLER', 'ACCOUNTANT')")
    public ResponseEntity<List<MemberResponseDTO>> getAllMembers() {
        List<Member> members = memberService.getAllMembers();
        return ResponseEntity.ok(members.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList()));
    }
    
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('MEMBER')")
    public ResponseEntity<MemberResponseDTO> getMyProfile(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        Member member = memberService.getMemberByUserId(user.getId());
        return ResponseEntity.ok(toResponseDTO(member));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'TELLER')")
    public ResponseEntity<MemberResponseDTO> getMember(@PathVariable UUID id) {
        Member member = memberService.getMemberById(id);
        return ResponseEntity.ok(toResponseDTO(member));
    }
    
    @GetMapping("/membership/{membershipNumber}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'TELLER')")
    public ResponseEntity<MemberResponseDTO> getMemberByMembershipNumber(@PathVariable String membershipNumber) {
        Member member = memberService.getMemberByMembershipNumber(membershipNumber);
        return ResponseEntity.ok(toResponseDTO(member));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<MemberResponseDTO> updateMember(@PathVariable UUID id, 
                                                           @Valid @RequestBody MemberDTO memberDTO) {
        Member member = memberService.updateMember(id, memberDTO);
        return ResponseEntity.ok(toResponseDTO(member));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER')")
    public ResponseEntity<MemberResponseDTO> patchMember(@PathVariable UUID id,
                                                          @Valid @RequestBody UpdateMemberRequest request) {
        Member member = memberService.patchMember(id, request);
        return ResponseEntity.ok(toResponseDTO(member));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteMember(@PathVariable UUID id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
    
    private MemberResponseDTO toResponseDTO(Member member) {
        MemberResponseDTO dto = new MemberResponseDTO();
        dto.setId(member.getId());
        dto.setMembershipNumber(member.getMembershipNumber());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setPhone(member.getPhone());
        dto.setEmail(member.getEmail());
        dto.setStatus(member.getStatus().toString());
        dto.setJoinedDate(member.getJoinedDate());
        return dto;
    }
}
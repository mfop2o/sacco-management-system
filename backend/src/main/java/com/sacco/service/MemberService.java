package com.sacco.service;

import com.sacco.dto.MemberDTO;
import com.sacco.dto.UpdateMemberRequest;
import com.sacco.entity.Member;
import com.sacco.exception.ResourceNotFoundException;
import com.sacco.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final UserService userService;
    private final SavingsAccountService savingsAccountService;
    
    @Transactional
    public Member registerMember(MemberDTO memberDTO) {
        // Validate unique fields
        if (memberRepository.existsByNationalId(memberDTO.getNationalId())) {
            throw new RuntimeException("National ID already exists");
        }
        if (memberRepository.existsByPhone(memberDTO.getPhone())) {
            throw new RuntimeException("Phone number already exists");
        }
        
        // Create member
        Member member = new Member();
        memberDTO.setPhone(memberDTO.getPhone().replaceAll("[\\s()-]", ""));
        member.setFirstName(memberDTO.getFirstName());
        member.setLastName(memberDTO.getLastName());
        member.setDateOfBirth(memberDTO.getDateOfBirth());
        member.setGender(memberDTO.getGender());
        member.setPhone(memberDTO.getPhone());
        member.setEmail(memberDTO.getEmail());
        member.setNationalId(memberDTO.getNationalId());
        member.setAddress(memberDTO.getAddress());
        member.setOccupation(memberDTO.getOccupation());
        member.setEmployer(memberDTO.getEmployer());
        member.setEmergencyContactName(memberDTO.getEmergencyContactName());
        member.setEmergencyContactPhone(memberDTO.getEmergencyContactPhone());
        member.setBranch(null); // Will be assigned later
        member.setMembershipNumber(generateMembershipNumber());
        member.setJoinedDate(LocalDate.now());
        member.setStatus(Member.MemberStatus.ACTIVE);
        
        Member savedMember = memberRepository.save(member);
        
        // Create default savings account
        savingsAccountService.createDefaultAccount(savedMember);
        
        return savedMember;
    }
    
    private String generateMembershipNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long count = memberRepository.count() + 1;
        return String.format("SACCO-%s-%05d", year, count);
    }
    
    public Member getMemberById(UUID id) {
        return memberRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
    }
    
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public Member getMemberByMembershipNumber(String membershipNumber) {
        return memberRepository.findByMembershipNumber(membershipNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
    }

    public Member getMemberByUserId(UUID userId) {
        return memberRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found for this user"));
    }
    
    @Transactional
    public Member updateMember(UUID id, MemberDTO memberDTO) {
        Member member = getMemberById(id);
        
        member.setFirstName(memberDTO.getFirstName());
        member.setLastName(memberDTO.getLastName());
        member.setPhone(memberDTO.getPhone());
        member.setEmail(memberDTO.getEmail());
        member.setAddress(memberDTO.getAddress());
        member.setOccupation(memberDTO.getOccupation());
        member.setEmployer(memberDTO.getEmployer());
        
        return memberRepository.save(member);
    }

    @Transactional
    public Member patchMember(UUID id, UpdateMemberRequest request) {
        Member member = getMemberById(id);
        if (request.getPhone() != null) member.setPhone(request.getPhone());
        if (request.getEmail() != null) member.setEmail(request.getEmail());
        if (request.getAddress() != null) member.setAddress(request.getAddress());
        if (request.getOccupation() != null) member.setOccupation(request.getOccupation());
        if (request.getEmployer() != null) member.setEmployer(request.getEmployer());
        return memberRepository.save(member);
    }
    
    @Transactional
    public void deleteMember(UUID id) {
        Member member = getMemberById(id);
        memberRepository.delete(member);
    }
}
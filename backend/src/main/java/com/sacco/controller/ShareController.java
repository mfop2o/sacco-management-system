package com.sacco.controller;

import com.sacco.dto.ShareDTO;
import com.sacco.entity.Member;
import com.sacco.entity.Share;
import com.sacco.repository.ShareRepository;
import com.sacco.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/shares")
@RequiredArgsConstructor
public class ShareController {

    private final ShareRepository shareRepository;
    private final MemberService memberService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER')")
    public ResponseEntity<ShareDTO> purchaseShares(@RequestParam UUID memberId,
                                                    @RequestParam Integer numberOfShares,
                                                    @RequestParam BigDecimal pricePerShare) {
        Member member = memberService.getMemberById(memberId);

        Share share = new Share();
        share.setMember(member);
        share.setNumberOfShares(numberOfShares);
        share.setPricePerShare(pricePerShare);
        share.setTotalValue(pricePerShare.multiply(BigDecimal.valueOf(numberOfShares)));

        Share saved = shareRepository.save(share);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<List<ShareDTO>> getMemberShares(@PathVariable UUID memberId) {
        List<Share> shares = shareRepository.findByMemberId(memberId);
        return ResponseEntity.ok(shares.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    private ShareDTO toDTO(Share share) {
        ShareDTO dto = new ShareDTO();
        dto.setId(share.getId());
        dto.setMemberId(share.getMember().getId());
        dto.setMemberName(share.getMember().getFirstName() + " " + share.getMember().getLastName());
        dto.setNumberOfShares(share.getNumberOfShares());
        dto.setPricePerShare(share.getPricePerShare());
        dto.setTotalValue(share.getTotalValue());
        dto.setPurchaseDate(share.getPurchaseDate());
        dto.setStatus(share.getStatus());
        return dto;
    }
}

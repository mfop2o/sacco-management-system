package com.sacco.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class MemberResponseDTO {
    private UUID id;
    private String membershipNumber;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String status;
    private LocalDate joinedDate;
}
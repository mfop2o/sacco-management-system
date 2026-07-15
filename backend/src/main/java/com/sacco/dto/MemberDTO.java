package com.sacco.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MemberDTO {
    
    @NotBlank(message = "First name is required")
    @Size(max = 50)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    private String lastName;
    
    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;
    
    private String gender;
    
    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,20}$", message = "Invalid phone format")
    private String phone;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "National ID is required")
    private String nationalId;
    
    private String address;
    private String occupation;
    private String employer;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
package com.sacco.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String refreshToken;
    private String tokenType;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private List<String> permissions;
}

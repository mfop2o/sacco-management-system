package com.sacco.controller;

import com.sacco.dto.LoginRequest;
import com.sacco.dto.LoginResponse;
import com.sacco.dto.RegisterRequest;
import com.sacco.entity.User;
import com.sacco.security.CustomUserDetailsService;
import com.sacco.security.JwtTokenProvider;
import com.sacco.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String username = authentication.getName();
        List<String> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(role -> role.replace("ROLE_", ""))
            .collect(Collectors.toList());

        String token = jwtTokenProvider.generateToken(username, roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(username);

        User user = userService.getUserByUsername(username);
        userService.updateLastLogin(username);

        return ResponseEntity.ok(LoginResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .username(username)
            .email(user.getEmail())
            .fullName(user.getFirstName() + " " + user.getLastName())
            .role(roles.isEmpty() ? "MEMBER" : roles.get(0))
            .permissions(roles)
            .build());
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(User.UserRole.MEMBER);

        User saved = userService.createUser(user, request.getPassword());

        List<String> roles = List.of(saved.getRole().name());
        String token = jwtTokenProvider.generateToken(saved.getUsername(), roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(saved.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(LoginResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .username(saved.getUsername())
            .email(saved.getEmail())
            .fullName(saved.getFirstName() + " " + saved.getLastName())
            .role(saved.getRole().name())
            .permissions(roles)
            .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestParam String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userService.getUserByUsername(username);
        List<String> roles = List.of(user.getRole().name());

        String newToken = jwtTokenProvider.generateToken(username, roles);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        return ResponseEntity.ok(LoginResponse.builder()
            .token(newToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .username(username)
            .email(user.getEmail())
            .fullName(user.getFirstName() + " " + user.getLastName())
            .role(user.getRole().name())
            .permissions(roles)
            .build());
    }
}

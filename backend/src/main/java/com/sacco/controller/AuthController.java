package com.sacco.controller;

import com.sacco.dto.LoginRequest;
import com.sacco.dto.LoginResponse;
import com.sacco.dto.RegisterRequest;
import com.sacco.entity.PasswordResetToken;
import com.sacco.entity.User;
import com.sacco.repository.PasswordResetTokenRepository;
import com.sacco.repository.UserRepository;
import com.sacco.security.JwtTokenProvider;
import com.sacco.service.EmailService;
import com.sacco.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

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
        user.setVerified(false);

        User saved = userService.createUser(user, request.getPassword());

        String verificationToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(saved);
        resetToken.setToken(verificationToken);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendVerificationEmail(saved.getEmail(), verificationToken);

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

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent"));
        }

        String resetTokenStr = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(resetTokenStr);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), resetTokenStr);

        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");

        if (token == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and password are required"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token).orElse(null);
        if (resetToken == null || resetToken.isUsed() || resetToken.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired reset token"));
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification token is required"));
        }

        PasswordResetToken verificationToken = passwordResetTokenRepository.findByToken(token).orElse(null);
        if (verificationToken == null || verificationToken.isUsed() || verificationToken.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired verification token"));
        }

        User user = verificationToken.getUser();
        user.setVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        passwordResetTokenRepository.save(verificationToken);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }
}

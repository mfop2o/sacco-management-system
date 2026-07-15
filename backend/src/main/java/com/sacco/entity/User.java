package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    private String phone;
    
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.MEMBER;
    
    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "is_verified")
    private boolean isVerified = false;
    
    @Column(name = "mfa_enabled")
    private boolean mfaEnabled = false;
    
    @Column(name = "mfa_secret")
    private String mfaSecret;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_permissions",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;
    
    public enum UserRole {
        SUPER_ADMIN, SYSTEM_ADMIN, BRANCH_MANAGER, LOAN_OFFICER, 
        TELLER, ACCOUNTANT, MEMBER, AUDITOR
    }
}
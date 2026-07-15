package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "members")
@Data
@EqualsAndHashCode(callSuper = true)
public class Member extends BaseEntity {
    
    @Column(name = "membership_number", unique = true, nullable = false)
    private String membershipNumber;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    private String gender;
    
    @Column(nullable = false)
    private String phone;
    
    private String email;
    
    @Column(name = "national_id", unique = true)
    private String nationalId;
    
    private String address;
    private String occupation;
    private String employer;
    
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;
    
    @Enumerated(EnumType.STRING)
    private MemberStatus status = MemberStatus.ACTIVE;
    
    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @Column(name = "joined_date")
    private LocalDate joinedDate = LocalDate.now();
    
    @Column(name = "exit_date")
    private LocalDate exitDate;
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<SavingsAccount> savingsAccounts = new ArrayList<>();
    
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<Share> shares = new ArrayList<>();
    
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<Loan> loans = new ArrayList<>();
    
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<Dependent> dependents = new ArrayList<>();
    
    public enum MemberStatus {
        ACTIVE, INACTIVE, SUSPENDED, ARCHIVED, DECEASED
    }
}
package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "branches")
@Data
@EqualsAndHashCode(callSuper = true)
public class Branch extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String address;
    private String phone;
    private String email;
    private String manager;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @OneToMany(mappedBy = "branch")
    private List<User> users = new ArrayList<>();
    
    @OneToMany(mappedBy = "branch")
    private List<Member> members = new ArrayList<>();
}
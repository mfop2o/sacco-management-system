package com.sacco.config;

import com.sacco.entity.Branch;
import com.sacco.entity.User;
import com.sacco.repository.BranchRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (branchRepository.count() == 0) {
            Branch hq = new Branch();
            hq.setCode("HQ");
            hq.setName("Head Office");
            hq.setAddress("123 Main Street");
            hq.setPhone("+251-11-555-0100");
            hq.setEmail("hq@sacco.com");
            hq.setManager("System Admin");
            branchRepository.save(hq);
            log.info("Created default branch: Head Office");
        }

        Branch branch = branchRepository.findByCode("HQ").orElse(null);

        if (userRepository.existsByUsername("admin")) {
            User admin = userRepository.findByUsername("admin").get();
            admin.setEmail("admin@gmail.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setActive(true);
            admin.setVerified(true);
            if (branch != null) admin.setBranch(branch);
            userRepository.save(admin);
            log.info("Updated admin user (email: admin@gmail.com)");
        } else {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setRole(User.UserRole.SYSTEM_ADMIN);
            admin.setActive(true);
            admin.setVerified(true);
            admin.setBranch(branch);
            userRepository.save(admin);
            log.info("Created default admin user (username: admin, email: admin@gmail.com, password: admin123)");
        }
    }
}

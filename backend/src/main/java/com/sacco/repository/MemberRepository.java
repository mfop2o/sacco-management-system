package com.sacco.repository;

import com.sacco.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    
    Optional<Member> findByMembershipNumber(String membershipNumber);
    
    Optional<Member> findByNationalId(String nationalId);
    
    Optional<Member> findByPhone(String phone);

    Optional<Member> findByUserId(UUID userId);
    
    @Query("SELECT m FROM Member m WHERE m.status = :status")
    List<Member> findByStatus(@Param("status") Member.MemberStatus status);
    
    @Query("SELECT m FROM Member m WHERE m.firstName LIKE %:name% OR m.lastName LIKE %:name%")
    List<Member> searchByName(@Param("name") String name);
    
    @Query("SELECT COUNT(m) FROM Member m WHERE m.branch.id = :branchId")
    long countByBranchId(@Param("branchId") UUID branchId);
    
    boolean existsByNationalId(String nationalId);
    
    boolean existsByPhone(String phone);
    
    boolean existsByEmail(String email);
}
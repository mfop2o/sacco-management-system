package com.sacco.repository;

import com.sacco.entity.SavingsAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavingsAccountRepository extends JpaRepository<SavingsAccount, UUID> {
    
    Optional<SavingsAccount> findByAccountNumber(String accountNumber);
    
    List<SavingsAccount> findByMemberId(UUID memberId);
    
    List<SavingsAccount> findByMemberIdAndIsActive(UUID memberId, boolean isActive);
    
    @Query("SELECT SUM(s.balance) FROM SavingsAccount s WHERE s.member.id = :memberId")
    BigDecimal sumBalanceByMemberId(@Param("memberId") UUID memberId);
    
    @Query("SELECT COUNT(s) FROM SavingsAccount s WHERE s.isActive = true")
    long countActiveAccounts();

    @Query("SELECT COALESCE(SUM(s.balance), 0) FROM SavingsAccount s WHERE s.isActive = true")
    BigDecimal sumAllActiveBalances();
}
package com.sacco.repository;

import com.sacco.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {
    
    List<Loan> findByMemberId(UUID memberId);
    
    List<Loan> findByStatus(Loan.LoanStatus status);
    
    @Query("SELECT l FROM Loan l WHERE l.member.id = :memberId AND l.status IN :statuses")
    List<Loan> findByMemberIdAndStatusIn(@Param("memberId") UUID memberId, 
                                          @Param("statuses") List<Loan.LoanStatus> statuses);
    
    @Query("SELECT l FROM Loan l WHERE l.disbursementDate <= :date AND l.status = :status")
    List<Loan> findDisbursedLoansBefore(@Param("date") LocalDate date, 
                                        @Param("status") Loan.LoanStatus status);
    
    @Query("SELECT SUM(l.outstandingBalance) FROM Loan l WHERE l.status = :status")
    BigDecimal sumOutstandingByStatus(@Param("status") Loan.LoanStatus status);
    
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = :status")
    long countByStatus(@Param("status") Loan.LoanStatus status);
}
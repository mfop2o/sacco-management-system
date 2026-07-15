package com.sacco.repository;

import com.sacco.entity.AmortizationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AmortizationScheduleRepository extends JpaRepository<AmortizationSchedule, UUID> {
    List<AmortizationSchedule> findByLoanIdOrderByInstallmentNumber(UUID loanId);
    List<AmortizationSchedule> findByLoanIdAndStatus(UUID loanId, String status);
    List<AmortizationSchedule> findByDueDateBeforeAndStatus(LocalDate date, String status);
}

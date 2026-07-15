package com.sacco.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryDTO {
    private long totalMembers;
    private long activeMembers;
    private long totalLoans;
    private long activeLoans;
    private BigDecimal totalSavings;
    private BigDecimal totalLoanOutstanding;
    private BigDecimal totalSharesValue;
    private long pendingApprovals;
}

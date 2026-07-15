package com.sacco.repository;

import com.sacco.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {
    List<Share> findByMemberId(UUID memberId);

    @Query("SELECT COALESCE(SUM(s.totalValue), 0) FROM Share s WHERE s.member.id = :memberId AND s.status = 'ACTIVE'")
    BigDecimal sumTotalValueByMemberId(@Param("memberId") UUID memberId);

    @Query("SELECT COALESCE(SUM(s.numberOfShares), 0) FROM Share s WHERE s.member.id = :memberId AND s.status = 'ACTIVE'")
    Integer sumSharesByMemberId(@Param("memberId") UUID memberId);
}

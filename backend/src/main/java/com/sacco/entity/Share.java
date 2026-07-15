package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "shares")
@Data
@EqualsAndHashCode(callSuper = true)
public class Share extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @Column(name = "number_of_shares")
    private Integer numberOfShares;
    
    @Column(name = "price_per_share", precision = 15, scale = 2)
    private BigDecimal pricePerShare;
    
    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue;
    
    @Column(name = "purchase_date")
    private LocalDate purchaseDate = LocalDate.now();
    
    private String status = "ACTIVE";
}
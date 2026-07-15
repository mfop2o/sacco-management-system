package com.sacco.util;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

public class MembershipNumberGenerator {

    private static final AtomicLong counter = new AtomicLong(0);

    public static String generate(String prefix, long dbCount) {
        String year = String.valueOf(LocalDate.now().getYear());
        long seq = dbCount + counter.incrementAndGet();
        return String.format("%s-%s-%05d", prefix, year, seq);
    }

    public static String generateLoanNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long seq = counter.incrementAndGet();
        return String.format("LN-%s-%06d", year, seq);
    }

    public static String generateTransactionNumber() {
        return "TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
    }
}

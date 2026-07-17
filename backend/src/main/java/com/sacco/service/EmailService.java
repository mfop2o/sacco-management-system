package com.sacco.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "HUNDAAF SACCO - Password Reset";
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String body = "You have requested a password reset for your HUNDAAF SACCO account.\n\n"
            + "Click the link below to reset your password:\n" + resetUrl + "\n\n"
            + "This link will expire in 1 hour.\n\n"
            + "If you did not request this, please ignore this email.";

        sendEmail(to, subject, body);
    }

    public void sendVerificationEmail(String to, String token) {
        String subject = "HUNDAAF SACCO - Email Verification";
        String verifyUrl = "http://localhost:5173/verify-email?token=" + token;
        String body = "Welcome to HUNDAAF SACCO!\n\n"
            + "Please verify your email address by clicking the link below:\n" + verifyUrl + "\n\n"
            + "This link will expire in 24 hours.\n\n"
            + "If you did not create an account, please ignore this email.";

        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}

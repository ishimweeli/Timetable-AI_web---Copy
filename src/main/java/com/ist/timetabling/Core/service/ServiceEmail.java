package com.ist.timetabling.Core.service;

public interface ServiceEmail {
    void sendVerificationCode(String to, String code);
    void sendPasswordResetCode(String to, String code);
} 
package com.ist.timetabling.Auth.service;

import java.util.Locale;

public interface ServiceAuthEmail {

    void sendVerificationEmail(final String email, final String name, final String verificationLink, final Locale locale);

}

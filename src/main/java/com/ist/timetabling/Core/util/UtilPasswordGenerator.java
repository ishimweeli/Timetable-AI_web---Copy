package com.ist.timetabling.Core.util;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.util.regex.Pattern;

@Component
public class UtilPasswordGenerator {

    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    private static final SecureRandom random = new SecureRandom();

    public String generateSecurePassword(int length) {
        if(length < 8) {
            length = 8;
        }

        StringBuilder password = new StringBuilder(length);
        password.append(LOWERCASE.charAt(random.nextInt(LOWERCASE.length())));
        password.append(UPPERCASE.charAt(random.nextInt(UPPERCASE.length())));
        password.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        password.append(SPECIAL.charAt(random.nextInt(SPECIAL.length())));

        String allChars = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;
        for(int i = 4; i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        char[] passwordArray = password.toString().toCharArray();
        for(int i = 0; i < passwordArray.length; i++) {
            int randomIndex = random.nextInt(passwordArray.length);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[randomIndex];
            passwordArray[randomIndex] = temp;
        }

        return new String(passwordArray);
    }

    public boolean isPasswordValid(String password) {
        if(password == null || password.length() < 8) {
            return false;
        }

        Pattern lowercase = Pattern.compile("[a-z]");
        Pattern uppercase = Pattern.compile("[A-Z]");
        Pattern digit = Pattern.compile("[0-9]");
        Pattern special = Pattern.compile("[!@#$%^&*()\\-_=+\\[\\]{}|;:,.<>?]");

        return lowercase.matcher(password).find() &&
                uppercase.matcher(password).find() &&
                digit.matcher(password).find() &&
                special.matcher(password).find();
    }
}

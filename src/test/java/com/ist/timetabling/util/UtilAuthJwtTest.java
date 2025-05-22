package com.ist.timetabling.util;

import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.Auth.util.UtilAuthJwt;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
//import org.mockito.junit.jupiter.api.MockitoSettings;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UtilAuthJwtTest {

    @InjectMocks
    private UtilAuthJwt utilAuthJwt;

    private EntityUser testEntityUser;
    private final String SECRET_KEY = "thisIsAVeryLongSecretKeyForTestingPurposesOnly1234567890";
    private final long EXPIRATION_TIME = 86400000; // 1 day in milliseconds
    private final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        // Set up the secret key using reflection
        ReflectionTestUtils.setField(utilAuthJwt, "SECRET_KEY", SECRET_KEY);
        ReflectionTestUtils.setField(utilAuthJwt, "EXPIRATION_TIME", EXPIRATION_TIME);

        // Create a test user
        testEntityUser = new EntityUser();
        testEntityUser.setEmail(TEST_EMAIL);
    }

    @Test
    void generateToken_ValidUser_ReturnsToken() {
        // Act
        String token = utilAuthJwt.generateToken(testEntityUser);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void generateToken_NullUser_ReturnsTokenWithAnonymousSubject() {
        // Act
        String token = utilAuthJwt.generateToken(null);

        // Assert
        assertNotNull(token);
        assertEquals("anonymous", utilAuthJwt.extractUsername(token));
    }

    @Test
    void extractUsername_ValidToken_ReturnsEmail() {
        // Arrange
        String token = utilAuthJwt.generateToken(testEntityUser);

        // Act
        String username = utilAuthJwt.extractUsername(token);

        // Assert
        assertEquals(TEST_EMAIL, username);
    }

    @Test
    void extractUsername_InvalidToken_ReturnsNull() {
        // Arrange
        String invalidToken = "invalid.token.string";

        // Act
        String username = utilAuthJwt.extractUsername(invalidToken);

        // Assert
        assertNull(username);
    }

    @Test
    void isTokenValid_ValidTokenAndUser_ReturnsTrue() {
        // Arrange
        String token = utilAuthJwt.generateToken(testEntityUser);

        // Act
        boolean isValid = utilAuthJwt.isTokenValid(token, testEntityUser);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_InvalidUser_ReturnsFalse() {
        // Arrange
        String token = utilAuthJwt.generateToken(testEntityUser);
        EntityUser differentEntityUser = new EntityUser();
        differentEntityUser.setEmail("different@example.com");

        // Act
        boolean isValid = utilAuthJwt.isTokenValid(token, differentEntityUser);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void isTokenValid_ExpiredToken_ReturnsFalse() throws Exception {
        // Create a signing key
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

        // Generate an expired token manually
        String expiredToken = Jwts.builder()
                .claim("email", TEST_EMAIL)
                .subject(TEST_EMAIL)
                .issuedAt(new Date(System.currentTimeMillis() - 2 * EXPIRATION_TIME))
                .expiration(new Date(System.currentTimeMillis() - EXPIRATION_TIME))
                .signWith(key)
                .compact();

        // Act
        boolean isValid = utilAuthJwt.isTokenValid(expiredToken, testEntityUser);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        // Arrange
        String token = utilAuthJwt.generateToken(testEntityUser);

        // Act
        boolean isValid = utilAuthJwt.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void validateToken_InvalidToken_ReturnsFalse() {
        // Arrange
        String invalidToken = "invalid.token.string";

        // Act
        boolean isValid = utilAuthJwt.validateToken(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_ExpiredToken_ReturnsFalse() throws Exception {
        // Create a signing key
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

        // Generate an expired token manually
        String expiredToken = Jwts.builder()
                .claim("email", TEST_EMAIL)
                .subject(TEST_EMAIL)
                .issuedAt(new Date(System.currentTimeMillis() - 2 * EXPIRATION_TIME))
                .expiration(new Date(System.currentTimeMillis() - EXPIRATION_TIME))
                .signWith(key)
                .compact();

        // Act
        boolean isValid = utilAuthJwt.validateToken(expiredToken);

        // Assert
        assertFalse(isValid);
    }
}
package com.ist.timetabling.Core.filter;

import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.User.service.impl.ServiceUserDetailsSImpl;
import com.ist.timetabling.Auth.util.UtilAuthJwt;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FilterCoreJwtRequestTest {

    @Mock
    private RepositoryUser repositoryUser;

    @Mock
    private UtilAuthJwt utilAuthJwt;

    @Mock
    private ServiceUserDetailsSImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private HttpSession session;

    @Mock
    private PrintWriter writer;

    @InjectMocks
    private FilterCoreJwtRequest filterCoreJwtRequest;

    private final String TEST_TOKEN = "test.jwt.token";
    private final String TEST_EMAIL = "test@example.com";
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        userDetails = User.withUsername(TEST_EMAIL)
                .password("password")
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    void shouldNotFilter_PublicUrl_ReturnsTrue() {
        // Test all public URLs
        String[] publicUrls = {
                "/api/v1/auth/login",
                "/api/v1/auth/register",
                "/swagger-ui/index.html",
                "/swagger-ui/something",
                "/v3/api-docs/something"
        };

        for(String url : publicUrls) {
            when(request.getServletPath()).thenReturn(url);
            assertTrue(filterCoreJwtRequest.shouldNotFilter(request));
        }
    }

    @Test
    void shouldNotFilter_ProtectedUrl_ReturnsTrue() {
        when(request.getServletPath()).thenReturn("/api/v1/protected/resource");
        assertFalse(filterCoreJwtRequest.shouldNotFilter(request));
    }

    @Test
    void doFilterInternal_ValidToken_Success() throws ServletException, IOException {
        // Arrange
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("jwt")).thenReturn(TEST_TOKEN);
        when(utilAuthJwt.validateToken(TEST_TOKEN)).thenReturn(true);
        when(utilAuthJwt.extractUsername(TEST_TOKEN)).thenReturn(TEST_EMAIL);
        when(userDetailsService.loadUserByUsername(TEST_EMAIL)).thenReturn(userDetails);

        // Act
        filterCoreJwtRequest.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);

        // Verify authentication was set in the security context
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(TEST_EMAIL, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void doFilterInternal_InvalidToken_Unauthorized() throws ServletException, IOException {
        // Arrange
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("jwt")).thenReturn(TEST_TOKEN);
        when(utilAuthJwt.validateToken(TEST_TOKEN)).thenReturn(false);
        when(response.getWriter()).thenReturn(writer);

        // Act
        filterCoreJwtRequest.doFilterInternal(request, response, filterChain);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(writer).write("Unauthorized: Invalid or missing JWT");
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    void doFilterInternal_UserNotFound_Unauthorized() throws ServletException, IOException {
        // Arrange
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("jwt")).thenReturn(TEST_TOKEN);
        when(utilAuthJwt.validateToken(TEST_TOKEN)).thenReturn(true);
        when(utilAuthJwt.extractUsername(TEST_TOKEN)).thenReturn(TEST_EMAIL);
        when(userDetailsService.loadUserByUsername(TEST_EMAIL)).thenThrow(new UsernameNotFoundException("User not found"));
        when(response.getWriter()).thenReturn(writer);

        // Act
        filterCoreJwtRequest.doFilterInternal(request, response, filterChain);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(writer).write("Unauthorized: User not found");
        verify(filterChain, never()).doFilter(any(), any());
    }
}

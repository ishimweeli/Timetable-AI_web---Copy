package com.ist.timetabling.service.impl;

import com.ist.timetabling.Auth.service.impl.ServiceAuthImpl;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthLogin;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Auth.dto.res.DtoResAuthLogin;
import com.ist.timetabling.User.dto.res.DtoResUser;
import com.ist.timetabling.Auth.exception.ExceptionAuthInvalidPassword;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.Auth.util.UtilAuthJwt;
import com.ist.timetabling.Core.model.I18n;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;

@ExtendWith(MockitoExtension.class)
class ServiceAuthImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UtilAuthJwt utilAuthJwt;

    @Mock
    private RepositoryUser repositoryUser;

    @Mock
    private HttpServletRequest httpServletRequest;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ServiceAuthImpl authService;

    private DtoReqAuthLogin dtoReqAuthLogin;
    private EntityUser testEntityUser;
    private EntityRole testEntityRole;

    @BeforeEach
    void setUp() {
        dtoReqAuthLogin = new DtoReqAuthLogin();
        dtoReqAuthLogin.setEmail("test@example.com");
        dtoReqAuthLogin.setPassword("password123");

        testEntityRole = new EntityRole();
        testEntityRole.setId(1);
        testEntityRole.setName("USER");

        testEntityUser = new EntityUser();
        testEntityUser.setId(1);
        testEntityUser.setUuid(UUID.randomUUID().toString());
        testEntityUser.setFirstName("John");
        testEntityUser.setLastName("Doe");
        testEntityUser.setEmail("test@example.com");
        testEntityUser.setPhone("1234567890");
        testEntityUser.setIsActive(true);
        testEntityUser.setEntityRole(testEntityRole);

        SecurityContextHolder.clearContext();
        when(httpServletRequest.getHeader("Accept-Language")).thenReturn("en");
    }

    @Test
    void login_Success() {
        I18n mockI18n = mock(I18n.class);

        try (MockedStatic<I18n> mockedI18n = mockStatic(I18n.class)) {
            mockedI18n.when(() -> new I18n(httpServletRequest)).thenReturn(mockI18n);
            when(mockI18n.getAuth(I18N_AUTH_LOGIN_SUCCESSFUL)).thenReturn("Login successful");

            when(repositoryUser.findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail()))
                    .thenReturn(Optional.of(testEntityUser));

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);

            when(utilAuthJwt.generateToken(testEntityUser)).thenReturn("test-jwt-token");

            final ApiResponse<DtoResAuthLogin> response = authService.login(dtoReqAuthLogin);

            assertNotNull(response);
            assertEquals(HttpStatus.OK, response.getStatus());
            assertEquals("Login successful", response.getMessage());

            DtoResAuthLogin data = response.getData();
            assertNotNull(data);
            assertEquals("John", data.getFirstName());
            assertEquals("Doe", data.getLastName());
            assertEquals("test@example.com", data.getEmail());
            assertEquals("Bearer test-jwt-token", data.getToken());
            assertEquals(testEntityUser.getUuid(), data.getUuid());
            assertEquals("1234567890", data.getPhone());
            assertEquals(1, data.getRoleId());
            assertEquals("USER", data.getRoleName());
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(SecurityContextHolder.getContext()).setAuthentication(authentication);
            verify(repositoryUser).findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail());
            verify(utilAuthJwt).generateToken(testEntityUser);
        }
    }

    @Test
    void login_UserNotFound() {
        I18n mockI18n = mock(I18n.class);

        try (MockedStatic<I18n> mockedI18n = mockStatic(I18n.class)) {
            mockedI18n.when(() -> new I18n(httpServletRequest)).thenReturn(mockI18n);
            when(mockI18n.getAuth(I18N_AUTH_USER_NOT_FOUND)).thenReturn("User not found");

            when(repositoryUser.findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail()))
                    .thenReturn(Optional.empty());
            ExceptionCoreNotFound exception = assertThrows(ExceptionCoreNotFound.class, () -> {
                authService.login(dtoReqAuthLogin);
            });

            assertEquals("User not found", exception.getMessage());

            verify(repositoryUser).findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail());
            verify(authenticationManager, never()).authenticate(any());
        }
    }

    @Test
    void login_InvalidPassword() {
        I18n mockI18n = mock(I18n.class);

        try (MockedStatic<I18n> mockedI18n = mockStatic(I18n.class)) {
            mockedI18n.when(() -> new I18n(httpServletRequest)).thenReturn(mockI18n);
            when(mockI18n.getAuth(I18N_AUTH_USER_NOT_FOUND)).thenReturn("User not found");
            when(mockI18n.getAuth(I18N_AUTH_UNAUTHORIZED)).thenReturn("Invalid credentials");

            when(repositoryUser.findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail()))
                    .thenReturn(Optional.of(testEntityUser));

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            ExceptionAuthInvalidPassword exception = assertThrows(ExceptionAuthInvalidPassword.class, () -> {
                authService.login(dtoReqAuthLogin);
            });

            assertEquals("Invalid credentials", exception.getMessage());

            verify(repositoryUser).findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail());
            verify(authenticationManager).authenticate(any());
        }
    }

    @Test
    void getCurrentUser_Success() {
        I18n mockI18n = mock(I18n.class);

        try (MockedStatic<I18n> mockedI18n = mockStatic(I18n.class);
             MockedStatic<SecurityContextHolder> mockedSecurityContext = mockStatic(SecurityContextHolder.class)) {

            mockedI18n.when(() -> new I18n(httpServletRequest)).thenReturn(mockI18n);
            when(mockI18n.getAuth(I18N_AUTH_USER_RETRIEVED)).thenReturn("User retrieved successfully");

            mockedSecurityContext.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("test@example.com");

            when(repositoryUser.findByEmailAndIsDeletedFalse("test@example.com"))
                    .thenReturn(Optional.of(testEntityUser));
            final ApiResponse<DtoResUser> response = authService.getCurrentUser();
            assertNotNull(response);
            assertEquals(HttpStatus.FOUND, response.getStatus());
            assertEquals("User retrieved successfully", response.getMessage());

            DtoResUser data = response.getData();
            assertNotNull(data);
            assertEquals(1, data.getId());
            assertEquals(testEntityUser.getUuid(), data.getUuid());
            assertEquals("test@example.com", data.getEmail());
            assertEquals("John", data.getFirstName());
            assertEquals("Doe", data.getLastName());
            assertEquals("1234567890", data.getPhone());
            assertTrue(data.getIsActive());
            assertEquals(1, data.getRoleId());
            assertEquals("USER", data.getRoleName());

            verify(repositoryUser).findByEmailAndIsDeletedFalse("test@example.com");
        }
    }

    @Test
    void getCurrentUser_UserNotFound() {
        I18n mockI18n = mock(I18n.class);

        try (MockedStatic<I18n> mockedI18n = mockStatic(I18n.class);
             MockedStatic<SecurityContextHolder> mockedSecurityContext = mockStatic(SecurityContextHolder.class)) {

            mockedI18n.when(() -> new I18n(httpServletRequest)).thenReturn(mockI18n);
            when(mockI18n.getAuth(I18N_AUTH_USER_NOT_FOUND)).thenReturn("User not found");

            mockedSecurityContext.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("test@example.com");

            when(repositoryUser.findByEmailAndIsDeletedFalse("test@example.com"))
                    .thenReturn(Optional.empty());

            ExceptionCoreNotFound exception = assertThrows(ExceptionCoreNotFound.class, () -> {
                authService.getCurrentUser();
            });

            assertEquals("User not found", exception.getMessage());
            verify(repositoryUser).findByEmailAndIsDeletedFalse("test@example.com");
        }
    }

    @Test
    void getCurrentUser_Exception() {
        I18n mockI18n = mock(I18n.class);

        try (MockedStatic<I18n> mockedI18n = mockStatic(I18n.class);
             MockedStatic<SecurityContextHolder> mockedSecurityContext = mockStatic(SecurityContextHolder.class)) {

            mockedI18n.when(() -> new I18n(httpServletRequest)).thenReturn(mockI18n);
            when(mockI18n.getAuth(I18N_AUTH_ERROR_RETRIEVING)).thenReturn("Error retrieving user");

            mockedSecurityContext.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("test@example.com");

            when(repositoryUser.findByEmailAndIsDeletedFalse("test@example.com"))
                    .thenThrow(new RuntimeException("Database error"));

            final ApiResponse<DtoResUser> response = authService.getCurrentUser();

            assertNotNull(response);
            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatus());
            assertEquals("Error retrieving user", response.getMessage());
            assertNull(response.getData());
            verify(repositoryUser).findByEmailAndIsDeletedFalse("test@example.com");
        }
    }
}

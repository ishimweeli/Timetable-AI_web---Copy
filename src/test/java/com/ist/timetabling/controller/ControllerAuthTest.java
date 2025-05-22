package com.ist.timetabling.controller;

import com.ist.timetabling.Auth.controller.ControllerAuth;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthLogin;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Auth.dto.res.DtoResAuthLogin;
import com.ist.timetabling.User.dto.res.DtoResUser;
import com.ist.timetabling.Auth.service.ServiceAuth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ControllerAuthTest {

    @Mock
    private ServiceAuth serviceAuth;

    @InjectMocks
    private ControllerAuth controllerAuth;

    private DtoReqAuthLogin dtoReqAuthLogin;
    private DtoResAuthLogin dtoResAuthLogin;
    private ApiResponse<DtoResAuthLogin> loginApiResponse;
    private DtoResUser dtoResUser;
    private ApiResponse<DtoResUser> userApiResponse;

    @BeforeEach
    void setUp() {
        // Set up test data
        dtoReqAuthLogin = new DtoReqAuthLogin();
        dtoReqAuthLogin.setEmail("test@example.com");
        dtoReqAuthLogin.setPassword("password123");

        String uuid = UUID.randomUUID().toString();
        dtoResAuthLogin = DtoResAuthLogin.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@example.com")
                .token("Bearer jwt-token-123")
                .uuid(uuid)
                .phone("1234567890")
                .roleId(1)
                .roleName("USER")
                .build();

        loginApiResponse = ApiResponse.success(
                HttpStatus.OK,
                "Login successful",
                dtoResAuthLogin);

        dtoResUser = DtoResUser.builder()
                .id(1)
                .uuid(uuid)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .phone("1234567890")
                .isActive(true)
                .roleId(1)
                .roleName("USER")
                .build();

        userApiResponse = ApiResponse.success(
                HttpStatus.FOUND,
                "User profile retrieved successfully",
                dtoResUser);
    }

    @Test
    void login_Success() {
        when(serviceAuth.login(any(DtoReqAuthLogin.class)))
                .thenReturn(loginApiResponse);

        ResponseEntity<ApiResponse<DtoResAuthLogin>> responseEntity =
                controllerAuth.login(dtoReqAuthLogin);

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());

        final ApiResponse<DtoResAuthLogin> responseBody = responseEntity.getBody();
        assertNotNull(responseBody);
        assertEquals(HttpStatus.OK, responseBody.getStatus());
        assertEquals("Login successful", responseBody.getMessage());

        DtoResAuthLogin data = responseBody.getData();
        assertNotNull(data);
        assertEquals("John", data.getFirstName());
        assertEquals("Doe", data.getLastName());
        assertEquals("test@example.com", data.getEmail());
        assertEquals("Bearer jwt-token-123", data.getToken());
        assertEquals(1, data.getRoleId());
        assertEquals("USER", data.getRoleName());
        verify(serviceAuth).login(dtoReqAuthLogin);
    }

    @Test
    void getCurrentUser_Success() {
        when(serviceAuth.getCurrentUser())
                .thenReturn(userApiResponse);
        ResponseEntity<ApiResponse<DtoResUser>> responseEntity =
                controllerAuth.getCurrentUser();
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());

        final ApiResponse<DtoResUser> responseBody = responseEntity.getBody();
        assertNotNull(responseBody);
        assertEquals(HttpStatus.FOUND, responseBody.getStatus());
        assertEquals("User profile retrieved successfully", responseBody.getMessage());

        DtoResUser data = responseBody.getData();
        assertNotNull(data);
        assertEquals(1, data.getId());
        assertEquals("John", data.getFirstName());
        assertEquals("Doe", data.getLastName());
        assertEquals("test@example.com", data.getEmail());
        assertEquals("1234567890", data.getPhone());
        assertTrue(data.getIsActive());
        assertEquals(1, data.getRoleId());
        assertEquals("USER", data.getRoleName());
        verify(serviceAuth).getCurrentUser();
    }

    @Test
    void getCurrentUser_Error() {
        final ApiResponse<DtoResUser> errorResponse = ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error retrieving user",
                null);

        when(serviceAuth.getCurrentUser())
                .thenReturn(errorResponse);

        ResponseEntity<ApiResponse<DtoResUser>> responseEntity =
                controllerAuth.getCurrentUser();
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());

        final ApiResponse<DtoResUser> responseBody = responseEntity.getBody();
        assertNotNull(responseBody);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseBody.getStatus());
        assertEquals("Error retrieving user", responseBody.getMessage());
        assertNull(responseBody.getData());

        // Verify
        verify(serviceAuth).getCurrentUser();
    }
}

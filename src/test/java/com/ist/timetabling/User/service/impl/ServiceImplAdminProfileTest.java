
package com.ist.timetabling.User.service.impl;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.req.DtoReqAdminProfile;
import com.ist.timetabling.User.dto.res.DtoResAdminProfile;
import com.ist.timetabling.User.entity.EntityAdminProfile;
import com.ist.timetabling.User.repository.RepositoryAdminProfile;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ServiceImplAdminProfileTest {

    @Mock
    private RepositoryAdminProfile adminProfileRepository;

    @Mock
    private HttpServletRequest httpServletRequest; // Mock HttpServletRequest

    @InjectMocks
    private ServiceImplAdminProfile adminProfileService;

    private EntityAdminProfile entityAdminProfile;
    private DtoReqAdminProfile dtoReqAdminProfile;

    @BeforeEach
    public void setUp() {
        entityAdminProfile = new EntityAdminProfile();
        entityAdminProfile.setId(1);
        entityAdminProfile.setUuid("123e4567-e89b-12d3-a456-426614174000");
        entityAdminProfile.setUserId(100);
        entityAdminProfile.setOrganizationId(200);
        entityAdminProfile.setCanManageOrganizations(true);
        entityAdminProfile.setStatusId(1);
        entityAdminProfile.setCreatedBy(1);
        entityAdminProfile.setModifiedBy(1);
        entityAdminProfile.setCreatedDate(LocalDateTime.now());
        entityAdminProfile.setModifiedDate(LocalDateTime.now());
        entityAdminProfile.setIsDeleted(false);

        dtoReqAdminProfile = new DtoReqAdminProfile();
        dtoReqAdminProfile.setUserId(100);
        dtoReqAdminProfile.setOrganizationId(200);
        dtoReqAdminProfile.setCanManageOrganizations(true);
        dtoReqAdminProfile.setStatusId(1);
        dtoReqAdminProfile.setCreatedBy(1);
        dtoReqAdminProfile.setModifiedBy(1);

        // Mock HttpServletRequest behavior
        when(httpServletRequest.getParameter(anyString())).thenReturn("en"); // Simulate getting locale
    }

    @Test
    public void testFindByUuid_Success() {
        when(adminProfileRepository.findByUuidAndIsDeletedFalse("123e4567-e89b-12d3-a456-426614174000"))
                .thenReturn(Optional.of(entityAdminProfile));

        final ApiResponse<DtoResAdminProfile> response = adminProfileService.findByUuid("123e4567-e89b-12d3-a456-426614174000");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("123e4567-e89b-12d3-a456-426614174000", response.getData().getUuid());
        verify(adminProfileRepository, times(1)).findByUuidAndIsDeletedFalse(any());
    }

    @Test
    public void testFindByUuid_NotFound() {
        when(adminProfileRepository.findByUuidAndIsDeletedFalse(any())).thenReturn(Optional.empty());

        final ApiResponse<DtoResAdminProfile> response = adminProfileService.findByUuid("invalid-uuid");

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals(404, response.getStatus());
    }

    @Test
    public void testUpdateAdminProfile_Success() {
        when(adminProfileRepository.findByUuidAndIsDeletedFalse(any())).thenReturn(Optional.of(entityAdminProfile));
        when(adminProfileRepository.save(any())).thenReturn(entityAdminProfile);

        final ApiResponse<DtoResAdminProfile> response = adminProfileService.updateAdminProfile("123e4567-e89b-12d3-a456-426614174000", dtoReqAdminProfile);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(adminProfileRepository, times(1)).save(any());
    }

    @Test
    public void testUpdateAdminProfile_NotFound() {
        when(adminProfileRepository.findByUuidAndIsDeletedFalse(any())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            adminProfileService.updateAdminProfile("invalid-uuid", dtoReqAdminProfile);
        });


        assertEquals("Admin not found", exception.getMessage());
    }


    @Test
    public void testGetAllProfiles() {
        Page<EntityAdminProfile> page = new PageImpl<>(Collections.singletonList(entityAdminProfile));
        when(adminProfileRepository.findAllByIsDeletedFalse(PageRequest.of(0, 10))).thenReturn(page);

        final ApiResponse<List<DtoResAdminProfile>> response = adminProfileService.getAllProfiles(0, 10);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
    }

    @Test
    public void testCreateAdminProfile() {
        when(adminProfileRepository.save(any())).thenReturn(entityAdminProfile);

        final ApiResponse<DtoResAdminProfile> response = adminProfileService.createAdminProfile(dtoReqAdminProfile);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(adminProfileRepository, times(1)).save(any());
    }

    @Test
    public void testSoftDeleteAdminProfile_Success() {
        when(adminProfileRepository.softDeleteByUuid(any())).thenReturn(1);

        final ApiResponse<DtoResAdminProfile> response = adminProfileService.softDeleteAdminProfile("123e4567-e89b-12d3-a456-426614174000");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(adminProfileRepository, times(1)).softDeleteByUuid(any());
    }

    @Test
    public void testSoftDeleteAdminProfile_AlreadyDeleted() {
        when(adminProfileRepository.softDeleteByUuid(any())).thenReturn(0);

        final ApiResponse<DtoResAdminProfile> response = adminProfileService.softDeleteAdminProfile("invalid-uuid");

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals(400, response.getStatus());
    }
}

package com.ist.timetabling.controller;

import com.ist.timetabling.User.controller.ControllerAdminProfile;
import com.ist.timetabling.User.dto.req.DtoReqAdminProfile;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.res.DtoResAdminProfile;
import com.ist.timetabling.User.service.ServiceAdminProfile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ControllerAdminProfileTest {

    @Mock
    private ServiceAdminProfile serviceAdminProfile;

    @InjectMocks
    private ControllerAdminProfile controllerAdminProfile;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controllerAdminProfile).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    public void testCreateAdminProfile() throws Exception {
        DtoReqAdminProfile request = new DtoReqAdminProfile();
        request.setUserId(100);
        request.setOrganizationId(200);
        request.setCanManageOrganizations(true);
        request.setStatusId(1);
        request.setCreatedBy(1);
        request.setModifiedBy(1);

        DtoResAdminProfile responseDto = new DtoResAdminProfile();
        responseDto.setUserId(100);
        responseDto.setOrganizationId(200);

        final ApiResponse<DtoResAdminProfile> response = ApiResponse.success(responseDto, "Admin profile created successfully");

        when(serviceAdminProfile.createAdminProfile(any(DtoReqAdminProfile.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/admin-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin profile created successfully"))
                .andExpect(jsonPath("$.data.userId").value(100));
    }

    @Test
    public void testGetAllProfiles() throws Exception {
        DtoResAdminProfile profileDTO = new DtoResAdminProfile();
        profileDTO.setUserId(100);
        profileDTO.setOrganizationId(200);

        final ApiResponse<List<DtoResAdminProfile>> response = ApiResponse.success(Collections.singletonList(profileDTO), "Admin profiles retrieved successfully");

        when(serviceAdminProfile.getAllProfiles(0, 10)).thenReturn(response);

        mockMvc.perform(get("/api/v1/admin-profiles")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin profiles retrieved successfully"))
                .andExpect(jsonPath("$.data[0].userId").value(100));
    }

    @Test
    public void testGetAdminProfileByUuid() throws Exception {
        DtoResAdminProfile profileDTO = new DtoResAdminProfile();
        profileDTO.setUuid("123e4567-e89b-12d3-a456-426614174000");
        profileDTO.setUserId(100);

        final ApiResponse<DtoResAdminProfile> response = ApiResponse.success(profileDTO, "Admin profile found");

        when(serviceAdminProfile.findByUuid("123e4567-e89b-12d3-a456-426614174000")).thenReturn(response);

        mockMvc.perform(get("/api/v1/admin-profiles/123e4567-e89b-12d3-a456-426614174000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin profile found"))
                .andExpect(jsonPath("$.data.userId").value(100));
    }

    @Test
    public void testUpdateAdminProfile() throws Exception {
        DtoReqAdminProfile request = new DtoReqAdminProfile();
        request.setCanManageOrganizations(false);
        request.setStatusId(2);
        request.setModifiedBy(2);

        DtoResAdminProfile responseDto = new DtoResAdminProfile();
        responseDto.setCanManageOrganizations(false);
        responseDto.setStatusId(2);

        final ApiResponse<DtoResAdminProfile> response = ApiResponse.success(responseDto, "Admin profile updated successfully");

        when(serviceAdminProfile.updateAdminProfile(any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/v1/admin-profiles/123e4567-e89b-12d3-a456-426614174000")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin profile updated successfully"))
                .andExpect(jsonPath("$.data.canManageOrganizations").value(false));
    }

}


//package com.ist.timetabling.service.impl;
//
//import com.ist.timetabling.Core.model.ApiResponse;
//import com.ist.timetabling.Core.model.I18n;
//import com.ist.timetabling.Organization.entity.EntityOrganization;
//import com.ist.timetabling.Organization.dto.req.DtoReqOrganization;
//import com.ist.timetabling.Organization.repository.RepositoryOrganization;
//import com.ist.timetabling.Organization.service.impl.ServiceOrganizationImpl;
//import jakarta.servlet.http.HttpServletRequest;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.mockito.junit.jupiter.MockitoSettings;
//import org.mockito.quality.Strictness;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.Pageable;
//import org.springframework.http.HttpStatus;
//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@MockitoSettings(strictness = Strictness.LENIENT)
//public class ServiceEntityOrganizationImplTest {
//
//    @Mock
//    private RepositoryOrganization repositoryOrganization;
//
//    @Mock
//    private HttpServletRequest httpServletRequest;
//
//    @Mock
//    private I18n i18n;
//
//    private ServiceOrganizationImpl serviceOrganization;
//
//    private EntityOrganization testOrganization;
//    private DtoReqOrganization createRequest;
//    private DtoReqOrganizationUpdate updateRequest;
//    private final Integer userId = 1;
//    private final String uuid = "test-uuid";
//
//    @BeforeEach
//    void setUp() {
//        when(i18n.getOrganization(anyString())).thenReturn("Mock message");
//        when(httpServletRequest.getAttribute(anyString())).thenReturn(i18n);
//        serviceOrganization = new ServiceOrganizationImpl(repositoryOrganization, httpServletRequest);
//
//        testOrganization = new EntityOrganization();
//        testOrganization.setId(1);
//        testOrganization.setUuid(uuid);
//        testOrganization.setName("Test Organization");
//        testOrganization.setAddress("123 Test Street");
//        testOrganization.setContactEmail("test@example.com");
//        testOrganization.setContactPhone("123-456-7890");
//        testOrganization.setStatusId(1);
//        testOrganization.setCreatedBy(userId.toString());
//        testOrganization.setModifiedBy(userId.toString());
//        testOrganization.setCreatedDate(LocalDateTime.now());
//        testOrganization.setModifiedDate(LocalDateTime.now());
//        testOrganization.setIsDeleted(false);
//
//        createRequest = new DtoReqOrganization();
//        createRequest.setName("Test Organization");
//        createRequest.setAddress("123 Test Street");
//        createRequest.setContactEmail("test@example.com");
//        createRequest.setContactPhone("123-456-7890");
//        createRequest.setStatusId(1);
//
//        updateRequest = new DtoReqOrganizationUpdate();
//        updateRequest.setName("Updated Organization");
//        updateRequest.setAddress("456 Updated Street");
//        updateRequest.setContactEmail("updated@example.com");
//        updateRequest.setContactPhone("987-654-3210");
//        updateRequest.setStatusId(2);
//        updateRequest.setModifiedBy(userId.toString());
//    }
//
//    @Test
//    void createOrganization_Success() {
//        when(repositoryOrganization.existsByNameAndIsDeletedFalse(anyString())).thenReturn(false);
//        when(repositoryOrganization.save(any(EntityOrganization.class))).thenReturn(testOrganization);
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.createOrganization(createRequest, userId);
//
//        assertEquals(HttpStatus.CREATED.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//        assertEquals(testOrganization, response.getData());
//
//        verify(repositoryOrganization).existsByNameAndIsDeletedFalse(createRequest.getName());
//        verify(repositoryOrganization).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void createOrganization_AlreadyExists() {
//        when(repositoryOrganization.existsByNameAndIsDeletedFalse(anyString())).thenReturn(true);
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.createOrganization(createRequest, userId);
//
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertFalse(response.isSuccess());
//        assertNull(response.getData());
//
//        verify(repositoryOrganization).existsByNameAndIsDeletedFalse(createRequest.getName());
//        verify(repositoryOrganization, never()).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void deleteOrganizationByUuid_Success() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.of(testOrganization));
//        when(repositoryOrganization.save(any(EntityOrganization.class))).thenReturn(testOrganization);
//
//        final ApiResponse<Void> response = serviceOrganization.deleteOrganizationByUuid(uuid, userId);
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//        verify(repositoryOrganization).save(any(EntityOrganization.class));
//        assertTrue(testOrganization.getIsDeleted());
//        assertEquals(userId.toString(), testOrganization.getModifiedBy());
//    }
//
//    @Test
//    void deleteOrganizationByUuid_NotFound() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.empty());
//
//        final ApiResponse<Void> response = serviceOrganization.deleteOrganizationByUuid(uuid, userId);
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
//        assertFalse(response.isSuccess());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//        verify(repositoryOrganization, never()).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void getAllOrganizations_Success() {
//        List<EntityOrganization> organizations = List.of(testOrganization);
//        Page<EntityOrganization> page = new PageImpl<>(organizations);
//        when(repositoryOrganization.findByIsDeletedFalseOrderByNameAsc(any(Pageable.class))).thenReturn(page);
//
//        final ApiResponse<List<EntityOrganization>> response = serviceOrganization.getAllOrganizations(0, 10);
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//        assertEquals(1, response.getData().size());
//        assertEquals(organizations, response.getData());
//
//        verify(repositoryOrganization).findByIsDeletedFalseOrderByNameAsc(any(Pageable.class));
//    }
//
//    @Test
//    void getAllOrganizationsProjection_Success() {
//        List<DtoReqOrganizationProjection> projections = new ArrayList<>();
//        Page<DtoReqOrganizationProjection> page = new PageImpl<>(projections);
//        when(repositoryOrganization.findAllProjections(any(Pageable.class))).thenReturn(page);
//
//        final ApiResponse<List<DtoReqOrganizationProjection>> response = serviceOrganization.getAllOrganizationsProjection(0, 10);
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//        assertEquals(projections, response.getData());
//
//        verify(repositoryOrganization).findAllProjections(any(Pageable.class));
//    }
//
//    @Test
//    void searchOrganizationsByName_Success() {
//        List<EntityOrganization> organizations = List.of(testOrganization);
//        when(repositoryOrganization.searchByNameContainingNative(anyString())).thenReturn(organizations);
//
//        final ApiResponse<List<EntityOrganization>> response = serviceOrganization.searchOrganizationsByName("Test");
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//        assertEquals(organizations, response.getData());
//
//        verify(repositoryOrganization).searchByNameContainingNative("Test");
//    }
//
//    @Test
//    void getOrganizationsByStatus_Success() {
//        List<EntityOrganization> organizations = List.of(testOrganization);
//        Page<EntityOrganization> page = new PageImpl<>(organizations);
//        when(repositoryOrganization.findByStatusIdAndNotDeleted(anyInt(), any(Pageable.class))).thenReturn(page);
//
//        final ApiResponse<List<EntityOrganization>> response = serviceOrganization.getOrganizationsByStatus(1, 0, 10);
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//        assertEquals(organizations, response.getData());
//
//        verify(repositoryOrganization).findByStatusIdAndNotDeleted(eq(1), any(Pageable.class));
//    }
//
//    @Test
//    void updateOrganizationByUuid_Success() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.of(testOrganization));
//        when(repositoryOrganization.existsByNameAndIsDeletedFalse(eq(updateRequest.getName()))).thenReturn(false);
//        when(repositoryOrganization.save(any(EntityOrganization.class))).thenReturn(testOrganization);
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.updateOrganizationByUuid(uuid, updateRequest);
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//        verify(repositoryOrganization).existsByNameAndIsDeletedFalse(updateRequest.getName());
//        verify(repositoryOrganization).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void updateOrganizationByUuid_NotFound() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.empty());
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.updateOrganizationByUuid(uuid, updateRequest);
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
//        assertFalse(response.isSuccess());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//        verify(repositoryOrganization, never()).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void updateOrganizationByUuid_NameAlreadyExists() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.of(testOrganization));
//        when(repositoryOrganization.existsByNameAndIsDeletedFalse(eq(updateRequest.getName()))).thenReturn(true);
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.updateOrganizationByUuid(uuid, updateRequest);
//
//        assertEquals(HttpStatus.CONFLICT.value(), response.getStatus());
//        assertFalse(response.isSuccess());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//        verify(repositoryOrganization).existsByNameAndIsDeletedFalse(updateRequest.getName());
//        verify(repositoryOrganization, never()).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void updateOrganizationByUuid_NoChange() {
//        EntityOrganization organization = new EntityOrganization();
//        organization.setName(updateRequest.getName());
//        organization.setAddress(updateRequest.getAddress());
//        organization.setContactEmail(updateRequest.getContactEmail());
//        organization.setContactPhone(updateRequest.getContactPhone());
//        organization.setStatusId(updateRequest.getStatusId());
//        organization.setModifiedBy(updateRequest.getModifiedBy());
//
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.of(organization));
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.updateOrganizationByUuid(uuid, updateRequest);
//
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertFalse(response.isSuccess());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//        verify(repositoryOrganization, never()).save(any(EntityOrganization.class));
//    }
//
//    @Test
//    void getOrganizationByUuid_Success() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.of(testOrganization));
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.getOrganizationByUuid(uuid);
//
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertTrue(response.isSuccess());
//        assertNotNull(response.getData());
//        assertEquals(testOrganization, response.getData());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//    }
//
//    @Test
//    void getOrganizationByUuid_NotFound() {
//        when(repositoryOrganization.findByUuidAndIsDeletedFalse(eq(uuid))).thenReturn(Optional.empty());
//
//        final ApiResponse<EntityOrganization> response = serviceOrganization.getOrganizationByUuid(uuid);
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
//        assertFalse(response.isSuccess());
//        assertNull(response.getData());
//
//        verify(repositoryOrganization).findByUuidAndIsDeletedFalse(uuid);
//    }
//}

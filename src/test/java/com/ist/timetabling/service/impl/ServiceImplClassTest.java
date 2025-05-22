package com.ist.timetabling.service.impl;

import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.dto.req.DtoReqClass;
import com.ist.timetabling.Class.dto.req.DtoReqClassUpdate;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Class.service.Impl.ServiceClassImpl;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ServiceImplClassTest {

    @Mock
    private RepositoryClass repositoryClass;

    @Mock
    private RepositoryOrganization repositoryOrganization;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private ServiceClassImpl serviceClass;

    private EntityClass entityClass1;
    private EntityClass entityClass2;
    private DtoReqClass dtoReqClass;
    private DtoReqClassUpdate dtoReqClassUpdate;
    private final Integer userId = 1;
    private final String uuid = "test-uuid";

    @BeforeEach
    void setUp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        entityClass1 = new EntityClass();
        entityClass1.setId(1);
        entityClass1.setUuid("test-uuid-1");
        entityClass1.setName("A Test Class");
        entityClass1.setDescription("Description 1");
        entityClass1.setCapacity(30);
        entityClass1.setOrganizationId(1);
        entityClass1.setStatusId(1);
        entityClass1.setCreatedBy(userId.toString());
        entityClass1.setModifiedBy(userId.toString());
        entityClass1.setCreatedDate(LocalDateTime.now());
        entityClass1.setModifiedDate(LocalDateTime.now());
        entityClass1.setIsDeleted(false);

        entityClass2 = new EntityClass();
        entityClass2.setId(2);
        entityClass2.setUuid("test-uuid-2");
        entityClass2.setName("B Test Class");
        entityClass2.setDescription("Description 2");
        entityClass2.setCapacity(25);
        entityClass2.setOrganizationId(1);
        entityClass2.setStatusId(1);
        entityClass2.setCreatedBy(userId.toString());
        entityClass2.setModifiedBy(userId.toString());
        entityClass2.setCreatedDate(LocalDateTime.now());
        entityClass2.setModifiedDate(LocalDateTime.now());
        entityClass2.setIsDeleted(false);

        dtoReqClass = new DtoReqClass();
        dtoReqClass.setName("New Test Class");
//        dtoReqClass.setDescription("New Description");
        dtoReqClass.setCapacity(40);
        dtoReqClass.setOrganizationId(1);
        dtoReqClass.setStatusId(1);

        dtoReqClassUpdate = new DtoReqClassUpdate();
        dtoReqClassUpdate.setName("Updated Class");
//        dtoReqClassUpdate.setDescription("Updated Description");
        dtoReqClassUpdate.setCapacity(50);
        dtoReqClassUpdate.setStatusId(1);
        dtoReqClassUpdate.setModifiedBy(userId.toString());
    }

    @Test
    void getAllClasses_WithSorting_Success() {
        List<EntityClass> classes = new ArrayList<>();
        classes.add(entityClass1);
        classes.add(entityClass2);

        Page<EntityClass> classPage = new PageImpl<>(classes);
        
        when(repositoryClass.findByIsDeletedFalse(any(Pageable.class))).thenReturn(classPage);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<List<EntityClass>> response = serviceClass.getAllClasses(0, 10, "name", "asc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertTrue(response.isSuccess());
        assertEquals(2, response.getData().size());
        assertEquals(2, response.getTotalItems());
        assertEquals(1, response.getTotalPages());
        assertEquals(0, response.getCurrentPage());
        assertFalse(response.getHasNext());
        assertFalse(response.getHasPrevious());

        verify(repositoryClass).findByIsDeletedFalse(any(Pageable.class));
    }


    @Test
    void getClassByUuid_Success() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.of(entityClass1));
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.getClassByUuid("test-uuid-1");

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertTrue(response.isSuccess());
        assertEquals(entityClass1, response.getData());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("test-uuid-1");
    }

    @Test
    void getClassByUuid_NotFound() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.empty());
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.getClassByUuid("non-existent-uuid");

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertFalse(response.isSuccess());
        assertNull(response.getData());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("non-existent-uuid");
    }

    @Test
    void createClass_Success() {
        when(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(anyString(), anyInt())).thenReturn(false);
        when(repositoryOrganization.existsById(anyInt())).thenReturn(true);
        when(repositoryClass.save(any(EntityClass.class))).thenAnswer(invocation -> {
            EntityClass savedClass = invocation.getArgument(0);
            savedClass.setId(3);
            return savedClass;
        });
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.createClass(dtoReqClass);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED.value(), response.getStatus());
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals("New Test Class", response.getData().getName());
        assertEquals("New Description", response.getData().getDescription());
        assertEquals(40, response.getData().getCapacity());
        assertEquals(1, response.getData().getOrganizationId());
        assertEquals(1, response.getData().getStatusId());
        assertEquals(userId.toString(), response.getData().getModifiedBy());
        assertFalse(response.getData().getIsDeleted());

        verify(repositoryClass).existsByNameAndOrganizationIdAndIsDeletedFalse(dtoReqClass.getName(), dtoReqClass.getOrganizationId());
        verify(repositoryOrganization).existsById(dtoReqClass.getOrganizationId());
        verify(repositoryClass).save(any(EntityClass.class));
    }

    @Test
    void createClass_AlreadyExists() {
        when(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(anyString(), anyInt())).thenReturn(true);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.createClass(dtoReqClass);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertFalse(response.isSuccess());
        assertNull(response.getData());

        verify(repositoryClass).existsByNameAndOrganizationIdAndIsDeletedFalse(dtoReqClass.getName(), dtoReqClass.getOrganizationId());
        verify(repositoryOrganization, never()).existsById(anyInt());
        verify(repositoryClass, never()).save(any(EntityClass.class));
    }

    @Test
    void createClass_OrganizationNotFound() {
        when(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(anyString(), anyInt())).thenReturn(false);
        when(repositoryOrganization.existsById(anyInt())).thenReturn(false);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.createClass(dtoReqClass);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertFalse(response.isSuccess());
        assertNull(response.getData());

        verify(repositoryClass).existsByNameAndOrganizationIdAndIsDeletedFalse(dtoReqClass.getName(), dtoReqClass.getOrganizationId());
        verify(repositoryOrganization).existsById(dtoReqClass.getOrganizationId());
        verify(repositoryClass, never()).save(any(EntityClass.class));
    }

    @Test
    void searchClassesByName_Success() {
        List<EntityClass> classes = new ArrayList<>();
        classes.add(entityClass1);
        classes.add(entityClass2);

        when(repositoryClass.searchByNameContainingNative(anyString())).thenReturn(classes);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<List<EntityClass>> response = serviceClass.searchClassesByName("Test");

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertTrue(response.isSuccess());
        assertEquals(2, response.getData().size());

        verify(repositoryClass).searchByNameContainingNative("Test");
    }

    @Test
    void getClassesByStatus_Success() {
        List<EntityClass> classes = new ArrayList<>();
        classes.add(entityClass1);
        classes.add(entityClass2);

        Page<EntityClass> classPage = new PageImpl<>(classes);
        
        when(repositoryClass.findByStatusIdAndIsDeletedFalse(anyInt(), any(Pageable.class))).thenReturn(classPage);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<List<EntityClass>> response = serviceClass.getClassesByStatus(1, 0, 10);

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertTrue(response.isSuccess());
        assertEquals(2, response.getData().size());
        assertEquals(2, response.getTotalItems());
        assertEquals(1, response.getTotalPages());
        assertEquals(0, response.getCurrentPage());
        assertFalse(response.getHasNext());
        assertFalse(response.getHasPrevious());

        verify(repositoryClass).findByStatusIdAndIsDeletedFalse(1, PageRequest.of(0, 10));
    }

    @Test
    void deleteClassByUuid_Success() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.of(entityClass1));
        when(repositoryClass.save(any(EntityClass.class))).thenReturn(entityClass1);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<Void> response = serviceClass.deleteClassByUuid("test-uuid-1");

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertTrue(response.isSuccess());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("test-uuid-1");
        verify(repositoryClass).save(any(EntityClass.class));
    }

    @Test
    void deleteClassByUuid_NotFound() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.empty());
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<Void> response = serviceClass.deleteClassByUuid("non-existent-uuid");

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertFalse(response.isSuccess());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("non-existent-uuid");
        verify(repositoryClass, never()).save(any(EntityClass.class));
    }

    @Test
    void updateClassByUuid_Success() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.of(entityClass1));
        when(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(anyString(), anyInt())).thenReturn(false);
        when(repositoryClass.save(any(EntityClass.class))).thenReturn(entityClass1);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.updateClassByUuid("test-uuid-1", dtoReqClassUpdate);

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("test-uuid-1");
        verify(repositoryClass).save(any(EntityClass.class));
    }

    @Test
    void updateClassByUuid_NotFound() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.empty());
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.updateClassByUuid("non-existent-uuid", dtoReqClassUpdate);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertFalse(response.isSuccess());
        assertNull(response.getData());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("non-existent-uuid");
        verify(repositoryClass, never()).save(any(EntityClass.class));
    }

    @Test
    void updateClassByUuid_NameAlreadyExists() {
        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.of(entityClass1));
        when(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(anyString(), anyInt())).thenReturn(true);
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.updateClassByUuid("test-uuid-1", dtoReqClassUpdate);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT.value(), response.getStatus());
        assertFalse(response.isSuccess());
        assertNull(response.getData());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("test-uuid-1");
        verify(repositoryClass).existsByNameAndOrganizationIdAndIsDeletedFalse(dtoReqClassUpdate.getName(), entityClass1.getOrganizationId());
        verify(repositoryClass, never()).save(any(EntityClass.class));
    }

    @Test
    void updateClassByUuid_NoChanges() {
        EntityClass existingClass = new EntityClass();
        existingClass.setId(1);
        existingClass.setUuid("test-uuid-1");
        existingClass.setName("Updated Class");
        existingClass.setDescription("Updated Description");
        existingClass.setCapacity(50);
        existingClass.setStatusId(1);
        existingClass.setModifiedBy(userId.toString());
        existingClass.setIsDeleted(false);

        when(repositoryClass.findByUuidAndIsDeletedFalse(anyString())).thenReturn(Optional.of(existingClass));
        when(httpServletRequest.getHeader(anyString())).thenReturn("en");

        final ApiResponse<EntityClass> response = serviceClass.updateClassByUuid("test-uuid-1", dtoReqClassUpdate);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertFalse(response.isSuccess());
        assertNull(response.getData());

        verify(repositoryClass).findByUuidAndIsDeletedFalse("test-uuid-1");
        verify(repositoryClass, never()).save(any(EntityClass.class));
    }
}

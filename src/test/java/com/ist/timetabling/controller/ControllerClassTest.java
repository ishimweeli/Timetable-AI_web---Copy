package com.ist.timetabling.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ist.timetabling.Class.controller.ControllerClass;
import com.ist.timetabling.Class.dto.req.DtoReqClass;
import com.ist.timetabling.Class.dto.req.DtoReqClassUpdate;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.service.ServiceClass;
import com.ist.timetabling.Core.model.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.hasSize;

@ExtendWith(MockitoExtension.class)
class ControllerClassTest {

    @Mock
    private ServiceClass serviceClass;

    @InjectMocks
    private ControllerClass controllerClass;

    private MockMvc mockMvc;
    
    private ObjectMapper objectMapper = new ObjectMapper();

    private EntityClass testClass;
    private List<EntityClass> testClasses;
    private DtoReqClass testDtoReqClass;
    private DtoReqClassUpdate testDtoReqClassUpdate;

    private EntityClass entityClass1;
    private EntityClass entityClass2;
    private final Integer userId = 1;

    @BeforeEach
    void setUp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        
        // Initialize MockMvc with the controller
        mockMvc = MockMvcBuilders.standaloneSetup(controllerClass).build();

        // Initialize test data
        testClass = new EntityClass();
        testClass.setUuid("test-uuid");
        testClass.setName("Test Class");
        testClass.setStatusId(1);

        testClasses = Arrays.asList(testClass);

        testDtoReqClass = new DtoReqClass();
        testDtoReqClass.setName("New Class");
        testDtoReqClass.setOrganizationId(1);

        testDtoReqClassUpdate = new DtoReqClassUpdate();
        testDtoReqClassUpdate.setName("Updated Class");
        testDtoReqClassUpdate.setModifiedBy("1");

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
    }

    @Test
    void getAllClasses() throws Exception {
        final ApiResponse<List<EntityClass>> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Success");
        apiResponse.setData(testClasses);

        when(serviceClass.getAllClasses(any(), any(), any(), any())).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "name")
                .param("sortDirection", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data[0].uuid").value("test-uuid"));
    }

    @Test
    void getClassByUuid() throws Exception {
        final ApiResponse<EntityClass> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Success");
        apiResponse.setData(testClass);

        when(serviceClass.getClassByUuid(anyString())).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes/test-uuid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data.uuid").value("test-uuid"));
    }

    @Test
    void searchClasses() throws Exception {
        final ApiResponse<List<EntityClass>> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Success");
        apiResponse.setData(testClasses);

        when(serviceClass.searchClassesByName(anyString())).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes/search")
                .param("keyword", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data[0].name").value("Test Class"));
    }

    @Test
    void getClassesByStatus() throws Exception {
        final ApiResponse<List<EntityClass>> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Success");
        apiResponse.setData(testClasses);

        when(serviceClass.getClassesByStatus(anyInt(), any(), any())).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes/status")
                .param("status", "1")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data[0].statusId").value(1));
    }

    @Test
    void createClass() throws Exception {
        final ApiResponse<EntityClass> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("Class created successfully");
        apiResponse.setData(testClass);

        when(serviceClass.createClass(any(DtoReqClass.class))).thenReturn(apiResponse);

        mockMvc.perform(post("/api/v1/classes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDtoReqClass))
                .header("User-Id", "1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(HttpStatus.CREATED.value()))
                .andExpect(jsonPath("$.message").value("Class created successfully"))
                .andExpect(jsonPath("$.data.uuid").value("test-uuid"));
    }

    @Test
    void deleteClassByUuid() throws Exception {
        final ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Class deleted successfully");

        when(serviceClass.deleteClassByUuid(anyString())).thenReturn(apiResponse);

        mockMvc.perform(delete("/api/v1/classes/test-uuid")
                .header("User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Class deleted successfully"));
    }

    @Test
    void updateClassByUuid() throws Exception {
        final ApiResponse<EntityClass> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Class updated successfully");
        apiResponse.setData(testClass);

        when(serviceClass.updateClassByUuid(anyString(), any(DtoReqClassUpdate.class))).thenReturn(apiResponse);

        mockMvc.perform(put("/api/v1/classes/test-uuid")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDtoReqClassUpdate))
                .header("User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Class updated successfully"))
                .andExpect(jsonPath("$.data.uuid").value("test-uuid"));
    }

    @Test
    void createClassWithInvalidData() throws Exception {
        // Test with invalid data to check validation
        DtoReqClass invalidDto = new DtoReqClass();
        // Leave required fields empty

        mockMvc.perform(post("/api/v1/classes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto))
                .header("User-Id", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateClassWithInvalidData() throws Exception {
        DtoReqClassUpdate invalidDto = new DtoReqClassUpdate();

        mockMvc.perform(put("/api/v1/classes/test-uuid")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto))
                .header("User-Id", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllClassesWithNoParams() throws Exception {
        final ApiResponse<List<EntityClass>> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Success");
        apiResponse.setData(testClasses);

        when(serviceClass.getAllClasses(any(), any(), any(), any())).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Success"));
    }

    @Test
    void getClassByUuidNotFound() throws Exception {
        final ApiResponse<EntityClass> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(HttpStatus.NOT_FOUND.value());
        apiResponse.setMessage("Class not found");

        when(serviceClass.getClassByUuid("non-existent-uuid")).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes/non-existent-uuid"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(HttpStatus.NOT_FOUND.value()))
                .andExpect(jsonPath("$.message").value("Class not found"));
    }

    @Test
    void getAllClasses_WithSorting_Success() {
        List<EntityClass> sortedClasses = new ArrayList<>();
        sortedClasses.add(entityClass1);
        sortedClasses.add(entityClass2);

        when(serviceClass.getAllClasses(anyInt(), anyInt(), eq("name"), eq("asc")))
                .thenReturn(ApiResponse.<List<EntityClass>>builder()
                        .status(HttpStatus.OK.value())
                        .success(true)
                        .message("Classes retrieved successfully")
                        .data(sortedClasses)
                        .totalItems(2L)
                        .totalPages(1)
                        .currentPage(0)
                        .hasNext(false)
                        .hasPrevious(false)
                        .build());

        ResponseEntity<ApiResponse<List<EntityClass>>> response = 
                controllerClass.getAllClasses(0, 10, "name", "asc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(2, response.getBody().getData().size());
        assertEquals("A Test Class", response.getBody().getData().get(0).getName());
        assertEquals("B Test Class", response.getBody().getData().get(1).getName());

        verify(serviceClass).getAllClasses(0, 10, "name", "asc");
    }

    @Test
    void getAllClasses_WithSortingDescending_Success() {
        List<EntityClass> sortedClasses = new ArrayList<>();
        sortedClasses.add(entityClass2);
        sortedClasses.add(entityClass1);

        when(serviceClass.getAllClasses(anyInt(), anyInt(), eq("name"), eq("desc")))
                .thenReturn(ApiResponse.<List<EntityClass>>builder()
                        .status(HttpStatus.OK.value())
                        .success(true)
                        .message("Classes retrieved successfully")
                        .data(sortedClasses)
                        .totalItems(2L)
                        .totalPages(1)
                        .currentPage(0)
                        .hasNext(false)
                        .hasPrevious(false)
                        .build());

        ResponseEntity<ApiResponse<List<EntityClass>>> response = 
                controllerClass.getAllClasses(0, 10, "name", "desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(2, response.getBody().getData().size());
        assertEquals("B Test Class", response.getBody().getData().get(0).getName());
        assertEquals("A Test Class", response.getBody().getData().get(1).getName());

        verify(serviceClass).getAllClasses(0, 10, "name", "desc");
    }

    @Test
    void getAllClasses_WithSortingByCapacity_Success() {
        List<EntityClass> sortedClasses = new ArrayList<>();
        sortedClasses.add(entityClass2);
        sortedClasses.add(entityClass1);

        when(serviceClass.getAllClasses(anyInt(), anyInt(), eq("capacity"), eq("asc")))
                .thenReturn(ApiResponse.<List<EntityClass>>builder()
                        .status(HttpStatus.OK.value())
                        .success(true)
                        .message("Classes retrieved successfully")
                        .data(sortedClasses)
                        .totalItems(2L)
                        .totalPages(1)
                        .currentPage(0)
                        .hasNext(false)
                        .hasPrevious(false)
                        .build());

        ResponseEntity<ApiResponse<List<EntityClass>>> response = 
                controllerClass.getAllClasses(0, 10, "capacity", "asc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(25, response.getBody().getData().get(0).getCapacity());
        assertEquals(30, response.getBody().getData().get(1).getCapacity());

        verify(serviceClass).getAllClasses(0, 10, "capacity", "asc");
    }

    @Test
    void getAllClasses_DefaultSorting_Success() {
        List<EntityClass> sortedClasses = new ArrayList<>();
        sortedClasses.add(entityClass1);
        sortedClasses.add(entityClass2);

        when(serviceClass.getAllClasses(anyInt(), anyInt(), isNull(), eq("asc")))
                .thenReturn(ApiResponse.<List<EntityClass>>builder()
                        .status(HttpStatus.OK.value())
                        .success(true)
                        .message("Classes retrieved successfully")
                        .data(sortedClasses)
                        .totalItems(2L)
                        .totalPages(1)
                        .currentPage(0)
                        .hasNext(false)
                        .hasPrevious(false)
                        .build());

        ResponseEntity<ApiResponse<List<EntityClass>>> response = 
                controllerClass.getAllClasses(0, 10, null, "asc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(2, response.getBody().getData().size());
        assertEquals("A Test Class", response.getBody().getData().get(0).getName());
        assertEquals("B Test Class", response.getBody().getData().get(1).getName());

        verify(serviceClass).getAllClasses(0, 10, null, "asc");
    }

    @Test
    void getAllClassesWithMockMvc() throws Exception {
        final ApiResponse<List<EntityClass>> apiResponse = ApiResponse.<List<EntityClass>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message("Success")
                .data(testClasses)
                .build();

        when(serviceClass.getAllClasses(any(), any(), any(), any())).thenReturn(apiResponse);

        mockMvc.perform(get("/api/v1/classes")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "name")
                .param("sortDirection", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(HttpStatus.OK.value()))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data[0].uuid").value("test-uuid"));
    }
}

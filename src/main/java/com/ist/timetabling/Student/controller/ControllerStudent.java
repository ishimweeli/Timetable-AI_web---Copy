package com.ist.timetabling.Student.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Student.dto.req.DtoReqStudent;
import com.ist.timetabling.Student.dto.res.DtoResStudent;
import com.ist.timetabling.Student.dto.res.DtoResStudentCsvUpload;
import com.ist.timetabling.Student.service.ServiceStudent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*")
public class ControllerStudent {

    private final ServiceStudent serviceStudent;

    public ControllerStudent(final ServiceStudent serviceStudent) {
        this.serviceStudent = serviceStudent;
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResStudent>> getStudent(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceStudent.findStudentByUuid(uuid));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResStudent>>> getAllStudents(
            @RequestParam(required = false, defaultValue = "0") final Integer page,
            @RequestParam(required = false, defaultValue = "10") final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer orgId) {
        return ResponseEntity.ok(serviceStudent.getAllStudents(page, size, sortBy, sortDirection, keyword, orgId));
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<DtoResStudent>>> getAllStudentsByOrganization(
            @PathVariable final Integer organizationId,
            @RequestParam(required = false, defaultValue = "0") final Integer page,
            @RequestParam(required = false, defaultValue = "10") final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword) {
        return ResponseEntity.ok(serviceStudent.getAllStudentsByOrganization(organizationId, page, size, sortBy, sortDirection, keyword));
    }

    @GetMapping("/department/{department}/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<DtoResStudent>>> getStudentsByDepartment(
            @PathVariable String department,
            @PathVariable final Integer organizationId,
            @RequestParam(required = false, defaultValue = "0") final Integer page,
            @RequestParam(required = false, defaultValue = "10") final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword) {
        return ResponseEntity.ok(serviceStudent.getStudentsByDepartment(department, organizationId, page, size, sortBy, sortDirection, keyword));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResStudent>> createStudent(@RequestBody final DtoReqStudent dtoReqStudent) {
        return ResponseEntity.ok(serviceStudent.createStudent(dtoReqStudent));
    }

    @PutMapping("/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResStudent>> updateStudent(@PathVariable("uuid") final String uuid, @RequestBody final DtoReqStudent dtoReqStudent) {
        return ResponseEntity.ok(serviceStudent.updateStudent(uuid, dtoReqStudent));
    }

    @PutMapping("/{uuid}/soft-delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<?>> softDeleteStudent(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceStudent.softDeleteStudent(uuid));
    }

    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResStudentCsvUpload>> importStudentsFromCsv(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow) {

     

        DtoReqCsvUpload uploadRequest = DtoReqCsvUpload.builder()
                .file(file)
                .organizationId(organizationId)
                .skipHeaderRow(skipHeaderRow)
                .build();

        ApiResponse<DtoResStudentCsvUpload> apiResponse = serviceStudent.importStudentsFromCsv(uploadRequest);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{uuid}/assign-class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResStudent>> assignStudentToClass(@PathVariable final String uuid, @PathVariable final Integer classId) {
        return ResponseEntity.ok(serviceStudent.assignStudentToClass(uuid, classId));
    }

    @PutMapping("/assign-class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<DtoResStudent>>> assignStudentsToClass(@RequestBody final List<String> studentUuids, @PathVariable final Integer classId) {
        return ResponseEntity.ok(serviceStudent.assignStudentsToClass(studentUuids, classId));
    }

    @GetMapping("/by-class/{classId}")
    public ResponseEntity<ApiResponse<List<DtoResStudent>>> getStudentsByClassId(@PathVariable final Integer classId) {
        return ResponseEntity.ok(serviceStudent.getStudentsByClassId(classId));
    }

    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<List<DtoResStudent>>> getUnassignedStudents() {
        return ResponseEntity.ok(serviceStudent.getUnassignedStudents());
    }
}
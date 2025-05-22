package com.ist.timetabling.Subject.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Subject.dto.req.DtoReqSubject;
import com.ist.timetabling.Subject.dto.res.DtoResSubject;
import com.ist.timetabling.Subject.dto.res.DtoResSubjectCsvUpload;
import com.ist.timetabling.Subject.service.ServiceSubject;
import com.ist.timetabling.Subject.util.UtilSubjectCsv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@Slf4j
@RestController
@RequestMapping("/api/v1/subjects")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerSubject {
    private final ServiceSubject serviceSubject;
    private final UtilSubjectCsv utilSubjectCsv;

    public ControllerSubject(final ServiceSubject serviceSubject, final UtilSubjectCsv utilSubjectCsv) {
        this.serviceSubject = serviceSubject;
        this.utilSubjectCsv = utilSubjectCsv;
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResSubject>> getSubject(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceSubject.findSubjectByUuid(uuid));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResSubject>>> getAllSubjects(
            @RequestParam(required = false, defaultValue = "0") final Integer page,
            @RequestParam(required = false, defaultValue = "10") final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer orgId) {
        return ResponseEntity.ok(serviceSubject.getAllSubjects(page, size, sortBy, sortDirection, keyword, orgId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResSubject>>createSubject(@RequestBody final DtoReqSubject dtoReqSubject) {
        return ResponseEntity.ok(serviceSubject.createSubject(dtoReqSubject));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResSubject>> updateSubject(@PathVariable("uuid") final String uuid,@RequestBody final DtoReqSubject dtoReqSubject) {
        return ResponseEntity.ok(serviceSubject.updateSubject(uuid, dtoReqSubject));
    }

    @PutMapping("/{uuid}/soft-delete")
    public ResponseEntity<ApiResponse<?>> softDeleteSubject(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceSubject.softDeleteSubject(uuid));
    }

    @PostMapping("/import/csv")
    public ResponseEntity<ApiResponse<DtoResSubjectCsvUpload>> importSubjects(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow,
            @RequestParam(required = false) Integer organizationId) {

        DtoReqCsvUpload uploadRequest = new DtoReqCsvUpload();
        uploadRequest.setFile(file);
        uploadRequest.setSkipHeaderRow(skipHeaderRow);
        uploadRequest.setOrganizationId(organizationId);

        final ApiResponse<DtoResSubjectCsvUpload> response = serviceSubject.importSubjectsFromCsv(uploadRequest);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

  
    @GetMapping("/template")
    public ResponseEntity<String> getSubjectCsvTemplate() {
        try {
            String csvTemplate = utilSubjectCsv.generateSubjectCsvTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "subjects_template.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvTemplate);
        }catch(IOException e) {
            return ResponseEntity.internalServerError().body("Error generating template: " + e.getMessage());
        }
    }
}

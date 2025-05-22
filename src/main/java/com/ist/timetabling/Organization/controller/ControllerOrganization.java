package com.ist.timetabling.Organization.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Organization.dto.res.DtoResOrganization;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganization;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.dto.res.DtoResOrganizationCsvUpload;
import com.ist.timetabling.Organization.service.ServiceOrganization;
import com.ist.timetabling.Organization.util.UtilOrganizationCsv;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/organizations")
@Slf4j
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerOrganization {

    private final ServiceOrganization serviceOrganization;
    private final UtilOrganizationCsv utilOrganizationCsv;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResOrganization>> getOrganizationByUuid(@PathVariable final String uuid) {
        final ApiResponse<DtoResOrganization> apiResponse = serviceOrganization.getOrganizationByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResOrganization>>> getAllOrganizations(
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size,
            @RequestParam(required = false) final String search) {
        final ApiResponse<List<DtoResOrganization>> apiResponse = serviceOrganization.getAllOrganizations(page, size, search);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/projections")
    public ResponseEntity<ApiResponse<List<DtoResOrganization>>> getAllOrganizationsProjection(
            @RequestParam(required = false) final Integer page,@RequestParam(required = false) final Integer size) {
        final ApiResponse<List<DtoResOrganization>> apiResponse = serviceOrganization.getAllOrganizationsProjection(page, size);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<DtoResOrganization>>> getOrganizationsByStatus(
            @RequestParam Integer status, @RequestParam(required = false) final Integer page,@RequestParam(required = false) final Integer size) {
        final ApiResponse<List<DtoResOrganization>> apiResponse = serviceOrganization.getOrganizationsByStatus(status, page, size);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DtoResOrganization>>> searchOrganizations(@RequestParam final String keyword) {
        final ApiResponse<List<DtoResOrganization>> apiResponse = serviceOrganization.searchOrganizationsByName(keyword);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmailExists(
            @RequestParam final String email,
            @RequestParam(required = false) final String excludeUuid) {
        final ApiResponse<Map<String, Boolean>> apiResponse = serviceOrganization.checkEmailExists(email, excludeUuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResOrganization>> createOrganization(
            @Valid @RequestBody final DtoReqOrganization dtoReqOrganization) {
        final ApiResponse<DtoResOrganization> response = serviceOrganization.createOrganization(dtoReqOrganization);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResOrganization>> updateOrganizationByUuid(
            @PathVariable final String uuid, @Valid @RequestBody final DtoReqOrganization dtoReqOrganization) {
        final ApiResponse<DtoResOrganization> response = serviceOrganization.updateOrganizationByUuid(uuid, dtoReqOrganization);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteOrganizationByUuid(
            @PathVariable String uuid) {
        final ApiResponse<Void> response = serviceOrganization.deleteOrganizationByUuid(uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/import/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DtoResOrganizationCsvUpload>> importOrganizations(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow) {

        DtoReqCsvUpload uploadRequest = new DtoReqCsvUpload();
        uploadRequest.setFile(file);
        uploadRequest.setSkipHeaderRow(skipHeaderRow);

        final ApiResponse<DtoResOrganizationCsvUpload> response = serviceOrganization.importOrganizationsFromCsv(uploadRequest);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @GetMapping("/template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getOrganizationCsvTemplate() {
        try {
            String csvTemplate = utilOrganizationCsv.generateOrganizationCsvTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "organizations_template.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvTemplate);
        }catch(IOException e) {
            return ResponseEntity.internalServerError().body("Error generating template: " + e.getMessage());
        }

}
}

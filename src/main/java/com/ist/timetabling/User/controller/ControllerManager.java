package com.ist.timetabling.User.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.req.DtoReqManager;
import com.ist.timetabling.User.dto.res.DtoResManager;
import com.ist.timetabling.User.dto.res.DtoResManagerCsvUpload;
import com.ist.timetabling.User.service.ServiceManager;
import com.ist.timetabling.User.util.UtilManagerCsv;
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

@Slf4j
@RestController
@RequestMapping("/api/v1/managers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerManager {
    private final ServiceManager serviceManager;
    private final UtilManagerCsv utilManagerCsv;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResManager>> getManager(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceManager.findManagerByUuid(uuid));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResManager>>> getAllManagers(
            @RequestParam(required = false, defaultValue = "0") final Integer page,
            @RequestParam(required = false, defaultValue = "10") final Integer size,
            @RequestParam(required = false) final String search,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final Integer orgId) {
        return ResponseEntity.ok(serviceManager.getAllManagers(page, size, search, sortDirection, orgId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResManager>> createManager(
            @Valid @RequestBody final DtoReqManager dtoReqManager) {
        return ResponseEntity.ok(serviceManager.createManager(dtoReqManager));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResManager>> updateManager(
            @PathVariable("uuid") final String uuid,
            @Valid @RequestBody final DtoReqManager dtoReqManager) {
        return ResponseEntity.ok(serviceManager.updateManager(uuid, dtoReqManager));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<?>> softDeleteManager(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceManager.softDeleteManager(uuid));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<DtoResManager>> getCurrentManagerProfile() {
        return ResponseEntity.ok(serviceManager.getCurrentManagerProfile());
    }

    @PostMapping("/import/csv")
    @PreAuthorize("hasAnyRole('ADMIN') or @utilAuthContext.hasPermission('MANAGER', 'canCreateManagers')")
    public ResponseEntity<ApiResponse<DtoResManagerCsvUpload>> importManagers(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow,
            @RequestParam(required = false) Integer organizationId) {

        DtoReqCsvUpload uploadRequest = new DtoReqCsvUpload();
        uploadRequest.setFile(file);
        uploadRequest.setSkipHeaderRow(skipHeaderRow);
        uploadRequest.setOrganizationId(organizationId);

        return ResponseEntity.ok(serviceManager.importManagersFromCsv(uploadRequest));
    }

    /**
     * Get a CSV template for manager import
     *
     * @return CSV template file
     */
    @GetMapping("/template")
    public ResponseEntity<String> getManagerCsvTemplate() {
        try {
            String csvTemplate = utilManagerCsv.generateManagerCsvTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "managers_template.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvTemplate);
        }catch(IOException e) {
            log.error("Error generating manager CSV template: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error generating template: " + e.getMessage());
        }
    }
}

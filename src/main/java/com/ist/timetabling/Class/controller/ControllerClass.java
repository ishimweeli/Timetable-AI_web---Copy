package com.ist.timetabling.Class.controller;

import com.ist.timetabling.Class.dto.req.DtoReqClassPreference;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.dto.req.DtoReqClass;
import com.ist.timetabling.Class.dto.req.DtoReqClassUpdate;
import com.ist.timetabling.Class.dto.res.DtoResClassCsvUpload;
import com.ist.timetabling.Class.util.UtilClassCsv;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Class.service.ServiceClass;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Slf4j
@RequiredArgsConstructor
public class ControllerClass {

    private final ServiceClass serviceClass;
    private final UtilClassCsv utilClassCsv;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EntityClass>>> getAllClasses(
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer orgId,
            @RequestParam(required = false) final Integer planSettingsId) {
        final ApiResponse<List<EntityClass>> apiResponse =
                serviceClass.getAllClasses(page, size, sortBy, sortDirection, keyword, orgId, planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<EntityClass>> getClassByUuid(@PathVariable final String uuid) {
        final ApiResponse<EntityClass> apiResponse = serviceClass.getClassByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EntityClass>>> searchClasses(@RequestParam final String keyword) {
        final ApiResponse<List<EntityClass>> apiResponse = serviceClass.searchClassesByName(keyword);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<EntityClass>>> getClassesByStatus(
            @RequestParam Integer status,
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size) {
        final ApiResponse<List<EntityClass>> apiResponse = serviceClass.getClassesByStatus(status, page, size);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EntityClass>> createClass(@Valid @RequestBody final DtoReqClass dtoReqClass) {
        final ApiResponse<EntityClass> apiResponse = serviceClass.createClass(dtoReqClass);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteClassByUuid(@PathVariable final String uuid) {
        final ApiResponse<Void> apiResponse = serviceClass.deleteClassByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<EntityClass>> updateClassByUuid(
            @PathVariable final String uuid,
            @Valid @RequestBody final DtoReqClassUpdate updateDTO) {
        final ApiResponse<EntityClass> apiResponse = serviceClass.updateClassByUuid(uuid, updateDTO);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }


    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DtoResClassCsvUpload>> importClassesFromCsv(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow) {

      

        DtoReqCsvUpload uploadRequest = DtoReqCsvUpload.builder()
                .file(file)
                .organizationId(organizationId)
                .skipHeaderRow(skipHeaderRow)
                .build();

        ApiResponse<DtoResClassCsvUpload> apiResponse = serviceClass.importClassesFromCsv(uploadRequest);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }


    @GetMapping("/import/csv/template")
    public ResponseEntity<String> getClassCsvTemplate() {
        try {
            
            String template = utilClassCsv.generateClassCsvTemplate();

            return ResponseEntity
                    .ok()
                    .header("Content-Disposition", "attachment; filename=\"class_import_template.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(template);
        }catch(Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error generating template: " + e.getMessage());
        }
    }


    @GetMapping("/export/csv")
    public ResponseEntity<String> exportClassesToCsv(
            @RequestParam(required = false) final Integer orgId,
            @RequestParam(required = false) final Integer statusId) {

        try {

            ApiResponse<List<EntityClass>> apiResponse = serviceClass.getAllClasses(
                    null, 1000, "name", "asc", null, orgId, null);

            if(!apiResponse.isSuccess() || apiResponse.getData() == null) {
                return ResponseEntity.status(apiResponse.getStatus())
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Error fetching classes: " + apiResponse.getMessage());
            }

            List<EntityClass> classes = apiResponse.getData();
            if(statusId != null) {
                classes = classes.stream()
                        .filter(c -> statusId.equals(c.getStatusId()))
                        .toList();
            }

            String csvContent = utilClassCsv.exportClassesToCsv(classes);


            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "classes_export_" + timestamp + ".csv";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvContent);
        }catch(IOException e) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error generating CSV: " + e.getMessage());
        }
    }

    @PostMapping("/{classUuid}/preferences")
    public ResponseEntity<ApiResponse<EntityClass>> addSchedulePreferenceToClass(
            @PathVariable final String classUuid,
            @RequestBody final DtoReqClassPreference preferenceRequest) {
        return ResponseEntity.ok(serviceClass.addSchedulePreferenceToClass(
                classUuid,
                preferenceRequest.getPeriodId(),
                preferenceRequest.getDayOfWeek(),
                preferenceRequest.getPreferenceType(),
                preferenceRequest.getPreferenceValue()
        ));
    }

    @PutMapping("/schedule-preference/{uuid}")
    public ResponseEntity<ApiResponse<EntityClass>> updateSchedulePreference(
            @PathVariable final String uuid,
            @RequestBody final DtoReqClassPreference preferenceRequest) {
        return ResponseEntity.ok(serviceClass.updateSchedulePreference(
                uuid,
                preferenceRequest.getPreferenceType(),
                preferenceRequest.getPreferenceValue(),
                preferenceRequest.getPeriodId(),
                preferenceRequest.getDayOfWeek()
        ));
    }

    @GetMapping("/{classUuid}/preferences")
    public ResponseEntity<ApiResponse<List<EntityClass>>> getClassPreferences(@PathVariable final String classUuid) {
        return ResponseEntity.ok(serviceClass.getClassAllPreferences(classUuid));
    }

    @GetMapping("/{classUuid}/preferences/timeslot")
    public ResponseEntity<ApiResponse<EntityClass>> getClassPreferenceForSchedule(
            @PathVariable final String classUuid,
            @RequestParam final Integer periodId,
            @RequestParam final Integer dayOfWeek) {
        return ResponseEntity.ok(serviceClass.getClassPreferenceForSchedule(classUuid, periodId, dayOfWeek));
    }

    @DeleteMapping("/{classUuid}/preferences/timeslot")
    public ResponseEntity<ApiResponse<?>> clearClassSchedulePreferences(
            @PathVariable final String classUuid,
            @RequestParam final Integer periodId,
            @RequestParam final Integer dayOfWeek) {
        return ResponseEntity.ok(serviceClass.clearClassPreferencesForSchedule(classUuid, periodId, dayOfWeek));
    }

    @DeleteMapping("/schedule-preference/{uuid}")
    public ResponseEntity<ApiResponse<?>> deleteSchedulePreference(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceClass.deleteClassSchedulePreference(uuid));
    }
}

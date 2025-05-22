package com.ist.timetabling.Teacher.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacher;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacherPreference;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacher;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacherCsvUpload;
import com.ist.timetabling.Teacher.service.ServiceTeacher;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
public class ControllerTeacher {
    private final ServiceTeacher serviceTeacher;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResTeacher>> getTeacher(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceTeacher.findTeacherByUuid(uuid));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<DtoResTeacher>>> getAllTeachers(@RequestParam(required = false, defaultValue = "0") final Integer page, @RequestParam(required = false, defaultValue = "10") final Integer size, @RequestParam(required = false) final String sortBy, @RequestParam(required = false, defaultValue = "asc") final String sortDirection, @RequestParam(required = false) final String keyword, @RequestParam(required = false) final Integer orgId, @RequestParam(required = false) final Integer planSettingsId) {
        return ResponseEntity.ok(serviceTeacher.getAllTeachers(page, size, sortBy, sortDirection, keyword, orgId, planSettingsId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacher>> createTeacher(@Valid @RequestBody final DtoReqTeacher dtoReqTeacher) {
        return ResponseEntity.ok(serviceTeacher.createTeacher(dtoReqTeacher));
    }

    @PutMapping("/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacher>> updateTeacher(@PathVariable("uuid") final String uuid, @Valid @RequestBody final DtoReqTeacher dtoReqTeacher) {
        return ResponseEntity.ok(serviceTeacher.updateTeacher(uuid, dtoReqTeacher));
    }

    @DeleteMapping("/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<?>> softDeleteTeacher(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceTeacher.softDeleteTeacher(uuid));
    }

    @PostMapping("/{teacherUuid}/preferences")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacher>> addSchedulePreferenceToTeacher(
            @PathVariable final String teacherUuid,
            @RequestParam final Integer periodId,
            @RequestParam final Integer dayOfWeek,
            @RequestBody final DtoReqTeacherPreference preferenceRequest) {
        return ResponseEntity.ok(serviceTeacher.addSchedulePreferenceToTeacher(
                teacherUuid, periodId, dayOfWeek, preferenceRequest.getPreferenceType(), preferenceRequest.getPreferenceValue()));
    }

    @GetMapping("/{teacherUuid}/preferences/period")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacher>> getTeacherPreferenceForPeriodAndDay(
            @PathVariable final String teacherUuid,
            @RequestParam final Integer periodId,
            @RequestParam final Integer dayOfWeek) {
        return ResponseEntity.ok(serviceTeacher.getTeacherPreferenceForPeriodAndDay(teacherUuid, periodId, dayOfWeek));
    }

    @DeleteMapping("/{teacherUuid}/preferences/period")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<?>> clearTeacherPreferencesForPeriodAndDay(@PathVariable final String teacherUuid, @RequestParam final Integer periodId, @RequestParam final Integer dayOfWeek) {
        return ResponseEntity.ok(serviceTeacher.clearTeacherPreferencesForPeriodAndDay(teacherUuid, periodId, dayOfWeek));
    }

    @PostMapping("/{teacherUuid}/preferences/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacher>> addAllSchedulePreferencesToTeacher(@PathVariable final String teacherUuid, @RequestBody final DtoReqSchedulePreference preferences) {
        return ResponseEntity.ok(serviceTeacher.addSchedulePreferencesToTeacher(teacherUuid, preferences));
    }

    @PutMapping("/schedule-preference/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacher>> updateSchedulePreference(@PathVariable final String uuid, @RequestBody final DtoReqTeacherPreference preferenceRequest) {
        return ResponseEntity.ok(serviceTeacher.updateSchedulePreference(uuid, preferenceRequest.getPreferenceType(), preferenceRequest.getPreferenceValue()));
    }

    @GetMapping("/{teacherUuid}/preferences")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<DtoResTeacher>>> getTeacherPreferences(@PathVariable final String teacherUuid) {
        return ResponseEntity.ok(serviceTeacher.getTeacherAllPreferences(teacherUuid));
    }

    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DtoResTeacherCsvUpload>> importTeachersFromCsv(@RequestPart("file") MultipartFile file, @RequestParam(required = false) Integer organizationId, @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow) {

        DtoReqCsvUpload uploadRequest = DtoReqCsvUpload.builder().file(file).organizationId(organizationId).skipHeaderRow(skipHeaderRow).build();
        ApiResponse<DtoResTeacherCsvUpload> apiResponse = serviceTeacher.importTeachersFromCsv(uploadRequest);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/profiles")
    public ResponseEntity<ApiResponse<List<DtoResTeacher>>> getAllTeacherProfiles(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size, @RequestParam(defaultValue = "firstName") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {
        ApiResponse<List<DtoResTeacher>> response = serviceTeacher.getAllTeacherProfiles(page, size, sortBy, sortDirection);
        return  ResponseEntity.ok(response);
    }

}
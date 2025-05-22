package com.ist.timetabling.ClassBand.controller;

import com.ist.timetabling.ClassBand.entity.EntityClassBand;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBand;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBandUpdate;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBandPreference;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.ClassBand.service.ServiceClassBand;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/class-bands")
@Slf4j
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerClassBand {

    private final ServiceClassBand serviceClassBand;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EntityClassBand>>> getAllClassBands(
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer orgId,
            @RequestParam(required = false) final Integer planSettingsId) {
        final ApiResponse<List<EntityClassBand>> apiResponse =
                serviceClassBand.getAllClassBands(page, size, sortBy, sortDirection, keyword, orgId, planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<EntityClassBand>> getClassBandByUuid(@PathVariable final String uuid) {
        final ApiResponse<EntityClassBand> apiResponse = serviceClassBand.getClassBandByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EntityClassBand>>> searchClassBands(@RequestParam final String keyword) {
        final ApiResponse<List<EntityClassBand>> apiResponse = serviceClassBand.searchClassBandsByName(keyword);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<EntityClassBand>>> getClassBandsByStatus(@RequestParam Integer status, @RequestParam(required = false) final Integer page, @RequestParam(required = false) final Integer size) {
        final ApiResponse<List<EntityClassBand>> apiResponse = serviceClassBand.getClassBandsByStatus(status, page, size);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EntityClassBand>> createClassBand(@Valid @RequestBody final DtoReqClassBand dtoReqClassBand) {
        final ApiResponse<EntityClassBand> apiResponse = serviceClassBand.createClassBand(dtoReqClassBand);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteClassBandByUuid(@PathVariable final String uuid) {
        final ApiResponse<Void> apiResponse = serviceClassBand.deleteClassBandByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<EntityClassBand>> updateClassBandByUuid(@PathVariable final String uuid, @Valid @RequestBody final DtoReqClassBandUpdate dtoReqClassBandUpdate) {
        final ApiResponse<EntityClassBand> apiResponse = serviceClassBand.updateClassBandByUuid(uuid, dtoReqClassBandUpdate);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping("/{classBandUuid}/preferences")
    public ResponseEntity<ApiResponse<EntityClassBand>> addSchedulePreferenceToClassBandByPeriodAndDay(
        @PathVariable final String classBandUuid,
        @RequestBody final DtoReqClassBandPreference preferenceRequest
    ) {
        return ResponseEntity.ok(
            serviceClassBand.addSchedulePreferenceToClassBand(
                classBandUuid,
                preferenceRequest.getPeriodId(),
                preferenceRequest.getDayOfWeek(),
                preferenceRequest.getPreferenceType(),
                preferenceRequest.getPreferenceValue()
            )
        );
    }

    @GetMapping("/{classBandUuid}/preferences")
    public ResponseEntity<ApiResponse<List<EntityClassBand>>> getClassBandPreferences(@PathVariable final String classBandUuid) {
        return ResponseEntity.ok(serviceClassBand.getClassBandAllPreferences(classBandUuid));
    }

    @GetMapping("/{classBandUuid}/preferences/timeslot")
    public ResponseEntity<ApiResponse<EntityClassBand>> getClassBandPreferenceForTimeSlot(@PathVariable final String classBandUuid, @RequestParam Integer periodId, @RequestParam Integer dayOfWeek) {
        return ResponseEntity.ok(serviceClassBand.getClassBandPreferenceForSchedule(classBandUuid, periodId, dayOfWeek));
    }

    @PutMapping("/schedule-preference/{uuid}")
    public ResponseEntity<ApiResponse<EntityClassBand>> updateSchedulePreference(
        @PathVariable final String uuid,
        @RequestBody final DtoReqClassBandPreference preferenceRequest
    ) {
        return ResponseEntity.ok(
            serviceClassBand.updateSchedulePreference(
                uuid,
                preferenceRequest.getPreferenceType(),
                preferenceRequest.getPreferenceValue()
            )
        );
    }
}
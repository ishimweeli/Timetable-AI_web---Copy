package com.ist.timetabling.Period.controller;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.dto.req.DtoReqAllowLocationChangeBulk;
import com.ist.timetabling.Period.dto.req.DtoReqPeriod;
import com.ist.timetabling.Period.dto.res.DtoResPeriod;
import com.ist.timetabling.Period.dto.res.DtoResPeriodSchedules;
import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.service.ServicePeriod;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/periods")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerPeriod {

    private final ServicePeriod servicePeriod;

    @Autowired
    public ControllerPeriod(ServicePeriod servicePeriod) {
        this.servicePeriod = servicePeriod;
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResPeriod>> getPeriodByUuid(@PathVariable final String uuid) {
        final ApiResponse<DtoResPeriod> apiResponse = servicePeriod.getPeriodByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResPeriod>>> getAllPeriods(
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer orgId,
            @RequestParam(required = false) final Integer planSettingsId) {
        final ApiResponse<List<DtoResPeriod>> apiResponse = servicePeriod.getAllPeriods(
                page, size, sortBy, sortDirection, keyword, orgId, planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<DtoResPeriodSchedules>>> getAllPeriodsSchedules(
            @RequestParam(required = false) final Integer planSettingsId) {
        final ApiResponse<List<DtoResPeriodSchedules>> apiResponse = servicePeriod.getAllPeriodsSchedules(planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<DtoResPeriod>>> getAllPeriods(
            @RequestParam(required = false) final Integer planSettingsId) {
        final ApiResponse<List<DtoResPeriod>> apiResponse = servicePeriod.getAllPeriods(planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }


    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<EntityPeriod>>> getPeriodsByOrganizationId(
            @PathVariable final Integer organizationId,
            @RequestParam(required = false) final Integer planSettingsId,
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection) {
        final ApiResponse<List<EntityPeriod>> apiResponse =
                servicePeriod.getPeriodsByOrganizationId(organizationId, planSettingsId, page, size, sortBy, sortDirection);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResPeriod>> createPeriod(
            @Valid @RequestBody final DtoReqPeriod dtoReqPeriod) {
        final ApiResponse<DtoResPeriod> apiResponse = servicePeriod.createPeriod(dtoReqPeriod);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResPeriod>> updatePeriod(
            @PathVariable final String uuid,
            @Valid @RequestBody final DtoReqPeriod dtoReqPeriod) {
        final ApiResponse<DtoResPeriod> apiResponse =
                servicePeriod.updatePeriodByUuid(uuid, dtoReqPeriod);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }
    @PutMapping("/allow-location-change")
    public ResponseEntity<ApiResponse<List<DtoResPeriod>>> updateAllowLocationChangeForPeriods(
            @Valid @RequestBody DtoReqAllowLocationChangeBulk request) {
        ApiResponse<List<DtoResPeriod>> apiResponse = servicePeriod.updateAllowLocationChangeForPeriodsByUuid(
                request.getPeriodUuids(), request.getAllowLocationChange());
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deletePeriod(@PathVariable final String uuid) {
        final ApiResponse<Void> apiResponse = servicePeriod.deletePeriodByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }
}
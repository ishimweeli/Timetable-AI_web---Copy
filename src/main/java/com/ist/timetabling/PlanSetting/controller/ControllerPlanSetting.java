package com.ist.timetabling.PlanSetting.controller;

import com.ist.timetabling.Core.model.ApiResponse;

import com.ist.timetabling.PlanSetting.dto.req.DtoReqPlanningSettings;
import com.ist.timetabling.PlanSetting.dto.res.DtoResPlanningSettings;
import com.ist.timetabling.PlanSetting.service.ServicePlanSetting;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/plan-settings")
@RequiredArgsConstructor
public class ControllerPlanSetting {

    private final ServicePlanSetting servicePlanSetting;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResPlanningSettings>> getPlanningSettingsByUuid(@PathVariable final String uuid) {
        return ResponseEntity.ok(servicePlanSetting.findPlanningSettingsByUuid(uuid));
    }

    @GetMapping("/organization/{organizationId}/category/{category}")
    public ResponseEntity<ApiResponse<DtoResPlanningSettings>> getPlanningSettingsByOrganizationIdAndCategory(
            @PathVariable final String organizationId,
            @PathVariable final String category) {
        return ResponseEntity.ok(servicePlanSetting.findPlanningSettingsByOrganizationIdAndCategory(organizationId, category));
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<DtoResPlanningSettings>>> getPlanningSettingsByOrganizationId(
            @PathVariable final String organizationId) {
        return ResponseEntity.ok(servicePlanSetting.findPlanningSettingsByOrganizationId(organizationId));
    }

    @GetMapping("/organization/{organizationId}/paginated")
    public ResponseEntity<ApiResponse<Page<DtoResPlanningSettings>>> getPlanningSettingsByOrganizationIdPaginated(
            @PathVariable final String organizationId,
            final Pageable pageable,
            @RequestParam(required = false) final String search) {
        return ResponseEntity.ok(servicePlanSetting.findPlanningSettingsByOrganizationIdPaginated(organizationId, pageable, search));
    }

    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<DtoResPlanningSettings>>> getPlanningSettingsPaginated(
            final Pageable pageable,
            @RequestParam(required = false) final String search) {
        final ApiResponse<Page<DtoResPlanningSettings>> apiResponse = servicePlanSetting.findPlanningSettingsPaginated(pageable, search);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResPlanningSettings>>> getAllPlanningSettings(@RequestParam(required = false) final Integer page, @RequestParam(required = false) final Integer size, @RequestParam(required = false) final String sortBy, @RequestParam(required = false, defaultValue = "asc") final String sortDirection, @RequestParam(required = false) final String keyword, @RequestParam(required = false) final String orgId) {
        final ApiResponse<List<DtoResPlanningSettings>> apiResponse =
                servicePlanSetting.findAllPlanningSettings(page, size, sortBy, sortDirection, keyword, orgId);
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResPlanningSettings>> createPlanningSettings(@RequestBody @Valid final DtoReqPlanningSettings dtoReqPlanningSettings) {
        final ApiResponse<DtoResPlanningSettings> apiResponse = servicePlanSetting.createPlanningSettings(dtoReqPlanningSettings);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResPlanningSettings>> updatePlanningSettings(@PathVariable final String uuid, @RequestBody @Valid final DtoReqPlanningSettings dtoReqPlanningSettings) {
        final ApiResponse<DtoResPlanningSettings> apiResponse = servicePlanSetting.updatePlanningSettingsByUuid(uuid, dtoReqPlanningSettings);
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deletePlanningSettingsByUuid(@PathVariable final String uuid) {
        final ApiResponse<Void> apiResponse = servicePlanSetting.deletePlanningSettingsByUuid(uuid);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/max-control-number")
    public ResponseEntity<Integer> getMaxControlNumber(@RequestParam String organizationId, @RequestParam String category) {
        Integer maxControlNumber = servicePlanSetting.getMaxControlNumber(organizationId, category);
        return ResponseEntity.ok(maxControlNumber);
    }
}
package com.ist.timetabling.Rule.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Rule.dto.req.DtoReqRuleSchedulePreference;
import com.ist.timetabling.Rule.dto.res.DtoResRuleCsvUpload;
import com.ist.timetabling.Rule.entity.EntityRule;
import com.ist.timetabling.Rule.dto.req.DtoReqRule;
import com.ist.timetabling.Rule.dto.req.DtoReqRuleUpdate;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Rule.service.ServiceRule;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ist.timetabling.Rule.util.UtilRuleCsv;

import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/api/v1/rules")
@Slf4j
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerRule {

    private final ServiceRule serviceRule;
    private final UtilRuleCsv utilRuleCsv;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<EntityRule>> getRuleByUuid(@PathVariable final String uuid) {
        final ApiResponse<EntityRule> apiResponse = serviceRule.getRuleByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<EntityRule>>> getRulesByStatus(@RequestParam final Integer statusId, @RequestParam(required = false) final Integer page, @RequestParam(required = false) final Integer size) {
        final ApiResponse<List<EntityRule>> apiResponse = serviceRule.getRulesByStatus(statusId, page, size);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EntityRule>>> searchRules(@RequestParam final String keyword) {
        final ApiResponse<List<EntityRule>> apiResponse = serviceRule.searchRulesByName(keyword);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EntityRule>>> getAllRules(
            @RequestParam(required = false) final Integer page,
            @RequestParam(required = false) final Integer size,
            @RequestParam(required = false) final String sortBy,
            @RequestParam(required = false, defaultValue = "asc") final String sortDirection,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer orgId,
            @RequestParam(required = false) final Integer planSettingsId) {

        ApiResponse<List<EntityRule>> apiResponse = serviceRule.getAllRules(page, size, sortBy, sortDirection, keyword, orgId, planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }



    @GetMapping("/{ruleUuid}/preferences")
    public ResponseEntity<ApiResponse<List<EntityRule>>> getRulePreferences(@PathVariable final String ruleUuid) {
        return ResponseEntity.ok(serviceRule.getRuleAllPreferences(ruleUuid));
    }

    @GetMapping("/{ruleUuid}/preferences/timeslot")
    public ResponseEntity<ApiResponse<EntityRule>> getRulePreferenceForTimeSlot(@PathVariable final String ruleUuid, @RequestParam Integer periodId, @RequestParam Integer dayOfWeek) {
        return ResponseEntity.ok(serviceRule.getRulePreferenceForTimeSlot(ruleUuid, periodId, dayOfWeek));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EntityRule>> createRule(@Valid @RequestBody final DtoReqRule dtoReqRule) {
        final ApiResponse<EntityRule> apiResponse = serviceRule.createRule(dtoReqRule);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }


    @PostMapping("/{ruleUuid}/preferences")
    public ResponseEntity<ApiResponse<EntityRule>> addSchedulePreferenceToRule(@PathVariable final String ruleUuid, @RequestBody final DtoReqRuleSchedulePreference preferenceRequest) {
        return ResponseEntity.ok(serviceRule.addSchedulePreferenceToRule(ruleUuid, preferenceRequest.getPeriodId(), preferenceRequest.getDayOfWeek(), preferenceRequest.getPreferenceType(), preferenceRequest.getPreferenceValue()));
    }

    @PostMapping("/{ruleUuid}/schedules/{scheduleUuid}/preferences/all")
    public ResponseEntity<ApiResponse<EntityRule>> addAllSchedulePreferencesToRule(@PathVariable final String ruleUuid, @PathVariable final String scheduleUuid, @RequestBody final DtoReqSchedulePreference preferences) {
        return ResponseEntity.ok(serviceRule.addSchedulePreferencesToRule(ruleUuid, preferences));
    }


    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<EntityRule>> updateRuleByUuid(@PathVariable final String uuid, @Valid @RequestBody final DtoReqRuleUpdate dtoReqRuleUpdate) {
        final ApiResponse<EntityRule> apiResponse = serviceRule.updateRuleByUuid(uuid, dtoReqRuleUpdate);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/schedule-preference/{uuid}")
    public ResponseEntity<ApiResponse<EntityRule>> updateSchedulePreference(@PathVariable final String uuid, @RequestBody final DtoReqRuleSchedulePreference preferenceRequest) {
        return ResponseEntity.ok(serviceRule.updateSchedulePreference(uuid, preferenceRequest.getPreferenceType(), preferenceRequest.getPreferenceValue(), preferenceRequest.getPeriodId(), preferenceRequest.getDayOfWeek()));
    }

    @DeleteMapping("/{ruleUuid}/preferences/timeslot")
    public ResponseEntity<ApiResponse<?>> clearRulePreferencesForTimeSlot(@PathVariable final String ruleUuid, @RequestParam Integer periodId, @RequestParam Integer dayOfWeek) {
        return ResponseEntity.ok(serviceRule.clearRulePreferencesForTimeSlot(ruleUuid, periodId, dayOfWeek));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteRuleByUuid(@PathVariable final String uuid) {
        final ApiResponse<Void> apiResponse = serviceRule.deleteRuleByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @DeleteMapping("/schedule-preference/{uuid}")
    public ResponseEntity<ApiResponse<?>> deleteSchedulePreference(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceRule.deleteRuleSchedulePreference(uuid));
    }

    @PostMapping("/import/csv")
    public ResponseEntity<ApiResponse<DtoResRuleCsvUpload>> importRules(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow,
            @RequestParam(required = false) Integer organizationId) {

        DtoReqCsvUpload uploadRequest = new DtoReqCsvUpload();
        uploadRequest.setFile(file);
        uploadRequest.setSkipHeaderRow(skipHeaderRow);
        uploadRequest.setOrganizationId(organizationId);

        final ApiResponse<DtoResRuleCsvUpload> response = serviceRule.importRulesFromCsv(uploadRequest);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    /**
     * Get a CSV template for rule import
     *
     * @return CSV template file
     */
    @GetMapping("/template")
    public ResponseEntity<String> getRuleCsvTemplate() {
        try {
            String csvTemplate = utilRuleCsv.generateRuleCsvTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "rules_template.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvTemplate);
        }catch(IOException e) {
            log.error("Error generating rule CSV template: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error generating template: " + e.getMessage());
        }
    }
}

package com.ist.timetabling.Rule.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositorySchedulePreference;
import com.ist.timetabling.Period.service.ServiceSchedulePreference;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Rule.dto.res.DtoResRuleCsvUpload;
import com.ist.timetabling.Rule.entity.EntityRule;
import com.ist.timetabling.Rule.dto.req.DtoReqRule;
import com.ist.timetabling.Rule.dto.req.DtoReqRuleUpdate;
import com.ist.timetabling.Rule.repository.RepositoryRule;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Rule.service.ServiceRule;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Rule.util.RuleCsvMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_UNAUTHORIZED;
import static com.ist.timetabling.Rule.constant.ConstantRuleI18n.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.repository.RepositoryPeriod;

@Slf4j
@Service
public class ServiceImplRule implements ServiceRule {

    private final RepositoryRule repositoryRule;
    private final RepositoryOrganization repositoryOrganization;
    private final HttpServletRequest httpServletRequest;
    private final RepositorySchedulePreference repositorySchedulePreference;
    private final RepositorySchedule repositorySchedule;
    private final RepositoryPeriod repositoryPeriod;
    private final ServiceSchedulePreference serviceSchedulePreference;
    private final UtilAuthContext utilAuthContext;
    private final CSVReaderUtil csvReaderUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final String ROLE_ADMIN = "ADMIN";

    @Autowired
    public ServiceImplRule(final RepositoryRule repositoryRule,
                           final RepositoryOrganization repositoryOrganization,
                           final RepositorySchedulePreference repositorySchedulePreference,
                           final ServiceSchedulePreference serviceSchedulePreference,
                           final RepositorySchedule repositorySchedule,
                           final RepositoryPeriod repositoryPeriod,
                           final UtilAuthContext utilAuthContext,
                           final CSVReaderUtil csvReaderUtil,
                           final HttpServletRequest httpServletRequest) {

        this.repositoryRule = repositoryRule;
        this.repositoryOrganization = repositoryOrganization;
        this.repositorySchedulePreference = repositorySchedulePreference;
        this.repositorySchedule = repositorySchedule;
        this.repositoryPeriod = repositoryPeriod;
        this.serviceSchedulePreference = serviceSchedulePreference;
        this.utilAuthContext = utilAuthContext;
        this.httpServletRequest = httpServletRequest;
        this.csvReaderUtil = csvReaderUtil;

        objectMapper.findAndRegisterModules();
    }

    @Override
    @Transactional
    public ApiResponse<DtoResRuleCsvUpload> importRulesFromCsv(final DtoReqCsvUpload uploadRequest) {
        final I18n i18n = new I18n(httpServletRequest);
        if(uploadRequest.getFile().isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }
        Integer organizationId;
        if(utilAuthContext.isAdmin() && uploadRequest.getOrganizationId() != null) {
            organizationId = uploadRequest.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }

        if(!repositoryOrganization.existsById(organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getRule(I18N_ORGANIZATION_NOT_FOUND));
        }

        DtoResRuleCsvUpload result = new DtoResRuleCsvUpload();
        List<EntityRule> createdRules = new ArrayList<>();
        List<DtoResRuleCsvUpload.ImportError> errors = new ArrayList<>();

        try {
            RuleCsvMapper ruleCsvMapper = new RuleCsvMapper(csvReaderUtil);
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    RuleCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            result.setTotalProcessed(records.size());
            int rowNum = uploadRequest.getSkipHeaderRow() ? 2 : 1;

            for(CSVRecord record : records) {
                try {
                    DtoReqRule ruleRequest = ruleCsvMapper.mapToRuleRequest(record, organizationId, rowNum);

                    if(repositoryRule.existsByNameAndOrganizationIdAndIsDeletedFalse(
                            ruleRequest.getName(), organizationId)) {
                        throw new Exception(i18n.getRule(I18N_RULE_EXISTS));
                    }

                    ApiResponse<EntityRule> response = createRule(ruleRequest);

                    if(response.isSuccess()) {
                        createdRules.add(response.getData());
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                    DtoResRuleCsvUpload.ImportError error = new DtoResRuleCsvUpload.ImportError(
                            rowNum,
                            record.toString(),
                            e.getMessage()
                    );
                    errors.add(error);
                }
                rowNum++;
            }

            result.setCreatedRules(createdRules);
            result.setErrors(errors);
            result.setSuccessCount(createdRules.size());
            result.setErrorCount(errors.size());

            String message = result.buildSuccessMessage();
            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EntityRule> getRuleByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final Optional<EntityRule> entityRuleOpt = repositoryRule.findByUuidAndIsDeletedFalse(uuid);
        if(entityRuleOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }

        EntityRule entityRule = entityRuleOpt.get();


        List<EntitySchedulePreference> activePreferences = entityRule.getSchedulePreferences().stream()
                .filter(pref -> !pref.getIsDeleted())
                .collect(Collectors.toList());

        EntityRule filteredRule = copyRuleWithFilteredPreferences(entityRule, activePreferences);

        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_RETRIEVED_SINGLE), filteredRule);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityRule>> getRulesByStatus(final Integer statusId, final Integer page, final Integer size) {
        final I18n i18n = new I18n(httpServletRequest);
        final Pageable pageable = PaginationUtil.createPageable(page, size, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);

        Page<EntityRule> entityRules;
        if(utilAuthContext.isAdmin()) {
            entityRules = repositoryRule.findByStatusIdAndIsDeletedFalse(statusId, pageable);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            entityRules = repositoryRule.findByStatusIdAndOrganizationIdAndIsDeletedFalse(statusId, organizationId, pageable);
        }

        List<EntityRule> filteredRules = entityRules.getContent().stream()
                .map(this::filterRuleDeletedPreferences)
                .collect(Collectors.toList());

        return ApiResponse.<List<EntityRule>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getRule(I18N_RULE_STATUS_RESULTS))
                .data(filteredRules)
                .totalItems(entityRules.getTotalElements())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityRule>> searchRulesByName(final String keyword) {
        final I18n i18n = new I18n(httpServletRequest);

        List<EntityRule> entityRules;
        if(utilAuthContext.isAdmin()) {
            entityRules = repositoryRule.searchByNameContainingNative(keyword);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            entityRules = repositoryRule.searchByNameContainingAndOrganizationId(keyword, organizationId);
        }

        List<EntityRule> filteredRules = entityRules.stream()
                .map(this::filterRuleDeletedPreferences)
                .collect(Collectors.toList());

        return ApiResponse.<List<EntityRule>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getRule(I18N_RULE_SEARCH_RESULTS))
                .data(filteredRules)
                .totalItems(filteredRules.size())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityRule>> getAllRules(final Integer page,
                                                     final Integer size,
                                                     final String sortBy,
                                                     final String sortDirection,
                                                     final String keyword,
                                                     final Integer organizationId,
                                                     final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        Page<EntityRule> entityRules;

        Integer effectiveOrgId = null;
        if(!utilAuthContext.isAdmin()) {
            effectiveOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        } else if(organizationId != null) {
            effectiveOrgId = organizationId;
        }

        Pageable pageable;
        if(keyword != null && !keyword.trim().isEmpty()) {
            pageable = PageRequest.of(page, size);
        }else {

            String effectiveSortBy = sortBy;
            if(effectiveSortBy != null &&
                    (effectiveSortBy.equalsIgnoreCase("rule") || effectiveSortBy.equalsIgnoreCase("name"))) {

                effectiveSortBy = "name";
            }
            pageable = PaginationUtil.createPageable(page, size, effectiveSortBy, sortDirection,
                    DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
        }

        if(keyword != null && !keyword.trim().isEmpty()) {
            if(planSettingsId != null) {
                entityRules = repositoryRule.searchRulesWithPlanSettings(keyword, effectiveOrgId, planSettingsId, pageable);
            } else if(utilAuthContext.isAdmin()) {
                if(effectiveOrgId != null) {
                    entityRules = repositoryRule.searchByNameContainingAndOrganizationIdPage(keyword, effectiveOrgId, pageable);
                }else {
                    entityRules = repositoryRule.searchByNameContainingNativePage(keyword, pageable);
                }
            }else {
                entityRules = repositoryRule.searchByNameContainingAndOrganizationIdPage(keyword, effectiveOrgId, pageable);
            }
        }else {
            if(planSettingsId != null) {
                if(effectiveOrgId != null) {
                    entityRules = repositoryRule.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(effectiveOrgId, planSettingsId, pageable);
                } else {
                    entityRules = repositoryRule.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, pageable);
                }
            } else if(utilAuthContext.isAdmin()) {
                if(effectiveOrgId != null) {
                    entityRules = repositoryRule.findByOrganizationIdAndIsDeletedFalse(effectiveOrgId, pageable);
                }else {
                    entityRules = repositoryRule.findByIsDeletedFalse(pageable);
                }
            }else {
                entityRules = repositoryRule.findByOrganizationIdAndIsDeletedFalse(effectiveOrgId, pageable);
            }
        }

        List<EntityRule> filteredRules = entityRules.getContent().stream()
                .map(this::filterRuleDeletedPreferences)
                .collect(Collectors.toList());

        return ApiResponse.success(entityRules, i18n.getRule(I18N_RULES_RETRIEVED));
    }




    @Override
    @Transactional
    public ApiResponse<EntityRule> createRule(final DtoReqRule dtoReqRule) {
        final I18n i18n = new I18n(httpServletRequest);

        Integer organizationId;
        if(utilAuthContext.isAdmin() && dtoReqRule.getOrganizationId() != null) {
            organizationId = dtoReqRule.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            dtoReqRule.setOrganizationId(organizationId);
        }

        if(repositoryRule.existsByNameAndOrganizationIdAndIsDeletedFalse(
                dtoReqRule.getName(), organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getRule(I18N_RULE_EXISTS));
        }

        if(!repositoryOrganization.existsById(organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getRule(I18N_ORGANIZATION_NOT_FOUND));
        }

        final EntityRule entityRule = toDto(dtoReqRule);

        final EntityRule savedRule = repositoryRule.save(entityRule);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getRule(I18N_RULE_CREATED), savedRule);
    }

    @Override
    @Transactional
    public ApiResponse<EntityRule> updateRuleByUuid(final String uuid, final DtoReqRuleUpdate dtoReqRuleUpdate) {
        final I18n i18n = new I18n(httpServletRequest);

        Optional<EntityRule> entityRuleOptional = repositoryRule.findByUuidAndIsDeletedFalse(uuid);
        if(entityRuleOptional.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntityRule entityRule = entityRuleOptional.get();


        if(dtoReqRuleUpdate.getName() != null &&
                !dtoReqRuleUpdate.getName().equals(entityRule.getName()) &&
                repositoryRule.existsByNameAndOrganizationIdAndIsDeletedFalse(
                        dtoReqRuleUpdate.getName(), entityRule.getOrganizationId())) {
            return ApiResponse.error(HttpStatus.CONFLICT, i18n.getRule(I18N_RULE_EXISTS));
        }

        EntityRule updatedRule = updateRuleFields(entityRule, dtoReqRuleUpdate);
        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_UPDATED), updatedRule);
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteRuleByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);

        Optional<EntityRule> entityRuleOptional = repositoryRule.findByUuidAndIsDeletedFalse(uuid);
        if(entityRuleOptional.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }

        EntityRule entityRule = entityRuleOptional.get();

        if(!utilAuthContext.isAdmin() && !entityRule.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        entityRule.setIsDeleted(true);
        entityRule.setModifiedDate(LocalDateTime.now());
        repositoryRule.save(entityRule);

        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_DELETED), null);
    }

    @Override
    @Transactional
    public ApiResponse<EntityRule> updateSchedulePreference(final String preferenceUuid, final String preferenceType, final Boolean preferenceValue, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntitySchedulePreference> optPref = repositorySchedulePreference.findByUuid(preferenceUuid);
        if (!optPref.isPresent() || optPref.get().getIsDeleted()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntitySchedulePreference pref = optPref.get();
        setPreferenceField(pref, preferenceType, preferenceValue);
        repositorySchedulePreference.save(pref);
        // Find the rule containing this preference
        List<EntityRule> rules = repositoryRule.findBySchedulePreferencesContaining(pref);
        if (rules.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntityRule rule = rules.get(0);
        rule.setModifiedDate(LocalDateTime.now());
        rule = repositoryRule.save(rule);
        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_UPDATED), rule);
    }

    @Override
    @Transactional
    public ApiResponse<?> deleteRuleSchedulePreference(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntitySchedulePreference> schedulePreferenceOpt = repositorySchedulePreference.findByUuid(uuid);
            if(!schedulePreferenceOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
            }

            EntitySchedulePreference schedulePreference = schedulePreferenceOpt.get();

            List<EntityRule> affectedRules = repositoryRule.findBySchedulePreferencesContaining(schedulePreference);

            for(EntityRule rule : affectedRules) {
                rule.getSchedulePreferences().remove(schedulePreference);
                rule.setModifiedDate(LocalDateTime.now());
                repositoryRule.save(rule);
            }

            return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_PREFERENCE_DELETED), null);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<EntityRule> addSchedulePreferenceToRule(final String ruleUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityRule> ruleOpt = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid);
        if (!ruleOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntityRule rule = ruleOpt.get();

        // Fetch the period entity to get org, planSettings, periodNumber
        EntityPeriod period = repositoryPeriod.findById(periodId).orElse(null);
        if (period == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Period not found");
        }
        Integer orgId = period.getOrganizationId();
        Integer planSettingsId = period.getPlanSettingsId();
        Integer periodNumber = period.getPeriodNumber();

        // Check for existing preference with same composite key
        boolean exists = rule.getSchedulePreferences().stream()
            .anyMatch(pref ->
                pref.getOrganizationId() != null && pref.getOrganizationId().equals(orgId)
                && ((pref.getPlanSettingsId() == null && planSettingsId == null) || (pref.getPlanSettingsId() != null && pref.getPlanSettingsId().equals(planSettingsId)))
                && pref.getPeriodId() != null && pref.getPeriodId().equals(periodId)
                && pref.getDayOfWeek() != null && pref.getDayOfWeek().equals(dayOfWeek)
                && !pref.getIsDeleted()
            );
        if (exists) {
            return ApiResponse.error(HttpStatus.CONFLICT, "Preference already exists for this time slot and plan/period");
        }
        EntitySchedulePreference newPref = new EntitySchedulePreference();
        newPref.setPeriodId(periodId);
        newPref.setDayOfWeek(dayOfWeek);
        newPref.setOrganizationId(orgId);
        newPref.setPlanSettingsId(planSettingsId);
        setPreferenceField(newPref, preferenceType, preferenceValue);
        repositorySchedulePreference.save(newPref);
        rule.getSchedulePreferences().add(newPref);
        rule.setModifiedDate(LocalDateTime.now());
        rule = repositoryRule.save(rule);
        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_SCHEDULE_PREFERENCE_CREATED), rule);
    }

    @Override
    @Transactional
    public ApiResponse<EntityRule> addSchedulePreferencesToRule(final String ruleUuid, final DtoReqSchedulePreference preferences) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityRule> ruleOpt = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid);
        if(!ruleOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntityRule rule = ruleOpt.get();


        DtoResSchedulePreference createdPrefResponse = serviceSchedulePreference.createSchedulePreference(preferences);

        Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(createdPrefResponse.getUuid());
        if(!optEntityPref.isPresent()) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntitySchedulePreference entityPref = optEntityPref.get();

        if(!rule.getSchedulePreferences().contains(entityPref)) {
            rule.getSchedulePreferences().add(entityPref);
        }
        rule.setModifiedDate(LocalDateTime.now());
        rule = repositoryRule.save(rule);

        rule = filterRuleDeletedPreferences(rule);

        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_SCHEDULE_PREFERENCE_CREATED), rule);
    }

    @Override
    public ApiResponse<List<EntityRule>> getRuleAllPreferences(final String ruleUuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityRule> ruleOpt = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid);
        if(!ruleOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }

        EntityRule rule = ruleOpt.get();
        List<EntitySchedulePreference> activePreferences = rule.getSchedulePreferences().stream()
                .filter(pref -> !pref.getIsDeleted())
                .collect(Collectors.toList());

        EntityRule filteredRule = copyRuleWithFilteredPreferences(rule, activePreferences);

        List<EntityRule> result = new ArrayList<>();
        result.add(filteredRule);
        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_SCHEDULE_PREFERENCE_RETRIEVED), result);
    }

    @Override
    public ApiResponse<EntityRule> getRulePreferenceForTimeSlot(final String ruleUuid, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityRule> ruleOpt = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid);
        if (!ruleOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntityRule rule = ruleOpt.get();
        List<EntitySchedulePreference> filteredPrefs = rule.getSchedulePreferences().stream()
                .filter(pref -> pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek) && !pref.getIsDeleted())
                .collect(Collectors.toList());
        EntityRule ruleWithFilteredPrefs = copyRuleWithFilteredPreferences(rule, filteredPrefs);
        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULE_SCHEDULE_PREFERENCE_RETRIEVED), ruleWithFilteredPrefs);
    }

    @Override
    @Transactional
    public ApiResponse<?> clearRulePreferencesForTimeSlot(final String ruleUuid, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityRule> ruleOpt = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid);
        if (!ruleOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getRule(I18N_RULE_NOT_FOUND));
        }
        EntityRule rule = ruleOpt.get();
        List<EntitySchedulePreference> toRemove = rule.getSchedulePreferences().stream()
                .filter(pref -> pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek) && !pref.getIsDeleted())
                .collect(Collectors.toList());
        if (toRemove.isEmpty()) {
            return ApiResponse.success(HttpStatus.OK, "No preferences found for this time slot", null);
        }
        rule.getSchedulePreferences().removeAll(toRemove);
        for (EntitySchedulePreference pref : toRemove) {
            pref.setIsDeleted(true);
            repositorySchedulePreference.save(pref);
        }
        rule.setModifiedDate(LocalDateTime.now());
        repositoryRule.save(rule);
        return ApiResponse.success(HttpStatus.OK, String.format("%s (%d items)", i18n.getRule(I18N_RULE_PREFERENCE_DELETED), toRemove.size()), null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityRule>> getRulesByPlanSettingsId(Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getRule(I18N_PLAN_SETTING_NOT_FOUND));
        }
        
        Integer organizationId = null;
        if (!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }
        
        Page<EntityRule> entityRules;
        if (organizationId != null) {
            entityRules = repositoryRule.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                organizationId, planSettingsId, PageRequest.of(0, 1000));
        } else {
            entityRules = repositoryRule.findByPlanSettingsIdAndIsDeletedFalse(
                planSettingsId, PageRequest.of(0, 1000));
        }
        
        List<EntityRule> filteredRules = entityRules.getContent().stream()
                .map(this::filterRuleDeletedPreferences)
                .collect(Collectors.toList());
        
        return ApiResponse.success(HttpStatus.OK, i18n.getRule(I18N_RULES_RETRIEVED), filteredRules);
    }

    private boolean hasPermissionForRules(List<EntityRule> rules) {
        if(rules == null || rules.isEmpty()) {
            return false;
        }

        Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        return rules.stream().anyMatch(rule -> rule.getOrganizationId().equals(userOrgId));
    }

    private EntityRule updateRuleFields(final EntityRule entityRule, final DtoReqRuleUpdate dtoReqRuleUpdate) {
        if(dtoReqRuleUpdate.getName() != null) entityRule.setName(dtoReqRuleUpdate.getName());
        if(dtoReqRuleUpdate.getInitials() != null) entityRule.setInitials(dtoReqRuleUpdate.getInitials());
        if(dtoReqRuleUpdate.getData() != null) entityRule.setData(dtoReqRuleUpdate.getData());
        if(dtoReqRuleUpdate.getPriority() != null) entityRule.setPriority(dtoReqRuleUpdate.getPriority());
        if(dtoReqRuleUpdate.getIsEnabled() != null) entityRule.setEnabled(dtoReqRuleUpdate.getIsEnabled());
        if(dtoReqRuleUpdate.getStatusId() != null) entityRule.setStatusId(dtoReqRuleUpdate.getStatusId());
        if(dtoReqRuleUpdate.getPlanSettingsId() != null) entityRule.setPlanSettingsId(dtoReqRuleUpdate.getPlanSettingsId());
        if(dtoReqRuleUpdate.getComment() != null) entityRule.setComment(dtoReqRuleUpdate.getComment());

        entityRule.setModifiedDate(LocalDateTime.now());
        return repositoryRule.save(entityRule);
    }

    private EntityRule toDto(final DtoReqRule dtoReqRule) {
        final EntityRule entityRule = new EntityRule();
        entityRule.setName(dtoReqRule.getName());
        entityRule.setOrganizationId(dtoReqRule.getOrganizationId());
        entityRule.setPlanSettingsId(dtoReqRule.getPlanSettingsId());
        entityRule.setInitials(dtoReqRule.getInitials());
        entityRule.setData(dtoReqRule.getData());
        entityRule.setPriority(dtoReqRule.getPriority());
        entityRule.setEnabled(dtoReqRule.isEnabled());
        entityRule.setStatusId(dtoReqRule.getStatusId());
        entityRule.setComment(dtoReqRule.getComment());
        entityRule.setCreatedDate(LocalDateTime.now());
        entityRule.setModifiedDate(LocalDateTime.now());
        entityRule.setIsDeleted(false);
        entityRule.setUuid(UUID.randomUUID().toString());
        return entityRule;
    }

    private EntityRule filterRuleDeletedPreferences(EntityRule rule) {
        if(rule != null && rule.getSchedulePreferences() != null) {
            List<EntitySchedulePreference> activePreferences = rule.getSchedulePreferences().stream()
                    .filter(pref -> !pref.getIsDeleted())
                    .collect(Collectors.toList());

            return copyRuleWithFilteredPreferences(rule, activePreferences);
        }
        return rule;
    }

    private EntityRule copyRuleWithFilteredPreferences(EntityRule rule, List<EntitySchedulePreference> filteredPreferences) {
        return EntityRule.builder()
                .id(rule.getId())
                .uuid(rule.getUuid())
                .name(rule.getName())
                .organizationId(rule.getOrganizationId())
                .planSettingsId(rule.getPlanSettingsId())
                .initials(rule.getInitials())
                .data(rule.getData())
                .priority(rule.getPriority())
                .isEnabled(rule.isEnabled())
                .statusId(rule.getStatusId())
                .isDeleted(rule.getIsDeleted())
                .createdDate(rule.getCreatedDate())
                .modifiedDate(rule.getModifiedDate())
                .comment(rule.getComment())
                .schedulePreferences(filteredPreferences)
                .build();
    }

    private void setPreferenceField(EntitySchedulePreference pref, String preferenceType, Boolean preferenceValue) {
        if (preferenceType == null) return;
        switch (preferenceType) {
            case "mustScheduleClass":
                pref.setMustScheduleClass(preferenceValue);
                break;
            case "mustNotScheduleClass":
                pref.setMustNotScheduleClass(preferenceValue);
                break;
            case "prefersToScheduleClass":
                pref.setPrefersToScheduleClass(preferenceValue);
                break;
            case "prefersNotToScheduleClass":
                pref.setPrefersNotToScheduleClass(preferenceValue);
                break;
            case "applies":
                pref.setApplies(preferenceValue);
                break;
            case "isAvailable":
                pref.setIsAvailable(preferenceValue);
                break;
            case "cannotTeach":
                pref.setCannotTeach(preferenceValue);
                break;
            case "prefersToTeach":
                pref.setPrefersToTeach(preferenceValue);
                break;
            case "mustTeach":
                pref.setMustTeach(preferenceValue);
                break;
            case "dontPreferToTeach":
                pref.setDontPreferToTeach(preferenceValue);
                break;
            default:
                // ignore unknown types
        }
    }
}

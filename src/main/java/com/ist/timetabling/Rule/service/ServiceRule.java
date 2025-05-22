package com.ist.timetabling.Rule.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Rule.dto.res.DtoResRuleCsvUpload;
import com.ist.timetabling.Rule.entity.EntityRule;
import com.ist.timetabling.Rule.dto.req.DtoReqRule;
import com.ist.timetabling.Rule.dto.req.DtoReqRuleUpdate;
import java.util.List;


public interface ServiceRule {

    ApiResponse<EntityRule> getRuleByUuid(final String uuid);

    ApiResponse<List<EntityRule>> getRulesByStatus(final Integer statusId, final Integer page, final Integer size);

    ApiResponse<List<EntityRule>> searchRulesByName(final String keyword);

    ApiResponse<List<EntityRule>> getAllRules(final Integer page, final Integer size, final String sortBy, final String sortDirection, final String keyword, final Integer organizationId, final Integer planSettingsId);

    ApiResponse<EntityRule> createRule(final DtoReqRule dtoReqRule);

    ApiResponse<EntityRule> updateRuleByUuid(final String uuid, final DtoReqRuleUpdate dtoReqRuleUpdate);

    ApiResponse<Void> deleteRuleByUuid(final String uuid);

    ApiResponse<List<EntityRule>> getRuleAllPreferences(final String ruledUuid);

    ApiResponse<EntityRule> getRulePreferenceForTimeSlot(final String ruleUuid, final Integer periodId, final Integer dayOfWeek);

    ApiResponse<EntityRule> addSchedulePreferenceToRule(final String ruleUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue);

    ApiResponse<EntityRule> addSchedulePreferencesToRule(final String ruleUuid, final DtoReqSchedulePreference preferences);

    ApiResponse<EntityRule> updateSchedulePreference(final String preferenceUuid, final String preferenceType, final Boolean preferenceValue, final Integer periodId, final Integer dayOfWeek);

    ApiResponse<?> deleteRuleSchedulePreference(final String uuid);

    ApiResponse<?> clearRulePreferencesForTimeSlot(final String ruleUuid, final Integer periodId, final Integer dayOfWeek);

    ApiResponse<DtoResRuleCsvUpload> importRulesFromCsv(final DtoReqCsvUpload uploadRequest);

    ApiResponse<List<EntityRule>> getRulesByPlanSettingsId(final Integer planSettingsId);
    
}

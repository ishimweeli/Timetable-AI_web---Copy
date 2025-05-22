package com.ist.timetabling.Organization.service.impl;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganizationUiSettings;
import com.ist.timetabling.Organization.dto.res.DtoResOrganizationUiSettings;
import com.ist.timetabling.Organization.entity.EntityOrganizationUiSettings;
import com.ist.timetabling.Organization.repository.RepositoryOrganizationUiSettings;
import com.ist.timetabling.Organization.service.ServiceOrganizationUiSettings;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServiceOrganizationUiSettingsImpl implements ServiceOrganizationUiSettings {
    private final RepositoryOrganizationUiSettings repositoryOrganizationUiSettings;

    @Autowired
    public ServiceOrganizationUiSettingsImpl(RepositoryOrganizationUiSettings repositoryOrganizationUiSettings) {
        this.repositoryOrganizationUiSettings = repositoryOrganizationUiSettings;
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DtoResOrganizationUiSettings> getOrganizationUiSettingsByOrganizationId(final Integer organizationId) {
        final EntityOrganizationUiSettings entity = repositoryOrganizationUiSettings.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    EntityOrganizationUiSettings defaultSettings = new EntityOrganizationUiSettings();
                    defaultSettings.setOrganizationId(organizationId);
                    return defaultSettings;
                });
        DtoResOrganizationUiSettings dto = toDto(entity);
        return ApiResponse.success(HttpStatus.OK, "Organization UI settings retrieved", dto);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResOrganizationUiSettings> createOrUpdateOrganizationUiSettings(final DtoReqOrganizationUiSettings dtoReq) {
        EntityOrganizationUiSettings entity = repositoryOrganizationUiSettings.findByOrganizationId(dtoReq.getOrganizationId())
                .orElseGet(EntityOrganizationUiSettings::new);
        if(dtoReq.getColorPalette() != null) entity.setColorPalette(dtoReq.getColorPalette());
        if(dtoReq.getFont() != null) entity.setFont(dtoReq.getFont());
        if(dtoReq.getFontSize() != null) entity.setFontSize(dtoReq.getFontSize());
        if(dtoReq.getCellWidth() != null) entity.setCellWidth(dtoReq.getCellWidth());
        if(dtoReq.getCellHeight() != null) entity.setCellHeight(dtoReq.getCellHeight());
        if(dtoReq.getTheme() != null) entity.setTheme(dtoReq.getTheme());
        entity.setOrganizationId(dtoReq.getOrganizationId());
        EntityOrganizationUiSettings saved = repositoryOrganizationUiSettings.save(entity);
        DtoResOrganizationUiSettings dto = toDto(saved);
        return ApiResponse.success(HttpStatus.OK, "Organization UI settings saved", dto);
    }

    private DtoResOrganizationUiSettings toDto(EntityOrganizationUiSettings entity) {
        DtoResOrganizationUiSettings dto = new DtoResOrganizationUiSettings();
        dto.setId(entity.getId());
        dto.setOrganizationId(entity.getOrganizationId());
        dto.setColorPalette(entity.getColorPalette());
        dto.setFont(entity.getFont());
        dto.setFontSize(entity.getFontSize());
        dto.setCellWidth(entity.getCellWidth());
        dto.setCellHeight(entity.getCellHeight());
        dto.setTheme(entity.getTheme());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setModifiedDate(entity.getModifiedDate());
        return dto;
    }
}

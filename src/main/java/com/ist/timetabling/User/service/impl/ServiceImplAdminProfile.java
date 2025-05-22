package com.ist.timetabling.User.service.impl;


import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.User.dto.req.DtoReqAdminProfile;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.entity.EntityAdminProfile;
import com.ist.timetabling.User.dto.res.DtoResAdminProfile;
import com.ist.timetabling.User.exception.ExceptionUserNotFound;
import com.ist.timetabling.User.repository.RepositoryAdminProfile;
import com.ist.timetabling.User.service.ServiceAdminProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import static com.ist.timetabling.User.constant.ConstantAdmini18n.*;


@Slf4j
@Service
public class ServiceImplAdminProfile implements ServiceAdminProfile {

    private final RepositoryAdminProfile repositoryAdminProfile;
    private final HttpServletRequest httpServletRequest;

    @Autowired
    public ServiceImplAdminProfile(RepositoryAdminProfile repositoryAdminProfile, HttpServletRequest httpServletRequest) {
        this.repositoryAdminProfile = repositoryAdminProfile;
        this.httpServletRequest = httpServletRequest;
    }


    @Override
    public ApiResponse<DtoResAdminProfile> findByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        return repositoryAdminProfile.findByUuidAndIsDeletedFalse(uuid)
                .map(profile -> ApiResponse.success(convertToDTO(profile), i18n.getAdmin(I18N_ADMIN_RETRIEVE_SUCCESS)))
                .orElseGet(() -> ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getAdmin(I18N_ADMIN_NOT_FOUND)));
    }

    @Override
    public ApiResponse<List<DtoResAdminProfile>> getAllProfiles(final int page, final int size) {
        I18n i18n = new I18n(httpServletRequest);
        Page<DtoResAdminProfile> profilesPage = repositoryAdminProfile
                .findAllByIsDeletedFalse(PageRequest.of(page, size))
                .map(this::convertToDTO);

        return ApiResponse.<List<DtoResAdminProfile>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(i18n.getAdmin(I18N_ADMINS_RETRIEVE_SUCCESS))
                .data(profilesPage.getContent())
                .totalItems(profilesPage.getTotalElements())
                .totalPages(profilesPage.getTotalPages())
                .hasNext(profilesPage.hasNext())
                .hasPrevious(profilesPage.hasPrevious())
                .currentPage(profilesPage.getNumber())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<DtoResAdminProfile> createAdminProfile(final DtoReqAdminProfile dtoReqAdminProfile) {
        final I18n i18n = new I18n(httpServletRequest);
        final EntityAdminProfile entityAdminProfile = new EntityAdminProfile();
        BeanUtils.copyProperties(dtoReqAdminProfile, entityAdminProfile);
        entityAdminProfile.setCreatedDate(LocalDateTime.now());
        return ApiResponse.success(HttpStatus.CREATED, i18n.getAdmin(I18N_ADMIN_CREATE_SUCCESS), convertToDTO(repositoryAdminProfile.save(entityAdminProfile)));
    }

    @Override
    @Transactional
    public ApiResponse<DtoResAdminProfile> updateAdminProfile(final String uuid, DtoReqAdminProfile dtoReqAdminProfile) {

        I18n i18n = new I18n(httpServletRequest);
        EntityAdminProfile entityAdminProfile = repositoryAdminProfile.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionUserNotFound(i18n.getAdmin(I18N_ADMIN_NOT_FOUND)));

        entityAdminProfile.setCanManageOrganizations(dtoReqAdminProfile.getCanManageOrganizations());
        entityAdminProfile.setStatusId(dtoReqAdminProfile.getStatusId());
        entityAdminProfile.setModifiedBy(dtoReqAdminProfile.getModifiedBy());
        entityAdminProfile.setModifiedDate(LocalDateTime.now());

        entityAdminProfile = repositoryAdminProfile.save(entityAdminProfile);

        DtoResAdminProfile dtoResAdminProfile = new DtoResAdminProfile();
        BeanUtils.copyProperties(entityAdminProfile, dtoResAdminProfile);

        return ApiResponse.success(dtoResAdminProfile, i18n.getAdmin(I18N_ADMIN_UPDATE_SUCCESS));
    }

    @Override
    @Transactional
    public ApiResponse<DtoResAdminProfile> softDeleteAdminProfile(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        return repositoryAdminProfile.softDeleteByUuid(uuid) > 0
                ? ApiResponse.success(i18n.getAdmin(I18N_ADMIN_DELETE_SUCCESS)) : ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAdmin(I18N_ADMIN_ALREADY_DELETED));
    }

    private DtoResAdminProfile convertToDTO(EntityAdminProfile entityAdminProfile) {
        return DtoResAdminProfile.builder()
                .id(entityAdminProfile.getId())
                .uuid(entityAdminProfile.getUuid())
                .userId(entityAdminProfile.getUserId())
                .organizationId(entityAdminProfile.getOrganizationId())
                .canManageOrganizations(entityAdminProfile.getCanManageOrganizations())
                .statusId(entityAdminProfile.getStatusId())
                .modifiedBy(entityAdminProfile.getModifiedBy())
                .createdBy(entityAdminProfile.getCreatedBy())
                .modifiedDate(entityAdminProfile.getModifiedDate())
                .isDeleted(entityAdminProfile.getIsDeleted())
                .build();
    }

}




package com.ist.timetabling.User.service.impl;

import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.res.DtoResUserProfile;
import com.ist.timetabling.User.exception.ExceptionUserEmailNotFound;
import com.ist.timetabling.User.exception.ExceptionUserNotFound;
import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.User.service.ServiceUserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.ist.timetabling.User.constant.ConstantUserI18n.*;


@Service
@RequiredArgsConstructor
public class ServiceUserProfileImpl implements ServiceUserProfile {

    private final RepositoryUser repositoryUser;
    private final I18n i18n;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DtoResUserProfile> getCurrentUserProfile(final Authentication authentication) {
        if(authentication == null) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getUser(I18N_USER_PROFILE_FORBIDDEN));
        }

        EntityUser authenticatedEntityUser = (EntityUser) authentication.getPrincipal();
        String email = authenticatedEntityUser.getEmail();

        try {
            DtoResUserProfile profile = getUserProfile(email);
            return ApiResponse.success(profile, i18n.getUser(I18N_USER_PROFILE_FETCHED_SUCCESSFULLY));
        }catch(ExceptionUserNotFound e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getUser(I18N_USER_NOT_FOUND));
        }
    }


    @Override
    @Transactional(readOnly = true)
    public DtoResUserProfile getUserProfile(final String email) {
        EntityUser entityUser = repositoryUser.findUserByEmail(email);

        if(entityUser == null) {
            throw new ExceptionUserEmailNotFound(i18n.getUser(I18N_USER_EMAIL_NOT_FOUND));
        }

        return DtoResUserProfile.builder()
                .firstName(entityUser.getFirstName())
                .lastName(entityUser.getLastName())
                .email(entityUser.getEmail())
                .phone(entityUser.getPhone())
                .statusId(entityUser.getStatusId())
                .createdAt(entityUser.getCreatedDate())
                .updatedAt(entityUser.getModifiedDate())
                .build();
    }
}

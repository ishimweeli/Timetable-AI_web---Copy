package com.ist.timetabling.Auth.service.impl;

import com.ist.timetabling.Auth.dto.req.DtoReqAuthLogin;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthRefreshToken;
import com.ist.timetabling.Auth.dto.req.DtoReqAutRegister;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthCodeVerification;
import com.ist.timetabling.Auth.dto.res.DtoResAuthLogin;
import com.ist.timetabling.Auth.dto.res.DtoResAuthRefreshToken;
import com.ist.timetabling.Auth.entity.EntityAuthCode;
import com.ist.timetabling.Auth.entity.EntityAuthRefreshToken;
import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.Auth.exception.ExceptionAuthFailed;
import com.ist.timetabling.Auth.exception.ExceptionAuthInvalidPassword;
import com.ist.timetabling.Auth.exception.ExceptionAuthInvalidToken;
import com.ist.timetabling.Auth.repository.RepositoryAuthCode;
import com.ist.timetabling.Auth.repository.RepositoryRole;
import com.ist.timetabling.Auth.service.ServiceAuth;
import com.ist.timetabling.Auth.service.ServiceAuthCode;
import com.ist.timetabling.Auth.service.ServiceTokenManagement;
import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Auth.util.UtilAuthJwt;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Notifications.service.ServiceNotification;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.User.dto.res.DtoResUser;
import com.ist.timetabling.User.entity.EntityManagerProfile;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryManagerProfile;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;


@Service
@Slf4j
@RequiredArgsConstructor
public class ServiceAuthImpl implements ServiceAuth {

    private final AuthenticationManager authenticationManager;
    private final UtilAuthJwt utilAuthJwt;
    private final RepositoryUser repositoryUser;
    private final HttpServletRequest httpServletRequest;
    private final ServiceTokenManagement tokenManagementService;
    private final UtilAuthContext authContext;
    private final PasswordEncoder passwordEncoder;
    private final RepositoryOrganization repositoryOrganization;
    private final RepositoryRole repositoryRole;
    private final ServiceAuthCode serviceAuthCode;
    private final RepositoryAuthCode repositoryAuthCode;
    private final RepositoryManagerProfile repositoryManagerProfile;
    private final ServiceNotification serviceNotification;


    @Override
    @Transactional
    public ApiResponse<DtoResUser> register(final DtoReqAutRegister request) {
        final I18n i18n = new I18n(httpServletRequest);

        Optional<EntityUser> existingUserOpt = repositoryUser.findByEmailAndIsDeletedFalse(request.getEmail());

        if(existingUserOpt.isPresent()) {
            EntityUser existingUser = existingUserOpt.get();

            if(!existingUser.getIsActive()) {
                DtoResUser userDto = toDto(existingUser);
                userDto.setNeedsVerification(true);
                return ApiResponse.success(HttpStatus.OK, i18n.getAuth(I18N_AUTH_EXISTING_INACTIVE_USER), userDto);
            }

            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_EMAIL_ALREADY_EXISTS));
        }

        if(isOrganizationNameTaken(request.getOrganizationName())) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_ORGANIZATION_ALREADY_EXISTS));
        }
        EntityOrganization organization = createOrganizationFromRequest(request);
        final EntityOrganization savedOrganization = repositoryOrganization.save(organization);

        EntityUser user = createUserFromRequest(request);
        assignManagerRole(user, i18n);
        user.setOrganization(savedOrganization);

        final EntityUser savedUser = repositoryUser.save(user);

        updateOrganizationCreator(savedOrganization, savedUser.getId().toString());

        // Create manager profile with all permissions set to true
        createManagerProfile(savedUser, savedOrganization);

        serviceAuthCode.generateVerificationCode(savedUser, EntityAuthCode.AuthCodeType.REGISTRATION, httpServletRequest.getRemoteAddr());

        DtoResUser userDto = toDto(savedUser);
        userDto.setNeedsVerification(true);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getAuth(I18N_AUTH_REGISTER_SUCCESSFUL), userDto);
    }

    /**
     * Creates a manager profile for the user with all permissions set to true
     * @param user The user entity
     * @param organization The organization entity
     */
    private void createManagerProfile(EntityUser user, EntityOrganization organization) {
        EntityManagerProfile managerProfile = new EntityManagerProfile();
        managerProfile.setUserId(user.getId());
        managerProfile.setOrganizationId(organization.getId());
        managerProfile.setUuid(UUID.randomUUID().toString());
        managerProfile.setCanGenerateTimetable(true);
        managerProfile.setCanManageTeachers(true);
        managerProfile.setCanManageStudents(true);
        managerProfile.setCanCreateManagers(true);
        managerProfile.setCreatedBy(user.getId());
        managerProfile.setModifiedBy(user.getId());
        managerProfile.setStatusId(1);
        managerProfile.setIsDeleted(false);

        repositoryManagerProfile.save(managerProfile);
    }

    private boolean isOrganizationNameTaken(String name) {
        return repositoryOrganization.existsByNameAndIsDeletedFalse(name);
    }

    private EntityUser createUserFromRequest(final DtoReqAutRegister dtoReqAutRegister) {
        final EntityUser user = new EntityUser();
        user.setEmail(dtoReqAutRegister.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dtoReqAutRegister.getPassword()));
        user.setFirstName(dtoReqAutRegister.getFirstName());
        user.setLastName(dtoReqAutRegister.getLastName());
        user.setPhone(dtoReqAutRegister.getPhone());
        user.setIsActive(false);
        user.setCreatedBy(1);
        user.setModifiedBy(1);
        user.setStatusId(1);
        user.setIsDeleted(false);
        user.setUuid(UUID.randomUUID().toString());
        return user;
    }

    private void assignManagerRole(final EntityUser user, I18n i18n) {
        final EntityRole managerRole = repositoryRole.findByNameAndIsDeletedFalse("MANAGER")
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getAuth(I18N_AUTH_ROLE_NOT_FOUND)));
        user.setEntityRole(managerRole);
    }

    private EntityOrganization createOrganizationFromRequest(final DtoReqAutRegister dtoReqAutRegister) {
        final EntityOrganization organization = new EntityOrganization();
        organization.setName(dtoReqAutRegister.getOrganizationName());
        organization.setContactEmail(dtoReqAutRegister.getEmail());
        organization.setContactPhone(dtoReqAutRegister.getPhone());
        organization.setUuid(UUID.randomUUID().toString());
        organization.setCreatedBy("1");
        organization.setModifiedBy("1");
        organization.setStatusId(1);
        organization.setIsDeleted(false);
        return organization;
    }

    private void updateOrganizationCreator(EntityOrganization organization, String userId) {
        organization.setCreatedBy(userId);
        organization.setModifiedBy(userId);
        repositoryOrganization.save(organization);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResAuthLogin> login(final DtoReqAuthLogin dtoReqAuthLogin) {
        final I18n i18n = new I18n(httpServletRequest);

        final EntityUser entityUser = repositoryUser.findByEmailAndIsDeletedFalseAndIsActiveTrue(dtoReqAuthLogin.getEmail())
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getAuth(I18N_AUTH_USER_NOT_FOUND)));

        try {

            final Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dtoReqAuthLogin.getEmail(), dtoReqAuthLogin.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            final String accessToken = utilAuthJwt.generateToken(entityUser);
            final EntityAuthRefreshToken refreshToken = tokenManagementService.createRefreshToken(entityUser);

            final DtoResAuthLogin dtoResAuthLogin = DtoResAuthLogin.builder()
                    .firstName(entityUser.getFirstName())
                    .lastName(entityUser.getLastName())
                    .email(entityUser.getEmail())
                    .token("Bearer " + accessToken)
                    .refreshToken(refreshToken.getToken())
                    .uuid(entityUser.getUuid())
                    .phone(entityUser.getPhone())
                    .roleId(entityUser.getEntityRole().getId())
                    .roleName(entityUser.getEntityRole().getName())
                    .organizationId(entityUser.getOrganization().getId())
                    .build();

            // create notification
             serviceNotification.createActionNotification(entityUser.getUuid(), "Login", entityUser.getFirstName()+" "+entityUser.getLastName()+" logged in", "LOGIN", "AUTH");

            return ApiResponse.success(HttpStatus.OK, i18n.getAuth(I18N_AUTH_LOGIN_SUCCESSFUL), dtoResAuthLogin);

        }catch(final BadCredentialsException e) {
            throw new ExceptionAuthInvalidPassword(i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }catch(final Exception e) {
            throw new ExceptionAuthFailed(i18n.getAuth(I18N_AUTH_LOGIN_FAILED));
        }
    }

    @Override
    public ApiResponse<DtoResUser> getCurrentUser() {
        I18n i18n = new I18n(httpServletRequest);
        try {
            final EntityUser entityUser = authContext.getCurrentUser();
            return ApiResponse.success(HttpStatus.FOUND, i18n.getAuth(I18N_AUTH_USER_RETRIEVED), toDto(entityUser));
        }catch(final Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getAuth(I18N_AUTH_ERROR_RETRIEVING), null);
        }
    }

    @Override
    @Transactional
    public ApiResponse<DtoResAuthRefreshToken> refreshToken(final DtoReqAuthRefreshToken dtoReqAuthRefreshToken) {
        final I18n i18n = new I18n(httpServletRequest);

        final Optional<EntityAuthRefreshToken> refreshTokenOpt = tokenManagementService.findByToken(dtoReqAuthRefreshToken.getRefreshToken());

        if(refreshTokenOpt.isEmpty()) {
            throw new ExceptionAuthInvalidToken(i18n.getAuth(I18N_AUTH_INVALID_REFRESH_TOKEN));
        }

        final EntityAuthRefreshToken refreshToken = refreshTokenOpt.get();

        if(refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenManagementService.revokeRefreshToken(refreshToken.getToken());
            throw new ExceptionAuthInvalidToken(i18n.getAuth(I18N_AUTH_REFRESH_TOKEN_EXPIRED));
        }

        final EntityUser entityUser = refreshToken.getUser();
        String newAccessToken = utilAuthJwt.generateToken(entityUser);

        final DtoResAuthRefreshToken dtoResAuthRefreshToken = DtoResAuthRefreshToken.builder()
                .token("Bearer " + newAccessToken)
                .refreshToken(refreshToken.getToken())
                .build();

        return ApiResponse.success(HttpStatus.OK, i18n.getAuth(I18N_AUTH_TOKEN_REFRESHED), dtoResAuthRefreshToken);
    }

    @Override
    @Transactional
    public ApiResponse<Void> logout(String token) {
        final I18n i18n = new I18n(httpServletRequest);

        if(token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {

            final String username = utilAuthJwt.extractUsername(token);

            if(username != null) {

                final EntityUser entityUser = authContext.getCurrentUser();
                tokenManagementService.blacklistToken(token);
                tokenManagementService.revokeAllUserRefreshTokens(entityUser);

                return ApiResponse.success(HttpStatus.OK, i18n.getAuth(I18N_AUTH_LOGOUT_SUCCESSFUL), null);
            }

            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_INVALID_TOKEN), null);

        }catch(final Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getAuth(I18N_AUTH_LOGOUT_FAILED), null);
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> verifyRegistrationCode(DtoReqAuthCodeVerification request) {
        final I18n i18n = new I18n(httpServletRequest);

        try {
            Optional<EntityAuthCode> authCodeOpt = repositoryAuthCode.findByValueAndTypeAndIsUsedFalseAndExpiresAtAfter(
                    request.getCode(),
                    EntityAuthCode.AuthCodeType.REGISTRATION,
                    LocalDateTime.now()
            );

            if(authCodeOpt.isEmpty()) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_INVALID_OR_EXPIRED_CODE));
            }

            EntityAuthCode authCode = authCodeOpt.get();
            EntityUser user = authCode.getUser();

            if(request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_INVALID_EMAIL));
            }

            ApiResponse<Void> verificationResponse = serviceAuthCode.verifyAuthCode(request, user);

            if(verificationResponse.isSuccess()) { user.setIsActive(true);
                repositoryUser.save(user);
            }else {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, verificationResponse.getMessage());
            }

            return verificationResponse;
        }catch(Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error during verification");
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> resendVerificationCode(String email) {
        final I18n i18n = new I18n(httpServletRequest);

        EntityUser user = repositoryUser.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getAuth(I18N_AUTH_USER_NOT_FOUND)));

        if(user.getIsActive()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_USER_ALREADY_ACTIVE));
        }

        repositoryAuthCode.deleteByUserAndType(user, EntityAuthCode.AuthCodeType.REGISTRATION);

        serviceAuthCode.generateVerificationCode(user, EntityAuthCode.AuthCodeType.REGISTRATION, httpServletRequest.getRemoteAddr());

        return ApiResponse.success(HttpStatus.OK, i18n.getAuth(I18N_AUTH_CODE_RESENT), null);
    }

    private DtoResUser toDto(final EntityUser entityUser) {
        return DtoResUser.builder()
                .id(entityUser.getId())
                .uuid(entityUser.getUuid())
                .email(entityUser.getEmail())
                .firstName(entityUser.getFirstName())
                .lastName(entityUser.getLastName())
                .phone(entityUser.getPhone())
                .isActive(entityUser.getIsActive())
                .roleId(entityUser.getEntityRole().getId())
                .roleName(entityUser.getEntityRole().getName())
                .build();
    }
}

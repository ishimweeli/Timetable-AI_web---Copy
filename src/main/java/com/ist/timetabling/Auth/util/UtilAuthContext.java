package com.ist.timetabling.Auth.util;

import com.ist.timetabling.Auth.exception.ExceptionAuthInvalidToken;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Core.exception.ExceptionCoreUnauthorized;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.Auth.model.AuthUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Collection;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;

@Component
@RequiredArgsConstructor
public class UtilAuthContext {

    private final HttpServletRequest httpServletRequest;
    private final RepositoryUser repositoryUser;
    private final RepositoryOrganization repositoryOrganization;

    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication == null || authentication.getName() == null) {
            return null;
        }
        return authentication.getName();
    }

    public Collection<? extends GrantedAuthority> getUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication == null) {
            return java.util.Collections.emptyList();
        }
        return authentication.getAuthorities();
    }

    public EntityUser getCurrentUser() {
        final I18n i18n = new I18n(httpServletRequest);
        final String username = getCurrentUsername();

        if(username == null) {
            throw new ExceptionAuthInvalidToken(i18n.getAuth(I18N_AUTH_USER_NOT_FOUND));
        }
        return repositoryUser.findByEmailAndIsDeletedFalse(username).orElseThrow(() ->
                new ExceptionCoreNotFound(i18n.getAuth(I18N_AUTH_USER_NOT_FOUND)));
    }

    public static AuthUserDetails getAuthenticatedUser() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication != null && authentication.getPrincipal() instanceof AuthUserDetails) {
            return (AuthUserDetails) authentication.getPrincipal();
        }
        return null;
    }

    public static Integer getAuthenticatedUserId() {
        final AuthUserDetails userDetails = getAuthenticatedUser();
        return userDetails != null ? userDetails.getId() : null;
    }

    public static Integer getAuthenticatedUserOrganizationId() {
        AuthUserDetails userDetails = getAuthenticatedUser();
        return (userDetails != null) ? userDetails.getOrganizationId() : null;
    }

    public boolean isAdmin() {
        AuthUserDetails userDetails = getAuthenticatedUser();
        if(userDetails == null) {
            return false;
        }

        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_ADMIN"));
    }
    public void validateOrganizationAccess(Integer organizationId) {
        final I18n i18n = new I18n(httpServletRequest);

        if(isAdmin()) {
            return;
        }

        Integer userOrgId = getAuthenticatedUserOrganizationId();

        if(userOrgId == null || !userOrgId.equals(organizationId)) {
            throw new ExceptionCoreUnauthorized(i18n.getAuth("auth.error.unauthorized.organization"));
        }
    }

    public void validateOrganizationAccessByUuid(String organizationUuid) {
        final I18n i18n = new I18n(httpServletRequest);

        if(isAdmin()) {
            return;
        }

        Integer userOrgId = getAuthenticatedUserOrganizationId();

        EntityOrganization organization = repositoryOrganization.findByUuidAndIsDeletedFalse(organizationUuid)
                .orElse(null);

        if(organization == null || userOrgId == null || !userOrgId.equals(organization.getId())) {
            throw new ExceptionCoreUnauthorized(i18n.getAuth(I18N_AUTH_ACCESS_DENIED));
        }
    }
}

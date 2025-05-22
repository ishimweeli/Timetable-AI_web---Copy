package com.ist.timetabling.User.service.impl;

import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.Auth.model.AuthUserDetails;
import com.ist.timetabling.User.exception.ExceptionUserNotFound;
import com.ist.timetabling.User.repository.RepositoryUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceUserDetailsSImpl implements UserDetailsService {

    private final RepositoryUser repositoryUser;
    private final I18n i18n;

    @Override
    public UserDetails loadUserByUsername(final String email) throws UsernameNotFoundException {
        final EntityUser entityUser = repositoryUser.findByEmailAndIsDeletedFalse(email.trim().toLowerCase())
                .orElseThrow(() -> new ExceptionUserNotFound(I18N_AUTH_USER_NOT_FOUND));

        if(!entityUser.getIsActive()) {
            throw new UsernameNotFoundException(I18N_AUTH_ACCOUNT_NOT_ACTIVE);
        }

        String roleName = "ROLE_" + entityUser.getEntityRole().getName();
        log.debug("Loading user details for {}: role={}", entityUser.getEmail(), roleName);

        return new AuthUserDetails(
                entityUser.getId(),
                entityUser.getEmail(),
                entityUser.getPasswordHash(),
                entityUser.getIsActive(),
                entityUser.getOrganization().getId(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}

package com.ist.timetabling.User.service.impl;

import com.google.common.util.concurrent.RateLimiter;
import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Auth.service.ServiceEmail;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.dto.req.DtoResUser;
import com.ist.timetabling.Auth.dto.req.DtoReqAutRegister;
import com.ist.timetabling.Auth.exception.ExceptionAuthEmailAlreadyExists;
import com.ist.timetabling.Auth.exception.ExceptionAuthPhoneAlreadyExists;
import com.ist.timetabling.User.exception.ExceptionAuthRateLimitExceeded;
import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.User.service.ServiceUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.UUID;
import static com.ist.timetabling.User.constant.ConstantUserI18n.*;


@Service
public class ServiceUserImpl implements ServiceUser {

    private final RepositoryUser repositoryUser;
    private final PasswordEncoder passwordEncoder;
    private final I18n i18n;
    private final ServiceEmail serviceEmail;
    private final RateLimiter registerRateLimiter;

    @Autowired
    public ServiceUserImpl(RepositoryUser repositoryUser,
                           PasswordEncoder passwordEncoder,
                           I18n i18n,
                           ServiceEmail serviceEmail) {
        this.repositoryUser = repositoryUser;
        this.passwordEncoder = passwordEncoder;
        this.i18n = i18n;
        this.serviceEmail = serviceEmail;
        this.registerRateLimiter = RateLimiter.create(5.0 / 60.0);
    }

    @Override
    public ApiResponse<DtoResUser> registerUser(DtoReqAutRegister dtoReqAutRegister) {

        if(!registerRateLimiter.tryAcquire()) {
            throw new ExceptionAuthRateLimitExceeded(i18n.getUser(I18N_USER_ERROR_RATE_LIMIT));
        }

        if(repositoryUser.existsByEmail(dtoReqAutRegister.getEmail())) {
            throw new ExceptionAuthEmailAlreadyExists(i18n.getUser(I18N_USER_ERROR_EMAIL_EXISTS));
        }

        if(repositoryUser.existsByPhone(dtoReqAutRegister.getPhone())) {
            throw new ExceptionAuthPhoneAlreadyExists(i18n.getUser(I18N_USER_ERROR_PHONE_EXISTS));
        }

        EntityUser entityUser = new EntityUser();
        entityUser.setEmail(dtoReqAutRegister.getEmail());
        entityUser.setPasswordHash(passwordEncoder.encode(dtoReqAutRegister.getPassword()));
        entityUser.setFirstName(dtoReqAutRegister.getFirstName());
        entityUser.setLastName(dtoReqAutRegister.getLastName());
        entityUser.setPhone(dtoReqAutRegister.getPhone());

        EntityUser savedEntityUser = repositoryUser.save(entityUser);
        String token = UUID.randomUUID().toString();
        String verificationLink = "http://localhost:8080/api/v1/auth/verify?token=" + token;

        final DtoEmailRequest dtoEmailRequest = DtoEmailRequest.builder()
                .to(Collections.singletonList(savedEntityUser.getEmail()))
                .subject(i18n.getUser(I18N_USER_EMAIL_ACCOUNT_REGISTERED_SUBJECT))
                .templateName("account-confirmation")
                .templateVariables(java.util.Map.of(
                        "username", savedEntityUser.getFirstName(),
                        "confirmationLink", verificationLink))
                .build();
        serviceEmail.sendEmail(dtoEmailRequest);

        DtoResUser dtoResUser = new DtoResUser(savedEntityUser);
        return ApiResponse.success(dtoResUser, i18n.getUser(I18N_USER_SUCCESS_CREATED));
    }

}

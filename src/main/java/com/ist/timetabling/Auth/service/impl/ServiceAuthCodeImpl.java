package com.ist.timetabling.Auth.service.impl;

import com.ist.timetabling.Auth.dto.req.DtoReqAuthCodeVerification;
import com.ist.timetabling.Auth.entity.EntityAuthCode;
import com.ist.timetabling.Auth.repository.RepositoryAuthCode;
import com.ist.timetabling.Auth.service.ServiceAuthCode;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.Auth.service.ServiceEmail;
import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
@RequiredArgsConstructor
public class ServiceAuthCodeImpl implements ServiceAuthCode {
    @Value("${spring.mail.username}") private String sender;
    private final RepositoryAuthCode repositoryAuthCode;
    private final HttpServletRequest httpServletRequest;
    private final ServiceEmail serviceEmail;

    @Value("${auth.verification.code.expiration-minutes:15}")
    private long verificationCodeExpirationMinutes;

    @Override
    @Transactional
    public ApiResponse<Void> generateVerificationCode(EntityUser user, EntityAuthCode.AuthCodeType type, String ipAddress) {
        final I18n i18n = new I18n(httpServletRequest);

        repositoryAuthCode.findByUserAndTypeAndIsUsedFalse(user, type).ifPresent(existingCode -> { 
            existingCode.setIsUsed(true);
            repositoryAuthCode.save(existingCode);
        });

        EntityAuthCode authCode = new EntityAuthCode();
        authCode.setUser(user);
        String generatedCode = generateRandomCode();
        authCode.setValue(generatedCode);
        authCode.setType(type);
        authCode.setIpAddress(ipAddress);
        authCode.setExpiresAt(LocalDateTime.now().plusMinutes(verificationCodeExpirationMinutes));
        authCode.setCreatedBy(user.getId());
        authCode.setModifiedBy(user.getId());

        repositoryAuthCode.save(authCode);

        if(type == EntityAuthCode.AuthCodeType.REGISTRATION) {
            DtoEmailRequest emailRequest = new DtoEmailRequest();
            emailRequest.setTo(Collections.singletonList(user.getEmail()));
            emailRequest.setSubject("Email Verification Code");
            emailRequest.setTemplateName("verification-code");
            emailRequest.setFrom(sender);
            
            Map<String, Object> templateVariables = new HashMap<>();
            
            String firstName = (user.getFirstName() != null && !user.getFirstName().isEmpty()) ? user.getFirstName() : "User";
            
            templateVariables.put("firstName", firstName);
            templateVariables.put("code", generatedCode);
            emailRequest.setTemplateVariables(templateVariables);

            serviceEmail.sendEmail(emailRequest);
        }

        return ApiResponse.success(HttpStatus.CREATED, i18n.getAuth(I18N_AUTH_VERIFICATION_CODE_GENERATED), null);
    }

    @Override
    @Transactional
    public ApiResponse<Void> verifyAuthCode(DtoReqAuthCodeVerification verificationRequest, EntityUser user) {
        final I18n i18n = new I18n(httpServletRequest);

        Optional<EntityAuthCode> authCodeOpt = repositoryAuthCode.findByValueAndTypeAndIsUsedFalseAndExpiresAtAfter(
            verificationRequest.getCode(), 
            verificationRequest.getType(), 
            LocalDateTime.now()
        );

        if(authCodeOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_INVALID_OR_EXPIRED_CODE));
        }

        EntityAuthCode authCode = authCodeOpt.get();
        
        if(!authCode.getUser().getId().equals(user.getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_CODE_USER_MISMATCH));
        }

        authCode.setIsUsed(true);
        authCode.setUsedAt(LocalDateTime.now());
        repositoryAuthCode.save(authCode);

        return ApiResponse.success(HttpStatus.OK, i18n.getAuth(I18N_AUTH_CODE_VERIFIED_SUCCESSFULLY), null);
    }

    private String generateRandomCode() {
        SecureRandom random = new SecureRandom();
        int randomNumber = random.nextInt(1000000);
        String code = String.format("%06d", randomNumber);
        return code;
    }
} 

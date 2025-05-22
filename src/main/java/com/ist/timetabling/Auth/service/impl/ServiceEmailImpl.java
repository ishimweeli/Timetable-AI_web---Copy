package com.ist.timetabling.Auth.service.impl;

import com.ist.timetabling.Auth.dto.res.DtoEmailResponse;
import com.ist.timetabling.Auth.dto.req.DtoEmailAttachment;
import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Core.exception.ExceptionEmailSendFailure;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Auth.service.ServiceEmail;
import com.ist.timetabling.Auth.util.EmailTemplateUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.concurrent.CompletableFuture;
import static com.ist.timetabling.Auth.constant.ConstantEmailI18n.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceEmailImpl implements ServiceEmail {

    private final JavaMailSender mailSender;
    private final HttpServletRequest httpServletRequest;

    @Value("${spring.mail.username}") private String sender;
    @Value("${email.from-name:Timetable AI}") private String fromName;
    @Value("${email.max-retries:3}") private int maxRetries;
    @Value("${email.retry-delay-ms:1000}") private long retryDelayMs;
    private String defaultFromAddress=sender;
    @Value("${email.from-name:Timetable AI}") private String defaultFromName;

    @Override
    public ApiResponse<DtoEmailResponse> sendEmail(final DtoEmailRequest emailRequest) {
        final I18n i18n = new I18n(httpServletRequest);
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = prepareEmailHelper(message, emailRequest);
            
            validateVerificationCodeEmail(emailRequest);
            
            String emailContent = prepareEmailContent(emailRequest);
            helper.setText(emailContent, true);
            
            addAttachments(helper, emailRequest);
            
            mailSender.send(message);
            
            return ApiResponse.success(HttpStatus.OK, i18n.get(I18N_EMAIL_SEND_SUCCESS), buildSuccessResponse(emailRequest, i18n));
        }catch(Exception e) {
            log.error("Failed to send email: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.get(I18N_EMAIL_SEND_FAILURE));
        }
    }

    @Async
    public CompletableFuture<DtoEmailResponse> sendEmailAsync(final DtoEmailRequest emailRequest) {
        final I18n i18n = new I18n(httpServletRequest);
        int attempts = 0;
        Exception lastException = null;

        while (attempts < maxRetries) {
            attempts++;
            try {
                final MimeMessage message = mailSender.createMimeMessage();
                final MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(emailRequest.getFrom());
                setRecipients(helper, emailRequest);
                
                if(StringUtils.hasText(emailRequest.getReplyTo())) {
                    helper.setReplyTo(emailRequest.getReplyTo());
                }

                helper.setSubject(emailRequest.getSubject());
                helper.setText(emailRequest.getBody(), true);

                addAttachments(helper, emailRequest);
                mailSender.send(message);

                return CompletableFuture.completedFuture(
                    DtoEmailResponse.builder()
                        .success(true)
                        .message(i18n.getCore(I18N_EMAIL_SEND_SUCCESS))
                        .recipients(emailRequest.getTo())
                        .subject(emailRequest.getSubject())
                        .messageId(message.getMessageID())
                        .build()
                );
            }catch(MessagingException e) {
                lastException = e;
                try {
                    Thread.sleep(retryDelayMs * attempts);
                }catch(InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        return CompletableFuture.failedFuture(
            lastException != null ? lastException : new ExceptionEmailSendFailure(i18n.getCore(I18N_EMAIL_SEND_FAILURE))
        );
    }

    private MimeMessageHelper prepareEmailHelper(MimeMessage message, DtoEmailRequest emailRequest) throws MessagingException, UnsupportedEncodingException {
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        String fromAddress = emailRequest.getFrom() != null ? emailRequest.getFrom() : defaultFromAddress;
        helper.setFrom(fromAddress, defaultFromName);
        
        setRecipients(helper, emailRequest);
        helper.setSubject(emailRequest.getSubject());
        
        return helper;
    }
    
    private void setRecipients(MimeMessageHelper helper, DtoEmailRequest emailRequest) throws MessagingException {
        if(emailRequest.getTo() != null && !emailRequest.getTo().isEmpty()) {
            helper.setTo(emailRequest.getTo().toArray(new String[0]));
        }
        
        if(emailRequest.getCc() != null && !emailRequest.getCc().isEmpty()) {
            helper.setCc(emailRequest.getCc().toArray(new String[0]));
        }
        
        if(emailRequest.getBcc() != null && !emailRequest.getBcc().isEmpty()) {
            helper.setBcc(emailRequest.getBcc().toArray(new String[0]));
        }
    }
    
    private void validateVerificationCodeEmail(DtoEmailRequest emailRequest) {
        if(emailRequest.getTemplateName() != null && emailRequest.getTemplateName().equals("verification-code") &&
            emailRequest.getTemplateVariables() != null) {
            
            Object codeValue = emailRequest.getTemplateVariables().get("code");
            Object firstNameValue = emailRequest.getTemplateVariables().get("firstName");

            if(firstNameValue == null) {
                emailRequest.getTemplateVariables().put("firstName", "User");
            } else if(codeValue != null && codeValue.toString().equals(firstNameValue.toString())) {
                emailRequest.getTemplateVariables().put("firstName", "User");
            }
        }
    }
    
    private String prepareEmailContent(DtoEmailRequest emailRequest) {
        if(StringUtils.hasText(emailRequest.getTemplateName())) {
            return EmailTemplateUtil.processTemplate(emailRequest.getTemplateName(), emailRequest.getTemplateVariables());
        }else {
            return emailRequest.getBody();
        }
    }
    
    private void addAttachments(MimeMessageHelper helper, DtoEmailRequest emailRequest) throws MessagingException {
        if(emailRequest.getAttachments() != null) {
            for(DtoEmailAttachment attachment : emailRequest.getAttachments()) {
                byte[] data = Base64.getDecoder().decode(attachment.getData());
                String filename = StringUtils.hasText(attachment.getFilename()) ? attachment.getFilename() : "attachment";
                String contentType = StringUtils.hasText(attachment.getContentType()) ? attachment.getContentType() : "application/octet-stream";
                
                helper.addAttachment(filename, new ByteArrayResource(data), contentType);
            }
        }
    }
    
    private DtoEmailResponse buildSuccessResponse(DtoEmailRequest emailRequest, I18n i18n) {
        return DtoEmailResponse.builder()
            .success(true)
            .message(i18n.get(I18N_EMAIL_SEND_SUCCESS))
            .recipients(emailRequest.getTo())
            .subject(emailRequest.getSubject())
            .build();
    }
}

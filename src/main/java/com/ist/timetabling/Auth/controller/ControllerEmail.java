package com.ist.timetabling.Auth.controller;

import com.ist.timetabling.Auth.constant.ConstantEmailI18n;
import com.ist.timetabling.Auth.dto.res.DtoEmailResponse;
import com.ist.timetabling.Auth.dto.req.DtoEmailAttachment;
import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Auth.service.ServiceEmail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/email")
@RequiredArgsConstructor
@Slf4j
public class ControllerEmail {

    private final ServiceEmail emailService;
    private final HttpServletRequest httpServletRequest;

    @PostMapping("/confirmation")
    public ResponseEntity<ApiResponse<DtoEmailResponse>> sendConfirmationEmail(
            final @RequestParam("to") String recipient,
            final @RequestParam("confirmationLink") String confirmationLink,
            final @RequestParam("username") String username
    ) {
        log.info("Sending account confirmation email to {}", recipient);

        final DtoEmailRequest dtoEmailRequest = DtoEmailRequest.builder()
                .to(Collections.singletonList(recipient))
                .subject("Confirm Your Account")
                .templateName("account-confirmation")
                .templateVariables(java.util.Map.of("username", username, "confirmationLink", confirmationLink))
                .build();

        final ApiResponse<DtoEmailResponse> response = emailService.sendEmail(dtoEmailRequest);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse<DtoEmailResponse>> sendPasswordResetEmail(
            final @RequestParam("to") String recipient,
            final @RequestParam("resetLink") String resetLink,
            final @RequestParam("username") String username
    ) {
        log.info("Sending password reset email to {}", recipient);

        DtoEmailRequest request = DtoEmailRequest.builder()
                .to(Collections.singletonList(recipient))
                .subject("Reset Your Password")
                .templateName("password-reset")
                .templateVariables(java.util.Map.of("username", username, "resetLink", resetLink))
                .build();

        final ApiResponse<DtoEmailResponse> response = emailService.sendEmail(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/notification")
    public ResponseEntity<ApiResponse<DtoEmailResponse>> sendNotificationEmail(
            final @RequestParam("to") String recipient,
            final @RequestParam("subject") String subject,
            final @RequestParam("message") String message
    ) {
        final DtoEmailRequest request = DtoEmailRequest.builder()
                .to(Collections.singletonList(recipient))
                .subject(subject)
                .templateName("notification")
                .templateVariables(java.util.Map.of("message", message))
                .build();

        final ApiResponse<DtoEmailResponse> apiResponse = emailService.sendEmail(request);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping(value = "/send-with-attachment", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<DtoEmailResponse>> sendEmailWithAttachment(
            final @RequestParam("to") String recipient,
            final @RequestParam("subject") String subject,
            final @RequestParam("body") String body,
            final @RequestParam(value = "attachments", required = false) List<MultipartFile> attachmentFiles
    ) {

        final I18n i18n = new I18n(httpServletRequest);
        List<DtoEmailAttachment> attachments = new ArrayList<>();

        if(attachmentFiles != null) {
            for(MultipartFile file : attachmentFiles) {
                if(!file.isEmpty()) {
                    try {
                        String base64Data = java.util.Base64.getEncoder().encodeToString(file.getBytes());
                        DtoEmailAttachment attach = DtoEmailAttachment.builder()
                                .filename(file.getOriginalFilename())
                                .contentType(file.getContentType())
                                .data(base64Data)
                                .build();
                        attachments.add(attach);
                    }catch(IOException e) {
                        log.error("Failed to process attachment: {}", e.getMessage());
                        return ResponseEntity.badRequest().body(
                                ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getCore(ConstantEmailI18n.I18N_EMAIL_ATTACHMENT_ERROR))
                        );
                    }
                }
            }
        }

        DtoEmailRequest request = DtoEmailRequest.builder()
                .to(Collections.singletonList(recipient))
                .subject(subject)
                .body(body)
                .attachments(attachments)
                .build();

        final ApiResponse<DtoEmailResponse> response = emailService.sendEmail(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/send-to-many")
    public ResponseEntity<ApiResponse<DtoEmailResponse>> sendEmailToMany(
            final @RequestParam("to") List<String> recipients,
            final @RequestParam("subject") String subject,
            final @RequestParam("body") String body
    ) {

        final DtoEmailRequest dtoEmailRequest = DtoEmailRequest.builder()
                .to(recipients)
                .subject(subject)
                .body(body)
                .build();

        final ApiResponse<DtoEmailResponse> apiResponse = emailService.sendEmail(dtoEmailRequest);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping(value = "/send-to-many-with-attachments", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<DtoEmailResponse>> sendEmailToManyWithAttachments(
            final @RequestParam("to") List<String> recipients,
            final @RequestParam("subject") String subject,
            final @RequestParam("body") String body,
            final @RequestParam(value = "attachments", required = false) List<MultipartFile> attachmentFiles
    ) {

        final I18n i18n = new I18n(httpServletRequest);
        List<DtoEmailAttachment> attachments = new ArrayList<>();

        if(attachmentFiles != null) {
            for(MultipartFile file : attachmentFiles) {
                if(!file.isEmpty()) {
                    try {
                        String base64Data = java.util.Base64.getEncoder().encodeToString(file.getBytes());
                        DtoEmailAttachment attach = DtoEmailAttachment.builder()
                                .filename(file.getOriginalFilename())
                                .contentType(file.getContentType())
                                .data(base64Data)
                                .build();
                        attachments.add(attach);
                    }catch(IOException e) {
                        return ResponseEntity.badRequest().body(
                                ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getCore(ConstantEmailI18n.I18N_EMAIL_ATTACHMENT_ERROR))
                        );
                    }
                }
            }
        }

        final DtoEmailRequest dtoEmailRequest = DtoEmailRequest.builder()
                .to(recipients)
                .subject(subject)
                .body(body)
                .attachments(attachments)
                .build();

        final ApiResponse<DtoEmailResponse> apiResponse = emailService.sendEmail(dtoEmailRequest);

        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }
}

package com.ist.timetabling.Auth.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoEmailRequest {

    @NotEmpty(message = "At least one recipient email is required")
    private List<@Email(message = "Invalid email format") String> to;

    private List<@Email(message = "Invalid CC email format") String> cc;

    private List<@Email(message = "Invalid BCC email format") String> bcc;

    @Size(max = 255, message = "From email must be less than 255 characters")
    private String from;

    @Size(max = 255, message = "Reply-to email must be less than 255 characters")
    private String replyTo;

    @NotBlank(message = "Subject cannot be blank")
    @Size(max = 255, message = "Subject must be less than 255 characters")
    private String subject;

    @NotBlank(message = "Email body cannot be blank")
    private String body;

    private String templateName;

    private Map<String, Object> templateVariables;

    private List<DtoEmailAttachment> attachments;

}

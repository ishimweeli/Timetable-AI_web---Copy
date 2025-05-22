package com.ist.timetabling.Organization.dto.req;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Organization.constant.ConstantOrganizationI18n.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqOrganization {

    @NotBlank(message = I18N_ORGANIZATION_NAME_REQUIRED)
    @Size(min = 2, max = 100, message = I18N_ORGANIZATION_NAME_SIZE)
    private String name;

    @NotBlank(message = I18N_ORGANIZATION_ADDRESS_REQUIRED)
    private String address;

    @NotBlank(message = I18N_ORGANIZATION_EMAIL_REQUIRED)
    @Email(message = I18N_ORGANIZATION_EMAIL_INVALID)
    private String contactEmail;

    @NotBlank(message = I18N_ORGANIZATION_PHONE_REQUIRED)
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = I18N_ORGANIZATION_PHONE_INVALID)
    private String contactPhone;

    @Builder.Default
    @Min(value = 0, message = I18N_ORGANIZATION_STATUS_INVALID)
    @Max(value = 1, message = I18N_ORGANIZATION_STATUS_INVALID)
    private Integer statusId = 1;

}

package com.ist.timetabling.ClassBand.dto.req;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import static com.ist.timetabling.ClassBand.constant.ConstantClassBandI18n.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqClassBand {

    @NotBlank(message = I18N_CLASS_BAND_NAME_REQUIRED)
    @Size(min = 2, max = 100, message = I18N_CLASS_BAND_NAME_SIZE)
    private String name;

    @NotNull(message = I18N_CLASS_BAND_ORGANIZATION_REQUIRED)
    private Integer organizationId;

    private Integer planSettingsId;

    private String description;

    @Min(value = 0)
    private Integer minLessonsPerDay;

    @Min(value = 0)
    private Integer maxLessonsPerDay;

    @Min(value = 0)
    private Integer latestStartPosition;

    @Min(value = 0)
    private Integer earliestEnd;

    @Min(value = 0)
    private Integer maxFreePeriods;

    private Boolean presentEveryDay;

    @Builder.Default
    @Min(value = 0, message = I18N_CLASS_BAND_STATUS_INVALID)
    @Max(value = 1, message = I18N_CLASS_BAND_STATUS_INVALID)
    private Integer statusId = 1;

    @NotNull(message = I18N_CLASS_BAND_CLASSES_REQUIRED)
    @Size(min = 2, message = I18N_CLASS_BAND_MIN_CLASSES_REQUIRED)
    private List<String> participatingClassUuids;

    private Integer controlNumber;

} 
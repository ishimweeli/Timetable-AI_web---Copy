package com.ist.timetabling.ClassBand.dto.req;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import static com.ist.timetabling.ClassBand.constant.ConstantClassBandI18n.I18N_CLASS_BAND_NAME_SIZE;
import static com.ist.timetabling.ClassBand.constant.ConstantClassBandI18n.I18N_CLASS_BAND_STATUS_INVALID;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqClassBandUpdate {

    @Size(min = 2, max = 100, message = I18N_CLASS_BAND_NAME_SIZE)
    private String name;

    private String description;

    private Integer planSettingsId;

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

    @Min(value = 0, message = I18N_CLASS_BAND_STATUS_INVALID)
    @Max(value = 1, message = I18N_CLASS_BAND_STATUS_INVALID)
    private Integer statusId;

    private String modifiedBy;

    private List<String> participatingClassUuids;
} 
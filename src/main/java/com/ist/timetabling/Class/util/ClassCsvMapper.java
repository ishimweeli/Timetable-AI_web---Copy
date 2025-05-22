package com.ist.timetabling.Class.util;

import com.ist.timetabling.Class.dto.req.DtoReqClass;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class ClassCsvMapper {

    public static final String[] CSV_HEADERS = {
            "name", "initial", "section", "capacity", "locationId", "comment",
            "color", "minLessonsPerDay", "maxLessonsPerDay", "latestStartPosition",
            "earliestEnd", "maxFreePeriods", "presentEveryDay", "mainTeacher"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public ClassCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

   
    public DtoReqClass mapToClassRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
            String name = getRequiredField(record, "name", "Name is required", rowNumber);
            String initial = getRequiredField(record, "initial", "Initial is required", rowNumber);

         
            DtoReqClass.DtoReqClassBuilder builder = DtoReqClass.builder()
                    .name(name)
                    .initial(initial)
                    .organizationId(organizationId)
                    .statusId(1); 

          
            if(record.isMapped("section") && StringUtils.hasText(record.get("section"))) {
                builder.section(record.get("section"));
            }

            if(record.isMapped("capacity") && StringUtils.hasText(record.get("capacity"))) {
                try {
                    builder.capacity(Integer.parseInt(record.get("capacity")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid capacity: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("locationId") && StringUtils.hasText(record.get("locationId"))) {
                try {
                    builder.locationId(Integer.parseInt(record.get("locationId")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid locationId: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("comment") && StringUtils.hasText(record.get("comment"))) {
                builder.comment(record.get("comment"));
            }

            if(record.isMapped("color") && StringUtils.hasText(record.get("color"))) {
                builder.color(record.get("color"));
            }

            if(record.isMapped("minLessonsPerDay") && StringUtils.hasText(record.get("minLessonsPerDay"))) {
                try {
                    builder.minLessonsPerDay(Integer.parseInt(record.get("minLessonsPerDay")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid minLessonsPerDay: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("maxLessonsPerDay") && StringUtils.hasText(record.get("maxLessonsPerDay"))) {
                try {
                    builder.maxLessonsPerDay(Integer.parseInt(record.get("maxLessonsPerDay")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid maxLessonsPerDay: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("latestStartPosition") && StringUtils.hasText(record.get("latestStartPosition"))) {
                try {
                    builder.latestStartPosition(Integer.parseInt(record.get("latestStartPosition")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid latestStartPosition: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("earliestEnd") && StringUtils.hasText(record.get("earliestEnd"))) {
                try {
                    builder.earliestEnd(Integer.parseInt(record.get("earliestEnd")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid earliestEnd: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("maxFreePeriods") && StringUtils.hasText(record.get("maxFreePeriods"))) {
                try {
                    builder.maxFreePeriods(Integer.parseInt(record.get("maxFreePeriods")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid maxFreePeriods: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("presentEveryDay") && StringUtils.hasText(record.get("presentEveryDay"))) {
                builder.presentEveryDay(Boolean.parseBoolean(record.get("presentEveryDay")));
            }

            if(record.isMapped("mainTeacher") && StringUtils.hasText(record.get("mainTeacher"))) {
                builder.mainTeacher(record.get("mainTeacher"));
            }

            return builder.build();
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

   
    public Object[] mapToCSVRecord(EntityClass entityClass) {
        return new Object[]{
                entityClass.getName(),
                entityClass.getInitial(),
                entityClass.getSection(),
                entityClass.getCapacity(),
                entityClass.getLocationId(),
                entityClass.getDescription(),
                entityClass.getColor(),
                entityClass.getMinLessonsPerDay(),
                entityClass.getMaxLessonsPerDay(),
                entityClass.getLatestStartPosition(),
                entityClass.getEarliestEnd(),
                entityClass.getMaxFreePeriods(),
                entityClass.getPresentEveryDay(),
                entityClass.getMainTeacher()
        };
    }

   
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "Math Class", "MATH", "Mathematics", "30", "1", "Math class for grade 9",
                "#FF5733", "1", "5", "3", "7", "2", "true", "John Doe"
        });

        exampleRows.add(new String[]{
                "English Class", "ENG", "English", "25", "2", "English literature",
                "#33FF57", "2", "6", "2", "8", "1", "false", "Jane Smith"
        });

        return exampleRows;
    }

    
    private String getRequiredField(CSVRecord record, String fieldName, String errorMessage, int rowNumber) {
        if(!record.isMapped(fieldName) || !StringUtils.hasText(record.get(fieldName))) {
            throw new CSVImportException(errorMessage, rowNumber, record.toString());
        }
        return record.get(fieldName);
    }
}

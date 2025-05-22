package com.ist.timetabling.Class.util;

import com.ist.timetabling.Class.entity.EntityClass;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.StringWriter;
import java.util.List;


@Component
public class UtilClassCsv {

    private static final String[] CSV_HEADERS = {
            "name", "initial", "section", "capacity", "locationId", "description",
            "color", "minLessonsPerDay", "maxLessonsPerDay", "latestStartPosition",
            "earliestEnd", "maxFreePeriods", "presentEveryDay", "mainTeacher"
    };

   
    public String exportClassesToCsv(List<EntityClass> classes) throws IOException {
        StringWriter stringWriter = new StringWriter();

        try (CSVPrinter csvPrinter = new CSVPrinter(stringWriter, CSVFormat.DEFAULT
                .builder()
                .setHeader(CSV_HEADERS)
                .build())) {

            for(EntityClass entityClass : classes) {
                csvPrinter.printRecord(
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
                );
            }
        }

        return stringWriter.toString();
    }

   
    public String generateClassCsvTemplate() throws IOException {
        StringWriter stringWriter = new StringWriter();

        try (CSVPrinter csvPrinter = new CSVPrinter(stringWriter, CSVFormat.DEFAULT
                .builder()
                .setHeader(CSV_HEADERS)
                .build())) {

           
            csvPrinter.printRecord(
                    "Math Class", "MATH", "Mathematics", 30, 1, "Math class for grade 9",
                    "#FF5733", 1, 5, 3, 7, 2, true, "John Doe"
            );

            csvPrinter.printRecord(
                    "English Class", "ENG", "English", 25, 2, "English literature",
                    "#33FF57", 2, 6, 2, 8, 1, false, "Jane Smith"
            );
        }

        return stringWriter.toString();
    }
}

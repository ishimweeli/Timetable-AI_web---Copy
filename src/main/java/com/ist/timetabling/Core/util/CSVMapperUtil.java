package com.ist.timetabling.Core.util;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;


@Component
public class CSVMapperUtil {

    public <T> List<T> mapRecords(List<CSVRecord> records, Function<CSVRecord, T> mapper) {
        List<T> result = new ArrayList<>();
        for(CSVRecord record : records) {
            T mappedObject = mapper.apply(record);
            result.add(mappedObject);
        }
        return result;
    }

   
    public <T, C> List<T> mapRecordsWithContext(List<CSVRecord> records, BiFunction<CSVRecord, C, T> mapper, C context) {
        List<T> result = new ArrayList<>();
        for(CSVRecord record : records) {
            T mappedObject = mapper.apply(record, context);
            result.add(mappedObject);
        }
        return result;
    }

    public String generateCsvTemplate(String[] headers, List<String[]> exampleRows) throws IOException {
        StringWriter stringWriter = new StringWriter();

        try (CSVPrinter csvPrinter = new CSVPrinter(stringWriter, CSVFormat.DEFAULT
                .builder()
                .setHeader(headers)
                .build())) {
            if(exampleRows != null) {
                for(String[] row : exampleRows) {
                    csvPrinter.printRecord((Object[]) row);
                }
            }
        }

        return stringWriter.toString();
    }

   
    public <T> String exportToCsv(List<T> objects, String[] headers, Function<T, Object[]> recordMapper) throws IOException {
        StringWriter stringWriter = new StringWriter();

        try (CSVPrinter csvPrinter = new CSVPrinter(stringWriter, CSVFormat.DEFAULT
                .builder()
                .setHeader(headers)
                .build())) {

            for(T object : objects) {
                csvPrinter.printRecord(recordMapper.apply(object));
            }
        }

        return stringWriter.toString();
    }
}

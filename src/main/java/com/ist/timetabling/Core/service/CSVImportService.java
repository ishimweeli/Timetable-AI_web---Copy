package com.ist.timetabling.Core.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.CSVImportResult;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;


public abstract class CSVImportService<T, R extends DtoReqCsvUpload, S extends CSVImportResult<T>> {

    protected final CSVReaderUtil csvReaderUtil;

    protected CSVImportService(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

    
    protected ApiResponse<S> processCSVImport(
            R request,
            String[] headers,
            BiFunction<CSVRecord, Integer, T> recordProcessor,
            BiFunction<List<T>, List<CSVImportResult.CSVImportError>, S> responseBuilder) {

        MultipartFile file = request.getFile();
        if(file.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }

        List<T> createdItems = new ArrayList<>();
        List<CSVImportResult.CSVImportError> errors = new ArrayList<>();

        try {
            List<CSVRecord> records = csvReaderUtil.parseCSV(file, headers, request.getSkipHeaderRow());
            int rowNum = request.getSkipHeaderRow() ? 2 : 1; 

            for(CSVRecord record : records) {
                try {
                    T item = recordProcessor.apply(record, rowNum);
                    if(item != null) {
                        createdItems.add(item);
                    }
                }catch(Exception e) {
                    String errorMessage = e.getMessage();
                    String recordData = record.toString();

                    CSVImportResult.CSVImportError error = CSVImportResult.CSVImportError.builder()
                            .rowNumber(rowNum)
                            .originalData(recordData)
                            .errorMessage(errorMessage)
                            .build();

                    errors.add(error);
                }
                rowNum++;
            }

            S result = responseBuilder.apply(createdItems, errors);
            result.setTotalProcessed(records.size());
            result.setSuccessCount(createdItems.size());
            result.setErrorCount(errors.size());

            String message = result.buildSuccessMessage();
            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }

    
    protected void validateFile(MultipartFile file, BiConsumer<MultipartFile, String[]> additionalValidation) throws CSVImportException {
        if(file == null || file.isEmpty()) {
            throw new CSVImportException("CSV file is empty or missing");
        }

        String originalFilename = file.getOriginalFilename();
        if(originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            throw new CSVImportException("File must be a CSV file");
        }

        if(additionalValidation != null) {
            additionalValidation.accept(file, getCSVHeaders());
        }
    }

    
    protected abstract String[] getCSVHeaders();
}

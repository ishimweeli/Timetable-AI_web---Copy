package com.ist.timetabling.Core.exception;

import lombok.Getter;

@Getter
public class CSVImportException extends RuntimeException {

    private final int rowNumber;
    private final String rowContent;

    public CSVImportException(String message, int rowNumber, String rowContent) {
        super(message);
        this.rowNumber = rowNumber;
        this.rowContent = rowContent;
    }

    public CSVImportException(String message, Throwable cause, int rowNumber, String rowContent) {
        super(message, cause);
        this.rowNumber = rowNumber;
        this.rowContent = rowContent;
    }

    public CSVImportException(String message) {
        super(message);
        this.rowNumber = 0;
        this.rowContent = "";
    }

}
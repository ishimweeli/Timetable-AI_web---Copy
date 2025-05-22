package com.ist.timetabling.Class.exception;

/**
 * Custom exception for CSV import errors
 */
public class CsvImportException extends RuntimeException {

    public CsvImportException(String message) {
        super(message);
    }

    public CsvImportException(String message, Throwable cause) {
        super(message, cause);
    }
}
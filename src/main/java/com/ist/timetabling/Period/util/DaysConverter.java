package com.ist.timetabling.Period.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class DaysConverter implements AttributeConverter<List<Integer>, String> {

    private static final String SEPARATOR = ",";

    @Override
    public String convertToDatabaseColumn(List<Integer> attribute) {
        if(attribute == null || attribute.isEmpty()) {
            return "1,2,3,4,5"; // Default to all days if null or empty
        }
        return attribute.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(SEPARATOR));
    }

    @Override
    public List<Integer> convertToEntityAttribute(String dbData) {
        if(dbData == null || dbData.trim().isEmpty()) {
            return Arrays.asList(1, 2, 3, 4, 5); // Default to all days if null or empty
        }

        return Arrays.stream(dbData.split(SEPARATOR))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::valueOf)
                .collect(Collectors.toList());
    }
}

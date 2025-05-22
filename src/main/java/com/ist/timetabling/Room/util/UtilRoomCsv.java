package com.ist.timetabling.Room.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.Room.entity.EntityRoom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class UtilRoomCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final RoomCsvMapper roomCsvMapper;

    @Autowired
    public UtilRoomCsv(CSVMapperUtil csvMapperUtil, RoomCsvMapper roomCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.roomCsvMapper = roomCsvMapper;
    }

    
    public String exportRoomsToCsv(List<EntityRoom> rooms) throws IOException {
        return csvMapperUtil.exportToCsv(
                rooms,
                RoomCsvMapper.CSV_HEADERS,
                roomCsvMapper::mapToCSVRecord
        );
    }

  
    public String generateRoomCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                RoomCsvMapper.CSV_HEADERS,
                roomCsvMapper.generateExampleRows()
        );
    }
}
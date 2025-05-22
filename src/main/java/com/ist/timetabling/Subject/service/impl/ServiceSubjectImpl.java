package com.ist.timetabling.Subject.service.impl;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Subject.dto.req.DtoReqSubject;
import com.ist.timetabling.Subject.dto.res.DtoResSubject;
import com.ist.timetabling.Subject.dto.res.DtoResSubjectCsvUpload;
import com.ist.timetabling.Subject.entity.EntitySubject;
import com.ist.timetabling.Subject.repository.RepositorySubject;
import com.ist.timetabling.Subject.service.ServiceSubject;
import com.ist.timetabling.Subject.util.SubjectCsvMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.ist.timetabling.Notifications.service.ServiceNotification;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import static com.ist.timetabling.Subject.constant.ConstantSubjectI18n.*;

@Service
public class ServiceSubjectImpl implements ServiceSubject {

    private final RepositorySubject repositorySubject;
    private final HttpServletRequest httpServletRequest;
    private final com.ist.timetabling.Auth.util.UtilAuthContext utilAuthContext;
    private final CSVReaderUtil csvReaderUtil;
    private final ServiceNotification serviceNotification;

    @Autowired
    public ServiceSubjectImpl(final RepositorySubject repositorySubject,
                              final HttpServletRequest httpServletRequest,
                              final com.ist.timetabling.Auth.util.UtilAuthContext utilAuthContext,
                              final CSVReaderUtil csvReaderUtil,
                              final ServiceNotification serviceNotification) {
        this.repositorySubject = repositorySubject;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
        this.csvReaderUtil = csvReaderUtil;
        this.serviceNotification = serviceNotification;
    }

    @Override
    @Transactional
    public ApiResponse<DtoResSubjectCsvUpload> importSubjectsFromCsv(final DtoReqCsvUpload uploadRequest) {
        final I18n i18n = new I18n(httpServletRequest);

    
        if(uploadRequest.getFile().isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }

      
        Integer organizationId;
        if(utilAuthContext.isAdmin() && uploadRequest.getOrganizationId() != null) {
            organizationId = uploadRequest.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getAuthenticatedUserOrganizationId();
        }

        DtoResSubjectCsvUpload result = new DtoResSubjectCsvUpload();
        List<DtoResSubject> createdSubjects = new ArrayList<>();
        List<DtoResSubjectCsvUpload.ImportError> errors = new ArrayList<>();

        try {
         
            SubjectCsvMapper subjectCsvMapper = new SubjectCsvMapper(csvReaderUtil);
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    SubjectCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            result.setTotalProcessed(records.size());
            int rowNum = uploadRequest.getSkipHeaderRow() ? 2 : 1;

            for(CSVRecord record : records) {
                try {
               
                    DtoReqSubject subjectRequest = subjectCsvMapper.mapToSubjectRequest(record, organizationId, rowNum);

                    
                    Optional<EntitySubject> existingSubject = repositorySubject.findByNameAndOrganizationIdAndIsDeletedFalse(
                            subjectRequest.getName(), organizationId);

                    if(existingSubject.isPresent()) {
                        throw new Exception(i18n.getSubject(I18N_SUBJECT_EXISTS));
                    }

              
                    ApiResponse<DtoResSubject> response = createSubject(subjectRequest);

                    if(response.isSuccess()) {
                        createdSubjects.add(response.getData());
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                   
                    DtoResSubjectCsvUpload.ImportError error = new DtoResSubjectCsvUpload.ImportError(
                            rowNum,
                            record.toString(),
                            e.getMessage()
                    );
                    errors.add(error);

                }
                rowNum++;
            }

            result.setCreatedSubjects(createdSubjects);
            result.setErrors(errors);
            result.setSuccessCount(createdSubjects.size());
            result.setErrorCount(errors.size());

            String message = result.buildSuccessMessage();
            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<DtoResSubject> findSubjectByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntitySubject> optionalSubject = repositorySubject.findByUuidAndIsDeletedFalse(uuid);
        if(optionalSubject.isPresent()) {
            EntitySubject subject = optionalSubject.get();
            if(!utilAuthContext.isAdmin()) {
                Integer orgId = utilAuthContext.getAuthenticatedUserOrganizationId();
                if(!subject.getOrganizationId().equals(orgId)) {
                    return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getSubject(I18N_SUBJECT_NOT_FOUND));
                }
            }
            return ApiResponse.success(convertToDTO(subject), i18n.getSubject(I18N_SUBJECT_RETRIEVE_SUCCESS));
        }else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getSubject(I18N_SUBJECT_NOT_FOUND));
        }
    }

    @Override
    public ApiResponse<List<DtoResSubject>> getAllSubjects(final Integer page, final Integer size, final String sortBy, final String sortDirection, final String keyword, final Integer orgId) {
        final I18n i18n = new I18n(httpServletRequest);

        Integer organizationId;
        if(!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getAuthenticatedUserOrganizationId();
        }else {
            organizationId = orgId;
        }

        List<DtoResSubject> dtoResSubjects;
        long totalItems;
        if(keyword != null && !keyword.trim().isEmpty()) {
            List<EntitySubject> subjects;
            if(utilAuthContext.isAdmin() && organizationId == null) {
                subjects = repositorySubject.searchByNameContainingNative(keyword.toLowerCase());
            }else {
                subjects = repositorySubject.searchByNameContainingAndOrganizationId(keyword.toLowerCase(), organizationId);
            }
            dtoResSubjects = subjects.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            totalItems = dtoResSubjects.size();
        }else {
            Page<EntitySubject> pageSubjects;
            if(utilAuthContext.isAdmin() && organizationId == null) {
                pageSubjects = repositorySubject.findAllByIsDeletedFalse(PageRequest.of(page, size));
            }else {
                pageSubjects = repositorySubject.findAllByIsDeletedFalseAndOrganizationId(organizationId, PageRequest.of(page, size));
            }
            dtoResSubjects = pageSubjects.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            totalItems = pageSubjects.getTotalElements();
        }
        return ApiResponse.<List<DtoResSubject>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getSubject(I18N_SUBJECTS_RETRIEVE_SUCCESS))
                .data(dtoResSubjects)
                .totalItems(totalItems)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<DtoResSubject> createSubject(final DtoReqSubject dtoReqSubject) {
        final I18n i18n = new I18n(httpServletRequest);
        Integer orgId;
        if(utilAuthContext.isAdmin() && dtoReqSubject.getOrganizationId() != null) {
            orgId = dtoReqSubject.getOrganizationId();
        }else {
            orgId = utilAuthContext.getAuthenticatedUserOrganizationId();
            dtoReqSubject.setOrganizationId(orgId);
        }
        Optional<EntitySubject> existingSubject = repositorySubject.findByNameAndOrganizationIdAndIsDeletedFalse(dtoReqSubject.getName(), orgId);
        if(existingSubject.isPresent()) {
            return ApiResponse.error(HttpStatus.CONFLICT, i18n.getSubject(I18N_SUBJECT_EXISTS));
        }
        final EntitySubject entitySubject = new EntitySubject();
        BeanUtils.copyProperties(dtoReqSubject, entitySubject);
        entitySubject.setOrganizationId(orgId);
        entitySubject.setCreatedDate(LocalDateTime.now());
        entitySubject.setModifiedDate(LocalDateTime.now());
        entitySubject.setIsDeleted(false);
        entitySubject.setColor(dtoReqSubject.getColor());
        EntitySubject savedSubject = repositorySubject.save(entitySubject);
        
        // Create notification for subject creation
        String userUuid = utilAuthContext.getCurrentUser().getUuid();
        String title = "Subject Created";
        String message = "New subject '" + savedSubject.getName() + "' has been created.";
        serviceNotification.createActionNotification(userUuid, title, message, "CREATE", "SUBJECT");
        
        return ApiResponse.success(HttpStatus.CREATED, i18n.getSubject(I18N_SUBJECT_CREATE_SUCCESS), convertToDTO(savedSubject));
    }

    @Override
    @Transactional
    public ApiResponse<DtoResSubject> updateSubject(final String uuid, final DtoReqSubject dtoReqSubject) {
        final I18n i18n = new I18n(httpServletRequest);
        EntitySubject entitySubject = repositorySubject.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new RuntimeException(i18n.getSubject(I18N_SUBJECT_NOT_FOUND)));
        if(!utilAuthContext.isAdmin()) {
            Integer orgId = utilAuthContext.getAuthenticatedUserOrganizationId();
            if(!entitySubject.getOrganizationId().equals(orgId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getSubject(I18N_SUBJECT_NOT_FOUND));
            }
        }
        entitySubject.setName(dtoReqSubject.getName());
        entitySubject.setInitials(dtoReqSubject.getInitials());
        entitySubject.setDescription(dtoReqSubject.getDescription());
        entitySubject.setDurationInMinutes(dtoReqSubject.getDurationInMinutes());
        entitySubject.setGroup(dtoReqSubject.getGroup());
        entitySubject.setRedRepetition(dtoReqSubject.getRedRepetition());
        entitySubject.setBlueRepetition(dtoReqSubject.getBlueRepetition());
        entitySubject.setAutoConflictHandling(dtoReqSubject.getAutoConflictHandling());
        entitySubject.setConflictSubjectId(dtoReqSubject.getConflictSubjectId());
        entitySubject.setStatusId(dtoReqSubject.getStatusId());
        entitySubject.setColor(dtoReqSubject.getColor());
        entitySubject.setModifiedDate(LocalDateTime.now());
        entitySubject = repositorySubject.save(entitySubject);
        // Create notification for subject creation
        String userUuid = utilAuthContext.getCurrentUser().getUuid();
        String title = "Subject Updated";
        String message = "Subject '" + entitySubject.getName() + "' has been updated.";
        serviceNotification.createActionNotification(userUuid, title, message, "UPDATE", "SUBJECT");
        return ApiResponse.success(convertToDTO(entitySubject), i18n.getSubject(I18N_SUBJECT_UPDATE_SUCCESS));
    }

    @Override
    @Transactional
    public ApiResponse<DtoResSubject> softDeleteSubject(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntitySubject> optionalSubject = repositorySubject.findByUuidAndIsDeletedFalse(uuid);
        if(!optionalSubject.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getSubject(I18N_SUBJECT_NOT_FOUND));
        }
        EntitySubject subject = optionalSubject.get();
        if(!utilAuthContext.isAdmin()) {
            Integer orgId = utilAuthContext.getAuthenticatedUserOrganizationId();
            if(!subject.getOrganizationId().equals(orgId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getSubject(I18N_SUBJECT_NOT_FOUND));
            }
        }
        int deletedCount = repositorySubject.softDeleteByUuid(uuid);
        return deletedCount > 0
                ? ApiResponse.success(i18n.getSubject(I18N_SUBJECT_DELETE_SUCCESS))
                : ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getSubject(I18N_SUBJECT_ALREADY_DELETED));
    }

    @Override
    @Transactional
    public ApiResponse<List<EntitySubject>> getSubjectsOrganizationId(final Integer organizationId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        Integer orgId = organizationId;
        if (orgId == null && !utilAuthContext.isAdmin()) {
            orgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }
        
        List<EntitySubject> subjects;
        if (orgId != null) {
            subjects = repositorySubject.findByOrganizationIdAndIsDeletedFalse(orgId);
        } else {
            Page<EntitySubject> page = repositorySubject.findAllByIsDeletedFalse(PageRequest.of(0, 1000));
            subjects = page.getContent();
        }
        
        return ApiResponse.success(HttpStatus.OK, i18n.getSubject(I18N_SUBJECT_RETRIEVE_SUCCESS), subjects);
    }

    private DtoResSubject convertToDTO(final EntitySubject entitySubject) {
        return DtoResSubject.builder()
                .id(entitySubject.getId())
                .uuid(entitySubject.getUuid())
                .organizationId(entitySubject.getOrganizationId())
                .initials(entitySubject.getInitials())
                .name(entitySubject.getName())
                .description(entitySubject.getDescription())
                .durationInMinutes(entitySubject.getDurationInMinutes())
                .redRepetition(entitySubject.getRedRepetition())
                .blueRepetition(entitySubject.getBlueRepetition())
                .conflictSubjectId(entitySubject.getConflictSubjectId())
                .group(entitySubject.getGroup())
                .autoConflictHandling(entitySubject.getAutoConflictHandling())
                .createdBy(entitySubject.getCreatedBy())
                .modifiedBy(entitySubject.getModifiedBy())
                .createdDate(entitySubject.getCreatedDate())
                .modifiedDate(entitySubject.getModifiedDate())
                .statusId(entitySubject.getStatusId())
                .isDeleted(entitySubject.getIsDeleted())
                .color(entitySubject.getColor())
                .build();
    }
}

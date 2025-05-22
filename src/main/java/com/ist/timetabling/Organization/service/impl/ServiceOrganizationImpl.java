package com.ist.timetabling.Organization.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Organization.dto.res.DtoResOrganization;
import com.ist.timetabling.Organization.dto.res.DtoResOrganizationCsvUpload;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganization;
import com.ist.timetabling.Core.exception.ExceptionCoreNoChange;
import com.ist.timetabling.Organization.exception.ExceptionOrganizationAlreadyExists;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Organization.service.ServiceOrganization;
import com.ist.timetabling.Organization.util.OrganizationCsvMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.ist.timetabling.Organization.constant.ConstantOrganizationI18n.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ServiceOrganizationImpl implements ServiceOrganization {

    private final RepositoryOrganization repositoryOrganization;

    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;
    private final CSVReaderUtil csvReaderUtil;
    private final OrganizationCsvMapper organizationCsvMapper;

    private static final int DEFAULT_PAGE_SIZE = 10;

    private static final int DEFAULT_PAGE_NUMBER = 0;

    @Autowired
    public ServiceOrganizationImpl(RepositoryOrganization repositoryOrganization, HttpServletRequest httpServletRequest, UtilAuthContext utilAuthContext, CSVReaderUtil csvReaderUtil,
                                   OrganizationCsvMapper organizationCsvMapper) {
        this.repositoryOrganization = repositoryOrganization;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
        this.csvReaderUtil = csvReaderUtil;
        this.organizationCsvMapper = organizationCsvMapper;

    }

    @Override
    @Transactional
    public ApiResponse<DtoResOrganizationCsvUpload> importOrganizationsFromCsv(final DtoReqCsvUpload uploadRequest) {
        final I18n i18n = new I18n(httpServletRequest);

       
        if(uploadRequest.getFile().isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }

        if(!utilAuthContext.isAdmin()) {
            return ApiResponse.error(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can import organizations"
            );
        }

        DtoResOrganizationCsvUpload result = new DtoResOrganizationCsvUpload();
        List<DtoResOrganization> createdOrganizations = new ArrayList<>();
        List<DtoResOrganizationCsvUpload.ImportError> errors = new ArrayList<>();

        try {
          
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    OrganizationCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            result.setTotalProcessed(records.size());
            int rowNum = uploadRequest.getSkipHeaderRow() ? 2 : 1; 

            for(CSVRecord record : records) {
                try {
                  
                    DtoReqOrganization organizationRequest = organizationCsvMapper.mapToOrganizationRequest(record, rowNum);

                  
                    if(repositoryOrganization.existsByNameAndIsDeletedFalse(organizationRequest.getName())) {
                        throw new Exception(i18n.getOrganization(I18N_ORGANIZATION_EXISTS));
                    }

                
                    if(repositoryOrganization.existsByContactEmailAndIsDeletedFalse(organizationRequest.getContactEmail())) {
                        throw new Exception(i18n.getOrganization(I18N_ORGANIZATION_EMAIL_EXISTS));
                    }

                    ApiResponse<DtoResOrganization> response = createOrganization(organizationRequest);

                    if(response.isSuccess()) {
                        createdOrganizations.add(response.getData());
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                    DtoResOrganizationCsvUpload.ImportError error = new DtoResOrganizationCsvUpload.ImportError(
                            rowNum,
                            record.toString(),
                            e.getMessage()
                    );
                    errors.add(error);
                  
                }
                rowNum++;
            }

            result.setCreatedOrganizations(createdOrganizations);
            result.setErrors(errors);
            result.setSuccessCount(createdOrganizations.size());
            result.setErrorCount(errors.size());

            String message = result.buildSuccessMessage();
            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            log.error("Error reading CSV file: {}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DtoResOrganization> getOrganizationByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        EntityOrganization entityOrganization = repositoryOrganization.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND)));

        if(!utilAuthContext.isAdmin()) {
            Integer userId = utilAuthContext.getCurrentUser().getId();
            boolean hasAccess = entityOrganization.getUsers().stream()
                    .anyMatch(user -> user.getId().equals(userId));
            if(!hasAccess) {
                throw new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND));
            }
        }

        DtoResOrganization dtoResOrganization = toDto(entityOrganization);
        return ApiResponse.success(HttpStatus.FOUND, i18n.getOrganization(I18N_ORGANIZATION_RETRIEVED_SINGLE), dtoResOrganization);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResOrganization>> getAllOrganizations(Integer page, Integer size, String search) {
        final I18n i18n = new I18n(httpServletRequest);
        page = (page == null) ? DEFAULT_PAGE_NUMBER : page;
        size = (size == null) ? DEFAULT_PAGE_SIZE : size;
        Integer userId = utilAuthContext.getCurrentUser().getId();
        Pageable pageable = PageRequest.of(page, size);

        Boolean isAdmin = utilAuthContext.isAdmin();
        Page<EntityOrganization> organizationsPage;

        if(search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.toLowerCase() + "%";
            if(isAdmin) {
                organizationsPage = repositoryOrganization.searchByNameContainingNative(keyword, pageable);
            } else {
                organizationsPage = repositoryOrganization.searchByNameContainingNative(keyword, pageable);
            }
        } else {
            if(isAdmin) {
                organizationsPage = repositoryOrganization.findAllByIsDeletedFalseOrderByNameAsc(pageable);
            } else {
                organizationsPage = repositoryOrganization.findOrganizationsByUserAndNotDeleted(userId, pageable);
            }
        }

        List<DtoResOrganization> dtoResOrganizations = organizationsPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ApiResponse.<List<DtoResOrganization>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getOrganization(I18N_ORGANIZATION_RETRIEVED))
                .data(dtoResOrganizations)
                .totalItems(organizationsPage.getTotalElements())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResOrganization>> getAllOrganizationsProjection(Integer page, Integer size) {
        final I18n i18n = new I18n(httpServletRequest);
        page = (page == null) ? DEFAULT_PAGE_NUMBER : page;
        size = (size == null) ? DEFAULT_PAGE_SIZE : size;
        Integer userId = utilAuthContext.getCurrentUser().getId();
        Pageable pageable = PageRequest.of(page, size);

        Page<EntityOrganization> projectionsPage;
        if(utilAuthContext.isAdmin()) {
            projectionsPage = repositoryOrganization.findByIsDeletedFalseOrderByNameAsc(pageable);
        }else {
            projectionsPage = repositoryOrganization.findOrganizationsByUserAndNotDeleted(userId, pageable);
        }

        List<DtoResOrganization> dtoResOrganizations = projectionsPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        if(projectionsPage.isEmpty()) {
            throw new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_RETRIEVED));
        }
        return ApiResponse.success(dtoResOrganizations, i18n.getOrganization(I18N_ORGANIZATION_RETRIEVED));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResOrganization>> searchOrganizationsByName(final String keyword) {
        final I18n i18n = new I18n(httpServletRequest);
        List<EntityOrganization> organizations;

        if(utilAuthContext.isAdmin()) {
            organizations = repositoryOrganization.findByNameContainingAndIsDeletedFalseOrderByIdDesc(keyword);
        }else {
            Integer userId = utilAuthContext.getCurrentUser().getId();
            organizations = repositoryOrganization.findByNameContainingAndIsDeletedFalseOrderByIdDesc(keyword).stream()
                    .filter(org -> org.getUsers().stream().anyMatch(user -> user.getId().equals(userId)))
                    .collect(Collectors.toList());
        }

        if(organizations.isEmpty()) {
            throw new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND));
        }

        List<DtoResOrganization> dtoResOrganizations = organizations.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ApiResponse.<List<DtoResOrganization>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getOrganization(I18N_ORGANIZATION_SEARCH_RESULTS))
                .data(dtoResOrganizations)
                .totalItems(dtoResOrganizations.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResOrganization>> getOrganizationsByStatus(final Integer statusId, Integer page, Integer size) {
        final I18n i18n = new I18n(httpServletRequest);
        page = (page == null) ? DEFAULT_PAGE_NUMBER : page;
        size = (size == null) ? DEFAULT_PAGE_SIZE : size;
        Pageable pageable = PageRequest.of(page, size);

        Page<EntityOrganization> organizationsPage;

        if(utilAuthContext.isAdmin()) {
            organizationsPage = repositoryOrganization.findByStatusIdAndIsDeletedFalseOrderByIdDesc(statusId, pageable);
        }else {
            Integer userId = utilAuthContext.getCurrentUser().getId();
            organizationsPage = repositoryOrganization.findByStatusIdAndIsDeletedFalseOrderByIdDesc(statusId, pageable);

            List<EntityOrganization> filteredContent = organizationsPage.getContent().stream()
                    .filter(org -> org.getUsers().stream().anyMatch(user -> user.getId().equals(userId)))
                    .collect(Collectors.toList());

            List<DtoResOrganization> dtoResOrganizations = filteredContent.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtoResOrganizations, i18n.getOrganization(I18N_ORGANIZATION_STATUS_RESULTS));
        }

        List<DtoResOrganization> dtoResOrganizations = organizationsPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ApiResponse.success(dtoResOrganizations, i18n.getOrganization(I18N_ORGANIZATION_STATUS_RESULTS));
    }

    @Override
    @Transactional
    public ApiResponse<DtoResOrganization> createOrganization(final DtoReqOrganization dtoReqOrganization) {
        final I18n i18n = new I18n(httpServletRequest);

        if(!utilAuthContext.isAdmin()) {
            return ApiResponse.error(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can create organizations"
            );
        }

        if(repositoryOrganization.existsByNameAndIsDeletedFalse(dtoReqOrganization.getName())) {
            return ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    i18n.getOrganization(I18N_ORGANIZATION_EXISTS)
            );
        }

        EntityOrganization entityOrganization = new EntityOrganization();
        entityOrganization.setName(dtoReqOrganization.getName());
        entityOrganization.setAddress(dtoReqOrganization.getAddress());
        entityOrganization.setContactEmail(dtoReqOrganization.getContactEmail());
        entityOrganization.setContactPhone(dtoReqOrganization.getContactPhone());
        entityOrganization.setCreatedBy(utilAuthContext.getAuthenticatedUserId().toString());
        entityOrganization.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
        entityOrganization.setUuid(UUID.randomUUID().toString());
        entityOrganization.setStatusId(dtoReqOrganization.getStatusId());
        entityOrganization.setCreatedDate(LocalDateTime.now());
        entityOrganization.setModifiedDate(LocalDateTime.now());
        entityOrganization.setIsDeleted(false);

        EntityOrganization savedOrganization = repositoryOrganization.save(entityOrganization);

        DtoResOrganization dtoResOrganization = toDto(savedOrganization);

        return ApiResponse.success(HttpStatus.CREATED, i18n.getOrganization(I18N_ORGANIZATION_CREATED), dtoResOrganization);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResOrganization> updateOrganizationByUuid(final String uuid, final DtoReqOrganization dtoReqOrganization) {
        I18n i18n = new I18n(httpServletRequest);

        EntityOrganization entityOrganization = repositoryOrganization.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND)));

        if(!utilAuthContext.isAdmin()) {
            Integer userId = utilAuthContext.getCurrentUser().getId();
            boolean hasAccess = entityOrganization.getUsers().stream()
                    .anyMatch(user -> user.getId().equals(userId));
            if(!hasAccess) {
                throw new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND));
            }
        }

        if(isNoChange(entityOrganization, dtoReqOrganization)) {
            throw new ExceptionCoreNoChange(i18n.getOrganization(I18N_ORGANIZATION_NO_CHANGES));
        }

        if(dtoReqOrganization.getName() != null &&
                !dtoReqOrganization.getName().equals(entityOrganization.getName()) &&
                repositoryOrganization.existsByNameAndIsDeletedFalse(dtoReqOrganization.getName())) {
            throw new ExceptionOrganizationAlreadyExists(i18n.getOrganization(I18N_ORGANIZATION_EXISTS));
        }

        EntityOrganization updatedOrganization = updateOrganizationFields(entityOrganization, dtoReqOrganization);

        return ApiResponse.success(HttpStatus.OK, i18n.getOrganization(I18N_ORGANIZATION_UPDATED), toDto(updatedOrganization));
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteOrganizationByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);

        EntityOrganization entityOrganization = repositoryOrganization.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND)));

        if(!utilAuthContext.isAdmin()) {
            return ApiResponse.error(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can delete organizations"
            );
        }

        entityOrganization.setIsDeleted(true);
        entityOrganization.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
        entityOrganization.setModifiedDate(LocalDateTime.now());

        repositoryOrganization.save(entityOrganization);

        return ApiResponse.success(HttpStatus.OK, i18n.getOrganization(I18N_ORGANIZATION_DELETED), null);
    }

    private DtoResOrganization toDto(final EntityOrganization entityOrganization) {
        final DtoResOrganization dtoResOrganization = new DtoResOrganization();
        BeanUtils.copyProperties(entityOrganization, dtoResOrganization);
        return dtoResOrganization;
    }

    private boolean isNoChange(EntityOrganization entityOrganization, DtoReqOrganization request) {
        return (request.getName() == null || request.getName().equals(entityOrganization.getName())) &&
                (request.getAddress() == null || request.getAddress().equals(entityOrganization.getAddress())) &&
                (request.getContactEmail() == null || request.getContactEmail().equals(entityOrganization.getContactEmail())) &&
                (request.getContactPhone() == null || request.getContactPhone().equals(entityOrganization.getContactPhone())) &&
                (request.getStatusId() == null || request.getStatusId().equals(entityOrganization.getStatusId()));
    }

    private EntityOrganization updateOrganizationFields(EntityOrganization entityOrganization, DtoReqOrganization dtoReqOrganization) {
        if(dtoReqOrganization.getName() != null) entityOrganization.setName(dtoReqOrganization.getName());
        if(dtoReqOrganization.getAddress() != null) entityOrganization.setAddress(dtoReqOrganization.getAddress());
        if(dtoReqOrganization.getContactEmail() != null) entityOrganization.setContactEmail(dtoReqOrganization.getContactEmail());
        if(dtoReqOrganization.getContactPhone() != null) entityOrganization.setContactPhone(dtoReqOrganization.getContactPhone());
        if(dtoReqOrganization.getStatusId() != null) entityOrganization.setStatusId(dtoReqOrganization.getStatusId());
        entityOrganization.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
        entityOrganization.setModifiedDate(LocalDateTime.now());

        return repositoryOrganization.save(entityOrganization);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Boolean>> checkEmailExists(final String email, final String excludeUuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Map<String, Boolean> result = new HashMap<>();

        if(email == null || email.trim().isEmpty()) {
            result.put("exists", false);
            return ApiResponse.success(HttpStatus.OK, i18n.getOrganization(I18N_ORGANIZATION_EMAIL_EXISTS), result);
        }
        boolean exists;

        if(excludeUuid != null && !excludeUuid.trim().isEmpty()) {
            exists = repositoryOrganization.existsByContactEmailAndUuidNotAndIsDeletedFalse(email, excludeUuid);
        }else {
            exists = repositoryOrganization.existsByContactEmailAndIsDeletedFalse(email);
        }

        result.put("exists", exists);
        return ApiResponse.success(HttpStatus.OK, i18n.getOrganization(I18N_ORGANIZATION_EMAIL_EXISTS), result);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EntityOrganization> getOrganizationById(Integer organizationId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (organizationId == null) {
            throw new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND));
        }
        
        EntityOrganization entityOrganization = repositoryOrganization.findById(organizationId)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND)));

        if (!utilAuthContext.isAdmin()) {
            Integer userId = utilAuthContext.getCurrentUser().getId();
            boolean hasAccess = entityOrganization.getUsers().stream()
                    .anyMatch(user -> user.getId().equals(userId));
            if (!hasAccess) {
                throw new ExceptionCoreNotFound(i18n.getOrganization(I18N_ORGANIZATION_NOT_FOUND));
            }
        }

        return ApiResponse.success(HttpStatus.OK, i18n.getOrganization(I18N_ORGANIZATION_RETRIEVED_SINGLE), entityOrganization);
    }
}

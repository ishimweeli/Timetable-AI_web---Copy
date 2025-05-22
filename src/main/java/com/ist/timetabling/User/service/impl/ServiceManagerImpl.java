package com.ist.timetabling.User.service.impl;

import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.Auth.repository.RepositoryRole;
import com.ist.timetabling.Auth.service.ServiceEmail;
import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Core.util.UtilPasswordGenerator;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.User.dto.res.DtoResManagerCsvUpload;
import com.ist.timetabling.User.util.ManagerCsvMapper;
import lombok.extern.slf4j.Slf4j;
import com.ist.timetabling.User.constant.ConstantManagerI18n;
import com.ist.timetabling.User.dto.req.DtoReqManager;
import com.ist.timetabling.User.dto.res.DtoResManager;
import com.ist.timetabling.User.repository.RepositoryManagerProfile;
import com.ist.timetabling.User.service.ServiceManager;
import com.ist.timetabling.User.entity.EntityManagerProfile;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.exception.ExceptionUserNotFound;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ServiceManagerImpl implements ServiceManager {
    private static final String MANAGER_ROLE = "MANAGER";
    @Value("${spring.mail.username}") private String sender;
    @Autowired
    private RepositoryUser repositoryUser;

    @Autowired
    private RepositoryRole repositoryRole;

    @Autowired
    private RepositoryManagerProfile repositoryManagerProfile;

    @Autowired
    private RepositoryOrganization repositoryOrganization;

    @Autowired
    private HttpServletRequest httpServletRequest;

    @Autowired
    private I18n i18n;

    @Autowired
    private UtilAuthContext utilAuthContext;

    @Autowired
    private UtilPasswordGenerator utilPasswordGenerator;

    @Autowired
    private ServiceEmail serviceEmail;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CSVReaderUtil csvReaderUtil;

    @Autowired
    private ManagerCsvMapper managerCsvMapper;

    private boolean hasCreateManagerPermission() {
        final boolean isAdmin = utilAuthContext.isAdmin();
        if(isAdmin) {
            return true;
        }

        final Integer userId = utilAuthContext.getAuthenticatedUserId();
        Optional<EntityManagerProfile> managerProfile = repositoryManagerProfile.findByUserId(userId);
        return managerProfile.isPresent() && Boolean.TRUE.equals(managerProfile.get().getCanCreateManagers());
    }

    @Override
    @Transactional
    public ApiResponse<DtoResManagerCsvUpload> importManagersFromCsv(final DtoReqCsvUpload uploadRequest) {
        final I18n i18n = new I18n(httpServletRequest);

    
        if(uploadRequest.getFile().isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }

        
        if(!hasCreateManagerPermission()) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.insufficient.permissions"));
        }

      
        Integer organizationId;
        if(utilAuthContext.isAdmin() && uploadRequest.getOrganizationId() != null) {
            organizationId = uploadRequest.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }


        uploadRequest.setOrganizationId(organizationId);

        DtoResManagerCsvUpload result = new DtoResManagerCsvUpload();
        List<DtoResManager> createdManagers = new ArrayList<>();
        List<DtoResManagerCsvUpload.ImportError> errors = new ArrayList<>();

        try {
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    ManagerCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            result.setTotalProcessed(records.size());
            int rowNum = uploadRequest.getSkipHeaderRow() ? 2 : 1;

            ManagerCsvMapper managerCsvMapper = new ManagerCsvMapper(csvReaderUtil);

            for(CSVRecord record : records) {
                try {
                  
                    DtoReqManager managerRequest = managerCsvMapper.mapToManagerRequest(record, organizationId, rowNum);

                  
                    if(repositoryUser.existsByEmailAndIsDeletedFalse(managerRequest.getEmail())) {
                        throw new Exception(i18n.getManager(ConstantManagerI18n.I18N_MANAGER_EMAIL_EXISTS));
                    }

                    ApiResponse<DtoResManager> response = createManager(managerRequest);

                    if(response.isSuccess()) {
                        createdManagers.add(response.getData());
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                    DtoResManagerCsvUpload.ImportError error = new DtoResManagerCsvUpload.ImportError(
                            rowNum,
                            record.toString(),
                            e.getMessage()
                    );
                    errors.add(error);
                    log.error("Error processing CSV row {}: {}", rowNum, e.getMessage());
                }
                rowNum++;
            }

            result.setCreatedManagers(createdManagers);
            result.setErrors(errors);
            result.setSuccessCount(createdManagers.size());
            result.setErrorCount(errors.size());

            String message = result.buildSuccessMessage();
            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            log.error("Error reading CSV file: {}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }
    @Override
    public ApiResponse<DtoResManager> findManagerByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final boolean isAdmin = utilAuthContext.isAdmin();
        final Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();

        Optional<EntityUser> entityUserManager = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(uuid, MANAGER_ROLE);

        if(entityUserManager.isPresent()) {
            EntityUser entityUser = entityUserManager.get();

            if(!isAdmin && !entityUser.getOrganization().getId().equals(userOrgId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
            }

            Optional<EntityManagerProfile> optionalProfile = repositoryManagerProfile.findByUserId(entityUser.getId());
            DtoResManager dtoResManager = mapToDto(entityUser, optionalProfile.orElse(new EntityManagerProfile()));

            return ApiResponse.success(HttpStatus.OK, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_RETRIEVE_SUCCESS), dtoResManager);
        }else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
        }
    }

    @Override
    public ApiResponse<List<DtoResManager>> getAllManagers(
            final Integer page,
            final Integer size,
            final String searchTerm,
            final String sortDirection,
            final Integer orgId) {

        final I18n i18n = new I18n(httpServletRequest);
        final boolean isAdmin = utilAuthContext.isAdmin();
        final Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        final Integer currentUserId = utilAuthContext.getAuthenticatedUserId();

        boolean canCreateManagers = hasCreateManagerPermission();

        if(!isAdmin && !canCreateManagers) {
            EntityUser currentUser = utilAuthContext.getCurrentUser();
            Optional<EntityManagerProfile> optionalProfile = repositoryManagerProfile.findByUserId(currentUser.getId());
            DtoResManager currentManagerDto = mapToDto(currentUser, optionalProfile.orElse(new EntityManagerProfile()));

            List<DtoResManager> singleManagerList = Collections.singletonList(currentManagerDto);

            return ApiResponse.<List<DtoResManager>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getManager(ConstantManagerI18n.I18N_MANAGERS_RETRIEVE_SUCCESS))
                    .data(singleManagerList)
                    .totalItems(1L)
                    .build();
        }

        String sortField = "organization.id";
        Sort.Direction direction = Sort.Direction.ASC;
        if(sortDirection != null && sortDirection.equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<EntityUser> managerPage;
        Integer effectiveOrgId = orgId;
        if(!isAdmin && orgId == null) {
            effectiveOrgId = userOrgId;
        }
        if(!isAdmin && orgId != null && !orgId.equals(userOrgId)) {
            effectiveOrgId = userOrgId;
        }
        long totalManagers = 0L;
        if(searchTerm != null && !searchTerm.trim().isEmpty() && effectiveOrgId != null) {
            managerPage = repositoryUser.searchUsersByRoleOrgAndTerms(MANAGER_ROLE, effectiveOrgId, searchTerm, pageable);
            // For search+org, need a count query with same filters
            totalManagers = managerPage.getTotalElements();
        }
        else if(searchTerm != null && !searchTerm.trim().isEmpty() && isAdmin) {
            managerPage = repositoryUser.searchUsersByRoleAndTerms(MANAGER_ROLE, searchTerm, pageable);
            totalManagers = managerPage.getTotalElements();
        }
        else if(effectiveOrgId != null) {
            managerPage = repositoryUser.findByRoleAndOrganization(MANAGER_ROLE, effectiveOrgId, pageable);
            totalManagers = repositoryUser.countByOrganizationIdAndRoleAndIsDeletedFalse(effectiveOrgId, MANAGER_ROLE);
        }
        else if(isAdmin) {
            managerPage = repositoryUser.findAllByIsDeletedFalseAndEntityRole_Name(MANAGER_ROLE, pageable);
            totalManagers = repositoryUser.countByEntityRoleNameAndIsDeletedFalse(MANAGER_ROLE);
        }
        else {
            managerPage = repositoryUser.findByRoleAndOrganization(MANAGER_ROLE, userOrgId, pageable);
            totalManagers = repositoryUser.countByOrganizationIdAndRoleAndIsDeletedFalse(userOrgId, MANAGER_ROLE);
        }
        List<DtoResManager> dtoResManagers = managerPage.getContent().stream()
                .map(manager -> {
                    Optional<EntityManagerProfile> optionalProfile = repositoryManagerProfile.findByUserId(manager.getId());
                    return mapToDto(manager, optionalProfile.orElse(new EntityManagerProfile()));
                })
                .collect(Collectors.toList());
        return ApiResponse.<List<DtoResManager>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getManager(ConstantManagerI18n.I18N_MANAGERS_RETRIEVE_SUCCESS))
                .data(dtoResManagers)
                .totalItems(totalManagers)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<DtoResManager> createManager(final DtoReqManager dtoReqManager) {
        final I18n i18n = new I18n(httpServletRequest);
        final boolean isAdmin = utilAuthContext.isAdmin();
        final Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();

        if(!hasCreateManagerPermission()) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.insufficient.permissions"));
        }

        if(repositoryUser.existsByEmailAndIsDeletedFalse(dtoReqManager.getEmail())) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_EMAIL_EXISTS));
        }

        if(dtoReqManager.getOrganizationId() == null || dtoReqManager.getOrganizationId() <= 0) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_ORGANIZATION_REQUIRED));
        }

        if(!isAdmin && !dtoReqManager.getOrganizationId().equals(userOrgId)) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.cannot.create.for.other.organization"));
        }

        if(!repositoryOrganization.existsByIdAndIsDeletedFalse(dtoReqManager.getOrganizationId())) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_ORGANIZATION_NOT_FOUND));
        }

        EntityOrganization organization = repositoryOrganization.findById(dtoReqManager.getOrganizationId())
                .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

       
        String password = utilPasswordGenerator.generateSecurePassword(8);

        EntityRole entityRole = repositoryRole.findByName(MANAGER_ROLE)
                .map(role -> (EntityRole) role)
                .orElseThrow(() -> new ExceptionUserNotFound(i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND)));

        EntityUser entityUser = new EntityUser();
        entityUser.setEmail(dtoReqManager.getEmail());
        entityUser.setFirstName(dtoReqManager.getFirstName());
        entityUser.setLastName(dtoReqManager.getLastName());
        entityUser.setPhone(dtoReqManager.getPhone() != null ? dtoReqManager.getPhone() : "");
        entityUser.setIsActive(true);
        entityUser.setIsDeleted(false);
        entityUser.setStatusId(dtoReqManager.getStatusId() != null ? dtoReqManager.getStatusId() : 1);
        entityUser.setEntityRole(entityRole);
        entityUser.setCreatedBy(utilAuthContext.getCurrentUser().getOrganization().getId());
        entityUser.setModifiedBy(utilAuthContext.getCurrentUser().getOrganization().getId());
        entityUser.setOrganization(organization);
        entityUser.setPasswordHash(passwordEncoder.encode(password));

        final EntityUser entityUserSaved = repositoryUser.save(entityUser);

        EntityManagerProfile entityManagerProfile = new EntityManagerProfile();
        entityManagerProfile.setUserId(entityUser.getId());
        entityManagerProfile.setOrganizationId(dtoReqManager.getOrganizationId());
        entityManagerProfile.setCanGenerateTimetable(dtoReqManager.getCanGenerateTimetable() != null ? dtoReqManager.getCanGenerateTimetable() : false);
        entityManagerProfile.setCanManageTeachers(dtoReqManager.getCanManageTeachers() != null ? dtoReqManager.getCanManageTeachers() : false);
        entityManagerProfile.setCanManageStudents(dtoReqManager.getCanManageStudents() != null ? dtoReqManager.getCanManageStudents() : false);
        entityManagerProfile.setCanCreateManagers(dtoReqManager.getCanCreateManagers() != null ? dtoReqManager.getCanCreateManagers() : false);
        entityManagerProfile.setStatusId(dtoReqManager.getStatusId() != null ? dtoReqManager.getStatusId() : 1);
        entityManagerProfile.setIsDeleted(false);
        entityManagerProfile.setCreatedBy(utilAuthContext.getCurrentUser().getOrganization().getId());
        entityManagerProfile.setModifiedBy(utilAuthContext.getCurrentUser().getOrganization().getId());

        entityManagerProfile = repositoryManagerProfile.save(entityManagerProfile);

       
        try {
            DtoEmailRequest emailRequest = new DtoEmailRequest();
            emailRequest.setTo(Collections.singletonList(entityUser.getEmail()));
            emailRequest.setSubject("Your Manager Account Has Been Created");
            emailRequest.setTemplateName("account-created");
            emailRequest.setFrom(sender);

            Map<String, Object> templateVariables = new HashMap<>();
            templateVariables.put("firstName", entityUser.getFirstName());
            templateVariables.put("email", entityUser.getEmail());
            templateVariables.put("password", password);
            templateVariables.put("role", "Manager");
            templateVariables.put("organizationName", organization.getName());
            templateVariables.put("loginUrl", "https://timetable.ist-legal.rw/login");
            emailRequest.setTemplateVariables(templateVariables);

            serviceEmail.sendEmail(emailRequest);
        }catch(Exception e) {
            log.error("Failed to send email to new manager: {}", e.getMessage());

        }

        DtoResManager dtoResManager = mapToDto(entityUser, entityManagerProfile);

        return ApiResponse.success(HttpStatus.CREATED, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_CREATE_SUCCESS), dtoResManager);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResManager> updateManager(final String uuid, DtoReqManager dtoReqManager) {
        final I18n i18n = new I18n(httpServletRequest);
        final boolean isAdmin = utilAuthContext.isAdmin();
        final Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        final Integer userId = utilAuthContext.getCurrentUser().getOrganization().getId();

        Optional<EntityUser> optionalManager = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(uuid, MANAGER_ROLE);
        if(!optionalManager.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
        }

        EntityUser manager = optionalManager.get();

        if(!isAdmin && !manager.getOrganization().getId().equals(userOrgId)) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
        }

        boolean affectingPermissions = dtoReqManager.getCanCreateManagers() != null ||
                dtoReqManager.getCanGenerateTimetable() != null ||
                dtoReqManager.getCanManageStudents() != null ||
                dtoReqManager.getCanManageTeachers() != null;

        if(affectingPermissions && !isAdmin) {
            Optional<EntityManagerProfile> managerProfile = repositoryManagerProfile.findByUserId(userId);
            if(managerProfile.isEmpty() || !Boolean.TRUE.equals(managerProfile.get().getCanCreateManagers())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.insufficient.permissions"));
            }
        }

        if(!isAdmin && dtoReqManager.getOrganizationId() != null && !dtoReqManager.getOrganizationId().equals(userOrgId)) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.cannot.change.organization"));
        }

        if(dtoReqManager.getEmail() != null && !dtoReqManager.getEmail().equals(manager.getEmail())) {
            Optional<EntityUser> existingUserWithEmail = repositoryUser.findByEmailAndIsDeletedFalse(dtoReqManager.getEmail());
            if(existingUserWithEmail.isPresent() && !existingUserWithEmail.get().getId().equals(manager.getId())) {
                return ApiResponse.error(HttpStatus.CONFLICT, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_EMAIL_EXISTS));
            }
        }

        if(dtoReqManager.getOrganizationId() != null) {
            if(dtoReqManager.getOrganizationId() <= 0) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_ORGANIZATION_REQUIRED));
            }

            if(!repositoryOrganization.existsByIdAndIsDeletedFalse(dtoReqManager.getOrganizationId())) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_ORGANIZATION_NOT_FOUND));
            }
        }

        if(dtoReqManager.getEmail() != null) manager.setEmail(dtoReqManager.getEmail());
        if(dtoReqManager.getFirstName() != null) manager.setFirstName(dtoReqManager.getFirstName());
        if(dtoReqManager.getLastName() != null) manager.setLastName(dtoReqManager.getLastName());
        if(dtoReqManager.getPhone() != null) manager.setPhone(dtoReqManager.getPhone());
        if(dtoReqManager.getStatusId() != null) manager.setStatusId(dtoReqManager.getStatusId());

        if(dtoReqManager.getOrganizationId() != null) {
            EntityOrganization organization = repositoryOrganization.findById(dtoReqManager.getOrganizationId())
                    .orElseThrow(() -> new EntityNotFoundException("Organization not found"));
            manager.setOrganization(organization);
        }

        manager.setModifiedBy(userId);

        if(dtoReqManager.getPassword() != null && !dtoReqManager.getPassword().isEmpty()) {
            manager.setPasswordHash(passwordEncoder.encode(dtoReqManager.getPassword()));
        }

        manager = repositoryUser.save(manager);

        Optional<EntityManagerProfile> optionalProfile = repositoryManagerProfile.findByUserId(manager.getId());
        EntityManagerProfile managerProfile;

        if(optionalProfile.isPresent()) {
            managerProfile = optionalProfile.get();
        }else {
            managerProfile = new EntityManagerProfile();
            managerProfile.setUserId(manager.getId());
            managerProfile.setCreatedBy(userId);
        }

        if(dtoReqManager.getOrganizationId() != null) managerProfile.setOrganizationId(dtoReqManager.getOrganizationId());

        if(isAdmin || hasCreateManagerPermission()) {
            if(dtoReqManager.getCanGenerateTimetable() != null) managerProfile.setCanGenerateTimetable(dtoReqManager.getCanGenerateTimetable());
            if(dtoReqManager.getCanManageTeachers() != null) managerProfile.setCanManageTeachers(dtoReqManager.getCanManageTeachers());
            if(dtoReqManager.getCanManageStudents() != null) managerProfile.setCanManageStudents(dtoReqManager.getCanManageStudents());
            if(dtoReqManager.getCanCreateManagers() != null) managerProfile.setCanCreateManagers(dtoReqManager.getCanCreateManagers());
        }

        if(dtoReqManager.getStatusId() != null) managerProfile.setStatusId(dtoReqManager.getStatusId());
        managerProfile.setModifiedBy(userId);

        managerProfile = repositoryManagerProfile.save(managerProfile);

        DtoResManager dtoResManager = mapToDto(manager, managerProfile);

        return ApiResponse.success(HttpStatus.OK, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_UPDATE_SUCCESS), dtoResManager);
    }

    @Override
    @Transactional
    public ApiResponse<?> softDeleteManager(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final boolean isAdmin = utilAuthContext.isAdmin();
        final Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();

        final Optional<EntityUser> optionalManager = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(uuid, MANAGER_ROLE);
        if(!optionalManager.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
        }

        final EntityUser entityUser = optionalManager.get();

        if(!isAdmin && !entityUser.getOrganization().getId().equals(userOrgId)) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
        }

        if(!isAdmin && !hasCreateManagerPermission()) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.insufficient.permissions"));
        }

        entityUser.setIsDeleted(true);
        entityUser.setModifiedBy(utilAuthContext.getCurrentUser().getOrganization().getId());
        repositoryUser.save(entityUser);

        Optional<EntityManagerProfile> optionalProfile = repositoryManagerProfile.findByUserId(entityUser.getId());
        if(optionalProfile.isPresent()) {
            EntityManagerProfile profile = optionalProfile.get();
            profile.setIsDeleted(true);
            profile.setModifiedBy(utilAuthContext.getCurrentUser().getOrganization().getId());
            repositoryManagerProfile.save(profile);
        }

        return ApiResponse.success(HttpStatus.OK, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_DELETE_SUCCESS), null);
    }

    @Override
    public ApiResponse<DtoResManager> getCurrentManagerProfile() {
        final I18n i18n = new I18n(httpServletRequest);
        final EntityUser currentUser = utilAuthContext.getCurrentUser();
        
        if(currentUser == null) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, i18n.getManager("manager.error.not.authenticated"));
        }
        
        
        if(!MANAGER_ROLE.equals(currentUser.getEntityRole().getName())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getManager("manager.error.not.manager"));
        }
        
        
        Optional<EntityManagerProfile> optionalProfile = repositoryManagerProfile.findByUserId(currentUser.getId());
        
        if(optionalProfile.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getManager(ConstantManagerI18n.I18N_MANAGER_NOT_FOUND));
        }
        
        DtoResManager dtoResManager = mapToDto(currentUser, optionalProfile.get());
        
        return ApiResponse.success(
            HttpStatus.OK,
            i18n.getManager(ConstantManagerI18n.I18N_MANAGER_RETRIEVE_SUCCESS),
            dtoResManager
        );
    }

    private DtoResManager mapToDto(final EntityUser manager, final EntityManagerProfile profile) {
        DtoResManager dtoResManager = new DtoResManager();
        dtoResManager.setUuid(manager.getUuid());
        dtoResManager.setEmail(manager.getEmail());
        dtoResManager.setPhone(manager.getPhone());
        dtoResManager.setFirstName(manager.getFirstName());
        dtoResManager.setLastName(manager.getLastName());
        dtoResManager.setStatusId(manager.getStatusId());
        dtoResManager.setIsActive(manager.getIsActive());
        dtoResManager.setIsDeleted(manager.getIsDeleted());
        dtoResManager.setCreatedDate(manager.getCreatedDate());
        dtoResManager.setModifiedDate(manager.getModifiedDate());
        dtoResManager.setRole(manager.getEntityRole().getName());
        dtoResManager.setOrganizationId(manager.getOrganization().getId());
        dtoResManager.setCanGenerateTimetable(profile.getCanGenerateTimetable());
        dtoResManager.setCanManageTeachers(profile.getCanManageTeachers());
        dtoResManager.setCanManageStudents(profile.getCanManageStudents());
        dtoResManager.setCanCreateManagers(profile.getCanCreateManagers());

        return dtoResManager;
    }
}

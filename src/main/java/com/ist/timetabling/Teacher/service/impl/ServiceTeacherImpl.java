package com.ist.timetabling.Teacher.service.impl;

import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.Auth.repository.RepositoryRole;
import com.ist.timetabling.Auth.service.ServiceEmail;
import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Core.util.UtilPasswordGenerator;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositorySchedulePreference;
import com.ist.timetabling.Period.service.ServiceSchedulePreference;
import com.ist.timetabling.Teacher.constant.ConstantTeacherI18n;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacher;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacher;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacherCsvUpload;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherProfile;
import com.ist.timetabling.Teacher.service.ServiceTeacher;
import com.ist.timetabling.Teacher.util.TeacherCsvMapper;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.exception.ExceptionUserNotFound;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
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

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_UNAUTHORIZED;
import static com.ist.timetabling.Teacher.constant.ConstantTeacherI18n.*;

@Service
public class ServiceTeacherImpl implements ServiceTeacher {
    private static final String TEACHER_ROLE = "TEACHER";
    @Value("${spring.mail.username}") private String sender;
    @Autowired
    private RepositoryUser repositoryUser;

    @Autowired
    private RepositoryRole repositoryRole;

    @Autowired
    private RepositoryTeacherProfile repositoryTeacherProfile;

    @Autowired
    private RepositorySchedulePreference repositorySchedulePreference;

    @Autowired
    private ServiceSchedulePreference serviceSchedulePreference;

    @Autowired
    private HttpServletRequest httpServletRequest;

    @Autowired
    private I18n i18n;

    @Autowired
    private UtilAuthContext utilAuthContext;

    @Autowired
    private RepositoryOrganization repositoryOrganization;

    @Autowired
    private UtilPasswordGenerator utilPasswordGenerator;

    @Autowired
    private ServiceEmail serviceEmail;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CSVReaderUtil csvReaderUtil;

    @Autowired
    private TeacherCsvMapper teacherCsvMapper;

    @Override
    @Transactional
    public ApiResponse<DtoResTeacherCsvUpload> importTeachersFromCsv(final DtoReqCsvUpload uploadRequest) {
        final I18n i18n = new I18n(httpServletRequest);


        if(uploadRequest.getFile().isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }


        Integer organizationId;
        if(utilAuthContext.isAdmin() && uploadRequest.getOrganizationId() != null) {
            organizationId = uploadRequest.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }


        if(!repositoryOrganization.existsById(organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getTeacher(I18N_ORGANIZATION_NOT_FOUND));
        }

        DtoResTeacherCsvUpload.DtoResTeacherCsvUploadBuilder resultBuilder = DtoResTeacherCsvUpload.builder();
        List<DtoResTeacher> createdTeachers = new ArrayList<>();
        List<DtoResTeacherCsvUpload.TeacherImportError> errors = new ArrayList<>();

        try {

            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    TeacherCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            int rowNumber = uploadRequest.getSkipHeaderRow() ? 2 : 1;
            int errorCount = 0;
            int successCount = 0;

            for(CSVRecord record : records) {
                try {

                    DtoReqTeacher teacherRequest = teacherCsvMapper.mapToTeacherRequest(record, organizationId, rowNumber);


                    if(repositoryUser.existsByEmailAndIsDeletedFalse(teacherRequest.getEmail())) {
                        throw new Exception(i18n.getTeacher(I18N_TEACHER_EXISTS));
                    }


                    ApiResponse<DtoResTeacher> response = createTeacher(teacherRequest);

                    if(response.isSuccess()) {
                        createdTeachers.add(response.getData());
                        successCount++;
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {

                    DtoResTeacherCsvUpload.TeacherImportError error = DtoResTeacherCsvUpload.TeacherImportError.builder()
                            .rowNumber(rowNumber)
                            .originalData(record.toString())
                            .errorMessage(e.getMessage())
                            .build();
                    errors.add(error);

                    errorCount++;
                }
                rowNumber++;
            }

            DtoResTeacherCsvUpload result = resultBuilder
                    .createdTeachers(createdTeachers)
                    .errors(errors)
                    .totalProcessed(successCount + errorCount)
                    .successCount(successCount)
                    .errorCount(errorCount)
                    .build();

            if(successCount == 0) {
                return ApiResponse.error(
                        HttpStatus.BAD_REQUEST,
                        i18n.getTeacher(I18N_TEACHER_CSV_IMPORT_FAILED) + ": No teachers were created"

                );
            }

            String message = String.format("Processed %d teachers: %d created, %d errors",
                    result.getTotalProcessed(), result.getSuccessCount(), result.getErrorCount());

            return ApiResponse.success(
                    HttpStatus.OK,
                    message,
                    result
            );
        }catch(IOException e) {

            return ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    "Failed to process CSV file: " + e.getMessage()
            );
        }catch(Exception e) {

            return ApiResponse.error(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error importing teachers: " + e.getMessage()
            );
        }
    }
    @Override
    public ApiResponse<DtoResTeacher> findTeacherByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityUser> entityUserTeacher = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(uuid, TEACHER_ROLE);
        if(entityUserTeacher.isPresent()) {
            EntityUser entityUser = entityUserTeacher.get();
            Optional<EntityTeacherProfile> optionalProfile = repositoryTeacherProfile.findByUserId(entityUser.getId());

            if(!utilAuthContext.isAdmin() && optionalProfile.isPresent()) {
                Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                if(!optionalProfile.get().getOrganizationId().equals(currentUserOrgId)) {
                    return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
                }
            }

            DtoResTeacher dtoResTeacher = mapToDto(entityUser, optionalProfile.orElse(new EntityTeacherProfile()));

            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(ConstantTeacherI18n.I18N_TEACHER_RETRIEVE_SUCCESS), dtoResTeacher);
        }else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
    }

    @Override
    @Transactional
    public ApiResponse<List<DtoResTeacher>> getAllTeachers(final Integer page, final Integer size,
                                                           final String sortBy, final String sortDirection,
                                                           final String keyword, final Integer orgId, final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        // Use the provided orgId if admin; otherwise, use the authenticated user's orgId.
        Integer organizationId;
        if(!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getAuthenticatedUserOrganizationId();
        }else {
            organizationId = orgId;
        }

        List<DtoResTeacher> dtoResTeachers = new ArrayList<>();
        
        // Create the appropriate Sort object
        Sort sort = Sort.unsorted();
        if(sortBy != null && !sortBy.isEmpty()) {
            sort = sortDirection != null && sortDirection.equalsIgnoreCase("asc") ?
                    Sort.by(Sort.Direction.ASC, sortBy) :
                    Sort.by(Sort.Direction.DESC, sortBy);
        }

        // Create the PageRequest with the sort
        PageRequest pageRequest = PageRequest.of(
                page != null ? page : 0,
                size != null ? size : 20,
                sort
        );

        if (keyword != null && !keyword.trim().isEmpty()) {
            // When keyword provided, use repository search methods
            List<EntityTeacherProfile> profiles;
            if (utilAuthContext.isAdmin()) {
                if (planSettingsId != null) {
                    profiles = repositoryTeacherProfile.searchByNameContainingAndPlanSettingsId(
                            keyword.toLowerCase(), planSettingsId);
                } else {
                    profiles = repositoryTeacherProfile.searchByNameContainingNative(keyword.toLowerCase());
                }
                
                // Filter by organization if provided
                if (organizationId != null) {
                    profiles = profiles.stream()
                            .filter(profile -> organizationId.equals(profile.getOrganizationId()))
                            .collect(Collectors.toList());
                }
            } else {
                if (planSettingsId != null) {
                    profiles = repositoryTeacherProfile.searchByNameContainingAndOrganizationIdAndPlanSettingsId(
                            keyword.toLowerCase(), organizationId, planSettingsId);
                } else {
                    profiles = repositoryTeacherProfile.searchByNameContainingAndOrganizationId(
                            keyword.toLowerCase(), organizationId);
                }
            }
            
            dtoResTeachers = profiles.stream()
                    .map(profile -> {
                        Optional<EntityUser> teacherOpt = repositoryUser.findById(profile.getUserId());
                        return teacherOpt.map(teacher -> mapToDto(teacher, profile)).orElse(null);
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } else {
            // If no keyword, perform paginated fetch based on planSettingsId
            if (planSettingsId != null) {
                // Fetch teachers with specific plan settings ID
                List<EntityTeacherProfile> profiles;
                if (utilAuthContext.isAdmin()) {
                    if (organizationId != null) {
                        profiles = repositoryTeacherProfile.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                                organizationId, planSettingsId);
                    } else {
                        profiles = repositoryTeacherProfile.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId);
                    }
                } else {
                    profiles = repositoryTeacherProfile.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                            organizationId, planSettingsId);
                }
                
                dtoResTeachers = profiles.stream()
                        .map(profile -> {
                            Optional<EntityUser> teacherOpt = repositoryUser.findById(profile.getUserId());
                            return teacherOpt.filter(user -> !user.getIsDeleted())
                                    .map(teacher -> mapToDto(teacher, profile))
                                    .orElse(null);
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            } else {
                // Fetch all teachers without plan settings filter
                Page<EntityUser> teacherPage;
                if (utilAuthContext.isAdmin()) {
                    if (organizationId != null) {
                        teacherPage = repositoryUser.findAllByIsDeletedFalseAndOrganizationIdAndEntityRole_Name(
                                organizationId, TEACHER_ROLE, pageRequest);
                    } else {
                        teacherPage = repositoryUser.findAllByIsDeletedFalseAndEntityRole_Name(
                                TEACHER_ROLE, pageRequest);
                    }
                } else {
                    teacherPage = repositoryUser.findAllByIsDeletedFalseAndOrganizationIdAndEntityRole_Name(
                            organizationId, TEACHER_ROLE, pageRequest);
                }

                dtoResTeachers = teacherPage.getContent().stream()
                        .map(teacher -> {
                            Optional<EntityTeacherProfile> profileOpt = repositoryTeacherProfile.findByUserIdAndOrganizationId(
                                    teacher.getId(), organizationId);
                            return profileOpt.map(profile -> mapToDto(teacher, profile)).orElse(null);
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            }
        }

        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(ConstantTeacherI18n.I18N_TEACHERS_RETRIEVE_SUCCESS), dtoResTeachers);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResTeacher> updateSchedulePreference(final String preferenceUuid,
                                                               final String preferenceType,
                                                               final Boolean preferenceValue) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            // Validate input parameters
            if (preferenceUuid == null || preferenceType == null || preferenceValue == null) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Missing required parameters");
            }

            Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(preferenceUuid);
            if(!optEntityPref.isPresent() || optEntityPref.get().getIsDeleted()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
            }

            EntitySchedulePreference entityPref = optEntityPref.get();

            List<EntityTeacherProfile> relatedProfiles = repositoryTeacherProfile.findBySchedulePreferencesContaining(entityPref);
            if(!utilAuthContext.isAdmin() && !hasPermissionForProfiles(relatedProfiles)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }

            Integer periodId = entityPref.getPeriodId();
            Integer dayOfWeek = entityPref.getDayOfWeek();

            DtoReqSchedulePreference dtoReqSchedulePreference = new DtoReqSchedulePreference();
            dtoReqSchedulePreference.setPeriodId(periodId);
            dtoReqSchedulePreference.setDayOfWeek(dayOfWeek);
            dtoReqSchedulePreference.setOrganizationId(entityPref.getOrganizationId()); // Make sure this is set

            // Reset all preferences to null first
            dtoReqSchedulePreference.setCannotTeach(null);
            dtoReqSchedulePreference.setPrefersToTeach(null);
            dtoReqSchedulePreference.setMustTeach(null);
            dtoReqSchedulePreference.setDontPreferToTeach(null);

            // Set only the specified preference
            switch (preferenceType.toLowerCase()) {
                case "cannot_teach":
                    dtoReqSchedulePreference.setCannotTeach(preferenceValue);
                    break;
                case "prefers_to_teach":
                    dtoReqSchedulePreference.setPrefersToTeach(preferenceValue);
                    break;
                case "must_teach":
                    dtoReqSchedulePreference.setMustTeach(preferenceValue);
                    break;
                case "dont_prefer_to_teach":
                    dtoReqSchedulePreference.setDontPreferToTeach(preferenceValue);
                    break;
                default:
                    return ApiResponse.error(HttpStatus.BAD_REQUEST,
                            "Invalid preference type: " + preferenceType);
            }

            try {
                // This is where the transaction might be marked for rollback
                DtoResSchedulePreference updatedPrefResponse =
                        serviceSchedulePreference.updateSchedulePreference(preferenceUuid, dtoReqSchedulePreference);

                if (updatedPrefResponse == null) {
                    throw new Exception("Failed to update schedule preference");
                }

                if(relatedProfiles.isEmpty()) {
                    return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_PROFILE_NOT_FOUND));
                }

                EntityTeacherProfile profile = relatedProfiles.get(0);
                EntityUser teacher = repositoryUser.findById(profile.getUserId())
                        .orElseThrow(() -> new EntityNotFoundException(i18n.getTeacher(I18N_TEACHER_NOT_FOUND)));

                DtoResTeacher dtoResTeacher = mapToDto(teacher, profile);
                return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_UPDATE_SUCCESS), dtoResTeacher);
            } catch (Exception e) {
                // Log the detailed exception
                e.printStackTrace();
                throw new RuntimeException("Error updating schedule preference: " + e.getMessage(), e);
            }
        } catch(Exception ex) {
            ex.printStackTrace();
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<DtoResTeacher> createTeacher(final DtoReqTeacher dtoReqTeacher) {
        final I18n i18n = new I18n(httpServletRequest);

        EntityOrganization entityOrganization;
        Integer organizationId;

        if(utilAuthContext.isAdmin()) {
            Optional<EntityOrganization> orgOpt = repositoryOrganization.findById(dtoReqTeacher.getOrganizationId());
            entityOrganization = orgOpt.get();
            organizationId = dtoReqTeacher.getOrganizationId();
        }else {
            entityOrganization = utilAuthContext.getCurrentUser().getOrganization();
            organizationId = entityOrganization.getId();
        }

        String password = utilPasswordGenerator.generateSecurePassword(8);


        EntityRole entityRole = (EntityRole) repositoryRole.findByName(TEACHER_ROLE)
                .orElseThrow(() -> new ExceptionUserNotFound(i18n.getTeacher(I18N_TEACHER_NOT_FOUND)));

        EntityUser entityUser = new EntityUser();
        entityUser.setPasswordHash(passwordEncoder.encode(password));
        entityUser.setEmail(dtoReqTeacher.getEmail());
        entityUser.setFirstName(dtoReqTeacher.getFirstName());
        entityUser.setLastName(dtoReqTeacher.getLastName());
        entityUser.setPhone(dtoReqTeacher.getPhone());
        entityUser.setIsActive(true);
        entityUser.setIsDeleted(false);
        entityUser.setStatusId(dtoReqTeacher.getStatusId());
        entityUser.setEntityRole(entityRole);
        entityUser.setOrganization(entityOrganization);
        entityUser.setCreatedBy(utilAuthContext.getCurrentUser().getId());
        entityUser.setModifiedBy(utilAuthContext.getCurrentUser().getId());

        final EntityUser entityUserSaved = repositoryUser.save(entityUser);

        EntityTeacherProfile entityTeacherProfile = new EntityTeacherProfile();
        entityTeacherProfile.setUserId(entityUser.getId());
        entityTeacherProfile.setOrganizationId(organizationId);
        if(dtoReqTeacher.getPlanSettingsId() != null) {
            entityTeacherProfile.setPlanSettingsId(dtoReqTeacher.getPlanSettingsId());
        }
        entityTeacherProfile.setBio(dtoReqTeacher.getBio() != null ? dtoReqTeacher.getBio() : "");
        entityTeacherProfile.setInitials(dtoReqTeacher.getInitials() != null ? dtoReqTeacher.getInitials() : "");
        entityTeacherProfile.setDepartment(dtoReqTeacher.getDepartment() != null ? dtoReqTeacher.getDepartment() : "");
        entityTeacherProfile.setQualification(dtoReqTeacher.getQualification() != null ? dtoReqTeacher.getQualification() : "");
        entityTeacherProfile.setContractType(dtoReqTeacher.getContractType() != null ? dtoReqTeacher.getContractType() : "");
        entityTeacherProfile.setControlNumber(dtoReqTeacher.getControlNumber() != null ? dtoReqTeacher.getControlNumber() : 1);
        entityTeacherProfile.setNotes(dtoReqTeacher.getNotes());
        entityTeacherProfile.setPreferredStartTime(dtoReqTeacher.getPreferredStartTime());
        entityTeacherProfile.setPreferredEndTime(dtoReqTeacher.getPreferredEndTime());
        entityTeacherProfile.setMaxDailyHours(dtoReqTeacher.getMaxDailyHours() != null ? dtoReqTeacher.getMaxDailyHours() : 8);
        entityTeacherProfile.setCreatedBy(utilAuthContext.getCurrentUser().getId());
        entityTeacherProfile.setModifiedBy(utilAuthContext.getCurrentUser().getId());

        if(dtoReqTeacher.getPrimarySchedulePreferenceId() != null) {
            Optional<EntitySchedulePreference> optPref = repositorySchedulePreference.findById(Long.valueOf(dtoReqTeacher.getPrimarySchedulePreferenceId()));
            optPref.ifPresent(entityTeacherProfile::setPrimarySchedulePreference);
        }

        if(dtoReqTeacher.getSchedulePreferenceIds() != null && !dtoReqTeacher.getSchedulePreferenceIds().isEmpty()) {
            List<Long> longIds = dtoReqTeacher.getSchedulePreferenceIds().stream()
                    .map(Long::valueOf)
                    .collect(Collectors.toList());
            List<EntitySchedulePreference> preferences = repositorySchedulePreference.findAllByIdIn(dtoReqTeacher.getSchedulePreferenceIds());

            entityTeacherProfile.setSchedulePreferences(preferences);
        }

        entityTeacherProfile = repositoryTeacherProfile.save(entityTeacherProfile);

        DtoResTeacher dtoResTeacher = mapToDto(entityUser, entityTeacherProfile);

        try {
            DtoEmailRequest emailRequest = new DtoEmailRequest();
            emailRequest.setTo(Collections.singletonList(entityUser.getEmail()));
            emailRequest.setSubject("Your Teacher Account Has Been Created");
            emailRequest.setTemplateName("account-created");
            emailRequest.setFrom(sender);

            Map<String, Object> templateVariables = new HashMap<>();
            templateVariables.put("firstName", entityUser.getFirstName());
            templateVariables.put("email", entityUser.getEmail());
            templateVariables.put("password", password);
            templateVariables.put("role", "Teacher");
            templateVariables.put("organizationName", entityOrganization.getName());
            templateVariables.put("loginUrl", "https://timetable.ist-legal.rw/login");
            emailRequest.setTemplateVariables(templateVariables);

            serviceEmail.sendEmail(emailRequest);
        }catch(Exception e) {
            return ApiResponse.error(HttpStatus.CREATED, i18n.getTeacher(I18N_TEACHER_NOT_FOUND + e.getMessage()));
        }

        return ApiResponse.success(HttpStatus.CREATED, i18n.getTeacher(I18N_TEACHER_CREATE_SUCCESS), dtoResTeacher);
    }


    @Override
    @Transactional
    public ApiResponse<DtoResTeacher> updateTeacher(final String uuid, DtoReqTeacher dtoReqTeacher) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityUser> optionalTeacher = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(uuid, TEACHER_ROLE);
        EntityOrganization entityOrganization;
        Integer organizationId;

        if(optionalTeacher.isPresent()) {
            EntityUser teacher = optionalTeacher.get();
            Optional<EntityTeacherProfile> optionalProfile = repositoryTeacherProfile.findByUserId(teacher.getId());

            if(!utilAuthContext.isAdmin() && optionalProfile.isPresent()) {
                Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                if(!optionalProfile.get().getOrganizationId().equals(currentUserOrgId)) {
                    return ApiResponse.error(HttpStatus.FORBIDDEN,i18n.getAuth(I18N_AUTH_UNAUTHORIZED) );
                }
            }

            if(utilAuthContext.isAdmin()) {
                Optional<EntityOrganization> orgOpt = repositoryOrganization.findById(dtoReqTeacher.getOrganizationId());
                entityOrganization = orgOpt.get();
                organizationId = dtoReqTeacher.getOrganizationId();
            }else {
                entityOrganization = utilAuthContext.getCurrentUser().getOrganization();
                organizationId = entityOrganization.getId();
            }

            teacher.setEmail(dtoReqTeacher.getEmail());
            teacher.setFirstName(dtoReqTeacher.getFirstName());
            teacher.setLastName(dtoReqTeacher.getLastName());
            teacher.setPhone(dtoReqTeacher.getPhone());
            teacher.setStatusId(dtoReqTeacher.getStatusId());
            teacher.setOrganization(entityOrganization);

            if(dtoReqTeacher.getPassword() != null && !dtoReqTeacher.getPassword().isEmpty()) {
                teacher.setPasswordHash(dtoReqTeacher.getPassword());
            }

            teacher = repositoryUser.save(teacher);

            EntityTeacherProfile teacherProfile;

            if(optionalProfile.isPresent()) {
                teacherProfile = optionalProfile.get();
            }else {
                teacherProfile = new EntityTeacherProfile();
                teacherProfile.setUserId(teacher.getId());

                teacherProfile.setOrganizationId(utilAuthContext.getCurrentUser().getOrganization().getId());
            }

            if(dtoReqTeacher.getBio() != null) teacherProfile.setBio(dtoReqTeacher.getBio());
            if(dtoReqTeacher.getOrganizationId() != null) teacherProfile.setOrganizationId(organizationId);
            if(dtoReqTeacher.getPlanSettingsId() != null) teacherProfile.setPlanSettingsId(dtoReqTeacher.getPlanSettingsId());
            if(dtoReqTeacher.getMaxDailyHours() != null) teacherProfile.setMaxDailyHours(dtoReqTeacher.getMaxDailyHours());
            if(dtoReqTeacher.getPreferredStartTime() != null) teacherProfile.setPreferredStartTime(dtoReqTeacher.getPreferredStartTime());
            if(dtoReqTeacher.getPreferredEndTime() != null) teacherProfile.setPreferredEndTime(dtoReqTeacher.getPreferredEndTime());
            if(dtoReqTeacher.getInitials() != null) teacherProfile.setInitials(dtoReqTeacher.getInitials());
            if(dtoReqTeacher.getDepartment() != null) teacherProfile.setDepartment(dtoReqTeacher.getDepartment());
            if(dtoReqTeacher.getQualification() != null) teacherProfile.setQualification(dtoReqTeacher.getQualification());
            if(dtoReqTeacher.getContractType() != null) teacherProfile.setContractType(dtoReqTeacher.getContractType());
            if(dtoReqTeacher.getControlNumber() != null) teacherProfile.setControlNumber(dtoReqTeacher.getControlNumber());
            if(dtoReqTeacher.getNotes() != null) teacherProfile.setNotes(dtoReqTeacher.getNotes());

            if(dtoReqTeacher.getPrimarySchedulePreferenceId() != null) {
                Optional<EntitySchedulePreference> optPref =
                        repositorySchedulePreference.findById(Long.valueOf(dtoReqTeacher.getPrimarySchedulePreferenceId()));
                teacherProfile.setPrimarySchedulePreference(optPref.orElse(null));
            }

            if(dtoReqTeacher.getSchedulePreferenceIds() != null) {
                List<Long> longIds = dtoReqTeacher.getSchedulePreferenceIds().stream()
                        .map(Long::valueOf)
                        .collect(Collectors.toList());

                List<EntitySchedulePreference> preferences = repositorySchedulePreference.findAllByIdIn(dtoReqTeacher.getSchedulePreferenceIds());
                teacherProfile.setSchedulePreferences(preferences);
            }

            teacherProfile = repositoryTeacherProfile.save(teacherProfile);

            DtoResTeacher dto = mapToDto(teacher, teacherProfile);
            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(ConstantTeacherI18n.I18N_TEACHER_UPDATE_SUCCESS), dto);
        }else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
    }

    @Override
    public ApiResponse<?> softDeleteTeacher(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);

        final Optional<EntityUser> optionalTeacher = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(uuid, TEACHER_ROLE);
        if(optionalTeacher.isPresent()) {
            EntityUser entityUser = optionalTeacher.get();
            Optional<EntityTeacherProfile> optionalProfile = repositoryTeacherProfile.findByUserId(entityUser.getId());

            if(!utilAuthContext.isAdmin() && optionalProfile.isPresent()) {
                Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                if(!optionalProfile.get().getOrganizationId().equals(currentUserOrgId)) {
                    return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
                }
            }

            entityUser.setIsDeleted(true);
            repositoryUser.save(entityUser);
            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(ConstantTeacherI18n.I18N_TEACHER_DELETE_SUCCESS), null);
        }else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
    }

    @Override
    @Transactional
    public ApiResponse<?> deleteTeacherSchedulePreference(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            EntitySchedulePreference schedulePreference = repositorySchedulePreference.findByUuid(uuid)
                    .orElseThrow(() -> new EntityNotFoundException(i18n.getTeacher(I18N_TEACHER_NOT_FOUND)));

            List<EntityTeacherProfile> affectedProfiles = repositoryTeacherProfile.findBySchedulePreferencesContaining(schedulePreference);

            if(!utilAuthContext.isAdmin() && !hasPermissionForProfiles(affectedProfiles)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }

            for(EntityTeacherProfile profile : affectedProfiles) {
                profile.getSchedulePreferences().remove(schedulePreference);

                if(profile.getPrimarySchedulePreference() != null &&
                        profile.getPrimarySchedulePreference().equals(schedulePreference)) {
                    profile.setPrimarySchedulePreference(null);
                }
                repositoryTeacherProfile.save(profile);
            }
            repositorySchedulePreference.delete(schedulePreference);

            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_DELETE_SUCCESS), null);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<DtoResTeacher> addSchedulePreferenceToTeacher(final String teacherUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue) {
        final I18n i18n = new I18n(httpServletRequest);

        EntityTeacherProfile teacherProfile = repositoryTeacherProfile.findByUuidAndIsDeletedFalse(teacherUuid);
        if (teacherProfile == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }

        EntityUser teacher = repositoryUser.findByIdAndIsDeletedFalse(teacherProfile.getUserId());

        Optional<EntityTeacherProfile> profileOpt = repositoryTeacherProfile.findByUserId(teacherProfile.getUserId());

        if (!utilAuthContext.isAdmin() && profileOpt.isPresent()) {
            Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
            if (!profileOpt.get().getOrganizationId().equals(currentUserOrgId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
        }

        EntityTeacherProfile profile = profileOpt.orElseGet(() -> {
            EntityTeacherProfile newProfile = new EntityTeacherProfile();
            newProfile.setUserId(teacher.getId());
            newProfile.setOrganizationId(utilAuthContext.getCurrentUser().getOrganization().getId());
            return newProfile;
        });

        DtoReqSchedulePreference requestDTO = new DtoReqSchedulePreference();
        requestDTO.setPeriodId(periodId);
        requestDTO.setDayOfWeek(dayOfWeek);
        requestDTO.setOrganizationId(profile.getOrganizationId());

        // Set all preferences to null initially
        requestDTO.setCannotTeach(null);
        requestDTO.setPrefersToTeach(null);
        requestDTO.setMustTeach(null);
        requestDTO.setDontPreferToTeach(null);

        // Set the specific preference based on type
        switch (preferenceType.toLowerCase()) {
            case "cannot_teach":
                requestDTO.setCannotTeach(preferenceValue);
                break;
            case "prefers_to_teach":
                requestDTO.setPrefersToTeach(preferenceValue);
                break;
            case "must_teach":
                requestDTO.setMustTeach(preferenceValue);
                break;
            case "dont_prefer_to_teach":
                requestDTO.setDontPreferToTeach(preferenceValue);
                break;
            default:
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getTeacher("Invalid preference type: ") + preferenceType);
        }

        DtoResSchedulePreference createdPrefResponse = serviceSchedulePreference.createSchedulePreference(requestDTO);

        Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(createdPrefResponse.getUuid());

        if (!optEntityPref.isPresent()) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getTeacher("Failed to retrieve created schedule preference."));
        }

        EntitySchedulePreference entityPref = optEntityPref.get();

        if (!profile.getSchedulePreferences().contains(entityPref)) {
            profile.getSchedulePreferences().add(entityPref);
        }

        profile = repositoryTeacherProfile.save(profile);

        DtoResTeacher dtoResTeacher = mapToDto(teacher, profile);
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_CREATE_SUCCESS), dtoResTeacher);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResTeacher> addSchedulePreferencesToTeacher(final String teacherUuid, final DtoReqSchedulePreference preferences) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityUser> teacherOpt = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(teacherUuid, TEACHER_ROLE);
        if(!teacherOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
        EntityUser teacher = teacherOpt.get();
        Optional<EntityTeacherProfile> profileOpt = repositoryTeacherProfile.findByUserId(teacher.getId());

        if(!utilAuthContext.isAdmin() && profileOpt.isPresent()) {
            Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
            if(!profileOpt.get().getOrganizationId().equals(currentUserOrgId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
        }

        EntityTeacherProfile profile = profileOpt.orElseGet(() -> {
            EntityTeacherProfile newProfile = new EntityTeacherProfile();
            newProfile.setUserId(teacher.getId());
            newProfile.setOrganizationId(utilAuthContext.getCurrentUser().getOrganization().getId());
            return newProfile;
        });

        DtoResSchedulePreference createdPrefResponse = serviceSchedulePreference.createSchedulePreference(preferences);

        Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(createdPrefResponse.getUuid());
        if(!optEntityPref.isPresent()) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
        EntitySchedulePreference entityPref = optEntityPref.get();

        if(!profile.getSchedulePreferences().contains(entityPref)) {
            profile.getSchedulePreferences().add(entityPref);
        }
        profile = repositoryTeacherProfile.save(profile);
        DtoResTeacher dtoResTeacher = mapToDto(teacher, profile);
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_CREATE_SUCCESS), dtoResTeacher);
    }

    @Override
    public ApiResponse<List<DtoResTeacher>> getTeacherAllPreferences(final String teacherUuid) {
        final I18n i18n = new I18n(httpServletRequest);
        EntityTeacherProfile profile = repositoryTeacherProfile.findByUuidAndIsDeletedFalse(teacherUuid);
        if(profile == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
        Optional<EntityUser> teacherOpt = repositoryUser.findById(profile.getUserId());
        if(!teacherOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }
        if(!utilAuthContext.isAdmin()) {
            Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
            if(!profile.getOrganizationId().equals(currentUserOrgId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
        }
        DtoResTeacher teacherWithPrefs = mapToDto(teacherOpt.get(), profile);
        List<DtoResTeacher> result = new ArrayList<>();
        result.add(teacherWithPrefs);
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_PREFERENCE_RETRIEVED), result);
    }

    @Override
    public ApiResponse<DtoResTeacher> getTeacherPreferenceForPeriodAndDay(final String teacherUuid, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntityUser> teacherOpt = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(teacherUuid, TEACHER_ROLE);
            if(!teacherOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
            }

            Optional<EntityTeacherProfile> profileOpt = repositoryTeacherProfile.findByUserId(teacherOpt.get().getId());
            if(!profileOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_PROFILE_NOT_FOUND));
            }

            if(!utilAuthContext.isAdmin()) {
                Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                if(!profileOpt.get().getOrganizationId().equals(currentUserOrgId)) {
                    return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
                }
            }

            EntityTeacherProfile profile = profileOpt.get();
            DtoResTeacher teacherWithSpecificPrefs = mapToDto(teacherOpt.get(), profile);
            List<DtoResSchedulePreference> filteredPrefs = new ArrayList<>();
            for(DtoResSchedulePreference pref : teacherWithSpecificPrefs.getSchedulePreferences()) {
                if(pref.getPeriodId() != null && pref.getDayOfWeek() != null &&
                   pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek)) {
                    filteredPrefs.add(pref);
                }
            }

            teacherWithSpecificPrefs.setSchedulePreferences(filteredPrefs);

            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_PREFERENCE_RETRIEVED), teacherWithSpecificPrefs);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<?> clearTeacherPreferencesForPeriodAndDay(final String teacherUuid, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntityUser> teacherOpt = repositoryUser.findByUuidAndIsDeletedFalseAndEntityRole_Name(teacherUuid, TEACHER_ROLE);
            if(!teacherOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
            }

            Optional<EntityTeacherProfile> profileOpt = repositoryTeacherProfile.findByUserId(teacherOpt.get().getId());
            if(!profileOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getTeacher(I18N_TEACHER_PROFILE_NOT_FOUND));
            }

            if(!utilAuthContext.isAdmin()) {
                Integer currentUserOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                if(!profileOpt.get().getOrganizationId().equals(currentUserOrgId)) {
                    return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
                }
            }

            EntityTeacherProfile profile = profileOpt.get();
            List<EntitySchedulePreference> preferencesToRemove = new ArrayList<>();

            for(EntitySchedulePreference pref : profile.getSchedulePreferences()) {
                if(pref.getPeriodId() != null && pref.getDayOfWeek() != null &&
                   pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek)) {
                    preferencesToRemove.add(pref);
                    if(profile.getPrimarySchedulePreference() != null &&
                            profile.getPrimarySchedulePreference().getPeriodId().equals(periodId) &&
                            profile.getPrimarySchedulePreference().getDayOfWeek().equals(dayOfWeek)) {
                        profile.setPrimarySchedulePreference(null);
                    }
                    pref.setIsDeleted(true);
                    repositorySchedulePreference.save(pref);
                }
            }

            profile.getSchedulePreferences().removeAll(preferencesToRemove);
            repositoryTeacherProfile.save(profile);

            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_PREFERENCE_DELETED), null);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    // Helper method to check if user has permission for any of the profiles
    private boolean hasPermissionForProfiles(List<EntityTeacherProfile> profiles) {
        if(profiles == null || profiles.isEmpty()) {
            return false;
        }

        Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        return profiles.stream().anyMatch(profile -> profile.getOrganizationId().equals(userOrgId));
    }

    private DtoResTeacher mapToDto(final EntityUser teacher, final EntityTeacherProfile profile) {
        DtoResTeacher dtoResTeacher = new DtoResTeacher();
        dtoResTeacher.setUuid(profile.getUuid());
        dtoResTeacher.setId(profile.getId());
        dtoResTeacher.setEmail(teacher.getEmail());
        dtoResTeacher.setPhone(teacher.getPhone());
        dtoResTeacher.setFirstName(teacher.getFirstName());
        dtoResTeacher.setLastName(teacher.getLastName());
        dtoResTeacher.setStatusId(profile.getStatusId());
        dtoResTeacher.setIsDeleted(profile.getIsDeleted());
        dtoResTeacher.setCreatedDate(profile.getCreatedDate());
        dtoResTeacher.setModifiedDate(profile.getModifiedDate());
        dtoResTeacher.setRole(teacher.getEntityRole().getName());
        dtoResTeacher.setOrganizationId(profile.getOrganizationId());
        dtoResTeacher.setPlanSettingsId(profile.getPlanSettingsId());
        dtoResTeacher.setBio(profile.getBio());
        dtoResTeacher.setMaxDailyHours(profile.getMaxDailyHours());
        dtoResTeacher.setPreferredStartTime(profile.getPreferredStartTime());
        dtoResTeacher.setPreferredEndTime(profile.getPreferredEndTime());
        dtoResTeacher.setInitials(profile.getInitials());
        dtoResTeacher.setDepartment(profile.getDepartment());
        dtoResTeacher.setQualification(profile.getQualification());
        dtoResTeacher.setContractType(profile.getContractType());
        dtoResTeacher.setControlNumber(profile.getControlNumber());
        dtoResTeacher.setNotes(profile.getNotes());

        if(profile.getPrimarySchedulePreference() != null) {
            Optional<DtoResSchedulePreference> primaryPrefDto = serviceSchedulePreference.getPreferenceByUuid(profile.getPrimarySchedulePreference().getUuid());
            primaryPrefDto.ifPresent(dtoResTeacher::setPrimarySchedulePreference);
        }

        if(profile.getSchedulePreferences() != null && !profile.getSchedulePreferences().isEmpty()) {
            List<DtoResSchedulePreference> prefDtos = new ArrayList<>();
            for(EntitySchedulePreference pref : profile.getSchedulePreferences()) {
                if(!pref.getIsDeleted()) {
                    Optional<DtoResSchedulePreference> prefDto = serviceSchedulePreference.getPreferenceByUuid(pref.getUuid());
                    prefDto.ifPresent(prefDtos::add);
                }
            }
            dtoResTeacher.setSchedulePreferences(prefDtos);
        }else {
            dtoResTeacher.setSchedulePreferences(new ArrayList<>());
        }
        return dtoResTeacher;
    }

    @Override
    public ApiResponse<List<DtoResTeacher>> getAllTeacherProfiles(int page, int size, String sortBy, String sortDirection) {
        try {
            final List<EntityTeacherProfile> profiles;
            if (utilAuthContext.isAdmin()) {
                profiles = repositoryTeacherProfile.findAllByIsDeletedFalse();
            } else {
                final Integer orgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                profiles = repositoryTeacherProfile.findByOrganizationIdAndIsDeletedFalse(orgId);
            }

            final List<DtoResTeacher> teacherDtos = new ArrayList<>();
            for (final EntityTeacherProfile profile : profiles) {
                final Optional<EntityUser> userOpt = repositoryUser.findById(profile.getUserId());
                if (userOpt.isPresent() && !userOpt.get().getIsDeleted()) {
                    final DtoResTeacher teacherDto = mapToDto(userOpt.get(), profile);
                    teacherDtos.add(teacherDto);
                }
            }

            return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHERS_RETRIEVE_SUCCESS), teacherDtos);
        } catch (final Exception ex) {
            ex.printStackTrace();
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityTeacherProfile>> getTeachersByPlanSettingsId(final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getTeacher(I18N_PLAN_SETTING_NOT_FOUND));
        }
        
        Integer organizationId = null;
        if (!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }
        
        List<EntityTeacherProfile> teachers;
        if (organizationId != null) {
            teachers = repositoryTeacherProfile.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                organizationId, planSettingsId);
        } else {
            teachers = repositoryTeacherProfile.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId);
        }
        
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_RETRIEVE_SUCCESS), teachers);
    }
}

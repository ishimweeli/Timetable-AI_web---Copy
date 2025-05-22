package com.ist.timetabling.Student.service.Impl;

import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.Auth.repository.RepositoryRole;
import com.ist.timetabling.Auth.service.ServiceEmail;
import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Core.util.UtilPasswordGenerator;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Student.dto.req.DtoReqStudent;
import com.ist.timetabling.Student.dto.res.DtoResStudent;
import com.ist.timetabling.Student.dto.res.DtoResStudentCsvUpload;
import com.ist.timetabling.Student.entity.EntityStudentProfile;
import com.ist.timetabling.Student.repository.RepositoryStudentProfile;
import com.ist.timetabling.Student.service.ServiceStudent;
import com.ist.timetabling.Student.util.StudentCsvMapper;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.exception.ExceptionUserNotFound;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ist.timetabling.Core.util.CSVReaderUtil;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_UNAUTHORIZED;
import static com.ist.timetabling.Organization.constant.ConstantOrganizationI18n.I18N_ORGANIZATION_NOT_FOUND;
import static com.ist.timetabling.Student.constant.ConstantStudentI18n.*;
import static com.ist.timetabling.Teacher.constant.ConstantTeacherI18n.I18N_TEACHER_NOT_FOUND;
import static com.ist.timetabling.User.constant.ConstantUserI18n.I18N_USER_NOT_FOUND;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceStudentImpl implements ServiceStudent {
    @Value("${spring.mail.username}")
    private String username;


    private final RepositoryStudentProfile repositoryStudentProfile;
    private final RepositoryUser repositoryUser;
    private final RepositoryRole repositoryRole;
    private final RepositoryOrganization repositoryOrganization;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;
    private final UtilPasswordGenerator utilPasswordGenerator;
    private final PasswordEncoder passwordEncoder;
    private final ServiceEmail serviceEmail;
    private final CSVReaderUtil csvReaderUtil;
    private final StudentCsvMapper studentCsvMapper;

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String STUDENT_ROLE = "STUDENT";

    @Override
    @Transactional
    public ApiResponse<DtoResStudentCsvUpload> importStudentsFromCsv(final DtoReqCsvUpload uploadRequest) {
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
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getStudent(I18N_ORGANIZATION_NOT_FOUND));
        }

        DtoResStudentCsvUpload.DtoResStudentCsvUploadBuilder resultBuilder = DtoResStudentCsvUpload.builder();
        List<DtoResStudent> createdStudents = new ArrayList<>();
        List<DtoResStudentCsvUpload.StudentImportError> errors = new ArrayList<>();

        try {
       
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    studentCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            int rowNumber = uploadRequest.getSkipHeaderRow() ? 2 : 1; 
            int successCount = 0;
            int errorCount = 0;

            for(CSVRecord record : records) {
                try {
                    
                    DtoReqStudent studentRequest = studentCsvMapper.mapToStudentRequest(record, organizationId, rowNumber);
                    
                   
                    Optional<EntityStudentProfile> existingStudent = repositoryStudentProfile.findByStudentIdNumberAndIsDeletedFalseAndOrganizationId(
                            studentRequest.getStudentIdNumber(), organizationId);

                    if(existingStudent.isPresent()) {
                        throw new Exception(i18n.getStudent(I18N_STUDENT_ID_EXISTS));
                    }

                
                    if(studentRequest.getEmail() != null && !studentRequest.getEmail().isEmpty()) {
                        Optional<EntityUser> existingEmail = repositoryUser.findByEmailAndIsDeletedFalse(studentRequest.getEmail());
                        if(existingEmail.isPresent()) {
                            throw new Exception(i18n.getStudent(I18N_STUDENT_EMAIL_EXISTS));
                        }
                    }

                
                    ApiResponse<DtoResStudent> response = createStudent(studentRequest);

                    if(response.isSuccess()) {
                        createdStudents.add(response.getData());
                        successCount++;
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                 
                    DtoResStudentCsvUpload.StudentImportError error = DtoResStudentCsvUpload.StudentImportError.builder()
                            .rowNumber(rowNumber)
                            .originalData(record.toString())
                            .errorMessage(e.getMessage())
                            .build();
                    errors.add(error);
                    errorCount++;
                }
                rowNumber++;
            }

            DtoResStudentCsvUpload result = resultBuilder
                    .createdStudents(createdStudents)
                    .errors(errors)
                    .totalProcessed(successCount + errorCount)
                    .successCount(successCount)
                    .errorCount(errorCount)
                    .build();

     
            String message;
            HttpStatus status;
            
            if(successCount > 0) {
                message = String.format("Processed %d students: %d created, %d errors",
                        result.getTotalProcessed(), result.getSuccessCount(), result.getErrorCount());
                status = HttpStatus.OK;
            }else {
                message = i18n.getStudent(I18N_STUDENT_CSV_IMPORT_FAILED) + ": No students were created";
                status = HttpStatus.BAD_REQUEST;
            }

            return ApiResponse.success(status, message, result);
            
        }catch(IOException e) {
            return ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    "Failed to process CSV file: " + e.getMessage()
            );
        }catch(Exception e) {
            return ApiResponse.error(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error importing students: " + e.getMessage()
            );
        }
    }
    @Override
    public ApiResponse<DtoResStudent> findStudentByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityStudentProfile> studentOpt = repositoryStudentProfile.findByUuidAndIsDeletedFalse(uuid);

        if(studentOpt.isPresent()) {
            EntityStudentProfile studentProfile = studentOpt.get();
            Optional<EntityUser> userOpt = repositoryUser.findById(studentProfile.getUserId());

            if(userOpt.isEmpty()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_USER_NOT_FOUND));
            }

            EntityUser user = userOpt.get();

            if(!utilAuthContext.isAdmin() && !studentProfile.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }

            return ApiResponse.success(mapToDto(user, studentProfile), i18n.getStudent(I18N_STUDENT_RETRIEVE_SUCCESS));
        }

        return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_STUDENT_NOT_FOUND));
    }

    @Override
    public ApiResponse<List<DtoResStudent>> getAllStudents(final Integer page, final Integer size,
                                                           final String sortBy, final String sortDirection,
                                                           final String keyword, final Integer orgId) {
        final I18n i18n = new I18n(httpServletRequest);

        if(keyword != null && !keyword.trim().isEmpty()) {
            List<DtoResStudent> results;
            long totalItems;
            if(utilAuthContext.isAdmin()) {
                if(orgId != null) {
                    List<EntityStudentProfile> profiles = repositoryStudentProfile
                            .searchByKeywordAndOrganizationId(keyword.toLowerCase(), orgId);
                    results = mapProfilesToDto(profiles);
                    totalItems = results.size();
                }else {
                    List<EntityStudentProfile> profiles = repositoryStudentProfile
                            .searchByKeywordNative(keyword.toLowerCase());
                    results = mapProfilesToDto(profiles);
                    totalItems = results.size();
                }
            }else {
                Integer currentOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                List<EntityStudentProfile> profiles = repositoryStudentProfile
                        .searchByKeywordAndOrganizationId(keyword.toLowerCase(), currentOrgId);
                results = mapProfilesToDto(profiles);
                totalItems = results.size();
            }
            return ApiResponse.<List<DtoResStudent>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                    .data(results)
                    .totalItems(totalItems)
                    .build();
        }else {
            final Pageable pageable = createSortablePageable(page, size, sortBy, sortDirection);
            if(utilAuthContext.isAdmin()) {
                if(orgId != null) {
                    final Page<EntityStudentProfile> profiles = repositoryStudentProfile
                            .findAllByIsDeletedFalseAndOrganizationId(orgId, pageable);
                    return ApiResponse.<List<DtoResStudent>>builder()
                            .status(HttpStatus.OK.value())
                            .success(true)
                            .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                            .data(profiles.map(profile -> {
                                Optional<EntityUser> userOpt = repositoryUser.findById(profile.getUserId());
                                return userOpt.map(user -> mapToDto(user, profile)).orElse(null);
                            }).toList())
                            .totalItems(profiles.getTotalElements())
                            .build();
                }else {
                    final Page<EntityStudentProfile> profiles = repositoryStudentProfile
                            .findAllByIsDeletedFalse(pageable);
                    return ApiResponse.<List<DtoResStudent>>builder()
                            .status(HttpStatus.OK.value())
                            .success(true)
                            .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                            .data(profiles.map(profile -> {
                                Optional<EntityUser> userOpt = repositoryUser.findById(profile.getUserId());
                                return userOpt.map(user -> mapToDto(user, profile)).orElse(null);
                            }).toList())
                            .totalItems(profiles.getTotalElements())
                            .build();
                }
            }else {
                Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
                return getAllStudentsByOrganization(organizationId, page, size, sortBy, sortDirection, null);
            }
        }
    }

    @Override
    public ApiResponse<List<DtoResStudent>> getAllStudentsByOrganization(final Integer organizationId,
                                                                         final Integer page,
                                                                         final Integer size,
                                                                         final String sortBy,
                                                                         final String sortDirection,
                                                                         final String keyword) {
        final I18n i18n = new I18n(httpServletRequest);

        if(!utilAuthContext.isAdmin() && !organizationId.equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        if(keyword != null && !keyword.trim().isEmpty()) {
            List<EntityStudentProfile> profiles = repositoryStudentProfile
                    .searchByKeywordAndOrganizationId(keyword.toLowerCase(), organizationId);
            List<DtoResStudent> results = mapProfilesToDto(profiles);
            return ApiResponse.<List<DtoResStudent>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                    .data(results)
                    .totalItems(results.size())
                    .build();
        }else {
            final Pageable pageable = createSortablePageable(page, size, sortBy, sortDirection);
            final Page<EntityStudentProfile> profiles = repositoryStudentProfile
                    .findAllByIsDeletedFalseAndOrganizationId(organizationId, pageable);
            return ApiResponse.<List<DtoResStudent>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                    .data(profiles.map(profile -> {
                        Optional<EntityUser> userOpt = repositoryUser.findById(profile.getUserId());
                        return userOpt.map(user -> mapToDto(user, profile)).orElse(null);
                    }).toList())
                    .totalItems(profiles.getTotalElements())
                    .build();
        }
    }

    @Override
    public ApiResponse<List<DtoResStudent>> getStudentsByDepartment(final String department,
                                                                    final Integer organizationId,
                                                                    final Integer page,
                                                                    final Integer size,
                                                                    final String sortBy,
                                                                    final String sortDirection,
                                                                    final String keyword) {
        final I18n i18n = new I18n(httpServletRequest);

        if(!utilAuthContext.isAdmin() && !organizationId.equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        if(keyword != null && !keyword.trim().isEmpty()) {
            List<EntityStudentProfile> profiles = repositoryStudentProfile
                    .searchByDepartmentAndKeywordAndOrganizationId(department, keyword.toLowerCase(), organizationId);
            List<DtoResStudent> results = mapProfilesToDto(profiles);
            return ApiResponse.<List<DtoResStudent>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                    .data(results)
                    .totalItems(results.size())
                    .build();
        }else {
            final Pageable pageable = createSortablePageable(page, size, sortBy, sortDirection);
            final Page<EntityStudentProfile> profiles = repositoryStudentProfile
                    .findAllByDepartmentAndIsDeletedFalseAndOrganizationId(department, organizationId, pageable);
            return ApiResponse.<List<DtoResStudent>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS))
                    .data(profiles.map(profile -> {
                        Optional<EntityUser> userOpt = repositoryUser.findById(profile.getUserId());
                        return userOpt.map(user -> mapToDto(user, profile)).orElse(null);
                    }).toList())
                    .totalItems(profiles.getTotalElements())
                    .build();
        }
    }

    @Override
    @Transactional
    public ApiResponse<DtoResStudent> createStudent(final DtoReqStudent dtoReqStudent) {
        System.out.println("this is student I am saving"+dtoReqStudent);
        final I18n i18n = new I18n(httpServletRequest);

        EntityOrganization entityOrganization;
        Integer organizationId;

        if(utilAuthContext.isAdmin()) {
            Optional<EntityOrganization> orgOpt = repositoryOrganization.findById(dtoReqStudent.getOrganizationId());
            if(orgOpt.isEmpty()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_ORGANIZATION_NOT_FOUND));
            }
            entityOrganization = orgOpt.get();
            organizationId = dtoReqStudent.getOrganizationId();
        }else {
            entityOrganization = utilAuthContext.getCurrentUser().getOrganization();
            organizationId = entityOrganization.getId();
            dtoReqStudent.setOrganizationId(organizationId);
        }

        Optional<EntityStudentProfile> existingStudent = repositoryStudentProfile.findByStudentIdNumberAndIsDeletedFalseAndOrganizationId(
                dtoReqStudent.getStudentIdNumber(), organizationId);

        if(existingStudent.isPresent()) {
            return ApiResponse.error(HttpStatus.CONFLICT, i18n.getStudent(I18N_STUDENT_ID_EXISTS));
        }

        if(dtoReqStudent.getEmail() != null && !dtoReqStudent.getEmail().isEmpty()) {
            Optional<EntityUser> existingEmail = repositoryUser.findByEmailAndIsDeletedFalse(dtoReqStudent.getEmail());
            if(existingEmail.isPresent()) {
                return ApiResponse.error(HttpStatus.CONFLICT, i18n.getStudent(I18N_STUDENT_EMAIL_EXISTS));
            }
        }

        String password = utilPasswordGenerator.generateSecurePassword(12);


        EntityRole entityRole = (EntityRole) repositoryRole.findByName(STUDENT_ROLE)
                .orElseThrow(() -> new ExceptionUserNotFound(i18n.getTeacher(I18N_USER_NOT_FOUND)));

        EntityUser entityUser = new EntityUser();
        entityUser.setPasswordHash(passwordEncoder.encode(password));
        entityUser.setEmail(dtoReqStudent.getEmail());
        entityUser.setFirstName(dtoReqStudent.getFullName());
        entityUser.setLastName("");
        entityUser.setPhone(dtoReqStudent.getPhone());
        entityUser.setIsActive(true);
        entityUser.setIsDeleted(false);
        entityUser.setStatusId(dtoReqStudent.getStatusId() != null ? dtoReqStudent.getStatusId() : 0);
        entityUser.setEntityRole(entityRole);
        entityUser.setOrganization(entityOrganization);
        entityUser.setCreatedBy(utilAuthContext.getCurrentUser().getId());
        entityUser.setModifiedBy(utilAuthContext.getCurrentUser().getId());

        final EntityUser entityUserSaved = repositoryUser.save(entityUser);

        EntityStudentProfile entityStudentProfile = EntityStudentProfile.builder()
                .userId(entityUser.getId())
                .organizationId(organizationId)
                .studentIdNumber(dtoReqStudent.getStudentIdNumber())
                .department(dtoReqStudent.getDepartment() != null ? dtoReqStudent.getDepartment() : "")
                .address(dtoReqStudent.getAddress() != null ? dtoReqStudent.getAddress() : "")
                .statusId(dtoReqStudent.getStatusId() != null ? dtoReqStudent.getStatusId() : 0)
                .studentClassId(dtoReqStudent.getClassId())
                .createdBy(utilAuthContext.getCurrentUser().getId())
                .modifiedBy(utilAuthContext.getCurrentUser().getId())
                .isDeleted(false)
                .build();

        entityStudentProfile = repositoryStudentProfile.save(entityStudentProfile);

        DtoResStudent dtoResStudent = mapToDto(entityUser, entityStudentProfile);

        try {
            DtoEmailRequest emailRequest = new DtoEmailRequest();
            emailRequest.setTo(Collections.singletonList(entityUser.getEmail()));
            emailRequest.setSubject("Your Student Account Has Been Created");
            emailRequest.setTemplateName("account-created");
            emailRequest.setFrom(username);

            Map<String, Object> templateVariables = new HashMap<>();
            templateVariables.put("firstName", entityUser.getFirstName());
            templateVariables.put("email", entityUser.getEmail());
            templateVariables.put("password", password);
            templateVariables.put("role", "Student");
            templateVariables.put("organizationName", entityOrganization.getName());
            templateVariables.put("loginUrl", "https://timetable.ist-legal.rw/login");
            templateVariables.put("studentId", entityStudentProfile.getStudentIdNumber());
            emailRequest.setTemplateVariables(templateVariables);

            serviceEmail.sendEmail(emailRequest);
        }catch(ExceptionUserNotFound e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getTeacher(I18N_TEACHER_NOT_FOUND));
        }

        if(dtoReqStudent.getClassId() != null) {
            entityStudentProfile.setStudentClassId(dtoReqStudent.getClassId());
        }

        return ApiResponse.success(HttpStatus.CREATED, i18n.getStudent(I18N_STUDENT_CREATE_SUCCESS), dtoResStudent);
    }

    @Override
    @Transactional
    public ApiResponse<DtoResStudent> updateStudent(final String uuid, final DtoReqStudent dtoReqStudent) {
        final I18n i18n = new I18n(httpServletRequest);
        final Optional<EntityStudentProfile> optionalStudent = repositoryStudentProfile.findByUuidAndIsDeletedFalse(uuid);

        if(optionalStudent.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_STUDENT_NOT_FOUND));
        }

        EntityStudentProfile entityStudentProfile = optionalStudent.get();
        Optional<EntityUser> optionalUser = repositoryUser.findById(entityStudentProfile.getUserId());

        if(optionalUser.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_USER_NOT_FOUND));
        }

        EntityUser entityUser = optionalUser.get();

        if(!utilAuthContext.isAdmin() && !entityStudentProfile.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        if(dtoReqStudent.getOrganizationId() != null) {
            if(utilAuthContext.isAdmin()) {
                entityStudentProfile.setOrganizationId(dtoReqStudent.getOrganizationId());
                Optional<EntityOrganization> orgOpt = repositoryOrganization.findById(dtoReqStudent.getOrganizationId());
                orgOpt.ifPresent(entityUser::setOrganization);
            } else if(!dtoReqStudent.getOrganizationId().equals(entityStudentProfile.getOrganizationId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
        }

        if(dtoReqStudent.getStudentIdNumber() != null &&
                !dtoReqStudent.getStudentIdNumber().equals(entityStudentProfile.getStudentIdNumber())) {

            Optional<EntityStudentProfile> existingStudent = repositoryStudentProfile.findByStudentIdNumberAndIsDeletedFalseAndOrganizationId(
                    dtoReqStudent.getStudentIdNumber(), entityStudentProfile.getOrganizationId());

            if(existingStudent.isPresent() && !existingStudent.get().getId().equals(entityStudentProfile.getId())) {
                return ApiResponse.error(HttpStatus.CONFLICT, i18n.getStudent(I18N_STUDENT_ID_EXISTS));
            }
        }

        if(dtoReqStudent.getEmail() != null &&
                !dtoReqStudent.getEmail().equals(entityUser.getEmail()) &&
                !dtoReqStudent.getEmail().isEmpty()) {

            Optional<EntityUser> existingEmail = repositoryUser.findByEmailAndIsDeletedFalse(dtoReqStudent.getEmail());

            if(existingEmail.isPresent() && !existingEmail.get().getId().equals(entityUser.getId())) {
                return ApiResponse.error(HttpStatus.CONFLICT, i18n.getStudent(I18N_STUDENT_EMAIL_EXISTS));
            }
        }

        if(dtoReqStudent.getFirstName() != null) {
            entityUser.setFirstName(dtoReqStudent.getFirstName());
        }
        if(dtoReqStudent.getLastName() != null) {
            entityUser.setLastName(dtoReqStudent.getLastName());
        }
        if(dtoReqStudent.getEmail() != null) {
            entityUser.setEmail(dtoReqStudent.getEmail());
        }
        if(dtoReqStudent.getPhone() != null) {
            entityUser.setPhone(dtoReqStudent.getPhone());
        }
        if(dtoReqStudent.getStatusId() != null) {
            entityUser.setStatusId(dtoReqStudent.getStatusId());
            entityStudentProfile.setStatusId(dtoReqStudent.getStatusId());
        }
        entityUser.setModifiedBy(utilAuthContext.getCurrentUser().getId());
        repositoryUser.save(entityUser);

        if(dtoReqStudent.getStudentIdNumber() != null) {
            entityStudentProfile.setStudentIdNumber(dtoReqStudent.getStudentIdNumber());
        }
        if(dtoReqStudent.getDepartment() != null) {
            entityStudentProfile.setDepartment(dtoReqStudent.getDepartment());
        }
        if(dtoReqStudent.getAddress() != null) {
            entityStudentProfile.setAddress(dtoReqStudent.getAddress());
        }
        if(dtoReqStudent.getNotes() != null) {
            entityStudentProfile.setNotes(dtoReqStudent.getNotes());
        }
        if(dtoReqStudent.getStatusId() != null) {
            entityStudentProfile.setStatusId(dtoReqStudent.getStatusId());
        }
        if(dtoReqStudent.getClassId() != null) {
            entityStudentProfile.setStudentClassId(dtoReqStudent.getClassId());
        }

        entityStudentProfile.setModifiedBy(utilAuthContext.getCurrentUser().getId());
        entityStudentProfile = repositoryStudentProfile.save(entityStudentProfile);

        return ApiResponse.success(mapToDto(entityUser, entityStudentProfile), i18n.getStudent(I18N_STUDENT_UPDATE_SUCCESS));
    }

    @Override
    @Transactional
    public ApiResponse<?> softDeleteStudent(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final Optional<EntityStudentProfile> optionalStudent = repositoryStudentProfile.findByUuidAndIsDeletedFalse(uuid);

        if(optionalStudent.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_STUDENT_NOT_FOUND));
        }

        final EntityStudentProfile entityStudent = optionalStudent.get();
        final Optional<EntityUser> optionalUser = repositoryUser.findById(entityStudent.getUserId());

        if(!utilAuthContext.isAdmin() && !entityStudent.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        entityStudent.setIsDeleted(true);
        entityStudent.setModifiedBy(utilAuthContext.getCurrentUser().getId());
        repositoryStudentProfile.save(entityStudent);

        if(optionalUser.isPresent()) {
            EntityUser entityUser = optionalUser.get();
            entityUser.setIsDeleted(true);
            entityUser.setModifiedBy(utilAuthContext.getCurrentUser().getId());
            repositoryUser.save(entityUser);
        }

        return ApiResponse.success(i18n.getStudent(I18N__STUDENT_DELETE_SUCCESS));
    }

    @Transactional
    public ApiResponse<DtoResStudent> assignStudentToClass(final String studentUuid, final Integer classId) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityStudentProfile> studentOpt = repositoryStudentProfile.findByUuidAndIsDeletedFalse(studentUuid);
        if(studentOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_STUDENT_NOT_FOUND));
        }
        final EntityStudentProfile entityStudentProfile = studentOpt.get();
        System.out.println("Assigning student: " + studentUuid + " to class: " + classId+studentOpt);
        entityStudentProfile.setStudentClassId(classId);
        entityStudentProfile.setModifiedBy(utilAuthContext.getCurrentUser().getId());
        repositoryStudentProfile.save(entityStudentProfile);
        final Optional<EntityUser> userOpt = repositoryUser.findById(entityStudentProfile.getUserId());
        if(userOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getStudent(I18N_USER_NOT_FOUND));
        }
        return ApiResponse.success(mapToDto(userOpt.get(), entityStudentProfile), i18n.getStudent(I18N_STUDENT_ASSIGN_CLASS_SUCCESS));
    }

    @Transactional
    public ApiResponse<List<DtoResStudent>> assignStudentsToClass(final List<String> studentUuids, final Integer classId) {
        final I18n i18n = new I18n(httpServletRequest);
        List<DtoResStudent> updatedStudents = new ArrayList<>();
        for(String studentUuid : studentUuids) {
            Optional<EntityStudentProfile> studentOpt = repositoryStudentProfile.findByUuidAndIsDeletedFalse(studentUuid);
            if(studentOpt.isPresent()) {
                final EntityStudentProfile entityStudentProfile = studentOpt.get();
                System.out.println("Assigning student: " + studentUuid + " to class: " + classId+studentOpt);
                entityStudentProfile.setStudentClassId(classId);
                entityStudentProfile.setModifiedBy(utilAuthContext.getCurrentUser().getId());
                repositoryStudentProfile.save(entityStudentProfile);
                final Optional<EntityUser> userOpt = repositoryUser.findById(entityStudentProfile.getUserId());
                userOpt.ifPresent(entityUser -> updatedStudents.add(mapToDto(entityUser, entityStudentProfile)));
            }
        }
        return ApiResponse.success(updatedStudents, i18n.getStudent(I18N_STUDENT_ASSIGN_CLASS_SUCCESS));
    }

    public ApiResponse<List<DtoResStudent>> getStudentsByClassId(final Integer classId) {
        final I18n i18n = new I18n(httpServletRequest);
        List<EntityStudentProfile> profiles = repositoryStudentProfile.findAllByStudentClassIdAndIsDeletedFalse(classId);
        List<DtoResStudent> results = mapProfilesToDto(profiles);
        return ApiResponse.success(results, i18n.getStudent(I18N_STUDENTS_RETRIEVE_SUCCESS));
    }

    public ApiResponse<List<DtoResStudent>> getUnassignedStudents() {
        final I18n i18n = new I18n(httpServletRequest);
        List<EntityStudentProfile> profiles = repositoryStudentProfile.findUnassignedStudents();
        List<DtoResStudent> results = mapProfilesToDto(profiles);
        return ApiResponse.success(results, i18n.getStudent(I18N_STUDENT_UNASSIGNED_FETCH_SUCCESS));
    }

    // Helper methods for search and sort functionality
    private Pageable createSortablePageable(Integer page, Integer size, String sortBy, String sortDirection) {
        int pageNumber = page != null ? page : ApiResponse.DEFAULT_PAGE_NUMBER;
        int pageSize = size != null ? size : ApiResponse.DEFAULT_PAGE_SIZE;

        if(sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = sortDirection != null && sortDirection.equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Sort sort = Sort.by(direction, sortBy);
            return PageRequest.of(pageNumber, pageSize, sort);
        }else {
            return PageRequest.of(pageNumber, pageSize);
        }
    }

    private List<DtoResStudent> mapProfilesToDto(List<EntityStudentProfile> profiles) {
        return profiles.stream()
                .map(profile -> {
                    Optional<EntityUser> userOpt = repositoryUser.findById(profile.getUserId());
                    return userOpt.map(user -> mapToDto(user, profile)).orElse(null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private DtoResStudent mapToDto(EntityUser user, EntityStudentProfile profile) {
        DtoResStudent dto = new DtoResStudent();
        dto.setId(profile.getId());
        dto.setUuid(profile.getUuid());
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStudentIdNumber(profile.getStudentIdNumber());
        dto.setDepartment(profile.getDepartment());
        dto.setAddress(profile.getAddress());
        dto.setOrganizationId(profile.getOrganizationId());
        dto.setNotes(profile.getNotes());
        dto.setStatusId(profile.getStatusId());
        dto.setCreatedDate(profile.getCreatedDate());
        dto.setClassId(profile.getStudentClassId());
        dto.setModifiedDate(profile.getModifiedDate());
        return dto;
    }
}

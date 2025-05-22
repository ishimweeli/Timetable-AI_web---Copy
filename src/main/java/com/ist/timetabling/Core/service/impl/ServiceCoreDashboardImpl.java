package com.ist.timetabling.Core.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
// import com.ist.timetabling.Calendar.repository.RepositoryCalendar;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Core.dto.res.DtoResCoreDashboard;
import com.ist.timetabling.Core.dto.res.DtoResOrgStatistics;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.service.ServiceCoreDashboard;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Room.repository.RepositoryRoom;
import com.ist.timetabling.Rule.repository.RepositoryRule;
import com.ist.timetabling.Student.repository.RepositoryStudentProfile;
import com.ist.timetabling.Subject.repository.RepositorySubject;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherAvailability;
import com.ist.timetabling.Timetable.repository.RepositoryTimetable;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryAdminProfile;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;
import static com.ist.timetabling.Core.constant.ConstantCoreI18n.*;


@Service
public class ServiceCoreDashboardImpl implements ServiceCoreDashboard {

    private final RepositoryTimetable repositoryTimetable;
    private final RepositoryRule repositoryRule;
    private final RepositorySubject repositorySubject;
    private final RepositoryTeacherAvailability repositoryTeacherAvailability;
    private final RepositoryOrganization repositoryOrganization;
    private final RepositoryRoom repositoryRoom;
    // private final RepositoryCalendar repositoryCalendar;
    private final RepositoryAdminProfile repositoryAdminProfile;
    private final RepositoryClass repositoryClass;
    private final RepositoryUser repositoryUser;
    private final HttpServletRequest httpServletRequest;
    private final RepositoryStudentProfile repositoryStudentProfile;
    private final UtilAuthContext utilAuthContext;


    public ServiceCoreDashboardImpl(final RepositoryTimetable repositoryTimetable,
                                   final RepositoryRule repositoryRule,
                                   final RepositorySubject repositorySubject,
                                   final RepositoryTeacherAvailability repositoryTeacherAvailability,
                                   final RepositoryOrganization repositoryOrganization,
                                   final RepositoryRoom repositoryRoom,
                                //    final RepositoryCalendar repositoryCalendar,
                                   final RepositoryAdminProfile repositoryAdminProfile,
                                   final RepositoryClass repositoryClass,
                                   final RepositoryUser repositoryUser,
                                   final HttpServletRequest httpServletRequest,
                                   final RepositoryStudentProfile repositoryStudentProfile,
                                   final UtilAuthContext utilAuthContext) {
        this.repositoryTimetable = repositoryTimetable;
        this.repositoryRule = repositoryRule;
        this.repositorySubject = repositorySubject;
        this.repositoryTeacherAvailability = repositoryTeacherAvailability;
        this.repositoryOrganization = repositoryOrganization;
        this.repositoryRoom = repositoryRoom;
        // this.repositoryCalendar = repositoryCalendar;
        this.repositoryAdminProfile = repositoryAdminProfile;
        this.repositoryClass = repositoryClass;
        this.repositoryUser = repositoryUser;
        this.httpServletRequest = httpServletRequest;
        this.repositoryStudentProfile = repositoryStudentProfile;
        this.utilAuthContext = utilAuthContext;
    }

    @Override
    public ApiResponse<List<DtoResCoreDashboard>> getDashboardStatistics() {
        final I18n i18n = new I18n(httpServletRequest);
        final DtoResCoreDashboard statistics = DtoResCoreDashboard.builder()
            .countClass(repositoryClass.countByIsDeletedFalse())
            // .countCalendar(repositoryCalendar.countByIsDeletedFalse())
            .countRoom(repositoryRoom.countByIsDeletedFalse())
            .countRule(repositoryRule.countByIsDeletedFalse())
            .countSubject(repositorySubject.countByIsDeletedFalse())
            .countTimetable(repositoryTimetable.countByIsDeletedFalse())
            .countOrganization(repositoryOrganization.countByIsDeletedFalse())
            .countStudent(repositoryUser.countByEntityRoleNameAndIsDeletedFalse("STUDENT"))
            .countTeacher(repositoryUser.countByEntityRoleNameAndIsDeletedFalse("TEACHER"))
            .countAdmin(repositoryUser.countByEntityRoleNameAndIsDeletedFalse("ADMIN"))
            .countManager(repositoryUser.countByRoleAndIsDeletedFalse("MANAGER"))
            .countUser(repositoryUser.countByIsDeletedFalse())
            .build();

        return ApiResponse.success(List.of(statistics), i18n.getCore(DASHBOARD_STATISTICS_RETRIEVE_SUCCESS));
    }

    @Override
    public ApiResponse<DtoResOrgStatistics> getOrganizationStatistics() {
        final I18n i18n = new I18n(httpServletRequest);

      
        EntityUser currentUser = utilAuthContext.getCurrentUser();
        if(currentUser == null) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, i18n.getAuth("auth.error.unauthorized"), null);
        }

       
        EntityOrganization organization = currentUser.getOrganization();
        if(organization == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getCore("core.error.organization.not.found"), null);
        }

        Integer organizationId = organization.getId();

        
        final DtoResOrgStatistics statistics = DtoResOrgStatistics.builder()
            .countClass(repositoryClass.countByOrganizationIdAndIsDeletedFalse(organizationId))
            .countRoom(repositoryRoom.countByOrganizationIdAndIsDeletedFalse(organizationId))
            .countSubject(repositorySubject.countByOrganizationIdAndIsDeletedFalse(organizationId))
            .countTeacher(repositoryUser.countByOrganizationIdAndRoleAndIsDeletedFalse(organizationId, "TEACHER"))
            .countStudent(repositoryUser.countByOrganizationIdAndRoleAndIsDeletedFalse(organizationId, "STUDENT"))
            .countUser(repositoryUser.countByOrganizationIdAndIsDeletedFalse(organizationId))
            .countRule(repositoryRule.countByOrganizationIdAndIsDeletedFalse(organizationId))
            .countTimetable(repositoryTimetable.countByOrganizationIdAndIsDeletedFalse(organizationId))
            // .countCalendar(repositoryCalendar.countByOrganizationIdAndIsDeletedFalse(organizationId))
            .build();

        return ApiResponse.success(statistics, i18n.getCore(ORGANIZATION_STATISTICS_RETRIEVE_SUCCESS));
    }
}

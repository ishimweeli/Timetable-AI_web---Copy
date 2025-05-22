package com.ist.timetabling.Student.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Student.dto.req.DtoReqStudent;
import com.ist.timetabling.Student.dto.res.DtoResStudent;
import com.ist.timetabling.Student.dto.res.DtoResStudentCsvUpload;

import java.util.List;

public interface ServiceStudent {

    ApiResponse<DtoResStudent> findStudentByUuid(final String uuid);

    ApiResponse<List<DtoResStudent>> getAllStudents(final Integer page,
                                                    final Integer size,
                                                    final String sortBy,
                                                    final String sortDirection,
                                                    final String keyword,
                                                    final Integer orgId);

    ApiResponse<List<DtoResStudent>> getAllStudentsByOrganization(final Integer organizationId,
                                                                  final Integer page,
                                                                  final Integer size,
                                                                  final String sortBy,
                                                                  final String sortDirection,
                                                                  final String keyword);

    ApiResponse<List<DtoResStudent>> getStudentsByDepartment(final String department,
                                                             final Integer organizationId,
                                                             final Integer page,
                                                             final Integer size,
                                                             final String sortBy,
                                                             final String sortDirection,
                                                             final String keyword);

    ApiResponse<DtoResStudent> createStudent(final DtoReqStudent dtoReqStudent);

    ApiResponse<DtoResStudent> updateStudent(final String uuid, final DtoReqStudent dtoReqStudent);

    ApiResponse<?> softDeleteStudent(final String uuid);
    ApiResponse<DtoResStudentCsvUpload> importStudentsFromCsv(final DtoReqCsvUpload uploadRequest);

    ApiResponse<DtoResStudent> assignStudentToClass(final String studentUuid, final Integer classId);
    ApiResponse<List<DtoResStudent>> assignStudentsToClass(final List<String> studentUuids, final Integer classId);
    ApiResponse<List<DtoResStudent>> getStudentsByClassId(final Integer classId);
    ApiResponse<List<DtoResStudent>> getUnassignedStudents();
}
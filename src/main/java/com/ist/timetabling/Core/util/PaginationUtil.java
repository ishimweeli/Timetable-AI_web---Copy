package com.ist.timetabling.Core.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageImpl;
import java.util.List;


public class PaginationUtil {

    private PaginationUtil() {
    }

    public static Pageable createPageable(final Integer page, final Integer size, final int defaultPageNumber, final int defaultPageSize) {
        final int pageNumber = (page == null) ? defaultPageNumber : page;
        final int pageSize = (size == null) ? defaultPageSize : size;

        return PageRequest.of(pageNumber, pageSize);
    }

    public static Pageable createPageable(final Integer page, final Integer size, final String sortBy, final String sortDirection, final int defaultPageNumber, int defaultPageSize) {
        final int pageNumber = (page == null) ? defaultPageNumber : page;
        final int pageSize = (size == null) ? defaultPageSize : size;
        final String sortField = (sortBy == null) ? "name" : sortBy;

        final Sort sort = Sort.by(sortDirection != null && sortDirection.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC, sortField);

        return PageRequest.of(pageNumber, pageSize, sort);
    }

    /**
     * Converts a List<T> to a Page<T> using the provided Pageable.
     */
    public static <T> org.springframework.data.domain.Page<T> toPage(List<T> list, Pageable pageable) {
        if (list == null) {
            list = java.util.Collections.emptyList();
        }
        int total = list.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), total);
        List<T> content = (start <= end) ? list.subList(start, end) : java.util.Collections.emptyList();
        return new PageImpl<>(content, pageable, total);
    }

}
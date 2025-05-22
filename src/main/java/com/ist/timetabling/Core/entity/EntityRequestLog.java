package com.ist.timetabling.Core.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityRequestLog.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityRequestLog {

    public static final String TABLE = "request_logs";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Long id;
    public static final String ID = "request_log_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "request_log_uuid";

    @Column(name = USER_ID, nullable = false)
    private int userId;
    public static final String USER_ID = "request_log_user_id";

    @Column(name = REQUEST_TIME, nullable = false)
    private LocalDateTime requestTime;
    public static final String REQUEST_TIME = "request_log_request_time";

    @Column(name = TABLE_NAME, nullable = false)
    private String tableName;
    public static final String TABLE_NAME = "request_log_table_name";

    @Column(name = ACTION_TYPE, nullable = false)
    private String actionType;
    public static final String ACTION_TYPE = "request_log_action_type";

    @Lob
    @Column(name = REQUEST_DATA, nullable = false)
    private String requestData;
    public static final String REQUEST_DATA = "request_log_request_data";

    @Column(name = RESPONSE_CODE, nullable = false)
    private int responseCode;
    public static final String RESPONSE_CODE = "request_log_response_code";

    @Lob
    @Column(name = RESPONSE_MESSAGE, nullable = false)
    private String responseMessage;
    public static final String RESPONSE_MESSAGE = "request_log_response_message";

    @Column(name = IP_ADDRESS, nullable = false)
    private String ipAddress;
    public static final String IP_ADDRESS = "request_log_ip_address";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "request_log_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "request_log_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "request_log_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "request_log_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "request_log_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "request_log_is_deleted";

}

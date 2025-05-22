package com.ist.timetabling.Organization.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Table(name = EntityOrganizationUiSettings.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityOrganizationUiSettings {
    public static final String TABLE = "organization_ui_settings";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "organization_ui_settings_id";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId;
    public static final String ORGANIZATION_ID = "organization_id";

    @Column(name = COLOR_PALETTE, nullable = false)
    private String colorPalette = "blue";
    public static final String COLOR_PALETTE = "color_palette";

    @Column(name = FONT, nullable = false)
    private String font = "Inter";
    public static final String FONT = "font";

    @Column(name = FONT_SIZE, nullable = false)
    private String fontSize = "16px";
    public static final String FONT_SIZE = "font_size";

    @Column(name = CELL_WIDTH, nullable = false)
    private Integer cellWidth = 120;
    public static final String CELL_WIDTH = "cell_width";

    @Column(name = CELL_HEIGHT, nullable = false)
    private Integer cellHeight = 40;
    public static final String CELL_HEIGHT = "cell_height";

    @Column(name = THEME, nullable = false)
    private String theme = "light";
    public static final String THEME = "theme";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "modified_date";
} 
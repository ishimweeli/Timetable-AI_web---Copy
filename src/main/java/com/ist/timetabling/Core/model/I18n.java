package com.ist.timetabling.Core.model;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;


@Component
public class I18n {

    @Autowired
    private HttpServletRequest httpServletRequest;

    final Locale locale;

    public I18n() {
        this((HttpServletRequest) null);
    }

    public I18n(final Locale locale) {
        this.locale = locale;
    }

    public I18n(final HttpServletRequest httpServletRequest) {

        if(httpServletRequest != null) {
            this.httpServletRequest = httpServletRequest;
        }

        if(this.httpServletRequest == null) {
            this.locale = Locale.getDefault();
            return;
        }

        final String lang = this.httpServletRequest.getParameter("lang");
        if(lang != null && !lang.isBlank()) {
            this.locale = new Locale(lang);
            return;
        }

        final String language = this.httpServletRequest.getParameter("language");
        if(language != null && !language.isBlank()) {
            this.locale = new Locale(language);
            return;
        }

        final String languageHeader = this.httpServletRequest.getHeader("Accept-Language");
        if(languageHeader != null && !languageHeader.isBlank()) {
            this.locale = new Locale(languageHeader);
            return;
        }

        if(this.httpServletRequest.getLocale() != null) {
            this.locale = this.httpServletRequest.getLocale();
        }else {
            this.locale = Locale.getDefault();
        }

    }

    public String get(final String module, final String key) {
        try {
            final ResourceBundle resourceBundle = ResourceBundle.getBundle("i18n_"+ module.toLowerCase(), locale);
            return resourceBundle.getString(key);
        }catch (final MissingResourceException missingResourceException) {
            return key;
        }
    }

    public String get(final String key) {
        final String module = key.split("\\.")[0];
        return get(module, key);
    }

    public String getRoom(final String key) {
        return get("room", key);
    }
    
    public String getAuth(final String key) {
        return get("auth", key);
    }

    public String getTimetable(final String key) {
        return get("timetable", key);
    }

    public String getOrganization(final String key) {
        return get("organization", key);
    }
  
    public String getAdmin(final String key) {
        return get("user", key);
    }

    public String getTeacher(final String key) {
        return get("teacher", key);
    }

    public String getClass(final String key) {
        return get("class", key);
    }

    public String getCore(final String key) {
        return get("core", key);
    }

    public String getStudent(final String key) {
        return get("student", key);
    }

    public String getSubject(final String key) {
        return get("subject", key);
    }

    public String getCalendar(final String key) {
        return get("calendar", key);
    }

    public String getRule(final String key) {
        return get("rule", key);
    }

    public String getUser(final String key) {
        return get("user", key);
    }

    public String getPeriod(final String key) {
        return get("period", key);
    }

    public String getClassBand(final String key) { return get("classband", key);}

    public String getPlanSetting(final String key) { return get("plansetting",key);}

    public String getManager(final String key) { return get("plansetting",key);}

    public String getBinding(final String key) { return get("binding",key);}

    public String getNotification(final String key) { return get("notification",key);}

}

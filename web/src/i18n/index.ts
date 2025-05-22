import { en } from './en';
import { fr } from './fr';
import { de } from './de';
import { sv } from './sv';
import { da } from './da';
import { no } from './no';
import { pl } from './pl';
import { rw } from './rw';

const languages = {
  en,
  fr,
  de,
  sv,
  da,
  no,
  pl,
  rw,
};

export type Languages = keyof typeof languages;
export type Translation = typeof en;

export class I18n {
  private currentLang: Languages = 'en';

  constructor(initialLang: Languages = 'en') {
    this.currentLang = initialLang;
  }

  t(key: string, params?: Record<string, string>): string | string[] {
    const langData = languages[this.currentLang];
    if (langData[key] !== undefined) {
      const value = langData[key];
      if (typeof value === 'string') {
        return this.applyParams(value, params);
      } else if (Array.isArray(value)) {
        return value;
      }
    }

    const keys = key.split('.');
    let value: any = langData;

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        if (languages['en'][key] !== undefined && typeof languages['en'][key] === 'string') {
          const fallbackValue = languages['en'][key] as string;
          return this.applyParams(fallbackValue, params);
        }

        let fallbackValue = languages['en'];
        for (const fallbackKey of keys) {
          if (fallbackValue && fallbackValue[fallbackKey] !== undefined) {
            fallbackValue = fallbackValue[fallbackKey];
          } else {
            return key;
          }
        }

        if (typeof fallbackValue === 'string') {
          return this.applyParams(fallbackValue, params);
        } else if (Array.isArray(fallbackValue)) {
          return fallbackValue;
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }
    }

    if (typeof value === 'string') {
      return this.applyParams(value, params);
    } else if (Array.isArray(value)) {
      return value;
    }

    return key;
  }

  private applyParams(text: string, params?: Record<string, string>): string {
    if(!params) return text;

    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
      return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }, text);
  }

  setLanguage(lang: Languages): void {
    if(languages[lang]) {
      this.currentLang = lang;
      localStorage.setItem('preferred-language', lang);
    }else {
      console.warn(`Language not supported: ${lang}`);
    }
  }

  getCurrentLanguage(): Languages {
    return this.currentLang;
  }
}

export const i18n = new I18n();

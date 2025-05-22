import React from "react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { useI18n } from "@/hook/useI18n";
import { MapPin } from "lucide-react";
import { enUS, da, de, pl, sv, fr, it, es} from 'date-fns/locale';
import { Locale } from 'date-fns';

interface CalendarHeaderProps {
  view: "day" | "week" | "month";
  currentDate: Date;
  roomFilter?: {
    roomId: string;
    roomName?: string;
  };
}

const localeMap: Record<string, Locale> = {
  en: enUS,
  da,
  de,
  pl,
  sv,
  fr,
  it,
  es,
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ view, currentDate, roomFilter }) => {
  const { t, currentLanguage } = useI18n();
  const locale = localeMap[currentLanguage] || enUS;
  const isRw = currentLanguage === 'rw';

  const getArrayFromTranslation = (key: string): string[] => {
    const result = t(key, { returnObjects: true });
    if (typeof result === 'boolean') return [];
    return Array.isArray(result) && result.every(item => typeof item === 'string') ? result : [];
  };

  let monthsRaw = getArrayFromTranslation('calendar.months');
  let weekdaysRaw = getArrayFromTranslation('calendar.weekdays');
  let weekdaysShortRaw = getArrayFromTranslation('calendar.weekdaysShort');
  const rwMonths = monthsRaw;
  const rwWeekdays = weekdaysRaw;
  const rwWeekdaysShort = weekdaysShortRaw;

  const getHeaderText = () => {
    const dateFormat = t("calendar.dateFormat") || "EEEE, MMMM d, yyyy";
    const weekRangeFormat = t("calendar.weekRangeFormat") || "{{start}} - {{end}}, {{year}}";
    const dayHeaderFormat = t("calendar.dayHeaderFormat") || "{{date}}";
    const monthHeaderFormat = t("calendar.monthHeaderFormat") || "{{month}} {{year}}";
    switch (view) {
      case "day": {
        if (isRw) {
          let dayIdx = currentDate.getDay() - 1;
          if (dayIdx < 0) dayIdx = 6;
          const day = rwWeekdays[dayIdx] || '';
          const month = rwMonths[currentDate.getMonth()] || '';
          const dateStr = `${day}, ${currentDate.getDate()} ${month} ${currentDate.getFullYear()}`;
          return (typeof dayHeaderFormat === 'string' ? dayHeaderFormat : '{{date}}').replace("{{date}}", dateStr);
        } else {
          const dateStr = format(currentDate, dateFormat, { locale });
          return (typeof dayHeaderFormat === 'string' ? dayHeaderFormat : '{{date}}').replace("{{date}}", dateStr);
        }
      }
      case "week": {
        const start = startOfWeek(currentDate, { weekStartsOn: 1, locale });
        const end = endOfWeek(currentDate, { weekStartsOn: 1, locale });
        const sameMonth = start.getMonth() === end.getMonth();
        const sameYear = start.getFullYear() === end.getFullYear();
        let startStr, endStr, yearStr;
        if (isRw) {
          startStr = `${start.getDate()} ${String(rwMonths[start.getMonth()] || '')}`;
          endStr = `${end.getDate()} ${String(rwMonths[end.getMonth()] || '')}`;
        } else {
          startStr = format(start, sameMonth ? "d" : "d MMMM", { locale });
          endStr = format(end, "d MMMM", { locale });
        }
        yearStr = format(end, "yyyy", { locale });
        return weekRangeFormat.replace("{{start}}", startStr).replace("{{end}}", endStr).replace("{{year}}", yearStr);
      }
      case "month": {
        if (isRw) {
          const month = String(rwMonths[currentDate.getMonth()] || '');
          const year = String(currentDate.getFullYear());
          return (typeof monthHeaderFormat === 'string' ? monthHeaderFormat : '{{month}} {{year}}').replace("{{month}}", month).replace("{{year}}", year);
        } else {
          const month = format(currentDate, "MMMM", { locale });
          const year = format(currentDate, "yyyy", { locale });
          return (typeof monthHeaderFormat === 'string' ? monthHeaderFormat : '{{month}} {{year}}').replace("{{month}}", month).replace("{{year}}", year);
        }
      }
      default:
        return "";
    }
  };

  const getDayHeaders = () => {
    if (isRw && rwWeekdaysShort.length) {
      return rwWeekdaysShort.map((name: string, i: number) => (
        <div key={i} className="flex-1 text-center font-medium py-2 text-xs sm:text-sm">
          {name}
        </div>
      ));
    } else {
    const days = [];
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1, locale });
    for(let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days.push(
        <div
          key={i}
            className="flex-1 text-center font-medium py-2 text-xs sm:text-sm"
        >
            {format(day, "EEE", { locale })}
        </div>
      );
    }
    return days;
    }
  };

  return (
    <div className="mt-2">
      <h2 className="text-xl font-semibold text-center mb-2">
        {getHeaderText()}
        {roomFilter && roomFilter.roomId !== '_all' && roomFilter.roomName && (
          <span className="ml-2 inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            <MapPin className="h-3 w-3 mr-1" />
            {roomFilter.roomName}
          </span>
        )}
      </h2>

      {view === "week" && (
        <div className="flex border-b">
          {getDayHeaders()}
        </div>
      )}

      {view === "month" && (
        <div className="grid grid-cols-7 border-b">
          {isRw && rwWeekdaysShort.length
            ? rwWeekdaysShort.map((name: string, i: number) => (
                <div key={i} className="text-center font-medium py-2 text-[10px] sm:text-sm">
                  {name}
                </div>
              ))
            : Array.from({ length: 7 }).map((_, i) => {
                const dayInstance = addDays(startOfWeek(new Date(), { weekStartsOn: 1, locale }), i);
                return (
                  <div key={i} className="text-center font-medium py-2 text-[10px] sm:text-sm">
                    {format(dayInstance, "EEE", { locale })}
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;

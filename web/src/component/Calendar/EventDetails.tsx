import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, Book, RotateCcw, BadgeInfo } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { useI18n } from "@/hook/useI18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/component/Ui/dialog";
import { Badge } from "@/component/Ui/badge";
import { formatTimeRangeSimple } from "@/util/dateUtils";

interface CalendarEvent {
  uuid: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  classUuid?: string;
  className?: string;
  teacherUuid?: string;
  teacherName?: string;
  roomUuid?: string;
  roomName?: string;
  subjectUuid?: string;
  subjectName?: string;
  subjectColor?: string;
  description?: string;
  status?: string;
}

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate?: (updatedEvent: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onUpdate, onDelete }) => {
  const { t } = useI18n();
  const startTime = new Date(event.startDateTime);
  const endTime = new Date(event.endDateTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); 
  
  const handleEdit = () => {
    if(onUpdate) {
      onUpdate(event);
    }
  };
  
  const handleDelete = () => {
    if(onDelete) {
      onDelete(event.uuid);
    }
  };
  
  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {/* Event time */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{format(startTime, "EEEE, MMMM d, yyyy")}</div>
              <div>
                {formatTimeRangeSimple(startTime, endTime)} ({duration} {t("calendar.minutes")})
              </div>
              
              {event.isRecurring && (
                <div className="flex items-center gap-1.5 mt-1">
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event.recurringPattern === "WEEKLY" 
                      ? t("calendar.repeatsWeekly") 
                      : t("calendar.repeating")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Class */}
          {event.className && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{t("calendar.class")}</div>
                <div>{event.className}</div>
              </div>
            </div>
          )}
          
          {/* Teacher */}
          {event.teacherName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{t("calendar.teacher")}</div>
                <div>{event.teacherName}</div>
              </div>
            </div>
          )}
          
          {/* Subject */}
          {event.subjectName && (
            <div className="flex items-start gap-3">
              <Book className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{t("calendar.subject")}</div>
                <div className="flex items-center gap-2">
                  {event.subjectName}
                  {event.subjectColor && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: event.subjectColor }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Room */}
          {event.roomName && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{t("calendar.room")}</div>
                <div>{event.roomName}</div>
              </div>
            </div>
          )}
          
          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <BadgeInfo className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{t("calendar.description")}</div>
                <div className="text-sm">{event.description}</div>
              </div>
            </div>
          )}
          
          {/* Status */}
          {event.status && (
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {event.status}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          {onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.actions.delete")}
            </Button>
          )}
          {onUpdate && (
            <Button variant="outline" onClick={handleEdit}>
              {t("common.actions.edit")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetails; 

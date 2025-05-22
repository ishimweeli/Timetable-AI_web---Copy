import React from 'react';
import { TimetableClass } from '@/type/Timetable/TypeTimetable';
import { Button } from '@/component/Ui/button';
import { mockClasses } from '@/store/Timetable/mockClassData';

interface ClassSelectorProps {
  classes?: TimetableClass[];
  selectedClass: TimetableClass | null;
  onClassChange: (classData: TimetableClass) => void;
  isLoading?: boolean;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes = mockClasses,
  selectedClass,
  onClassChange,
  isLoading = false
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        Select Class:
      </label>
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2" style={{maxHeight: '120px'}}>
        {Array.isArray(classes) && classes.length > 0 ? (
          classes.map(classItem => (
            <Button
              key={classItem.uuid}
              variant={selectedClass?.uuid === classItem.uuid ? "default" : "outline"}
              onClick={() => onClassChange(classItem)}
              size="sm"
              className="whitespace-nowrap flex items-center gap-1"
              disabled={isLoading}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: classItem.color }}
              />
              {classItem.name}
            </Button>
          ))
        ) : (
          <div className="text-muted-foreground">No classes available</div>
        )}
      </div>
    </div>
  );
};

export default ClassSelector;

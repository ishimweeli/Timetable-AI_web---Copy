import React from "react";

interface RuleScheduleCalendarHeaderProps {
  days: number[];
  dayNames: { [key: number]: string };
}

const RuleScheduleCalendarHeader: React.FC<RuleScheduleCalendarHeaderProps> = ({
  days,
  dayNames,
}) => {
  return (
    <>
      <div className="py-3 bg-gray-100 border border-gray-300 font-bold text-center">
        #
      </div>
      <div className="py-3 bg-gray-100 border border-gray-300 font-bold text-center">
        Time
      </div>
      {days.map((day) => (
        <div
          key={day}
          className="py-3 bg-gray-100 border border-gray-300 font-bold text-center"
        >
          {dayNames[day]}
        </div>
      ))}
    </>
  );
};

export default RuleScheduleCalendarHeader;

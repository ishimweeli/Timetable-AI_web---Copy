// import React, { useMemo } from 'react';
// import TimetableCell from './TimetableCell';

// // Map day numbers to day names
// const DAY_NAME_MAP = {
//   1: 'Monday',
//   2: 'Tuesday',
//   3: 'Wednesday',
//   4: 'Thursday',
//   5: 'Friday',
//   6: 'Saturday',
//   7: 'Sunday'
// };

// interface TimetableContainerProps {
//   isLoading: boolean;
//   periods: Array<{
//     id: number;
//     name: string;
//     startTime: string;
//     endTime: string;
//     days: number[];
//   }>;
//   entries: Array<any>;
//   pendingEntries: Array<any>;
//   onEntryAdded: (entry: any) => any;
//   onEntryRemoved: (entryId: string | number) => boolean;
//   bindings: Array<any>;
//   selectedClass: string;
// }

// const TimetableContainer: React.FC<TimetableContainerProps> = ({
//   isLoading,
//   periods,
//   entries,
//   pendingEntries,
//   onEntryAdded,
//   onEntryRemoved,
//   bindings,
//   selectedClass
// }) => {
//   // Compute the unique days from periods
//   const allDays = useMemo(() => {
//     if (!Array.isArray(periods) || periods.length === 0) return [];
//     return Array.from(new Set(periods.flatMap(period => Array.isArray(period.days) ? period.days : []))).sort((a, b) => a - b);
//   }, [periods]);

//   const daysToShow = allDays.map(dayNum => DAY_NAME_MAP[dayNum]);

//   if (isLoading) {
//     return <div className="text-center p-8 text-gray-500">Loading timetable...</div>;
//   }

//   return (
//     <div className="w-full md:w-3/4">
//       <div className="bg-white p-4 rounded-lg shadow-sm">
//         <div className="grid gap-2 mb-2" style={{gridTemplateColumns: `repeat(${daysToShow.length + 1}, minmax(0, 1fr))`}}>
//           <div className="bg-gray-100 p-2 text-center font-medium">Period / Day</div>
//           {daysToShow.map((day) => (
//             <div key={day} className="bg-gray-100 p-2 text-center font-medium">{day}</div>
//           ))}
//         </div>

//         {Array.isArray(periods) && periods.length > 0 ? (
//           periods.map(period => (
//             <div key={period.id} className="grid gap-2 mb-2" style={{gridTemplateColumns: `repeat(${daysToShow.length + 1}, minmax(0, 1fr))`}}>
//               <div className="bg-gray-100 p-2 text-center">
//                 <div className="font-medium">{period.name}</div>
//                 <div className="text-xs text-gray-500">{period.startTime} - {period.endTime}</div>
//               </div>
//               {allDays.map((dayNum) => (
//                 period.days && period.days.includes(dayNum) ? (
//                   <TimetableCell
//                     key={`${period.id}-${dayNum}`}
//                     day={dayNum - 1}
//                     period={period}
//                     entries={entries}
//                     pendingEntries={pendingEntries}
//                     onEntryAdded={onEntryAdded}
//                     onEntryRemoved={onEntryRemoved}
//                     allBindings={bindings}
//                     selectedClass={selectedClass}
//                   />
//                 ) : (
//                   <div key={`${period.id}-${dayNum}`} className="bg-gray-50" />
//                 )
//               ))}
//             </div>
//           ))
//         ) : (
//           <div className="text-center p-4 text-gray-500">
//             No periods available. Please check your schedule configuration.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TimetableContainer;
import React from "react";
import { Loader2 } from "lucide-react";
import { SubjectData } from "@/type/subject";
import { cn } from "@/util/util";

interface SubjectListProps {
  subjects: SubjectData[];
  isLoading: boolean;
  onSelectSubject: (uuid: string) => void;
  selectedSubjectUuid: string | null;
  searchTerm: string;
  onSearchChange?: (value: string) => void;
  loadMoreRef?:
    | React.RefObject<HTMLDivElement>
    | ((node: HTMLDivElement | null) => void);
}

const SubjectList = ({
  subjects,
  isLoading,
  onSelectSubject,
  selectedSubjectUuid,
  searchTerm,
  loadMoreRef,
}: SubjectListProps) => {
  const filteredSubjects = subjects.filter((subject) => {
    if(!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name?.toLowerCase().includes(searchLower) ||
      subject.initials?.toLowerCase().includes(searchLower) ||
      subject.description?.toLowerCase().includes(searchLower)
    );
  });

  // Debug: Log subjects to see if color data is present
  console.log("Filtered subjects:", filteredSubjects);

  return (
    <div className="space-y-4">
      {isLoading && subjects.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No subjects match your search" : "No subjects found"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSubjects.map((subject) => {
            // Debug: Log each subject to check color
            console.log(`Subject ${subject.name} color:`, subject.color);

            return (
              <div
                key={subject.uuid || String(subject.id)}
                className={cn(
                  "flex items-center p-2 rounded-md cursor-pointer transition-colors istui-timetable__main_list_card_list_item",
                  selectedSubjectUuid === (subject.uuid || subject.id)
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "hover:bg-accent border-l-4 border-transparent",
                )}
                onClick={() =>
                  onSelectSubject(subject.uuid || subject.id.toString())
                }
              >
                <div
                  className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: subject.color || (subject.redRepetition ? "#FEE2E2" : "#DBEAFE")
                  }}
                >
                  {subject.initials?.substring(0, 2) || "??"}
                </div>
                <div className="ml-3 flex-1">
                  <p
                    className={`text-sm ${selectedSubjectUuid === (subject.uuid || subject.id) ? "font-semibold text-primary" : "font-medium"}`}
                  >
                    {subject.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{subject.initials}</span>
                    {subject.group && (
                      <>
                        <span className="text-xs">•</span>
                        <span className="capitalize">{subject.group}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reference element for scroll position - positioned to trigger loading when scrolled to */}
      {loadMoreRef && (
        <div
          ref={typeof loadMoreRef === 'function' ? loadMoreRef : loadMoreRef}
          className="h-10 -mt-5"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SubjectList;

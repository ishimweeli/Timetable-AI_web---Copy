import React, { useEffect } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { TypeTeacher } from "@/type/Teacher/TypeTeacher.ts";
import { useI18n } from "@/hook/useI18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/component/Ui/dropdown-menu";
import { Skeleton } from "@/component/Ui/skeleton";

interface TeacherListProps {
  teachers: TypeTeacher[];
  onSelectTeacher: (uuid: string) => void;
  onNewTeacher: () => void;
  selectedTeacherUuid: string | null;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onFilter: (field: string) => void;
  count?: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  loadMoreRef?: React.Ref<HTMLDivElement>;
}

function TeacherList({
  teachers,
  onSelectTeacher,
  onNewTeacher,
  selectedTeacherUuid,
  searchTerm,
  onSearchTermChange,
  onFilter,
  count = 0,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  loadMoreRef,
}: TeacherListProps) {
  const { t } = useI18n();

  useEffect(() => {
    console.log("TeacherList received updated teachers:", teachers.length);
  }, [teachers]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t("teacher.list.title")}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              ({count})
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>{t("common.filter")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t("teacher.list.filterByDepartment")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilter("")}>
                  {t("teacher.departments.all")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Mathematics")}>
                  {t("teacher.departments.mathematics")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Science")}>
                  {t("teacher.departments.science")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Languages")}>
                  {t("teacher.departments.languages")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Arts")}>
                  {t("teacher.departments.arts")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              className="h-8 whitespace-nowrap istui-timetable__main_list_card_button"
              onClick={onNewTeacher}
            >
              <span>{t("teacher.actions.new")}</span>
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("teacher.list.searchPlaceholder")}
            className="pl-9 istui-timetable__main_list_card_search_input"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-grow px-4 pb-2 h-[calc(100vh-240px)] overflow-y-auto">
        {isLoading && teachers.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center p-3 rounded-md mb-2 ">
                <Skeleton className="h-9 w-9 rounded-full mr-3" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : teachers.length > 0 ? (
          teachers.map((teacher) => {
            const initials =
              teacher.initials ||
              `${teacher.firstName?.[0] || ""}${teacher.lastName?.[0] || ""}`;

            return (
              <div
                key={teacher.uuid}
                className={`flex items-center justify-between p-3 rounded-md mb-2 cursor-pointer istui-timetable__main_list_card_list_item ${
                  selectedTeacherUuid === teacher.uuid
                    ? "bg-primary/10"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 bg-card"
                }`}
                onClick={() => onSelectTeacher(teacher.uuid)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      selectedTeacherUuid === teacher.uuid
                        ? "bg-primary/20 text-primary"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    }`}
                  >
                    <span className="text-xs font-medium">{initials}</span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.department || t("teacher.list.noDepartment")}{" "}
                      {teacher.maxDailyHours &&
                        `• ${teacher.maxDailyHours} ${t("teacher.list.hoursPerDay")}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-muted-foreground">
                {t("teacher.list.noTeachersFound")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("teacher.list.adjustSearch")}
              </p>
            </div>
          </div>
        )}

        {(isLoading || isLoadingMore) && (
          <div className="text-center py-4">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-6 w-6 text-primary mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm">{t("teacher.list.loadingMore")}</p>
            </div>
          </div>
        )}

        {!isLoadingMore && hasMore && teachers.length > 0 && (
          <div className="text-center py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading || isLoadingMore}
            >
              {t("teacher.list.loadMore")} ({teachers.length}/{count})
            </Button>
          </div>
        )}

        {!isLoadingMore && !hasMore && teachers.length > 0 && (
          <div className="text-center py-3 text-xs text-muted-foreground">
            {t("teacher.list.endOfList", { count: teachers.length })}
          </div>
        )}

        {hasMore && !isLoadingMore && (
          <div
            ref={loadMoreRef}
            className="h-20 -mt-10"
            aria-hidden="true"
          ></div>
        )}
      </ScrollArea>

      <div className="text-xs text-muted-foreground p-4 pt-2 border-t mt-auto">
        <p>{t("teacher.list.colorLegend")}:</p>
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900"></div>
            <span>{t("teacher.list.availableTeacher")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/20"></div>
            <span>{t("teacher.list.selectedTeacher")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TeacherList);

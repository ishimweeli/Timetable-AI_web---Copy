import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { useI18n } from "@/hook/useI18n";
import { TypeClass } from "@/type/Class/TypeClass.ts";

interface ClassListProps {
  classes: TypeClass[];
  selectedClassUuid: string | null;
  onSelectClass: (uuid: string) => void;
  onNewClass: () => void;
  isLoading?: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  totalClasses: number;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  selectedClassUuid,
  onSelectClass,
  onNewClass,
  isLoading = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
  totalClasses,
  loadMoreRef,
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Implement infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if(listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        // If we're near the bottom (within 200px) and we have more items to load
        if(
          scrollTop + clientHeight >= scrollHeight - 200 &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          onLoadMore();
        }
      }
    };

    const listElement = listRef.current;
    if(listElement) {
      listElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if(listElement) {
        listElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, onLoadMore]);

  const sections = useMemo(() => {
    const uniqueSections = new Set<string>();
    classes.forEach((c) => {
      if(c.section) uniqueSections.add(c.section);
    });
    return Array.from(uniqueSections);
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.initial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.section &&
          c.section.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSection = !filterSection || c.section === filterSection;

      return matchesSearch && matchesSection;
    });
  }, [classes, searchTerm, filterSection]);

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {t("class.list.title")}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({filteredClasses.length})
              </span>
            </h2>
            <Button size="sm" onClick={onNewClass} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" />
              {t("class.actions.new")}
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("class.list.searchPlaceholder")}
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
          </div>

          {sections.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                size="sm"
                variant={filterSection === null ? "default" : "outline"}
                onClick={() => setFilterSection(null)}
                className="text-xs h-7"
                disabled={isLoading}
              >
                {t("class.list.allSections")}
              </Button>
              {sections.map((section) => (
                <Button
                  key={section}
                  size="sm"
                  variant={filterSection === section ? "default" : "outline"}
                  onClick={() =>
                    setFilterSection(section === filterSection ? null : section)
                  }
                  className="text-xs h-7"
                  disabled={isLoading}
                >
                  {section}
                </Button>
              ))}
              {filterSection && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilterSection(null)}
                  className="text-xs h-7 text-muted-foreground"
                  disabled={isLoading}
                >
                  {t("class.list.clearFilter")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        ref={listRef}
        style={{
          maxHeight: "calc(100vh - 250px)",
          scrollBehavior: "smooth",
        }}
      >
        <div className="p-4">
          {filteredClasses.length > 0 ? (
            <div className="space-y-2">
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.uuid}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedClassUuid === classItem.uuid
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => onSelectClass(classItem.uuid)}
                >
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-200 text-gray-600">
                      {classItem.initial || "123d"}
                    </div>
                    <span className="font-medium">{classItem.name}</span>
                  </div>
                  <div className="flex text-xs text-muted-foreground ml-10">
                    {classItem.section && (
                      <span className="mr-3">{classItem.section}</span>
                    )}
                    <span>• {classItem.capacity} students</span>
                  </div>
                </div>
              ))}

              {isLoadingMore && (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more classes...
                  </div>
                </div>
              )}

              {!isLoadingMore && hasMore && filteredClasses.length > 0 && (
                <div className="mt-4 mb-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Classes
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({filteredClasses.length}/{totalClasses})
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {!isLoadingMore && !hasMore && filteredClasses.length > 0 && (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  End of list - {filteredClasses.length} classes loaded
                </div>
              )}

              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="h-10 opacity-0"
                  aria-hidden="true"
                />
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Filter className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="mb-1">{t("class.list.noResults")}</p>
              <p className="text-sm">
                {filterSection
                  ? t("class.list.tryDifferentFilter")
                  : t("class.list.tryDifferentSearch")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassList;

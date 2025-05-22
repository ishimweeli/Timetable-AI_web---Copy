import React, { useEffect, useRef } from "react";
import { Skeleton } from "@/component/Ui/skeleton";
import { Button } from "@/component/Ui/button";
import { TypeClassBand } from "@/type/ClassBand/TypeClassBand";
import { useI18n } from "@/hook/useI18n";
import { useInView } from "react-intersection-observer";

interface ClassBandListProps {
  classBands: TypeClassBand[];
  onSelectClassBand: (uuid: string) => void;
  selectedClassBandUuid: string | null;
  isLoading?: boolean;
  isFetching?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  disableInfiniteScroll?: boolean;
  showEndOfList?: boolean;
}

const ClassBandList: React.FC<ClassBandListProps> = ({
  classBands,
  onSelectClassBand,
  selectedClassBandUuid,
  isLoading = false,
  isFetching = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  disableInfiniteScroll = false,
  showEndOfList = true,
}) => {
  const { t } = useI18n();
  const listRef = useRef<HTMLDivElement>(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: false,
    delay: 300,
    skip: disableInfiniteScroll
  });

  useEffect(() => {
    if (!disableInfiniteScroll && inView && hasMore && !isFetching && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isFetching, isLoadingMore, onLoadMore, disableInfiniteScroll]);

  const handleClassBandClick = (uuid: string) => {
    onSelectClassBand(uuid);
  };

  return (
    <div className="flex flex-col h-full" ref={listRef}>
      <div className="p-4" style={{ minHeight: 'calc(100vh - 200px + 50px)' }}>
        {isLoading && classBands.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center p-3 rounded-md mb-2">
                <Skeleton className="h-9 w-9 rounded-full mr-3" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : classBands.length > 0 ? (
          <>
            <div>
              {classBands.map((classBand) => (
                <div
                  key={classBand.uuid}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors istui-timetable__main_list_card_list_item ${
                    selectedClassBandUuid === classBand.uuid
                      ? "bg-primary/10 border-l-4 border-primary"
                      : "hover:bg-muted/50 border-l-4 border-transparent"
                  }`}
                  onClick={() => handleClassBandClick(classBand.uuid)}
                >
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-primary font-medium ${
                      selectedClassBandUuid === classBand.uuid
                        ? "bg-primary/20"
                        : "bg-primary/10"
                    }`}
                  >
                    {classBand.name.charAt(0).toLowerCase()}
                  </div>
                  <div className="ml-3 flex-1">
                    <p
                      className={`text-sm ${selectedClassBandUuid === classBand.uuid ? "font-semibold text-primary" : "font-medium"}`}
                    >
                      {classBand.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("classBand.listItemFormat", {
                        classCount: t("classBand.classCount", { count: (classBand.participatingClasses?.length || 0).toString() }),
                        lessonRange: t("classBand.lessonRange", {
                          min: classBand.minLessonsPerDay?.toString() || "0",
                          max: classBand.maxLessonsPerDay?.toString() || "0"
                        })
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Show the Load More button if there are class bands and hasMore is true */}
              {classBands.length > 0 && (hasMore || isLoadingMore) && (
                <div className="mt-4 mb-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadMore}
                    disabled={isLoadingMore || isFetching}
                    className="min-w-[200px]"
                  >
                    <div className="flex items-center">
                      {(isLoadingMore || isFetching) && (
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-primary"
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
                      )}
                      {t("classBand.loadMoreClassBands")}
                    </div>
                  </Button>
                </div>
              )}

              {/* Show end of list message only when we've loaded all items and there are no more */}
              {!hasMore && showEndOfList && classBands.length > 0 && (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  {t("common.endOfList")}
                </div>
              )}
            </div>

            {/* Simple padding to ensure scrollbar appears */}
            <div className="h-20" aria-hidden="true"></div>
          </>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-muted-foreground">
                {t("classBand.list.noClassBandsFound")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("classBand.list.adjustSearch")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassBandList;

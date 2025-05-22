import React, { useEffect, useRef } from "react";
import { GripVertical, Clock, Loader2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Spinner } from "@/component/Ui/spinner";
import { useI18n } from "@/hook/useI18n";
import { Button } from "@/component/Ui/button";
import { Period } from "@/type/Period/index";

interface PeriodListProps {
  periods: Period[];
  selectedPeriod: Period | null;
  onSelectPeriod: (period: Period) => void;
  onDragEnd: (result: DropResult) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  count?: number;
  isLoading?: boolean;
  listContainerRef: React.RefObject<HTMLDivElement>;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

const PeriodList: React.FC<PeriodListProps> = ({
  periods,
  selectedPeriod,
  onSelectPeriod,
  onDragEnd,
  isLoadingMore,
  hasMore,
  onLoadMore,
  searchTerm,
  onSearchChange,
  count,
  isLoading,
  listContainerRef,
  loadMoreRef,
}) => {
  const { t } = useI18n();

  const filteredPeriods = React.useMemo(() => {
    if(!searchTerm) return periods;
    const searchLower = searchTerm.toLowerCase();
    return periods.filter(
      (period) =>
        period.name?.toLowerCase().includes(searchLower) ||
        period.periodType?.toLowerCase().includes(searchLower) ||
        period.periodNumber?.toString().includes(searchLower)
    );
  }, [periods, searchTerm]);

  
  useEffect(() => {}, [selectedPeriod]);


  return (
    <div className="flex flex-col h-full">
      {isLoading && periods.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Spinner size="lg" />
        </div>
      ) : filteredPeriods.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="periods">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 p-4"
                style={{ minHeight: 'calc(100vh - 200px + 50px)' }}
              >
                {filteredPeriods.map((period, index) => (
                  <Draggable
                    key={period.uuid}
                    draggableId={period.uuid}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedPeriod?.uuid === period.uuid
                            ? "bg-primary/10 border-primary/30"
                            : "bg-card hover:bg-accent"
                        }`}
                        onClick={() => onSelectPeriod(period)}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 text-muted-foreground"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{period.name}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>
                              {period.startTime?.substring(0, 5)} -{" "}
                              {period.endTime?.substring(0, 5)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{period.periodType}</span>
                            {period.periodNumber && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>Period {period.periodNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline-block mr-1" />
                          {period.durationMinutes} min
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Show the Load More button only if hasMore is true */}
                {periods.length > 0 && hasMore && (
                  <div className="mt-4 mb-6 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLoadMore}
                      disabled={isLoadingMore}
                      className="min-w-[200px]"
                      data-testid="load-more-button"
                    >
                      <div className="flex items-center">
                        {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("period.actions.loadMore")}
                        {count > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({periods.length}/{count})
                          </span>
                        )}
                      </div>
                    </Button>
                  </div>
                )}

                {/* End of list message - shown when hasMore is false and we have periods */}
                {!hasMore && periods.length > 0 && (
                  <div className="text-center py-3 text-xs text-muted-foreground" data-testid="end-of-list">
                    {t("period.list.endOfList", { count: String(periods.length) })}
                  </div>
                )}

                {/* Simple padding to ensure scrollbar appears */}
                <div className="h-20" aria-hidden="true"></div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t("period.noPeriods")}</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(PeriodList);

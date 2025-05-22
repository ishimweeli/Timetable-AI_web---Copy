import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/component/Ui/button";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/hook/useI18n";

interface InfiniteScrollProps<T> {
  // Data and loading states
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  
  // Callbacks
  onLoadMore: () => void;
  
  // Rendering
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  
  // Optional props
  className?: string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  showManualLoadMoreButton?: boolean;
  loadMoreButtonText?: string;
  loadingMoreText?: string;
  containerStyle?: React.CSSProperties;
  loadMoreThreshold?: number;
}

function InfiniteScroll<T>({
  items,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  renderItem,
  keyExtractor,
  className = "",
  emptyComponent,
  loadingComponent,
  showManualLoadMoreButton = true,
  loadMoreButtonText,
  loadingMoreText,
  containerStyle,
  loadMoreThreshold = 0.5,
}: InfiniteScrollProps<T>) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intersection observer to detect when user scrolls to bottom
  const { ref: loadMoreRef, inView } = useInView({
    threshold: loadMoreThreshold,
    triggerOnce: false,
  });

  // Automatically load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, isFetchingNextPage, onLoadMore]);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span>{t("common.loading")}</span>
    </div>
  );

  // Default empty component
  const defaultEmptyComponent = (
    <div className="text-center py-8 text-muted-foreground">
      <p>{t("common.noItemsFound")}</p>
    </div>
  );

  return (
    <div 
      className={`infinite-scroll-container ${className}`}
      ref={containerRef}
      style={{
        overflowY: "auto",
        maxHeight: "calc(100vh - 250px)",
        scrollBehavior: "smooth",
        overscrollBehavior: "contain",
        ...containerStyle
      }}
    >
      {isLoading && items.length === 0 ? (
        loadingComponent || defaultLoadingComponent
      ) : items.length > 0 ? (
        <div className="infinite-scroll-items">
          {items.map((item, index) => (
            <React.Fragment key={keyExtractor(item)}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
          
          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="text-center py-4 transition-opacity duration-300 ease-in-out">
              <div className="flex flex-col items-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <p className="text-sm mt-2 text-muted-foreground">
                  {loadingMoreText || t("common.loadingMore")}
                </p>
              </div>
            </div>
          )}
          
          {/* Manual load more button */}
          {!isFetchingNextPage && hasMore && showManualLoadMoreButton && (
            <div className="mt-4 mb-6 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoading || isFetchingNextPage}
                className="min-w-[200px]"
              >
                {loadMoreButtonText || t("common.loadMore")}
              </Button>
            </div>
          )}
          
          {/* Invisible element for intersection observer */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="h-10 opacity-0"
              aria-hidden="true"
            />
          )}
        </div>
      ) : (
        emptyComponent || defaultEmptyComponent
      )}
    </div>
  );
}

export default InfiniteScroll; 
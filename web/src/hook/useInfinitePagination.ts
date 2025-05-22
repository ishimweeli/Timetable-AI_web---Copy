import { useState, useCallback, useEffect } from "react";

interface UseInfinitePaginationProps<T, P> {
  fetchFunction: (params: P) => Promise<{
    data: T[];
    totalItems?: number;
    hasMore?: boolean;
  }>;
  initialParams: P;
  pageSize: number;
  initialData?: T[];
  dedupKey?: keyof T;
}

interface UseInfinitePaginationResult<T, P> {
  items: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  totalItems: number;
  page: number;
  params: P;
  loadMore: () => void;
  refresh: () => void;
  setParams: (newParams: Partial<P>) => void;
}

function useInfinitePagination<T, P extends { page: number; size: number }>({
  fetchFunction,
  initialParams,
  pageSize,
  initialData = [],
  dedupKey,
}: UseInfinitePaginationProps<T, P>): UseInfinitePaginationResult<T, P> {
  const [items, setItems] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(initialParams.page);
  const [params, setParamsState] = useState<P>(initialParams);

  // Function to fetch data
  const fetchData = useCallback(async (isLoadingMore: boolean = false) => {
    try {
      if (isLoadingMore) {
        setIsFetchingNextPage(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetchFunction(params);
      
      if (response) {
        // Update total items if available
        if (response.totalItems !== undefined) {
          setTotalItems(response.totalItems);
        }
        
        // Determine if there are more items to load
        const responseHasMore = response.hasMore !== undefined 
          ? response.hasMore 
          : response.data.length === pageSize;
        setHasMore(responseHasMore);
        
        // Update items list
        if (isLoadingMore && dedupKey) {
          // Deduplicate items when loading more
          setItems(prevItems => {
            const existingItemsMap = new Map(
              prevItems.map(item => [item[dedupKey], item])
            );
            
            response.data.forEach(item => {
              if (!existingItemsMap.has(item[dedupKey])) {
                existingItemsMap.set(item[dedupKey], item);
              }
            });
            
            return Array.from(existingItemsMap.values());
          });
        } else if (isLoadingMore) {
          // Append items without deduplication
          setItems(prevItems => [...prevItems, ...response.data]);
        } else {
          // Replace all items
          setItems(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [fetchFunction, params, pageSize, dedupKey]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load more function
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isFetchingNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      setParamsState(prev => ({ ...prev, page: nextPage }));
      fetchData(true);
    }
  }, [hasMore, isLoading, isFetchingNextPage, page, fetchData]);

  // Refresh function
  const refresh = useCallback(() => {
    setPage(initialParams.page);
    setParamsState(prev => ({ ...prev, page: initialParams.page }));
    fetchData();
  }, [initialParams.page, fetchData]);

  // Set params function
  const setParams = useCallback((newParams: Partial<P>) => {
    setPage(initialParams.page);
    setParamsState(prev => ({ 
      ...prev, 
      ...newParams, 
      page: initialParams.page 
    }));
  }, [initialParams.page]);

  return {
    items,
    isLoading,
    isFetchingNextPage,
    hasMore,
    totalItems,
    page,
    params,
    loadMore,
    refresh,
    setParams,
  };
}

export default useInfinitePagination; 
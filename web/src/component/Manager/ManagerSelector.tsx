import React, { useState, useEffect } from "react";
import { X, Edit, Check } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { cn } from "@/util/util.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/component/Ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { Checkbox } from "@/component/Ui/checkbox";
import { Textarea } from "@/component/Ui/textarea";
import { useGetManagersQuery } from "../../store/Manager/ApiManager";
import { useInView } from "react-intersection-observer";

interface ManagerTag {
  id: string;
  code: string;
  name?: string;
}

interface ManagerSelectorProps {
  onSelectionChange?: (selectedTags: ManagerTag[]) => void;
}

// Create a separate component for manager tags to ensure proper re-rendering
const ManagerTagItem = ({
  tag,
  isActive,
  onSelect,
  onRemove,
}: {
  tag: ManagerTag;
  isActive: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className="flex items-center rounded-md overflow-hidden border cursor-pointer border-gray-200 bg-gray-50 hover:bg-gray-100"
      onClick={onSelect}
    >
      <div className="px-2 py-1 text-xs font-medium bg-gray-200">
        {tag.code}
      </div>
      <div className="px-2 py-1 text-xs">{tag.name?.split(" ")[0]}</div>
      <div
        onClick={onRemove}
        className="p-1 transition-colors hover:bg-gray-200"
      >
        <X className="h-3 w-3" />
      </div>
    </div>
  );
};

const ManagerSelector: React.FC<ManagerSelectorProps> = ({
  onSelectionChange,
}) => {
  // State
  const [selectedTags, setSelectedTags] = useState<ManagerTag[]>([]);
  const [activeManagerId, setActiveManagerId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [managerPageSize, setManagerPageSize] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // API query
  const {
    data: managersResponse,
    isLoading,
    isFetching,
  } = useGetManagersQuery({
    size: managerPageSize,
  });

  // Infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Get manager tags from API response
  const getManagerTags = (): ManagerTag[] => {
    if(!managersResponse?.data) return [];

    return managersResponse.data.map((manager) => ({
      id: manager.uuid,
      code: manager.firstName.charAt(0) + manager.lastName.charAt(0),
      name: `${manager.firstName} ${manager.lastName}`,
    }));
  };

  const MANAGER_TAGS = getManagerTags();
  const availableTags = MANAGER_TAGS.filter(
    (tag) => !selectedTags.some((t) => t.id === tag.id),
  );

  // Initialize selected tags
  useEffect(() => {
    if(MANAGER_TAGS.length > 0 && selectedTags.length === 0) {
      const initialTags = MANAGER_TAGS.slice(
        0,
        Math.min(4, MANAGER_TAGS.length),
      );
      setSelectedTags(initialTags);
      onSelectionChange?.(initialTags);

      // Set first tag as active
      if(initialTags.length > 0) {
        setActiveManagerId(initialTags[0].id);
      }
    }
  }, [MANAGER_TAGS, onSelectionChange]);

  // Handle infinite scroll
  useEffect(() => {
    if(inView && hasMore && !isFetching && !isLoadingMore && showAllTags) {
      handleLoadMore();
    }
  }, [inView, hasMore, isFetching, isLoadingMore, showAllTags]);

  // Check if there are more managers to load
  useEffect(() => {
    if(managersResponse) {
      setIsLoadingMore(false);

      if(
        !managersResponse.data ||
        managersResponse.data.length < managerPageSize
      ) {
        setHasMore(false);
      }else {
        setHasMore(true);
      }
    }
  }, [managersResponse, managerPageSize]);

  // Handlers
  const handleLoadMore = () => {
    if(hasMore && !isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setManagerPageSize((prevSize) => prevSize + 5);
    }
  };

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    setSelectedTags(updatedTags);
    onSelectionChange?.(updatedTags);

    // If we removed the active manager, set a new active manager
    if(activeManagerId === tagId && updatedTags.length > 0) {
      setActiveManagerId(updatedTags[0].id);
    } else if(updatedTags.length === 0) {
      setActiveManagerId(null);
    }
  };

  const handleAddTag = (tag: ManagerTag) => {
    if(!selectedTags.some((t) => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      onSelectionChange?.(updatedTags);
    }
    setActiveManagerId(tag.id);
  };

  const handleSelectManager = (managerId: string) => {
    setActiveManagerId(managerId);
  };

  if(isLoading) {
    return <div>Loading managers...</div>;
  }

  return (
    <div className="p-4 border rounded-md">
      {/* Debug info */}
      <div className="text-xs text-gray-400 mb-2">
        Active Manager: {activeManagerId || "none"}
      </div>

      {/* COMPACT VIEW */}
      {!isExpanded && (
        <div className="flex flex-wrap gap-2 items-center">
          {selectedTags.map((tag) => (
            <ManagerTagItem
              key={tag.id}
              tag={tag}
              isActive={false}
              onSelect={() => handleSelectManager(tag.id)}
              onRemove={(e) => handleRemoveTag(tag.id, e)}
            />
          ))}

          {availableTags.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setIsExpanded(true)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      )}

      {/* EXPANDED VIEW */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Selected tags */}
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <ManagerTagItem
                key={tag.id}
                tag={tag}
                isActive={false}
                onSelect={() => handleSelectManager(tag.id)}
                onRemove={(e) => handleRemoveTag(tag.id, e)}
              />
            ))}
          </div>

          {/* Available managers */}
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium">Available Managers</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowAllTags(!showAllTags)}
              >
                {showAllTags ? "Show Less" : "Show All"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 p-1">
              {(showAllTags ? availableTags : availableTags.slice(0, 8)).map(
                (tag) => (
                  <Button
                    key={tag.id}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleAddTag(tag)}
                  >
                    <span className="font-medium mr-1">{tag.code}</span>
                    <span className="text-xs truncate max-w-[80px]">
                      {tag.name?.split(" ")[0]}
                    </span>
                  </Button>
                ),
              )}

              {/* Show more button */}
              {!showAllTags && availableTags.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setShowAllTags(true)}
                >
                  +{availableTags.length - 8} more
                </Button>
              )}

              {/* Load more button */}
              {showAllTags && hasMore && (
                <div className="w-full text-center py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={handleLoadMore}
                    disabled={isFetching || isLoadingMore}
                  >
                    {isFetching || isLoadingMore ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-1 h-3 w-3 text-primary"
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
                        Loading...
                      </div>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}

              {/* Infinite scroll detector */}
              {showAllTags && (
                <div ref={loadMoreRef} className="h-2 w-full"></div>
              )}
            </div>
          </div>

          {/* Done button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsExpanded(false)}
            >
              <Check className="h-3 w-3 mr-1" />
              Done
            </Button>
          </div>

          {/* Manager preferences */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              Manager Preferences
              {activeManagerId &&
                selectedTags.find((t) => t.id === activeManagerId) && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {selectedTags.find((t) => t.id === activeManagerId)?.name}
                  </span>
                )}
            </h3>

            {/* Preferences form */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max. consecutive teaching hours
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max. location shifts pr. day
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max. gap hours pr. week
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max. working time in period
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="bindings" />
                <label
                  htmlFor="bindings"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Count bindings without classes
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="timeEveryDay" />
                <label
                  htmlFor="timeEveryDay"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Time every day
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max. consecutive gap hours
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Min. consecutive gap hours
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Comment</label>
                <Textarea
                  className="h-10"
                  placeholder="Add your comment here..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSelector;

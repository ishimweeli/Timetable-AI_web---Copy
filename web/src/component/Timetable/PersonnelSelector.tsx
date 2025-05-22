import React, { useState } from "react";
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

interface PersonnelTag {
  id: string;
  code: string;
  name?: string; // Adding full name for tooltip
}

interface PersonnelSelectorProps {
  onSelectionChange?: (selectedTags: PersonnelTag[]) => void;
}

// Extended personnel data with full names
const PERSONNEL_TAGS: PersonnelTag[] = [
  { id: "bc", code: "BC", name: "Benjamin Carter" },
  { id: "cf", code: "CF", name: "Charlotte Foster" },
  { id: "em", code: "EM", name: "Emily Morgan" },
  { id: "hu", code: "HU", name: "Henry Underwood" },
  { id: "jm", code: "JM", name: "James Mitchell" },
  { id: "lc", code: "LC", name: "Lucy Campbell" },
  { id: "lp", code: "LP", name: "Liam Peterson" },
  { id: "bd", code: "BD", name: "Brian Donovan" },
  { id: "eg", code: "EG", name: "Emma Green" },
  { id: "fc", code: "FC", name: "Fiona Clark" },
  { id: "je", code: "JE", name: "John Evans" },
  { id: "kp", code: "KP", name: "Katherine Parker" },
  { id: "lm", code: "LM", name: "Leo Martinez" },
  { id: "ma", code: "MA", name: "Michael Adams" },
  { id: "bo", code: "BO", name: "Benjamin Oswald" },
  { id: "el", code: "EL", name: "Emma Lewis" },
  { id: "ho", code: "HO", name: "Hannah Olsen" },
  { id: "ju", code: "JU", name: "Julian Unger" },
  { id: "ks", code: "KS", name: "Karen Smith" },
  { id: "lo", code: "LO", name: "Lucas Ortiz" },
  { id: "ms", code: "MS", name: "Mia Scott" },
  { id: "ch", code: "CH", name: "Christopher Harris" },
  { id: "en", code: "EN", name: "Elizabeth Nolan" },
  { id: "ir", code: "IR", name: "Ian Robertson" },
  { id: "kh", code: "KH", name: "Kevin Hughes" },
  { id: "ll", code: "LL", name: "Lily Lawrence" },
  { id: "ls", code: "LS", name: "Laura Sanders" },
];

const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  onSelectionChange,
}) => {
  const [selectedTags, setSelectedTags] = useState<PersonnelTag[]>([
    PERSONNEL_TAGS.find((tag) => tag.id === "bc") || { id: "bc", code: "BC" },
    PERSONNEL_TAGS.find((tag) => tag.id === "cf") || { id: "cf", code: "CF" },
    PERSONNEL_TAGS.find((tag) => tag.id === "em") || { id: "em", code: "EM" },
    PERSONNEL_TAGS.find((tag) => tag.id === "hu") || { id: "hu", code: "HU" },
  ]);

  const [showAllTags, setShowAllTags] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    setSelectedTags(updatedTags);
    onSelectionChange?.(updatedTags);
  };

  const handleAddTag = (tag: PersonnelTag) => {
    if(!selectedTags.some((t) => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      onSelectionChange?.(updatedTags);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const availableTags = PERSONNEL_TAGS.filter(
    (tag) => !selectedTags.some((t) => t.id === tag.id),
  );

  // The compact view (when collapsed)
  const CompactView = () => (
    <div className="w-full animate-fade-in">
      <div className="flex items-center mb-2">
        <div className="text-sm font-medium">
          Select Personnel{" "}
          <span className="text-muted-foreground text-xs font-normal">
            25/124
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button size="icon" variant="outline" className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={toggleExpanded}
          >
            <Edit className="h-4 w-4 text-emerald-500" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <TooltipProvider>
          {selectedTags.map((tag) => (
            <Tooltip key={tag.id}>
              <TooltipTrigger asChild>
                <div className="personnel-tag selected group">{tag.code}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tag.name || `Personnel ${tag.code}`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        <span className="text-xs text-muted-foreground p-1">+23</span>
      </div>
    </div>
  );

  // The expanded view with all form controls
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {!isExpanded ? (
        <CompactView />
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="text-sm font-medium">
              Select Personnel{" "}
              <span className="text-muted-foreground text-xs font-normal">
                25/124
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={toggleExpanded}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-7 w-7">
                <Check className="h-4 w-4 text-emerald-500" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            <TooltipProvider>
              {selectedTags.map((tag) => (
                <Tooltip key={tag.id}>
                  <TooltipTrigger asChild>
                    <div className="personnel-tag selected group">
                      {tag.code}
                      <button
                        type="button"
                        className="personnel-tag-remove"
                        onClick={() => handleRemoveTag(tag.id)}
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tag.name || `Personnel ${tag.code}`}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            <span className="text-xs text-muted-foreground p-1">+23</span>
          </div>

          {showAllTags && (
            <div className="grid grid-cols-6 gap-1 mb-3 p-2 bg-gray-50 rounded-md animate-scale-in">
              <TooltipProvider>
                {availableTags.map((tag) => (
                  <Tooltip key={tag.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="personnel-tag cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag.code}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tag.name || `Personnel ${tag.code}`}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-xs mb-4 w-fit"
            onClick={() => setShowAllTags(!showAllTags)}
          >
            {showAllTags ? "Hide Options" : "Show More Options"}
          </Button>

          {/* Form controls matching the image */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Controlpositionnumber
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
                Min. positions pr. day
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
                Max. positions pr. day
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

          <div className="grid grid-cols-3 gap-4 mb-4">
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
      )}
    </div>
  );
};

export default PersonnelSelector;

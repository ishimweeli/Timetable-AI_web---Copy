import React, { useState } from "react";
import { Card, CardContent } from "@/component/Ui/card.tsx";
import { Button } from "@/component/Ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select.tsx";
import { Badge } from "@/component/Ui/badge.tsx";
import { X } from "lucide-react";

interface StudentFiltersProps {
  onFilterChange: (filters: {
    grade?: string;
    department?: string;
    quickFilters: string[];
  }) => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({ onFilterChange }) => {
  const [grade, setGrade] = useState<string | undefined>(undefined);
  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);

  const handleQuickFilterToggle = (filter: string) => {
    if(quickFilters.includes(filter)) {
      setQuickFilters(quickFilters.filter((f) => f !== filter));
    }else {
      setQuickFilters([...quickFilters, filter]);
    }
  };

  const handleGradeChange = (value: string) => {
    const newGrade = value === "all" ? undefined : value;
    setGrade(newGrade);
    onFilterChange({ grade: newGrade, department, quickFilters });
  };

  const handleDepartmentChange = (value: string) => {
    const newDepartment = value === "all" ? undefined : value;
    setDepartment(newDepartment);
    onFilterChange({ grade, department: newDepartment, quickFilters });
  };

  const handleRemoveFilter = (type: "grade" | "department" | string) => {
    if(type === "grade") {
      setGrade(undefined);
      onFilterChange({ grade: undefined, department, quickFilters });
    } else if(type === "department") {
      setDepartment(undefined);
      onFilterChange({ grade, department: undefined, quickFilters });
    }else {
      const newQuickFilters = quickFilters.filter((f) => f !== type);
      setQuickFilters(newQuickFilters);
      onFilterChange({ grade, department, quickFilters: newQuickFilters });
    }
  };

  const handleClearAll = () => {
    setGrade(undefined);
    setDepartment(undefined);
    setQuickFilters([]);
    onFilterChange({
      grade: undefined,
      department: undefined,
      quickFilters: [],
    });
  };

  const getGradeLabel = (gradeValue: string) => {
    switch (gradeValue) {
      case "freshman":
        return "Freshman";
      case "sophomore":
        return "Sophomore";
      case "junior":
        return "Junior";
      case "senior":
        return "Senior";
      case "graduate":
        return "Graduate";
      default:
        return gradeValue;
    }
  };

  const getDepartmentLabel = (deptValue: string) => {
    switch (deptValue) {
      case "cs":
        return "Computer Science";
      case "eng":
        return "Engineering";
      case "bus":
        return "Business";
      case "arts":
        return "Arts";
      case "sci":
        return "Sciences";
      case "hum":
        return "Humanities";
      default:
        return deptValue;
    }
  };

  const hasActiveFilters =
    grade !== undefined || department !== undefined || quickFilters.length > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={quickFilters.includes("honor") ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => handleQuickFilterToggle("honor")}
              >
                Honor Roll
              </Button>
              <Button
                variant={
                  quickFilters.includes("international") ? "default" : "outline"
                }
                size="sm"
                className="h-8"
                onClick={() => handleQuickFilterToggle("international")}
              >
                International
              </Button>
              <Button
                variant={
                  quickFilters.includes("scholarship") ? "default" : "outline"
                }
                size="sm"
                className="h-8"
                onClick={() => handleQuickFilterToggle("scholarship")}
              >
                Scholarship
              </Button>
              <Button
                variant={
                  quickFilters.includes("assistance") ? "default" : "outline"
                }
                size="sm"
                className="h-8"
                onClick={() => handleQuickFilterToggle("assistance")}
              >
                Needs Assistance
              </Button>
              <Button
                variant={
                  quickFilters.includes("attendance") ? "default" : "outline"
                }
                size="sm"
                className="h-8"
                onClick={() => handleQuickFilterToggle("attendance")}
              >
                Attendance Issues
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 min-w-[280px]">
            <Select value={grade || "all"} onValueChange={handleGradeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Grade/Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="freshman">Freshman</SelectItem>
                <SelectItem value="sophomore">Sophomore</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={department || "all"}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="eng">Engineering</SelectItem>
                <SelectItem value="bus">Business</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="sci">Sciences</SelectItem>
                <SelectItem value="hum">Humanities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center mt-4 gap-2 flex-wrap">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {grade && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getGradeLabel(grade)}{" "}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveFilter("grade")}
                  />
                </Badge>
              )}
              {department && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getDepartmentLabel(department)}{" "}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveFilter("department")}
                  />
                </Badge>
              )}
              {quickFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter === "honor"
                    ? "Honor Roll"
                    : filter === "international"
                      ? "International"
                      : filter === "scholarship"
                        ? "Scholarship"
                        : filter === "assistance"
                          ? "Needs Assistance"
                          : filter === "attendance"
                            ? "Attendance Issues"
                            : filter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveFilter(filter)}
                  />
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-8"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentFilters;

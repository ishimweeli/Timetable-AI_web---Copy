import React, { useState } from "react";
import { Button } from "@/component/Ui/button";
import { X, Loader2 } from "lucide-react";
import { Checkbox } from "@/component/Ui/checkbox";

const StudentClassAssignmentPanel = ({
  isOpen,
  onClose,
  students,
  classes,
  onAssign,
  isLoading
}) => {
  const [selectedStudentUuids, setSelectedStudentUuids] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const handleStudentToggle = (uuid) => {
    setSelectedStudentUuids((prev) =>
      prev.includes(uuid)
        ? prev.filter((id) => id !== uuid)
        : [...prev, uuid]
    );
  };

  const handleAssign = () => {
    if(selectedStudentUuids.length && selectedClassId) {
      onAssign(selectedStudentUuids, selectedClassId);
    }
  };

  if(!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 flex flex-col border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold text-lg">Assign Students to Class</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Select Class</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
          >
            <option value="">Choose a class</option>
            {classes.map(cls => (
              <option key={cls.uuid} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-2 text-sm font-medium">Select Students</div>
        <div className="max-h-64 overflow-y-auto border rounded">
          {students.map(student => (
            <div key={student.uuid} className="flex items-center px-2 py-1 border-b last:border-b-0">
              <Checkbox
                checked={selectedStudentUuids.includes(student.uuid)}
                onCheckedChange={() => handleStudentToggle(student.uuid)}
                id={`student-${student.uuid}`}
              />
              <label htmlFor={`student-${student.uuid}`} className="ml-2 cursor-pointer flex-1">
                {student.fullName} <span className="text-xs text-gray-400 ml-2">{student.studentIdNumber}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={!selectedStudentUuids.length || !selectedClassId || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Assign
        </Button>
      </div>
    </div>
  );
};

export default StudentClassAssignmentPanel; 
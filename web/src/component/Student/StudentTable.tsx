import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/Ui/table.tsx";
import { Button } from "@/component/Ui/button.tsx";
import { Eye, Trash2 } from "lucide-react";
import { Student } from "@/type/student/student.ts";

interface StudentTableProps {
  students: Student[];
  onViewProfile: (uuid: string) => void;
  onDeleteStudent: (uuid: string) => void;
  isLoading: boolean;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onViewProfile,
  onDeleteStudent,
  isLoading,
}) => {
  if(isLoading) {
    return <div className="text-center py-4">Loading students...</div>;
  }

  if(students.length === 0) {
    return (
      <div className="text-center py-4">
        No students found. Add a new student to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.uuid}>
            <TableCell>{student.studentIdNumber}</TableCell>
            <TableCell>{student.fullName}</TableCell>
            <TableCell>{student.department || "-"}</TableCell>
            <TableCell>{student.email || "-"}</TableCell>
            <TableCell>{student.phone || "-"}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  student.statusId === 1
                    ? "bg-green-100 text-green-800"
                    : student.statusId === 2
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {student.statusId === 1
                  ? "Active"
                  : student.statusId === 2
                    ? "Pending"
                    : "Inactive"}
              </span>
            </TableCell>
            <TableCell className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile(student.uuid)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDeleteStudent(student.uuid)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentTable;

import type { ReactNode } from 'react';
import AttendanceManagement from './AttendanceManagement';

interface StudentsAttendanceTabProps {
  filterComponent?: ReactNode;
  isActive?: boolean;
}

export default function StudentsAttendanceTab({
  filterComponent,
  isActive,
}: StudentsAttendanceTabProps) {
  // Only render when active to optimize performance
  if (!isActive) return null;

  return (
    <div>
      {/* Render shared filter component if provided */}
      {filterComponent}

      {/* Students Attendance Table */}
      <AttendanceManagement />
    </div>
  );
}

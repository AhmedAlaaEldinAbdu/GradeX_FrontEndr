import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import AttendanceConfirmPopup from '@/pages/school-dashboard/attendance/popups/AttendanceConfirmPopup';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import HistoryIcon from '@gradex/assets/icons/History.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeacherAttendance,
  clearFilters,
  clearSelection,
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
} from '@/redux/features/teacher-attendance/teacherAttendanceSlice';
import type { TeacherAttendance } from '@/types/teacherAttendance';
import { AttendanceStatus, TeacherJobType } from '@/types/teacherAttendance';
import { formatTime, formatDateDisplay } from '@/shared/common/common';

const EDUCATIONAL_STAGES = [
  { value: 'primary', labelAr: 'المرحلة الابتدائية', labelEn: 'Primary School' },
  { value: 'middle', labelAr: 'المرحلة الإعدادية', labelEn: 'Middle School' },
  { value: 'secondary', labelAr: 'المرحلة الثانوية', labelEn: 'Secondary School' },
  { value: 'kindergarten', labelAr: 'رياض الأطفال', labelEn: 'Kindergarten' },
];

const CLASSROOMS = [
  { value: '1a', labelAr: '1/أ', labelEn: '1/A' },
  { value: '2a', labelAr: '2/أ', labelEn: '2/A' },
  { value: '1a-2a', labelAr: '1/أ - 2/أ', labelEn: '1/A - 2/A' },
];

const TYPE_OPTIONS = [
  { value: String(TeacherJobType.Teacher), labelAr: 'معلم', labelEn: 'Teacher' },
  { value: String(TeacherJobType.Administrator), labelAr: 'إداري', labelEn: 'Administrator' },
  { value: String(TeacherJobType.Supervisor), labelAr: 'مشرف', labelEn: 'Supervisor' },
];

const getStatusDisplay = (
  status: number | null,
  t: (key: string) => string
): { text: string; className: string } => {
  switch (status) {
    case AttendanceStatus.Present:
      return { text: t('attendance.present'), className: 'text-green-600' };
    case AttendanceStatus.Absent:
      return { text: t('attendance.absent'), className: 'text-red-600' };
    case AttendanceStatus.Late:
      return { text: t('attendance.late'), className: 'text-yellow-600' };
    case AttendanceStatus.EarlyLeave:
      return { text: t('attendance.earlyLeave'), className: 'text-orange-600' };
    default:
      return { text: t('attendance.notAvailable'), className: 'text-gray-500' };
  }
};

const getClassroomsDisplay = (
  classRooms: TeacherAttendance['classRooms'],
  currentLang: 'ar' | 'en'
): string => {
  if (!classRooms || classRooms.length === 0) return '-';
  return classRooms
    .map((c) => (currentLang === 'ar' ? c.classroomNameAr : c.classroomNameEn) || '-')
    .join(', ');
};

interface EmployeesAttendanceTabProps {
  filterComponent?: React.ReactNode;
  isActive?: boolean;
}

export default function EmployeesAttendanceTab({
  filterComponent,
  isActive,
}: EmployeesAttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();

  // Redux state
  const { attendances, pagination, isLoading, selectedAttendanceIds } = useAppSelector(
    (state) => state.teacherAttendance
  );

  // Local filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'present' | 'absent' | 'late'>('present');
  const [popupIsBulk, setPopupIsBulk] = useState(false);
  const [popupEmployeeName, setPopupEmployeeName] = useState('');
  const [popupEmployeeId, setPopupEmployeeId] = useState<string | null>(null);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    if (isActive) {
      dispatch(
        fetchTeacherAttendance({
          page: currentPage,
          limit: pagination.limit,
          filters: {
            searchName: searchTerm || undefined,
            educationalStageId: selectedStage || undefined,
            classroomId: selectedClassroom || undefined,
            job: selectedType ? Number(selectedType) : undefined,
          },
        })
      );
    }
  }, [
    dispatch,
    isActive,
    currentPage,
    pagination.limit,
    searchTerm,
    selectedType,
    selectedStage,
    selectedClassroom,
  ]);

  // Only render when active
  if (!isActive) return null;

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      dispatch(selectAttendance(id));
    } else {
      dispatch(deselectAttendance(id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAllAttendances());
    } else {
      dispatch(clearSelection());
    }
  };

  const allCurrentPageSelected =
    attendances.length > 0 && attendances.every((e) => selectedAttendanceIds.includes(e.id));

  const someCurrentPageSelected =
    attendances.some((e) => selectedAttendanceIds.includes(e.id)) && !allCurrentPageSelected;

  // Individual action handlers
  const handleIndividualAction = (
    employeeId: string,
    employeeName: string,
    type: 'present' | 'absent' | 'late'
  ) => {
    setPopupEmployeeId(employeeId);
    setPopupEmployeeName(employeeName);
    setPopupType(type);
    setPopupIsBulk(false);
    setPopupOpen(true);
  };

  // Bulk action handlers
  const handleBulkActionClick = (type: 'present' | 'absent' | 'late') => {
    setPopupType(type);
    setPopupIsBulk(true);
    setPopupEmployeeId(null);
    setPopupEmployeeName('');
    setPopupOpen(true);
  };

  const handleConfirmAction = (time?: string) => {
    if (popupIsBulk) {
      console.log(
        `Bulk action: ${popupType} for employees:`,
        selectedAttendanceIds,
        time ? `at ${time}` : ''
      );
      dispatch(clearSelection());
    } else if (popupEmployeeId) {
      console.log(
        `Individual action: ${popupType} for employee:`,
        popupEmployeeId,
        time ? `at ${time}` : ''
      );
    }
    setPopupOpen(false);
  };

  const handleCancelPopup = () => {
    setPopupOpen(false);
  };

  const columns: DataTableColumn<TeacherAttendance>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pagination.limit + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: '',
      headerComponent: (
        <input
          type="checkbox"
          checked={allCurrentPageSelected}
          ref={(el) => {
            if (el) {
              el.indeterminate = someCurrentPageSelected;
            }
          }}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedAttendanceIds.includes(row.id)}
          onChange={(e) => handleSelectEmployee(row.id, e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: 'attendance.employeeName',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <CustomImage src={ProfileImage} alt="profile" className="h-full w-full object-cover" />
          </div>
          <span className="font-medium">{row.teacherFullName}</span>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 transition-colors hover:bg-blue-100">
            <CustomImage src={EyeStyledIcon} alt="view" className="h-5 w-5" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'attendance.educationalStage',
      accessor: (row) => (
        <span>
          {currentLang === 'ar'
            ? row.lkSchoolStageNameAr || t('attendance.notAvailable')
            : row.lkSchoolStageNameEn || t('attendance.notAvailable')}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'attendance.classroom',
      accessor: (row) => <span>{getClassroomsDisplay(row.classRooms, currentLang)}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'attendance.date',
      accessor: (row) => <span>{formatDateDisplay(row.date)}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'attendance.attendanceTime',
      accessor: (row) => {
        const statusDisplay = getStatusDisplay(row.status, t);
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm">{formatTime(row.checkInTime)}</span>
            <span className={`text-xs ${statusDisplay.className}`}>{statusDisplay.text}</span>
          </div>
        );
      },
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'attendance.createdBy',
      accessor: (row) => (
        <span className="text-sm">
          {row.createdBy.createdByFullNane || t('attendance.notAvailable')}
          {row.createdBy.administrativePositionNameAr || row.createdBy.administrativePositionNameEn
            ? ` (${currentLang === 'ar' ? row.createdBy.administrativePositionNameAr : row.createdBy.administrativePositionNameEn})`
            : ''}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'attendance.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
            onClick={() => handleIndividualAction(row.id, row.teacherFullName, 'present')}
            title={t('attendance.present')}
          >
            <CustomImage src={CheckIcon} alt="check" className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 transition-colors hover:bg-yellow-200"
            onClick={() => handleIndividualAction(row.id, row.teacherFullName, 'late')}
            title={t('attendance.late')}
          >
            <CustomImage src={HistoryIcon} alt="history" className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
            onClick={() => handleIndividualAction(row.id, row.teacherFullName, 'absent')}
            title={t('attendance.absent')}
          >
            <CustomImage src={XMarkDangerIcon} alt="delete" className="h-4 w-4" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'custom',
      name: 'type-filter',
      placeholder: '',
      value: selectedType,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedType}
          onChange={(value) => setSelectedType(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={TYPE_OPTIONS.map((type) => ({
            value: type.value,
            label: currentLang === 'ar' ? type.labelAr : type.labelEn,
          }))}
          placeholder={t('attendance.type')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
      placeholder: '',
      value: selectedClassroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) =>
            setSelectedClassroom(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={CLASSROOMS.map((classroom) => ({
            value: classroom.value,
            label: currentLang === 'ar' ? classroom.labelAr : classroom.labelEn,
          }))}
          placeholder={t('attendance.classroom')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'educational-stage-filter',
      placeholder: '',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={EDUCATIONAL_STAGES.map((stage) => ({
            value: stage.value,
            label: currentLang === 'ar' ? stage.labelAr : stage.labelEn,
          }))}
          placeholder={t('attendance.educationalStage')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'search',
      name: 'searchEmployee',
      placeholder: t('attendance.searchEmployee'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStage('');
    setSelectedClassroom('');
    setCurrentPage(1);
    dispatch(clearFilters());
    dispatch(clearSelection());
  };

  const bulkActionsBar =
    selectedAttendanceIds.length > 0 ? (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleBulkActionClick('present')}
          className="flex items-center gap-1.5 rounded-full border border-green-500 bg-white px-3 py-1.5 text-sm text-green-600 transition-colors hover:bg-green-50"
        >
          <CustomImage src={CheckIcon} className="h-4 w-4" alt="present" />
          <span>{t('attendance.markAllPresent')}</span>
        </button>
        <button
          onClick={() => handleBulkActionClick('late')}
          className="flex items-center gap-1.5 rounded-full border border-yellow-500 bg-white px-3 py-1.5 text-sm text-yellow-600 transition-colors hover:bg-yellow-50"
        >
          <CustomImage src={HistoryIcon} className="h-4 w-4" alt="late" />
          <span>{t('attendance.markAllLate')}</span>
        </button>
        <button
          onClick={() => handleBulkActionClick('absent')}
          className="flex items-center gap-1.5 rounded-full border border-red-500 bg-white px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <CustomImage src={XMarkDangerIcon} className="h-4 w-4" alt="absent" />
          <span>{t('attendance.markAllAbsent')}</span>
        </button>
      </div>
    ) : null;

  return (
    <div>
      {filterComponent}

      <Card>
        <DataTable
          data={attendances}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          bulkActions={bulkActionsBar}
          isLoading={isLoading}
          emptyMessage={t('attendance.noEmployees')}
          t={t}
        />
      </Card>

      {/* Attendance Confirmation Popup */}
      <AttendanceConfirmPopup
        open={popupOpen}
        type={popupType}
        isBulk={popupIsBulk}
        personName={popupEmployeeName}
        personType="employee"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelPopup}
      />
    </div>
  );
}

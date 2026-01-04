import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import AttendanceConfirmPopup from '@/pages/school-dashboard/attendance/popups/AttendanceConfirmPopup';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import HistoryIcon from '@gradex/assets/icons/History.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeacherAttendance,
  bulkCreateAttendance,
  clearFilters,
  clearSelection,
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
} from '@/redux/features/teacher-attendance/teacherAttendanceSlice';
import { updateTeacherAttendance } from '@/redux/features/teachers';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups';
import type { TeacherAttendance } from '@/types/teacherAttendance';
import { AttendanceStatus } from '@/types/teacherAttendance';
import { formatTime, formatDateDisplay } from '@/shared/common/common';
import { useNavigate } from 'react-router-dom';

const TYPE_OPTIONS = [
  { value: String(AttendanceStatus.Present), labelAr: 'حاضر', labelEn: 'Present' },
  { value: String(AttendanceStatus.Absent), labelAr: 'غائب', labelEn: 'Absent' },
  { value: String(AttendanceStatus.Late), labelAr: 'متأخر', labelEn: 'Late' },
  { value: String(AttendanceStatus.EarlyLeave), labelAr: 'خارج مبكر', labelEn: 'Early Leave' },
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
  const navigate = useNavigate();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // Redux state
  const { attendances, pagination, isLoading, selectedAttendanceIds } = useAppSelector(
    (state) => state.teacherAttendance
  );

  const isLoadingAttendance = useAppSelector((state) => state.teachers.isLoadingAttendance);
  const isProcessing = isLoading || isLoadingAttendance;

  // Get classrooms from classrooms slice for filter options
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  // Get school stages from lookups slice for filter options
  const schoolStages = useAppSelector((state) => state.lookups.schoolStages);

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

  // Fetch classrooms and school stages for filter dropdowns on mount
  useEffect(() => {
    dispatch(fetchClassrooms({ page: 1, limit: 100 }));
    dispatch(fetchSchoolStages());
  }, [dispatch]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    if (isActive) {
      dispatch(
        fetchTeacherAttendance({
          page: currentPage,
          limit: pagination.limit,
          filters: {
            search: searchTerm || undefined,
            lkSchoolStageId: selectedStage || undefined,
            classroomId: selectedClassroom || undefined,
            status: selectedType ? Number(selectedType) : undefined,
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

  useEffect(() => {
    dispatch(clearSelection());
  }, [dispatch, isActive]);

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
    attendances.length > 0 && attendances.every((e) => selectedAttendanceIds.includes(e.teacherId));

  const someCurrentPageSelected =
    attendances.some((e) => selectedAttendanceIds.includes(e.teacherId)) && !allCurrentPageSelected;

  const allEmployeesDisabled =
    attendances.length === 0 || attendances.every((e) => e.status !== null && e.status !== -1);

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

  const handleConfirmAction = async (time?: string) => {
    try {
      if (popupIsBulk) {
        // Get the current date
        const currentDate = new Date().toISOString();

        // Map status from popup type
        const statusMap = {
          present: AttendanceStatus.Present,
          late: AttendanceStatus.Late,
          absent: AttendanceStatus.Absent,
        };

        // Prepare bulk request data
        const bulkData = selectedAttendanceIds.map((attendanceId) => {
          const attendance = attendances.find((a) => a.teacherId === attendanceId);
          return {
            teacherId: attendance?.teacherId || attendanceId,
            date: currentDate,
            status: statusMap[popupType],
            delayTime: time || undefined,
          };
        });

        await dispatch(bulkCreateAttendance(bulkData)).unwrap();

        const successMessageMap = {
          present: 'attendance.bulkAttendanceSuccess',
          late: 'attendance.bulkLateSuccess',
          absent: 'attendance.bulkAbsentSuccess',
        };

        showToast({
          message: successMessageMap[popupType],
          type: 'success',
        });

        dispatch(clearSelection());

        // Refresh attendance list
        dispatch(
          fetchTeacherAttendance({
            page: currentPage,
            limit: pagination.limit,
            filters: {
              search: searchTerm || undefined,
              lkSchoolStageId: selectedStage || undefined,
              classroomId: selectedClassroom || undefined,
              status: selectedType ? Number(selectedType) : undefined,
            },
          })
        );
      } else if (popupEmployeeId) {
        const attendance = attendances.find((a) => a.teacherId === popupEmployeeId);
        if (!attendance) {
          throw new Error('common.errorOccurred');
        }

        // Map status from popup type
        const statusMap = {
          present: AttendanceStatus.Present,
          late: AttendanceStatus.Late,
          absent: AttendanceStatus.Absent,
        };

        const currentDate = new Date().toISOString();

        if (attendance.id) {
          const now = new Date();
          const currentTime =
            time ||
            `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

          await dispatch(
            updateTeacherAttendance({
              id: attendance.id,
              teacherId: attendance.teacherId,
              date: currentDate,
              checkInTime: currentTime,
              checkOutTime: attendance.checkOutTime || '18:00',
              status: statusMap[popupType],
            })
          ).unwrap();
        } else {
          await dispatch(
            bulkCreateAttendance([
              {
                teacherId: attendance.teacherId,
                date: currentDate,
                status: statusMap[popupType],
                delayTime: time || undefined,
              },
            ])
          ).unwrap();
        }

        // Show appropriate success message based on action type
        const successMessageMap = {
          present: 'attendance.individualAttendanceSuccess',
          late: 'attendance.individualLateSuccess',
          absent: 'attendance.individualAbsentSuccess',
        };

        showToast({
          message: successMessageMap[popupType],
          type: 'success',
        });

        // Deselect the employee that was just marked
        dispatch(deselectAttendance(attendance.teacherId));

        // Refresh attendance list
        dispatch(
          fetchTeacherAttendance({
            page: currentPage,
            limit: pagination.limit,
            filters: {
              search: searchTerm || undefined,
              lkSchoolStageId: selectedStage || undefined,
              classroomId: selectedClassroom || undefined,
              status: selectedType ? Number(selectedType) : undefined,
            },
          })
        );
      }
      setPopupOpen(false);
    } catch (error) {
      setPopupOpen(false);
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      const isApiError = typeof error === 'string' && error !== 'common.errorOccurred';
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: isApiError,
      });
    }
  };

  const handleCancelPopup = () => {
    setPopupOpen(false);
  };

  const columns: DataTableColumn<TeacherAttendance>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = attendances?.findIndex((a) => a?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
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
          disabled={allEmployeesDisabled}
          className={`h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
            allEmployeesDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        />
      ),
      accessor: (row) => {
        const hasStatus = row.status !== null && row.status !== -1;
        return (
          <input
            type="checkbox"
            id={`checkbox-${row.teacherId}`}
            name={`checkbox-${row.teacherId}`}
            checked={selectedAttendanceIds.includes(row.teacherId)}
            onChange={(e) => handleSelectEmployee(row.teacherId, e.target.checked)}
            disabled={hasStatus}
            className={`h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
              hasStatus ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          />
        );
      },
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: 'attendance.employeeName',
      accessor: (row) => (
        <div className="flex w-full items-center gap-2">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
            <CustomImage src={ProfileImage} alt="profile" className="h-full w-full object-cover" />
          </div>
          <span className="flex-1 font-medium">{row.teacherFullName}</span>
          <button
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 transition-colors hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teachers/${row.teacherId}?tab=attendance`);
            }}
          >
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
      header: 'attendance.time',
      accessor: (row) => {
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm">{formatTime(row.checkInTime)}</span>
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
      accessor: (row) => {
        const hasStatus = row.status !== null && row.status !== -1;

        if (hasStatus) {
          const statusDisplay = getStatusDisplay(row.status, t);
          return (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                row.status === AttendanceStatus.Present
                  ? 'bg-green-100 text-green-800'
                  : row.status === AttendanceStatus.Absent
                    ? 'bg-red-100 text-red-800'
                    : row.status === AttendanceStatus.Late
                      ? 'bg-yellow-100 text-yellow-800'
                      : row.status === AttendanceStatus.EarlyLeave
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusDisplay.text}
            </span>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
              onClick={() => handleIndividualAction(row.teacherId, row.teacherFullName, 'present')}
              title={t('attendance.present')}
            >
              <CustomImage src={CheckIcon} alt="check" className="h-4 w-4" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 transition-colors hover:bg-yellow-200"
              onClick={() => handleIndividualAction(row.teacherId, row.teacherFullName, 'late')}
              title={t('attendance.late')}
            >
              <CustomImage src={HistoryIcon} alt="history" className="h-4 w-4" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
              onClick={() => handleIndividualAction(row.teacherId, row.teacherFullName, 'absent')}
              title={t('attendance.absent')}
            >
              <CustomImage src={XMarkDangerIcon} alt="delete" className="h-4 w-4" />
            </button>
          </div>
        );
      },
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
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
          options={classrooms.map((classroom) => ({
            value: classroom.id,
            label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
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
          options={schoolStages.map((stage) => ({
            value: stage.id,
            label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
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
          keyExtractor={(row) => row.teacherId}
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
        isProcessing={isProcessing}
      />
    </div>
  );
}

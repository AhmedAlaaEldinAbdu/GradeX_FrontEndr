import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import IconButton from '@/shared/components/IconButton';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentAttendance } from '@/redux/features/student-attendance/studentAttendanceSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import type { StudentAttendanceDto } from '@/types/studentAttendance';
import { formatTime } from '@/shared/common/common';
import useLanguage from '@/hooks/useLanguage';

export default function AttendanceManagement() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { attendances, pagination, isLoading } = useAppSelector((state) => state.studentAttendance);
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const currentLang = useMemo(() => (isArabic ? 'ar' : 'en') as 'ar' | 'en', [isArabic]);

  // Selection state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'present' | 'absent' | 'late'>('present');
  const [popupIsBulk, setPopupIsBulk] = useState(false);
  const [popupStudentName, setPopupStudentName] = useState('');
  const [popupStudentId, setPopupStudentId] = useState<string | null>(null);

  // Load educational stages and classrooms for filters
  useEffect(() => {
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 1000 }));
    dispatch(fetchClassrooms({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch student attendance
  useEffect(() => {
    dispatch(
      fetchStudentAttendance({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        search: searchTerm || undefined,
        lkSchoolStageId: selectedStageId || undefined,
        classroomId: selectedClassroomId || undefined,
        date: selectedDate || undefined,
      })
    );
  }, [
    dispatch,
    pagination.pageIndex,
    pagination.pageSize,
    searchTerm,
    selectedStageId,
    selectedClassroomId,
    selectedDate,
  ]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchStudentAttendance({
        page,
        limit: pagination.pageSize,
        search: searchTerm || undefined,
        lkSchoolStageId: selectedStageId || undefined,
        classroomId: selectedClassroomId || undefined,
        date: selectedDate || undefined,
      })
    );
  };

  // Selection handlers
  const getStudentKey = (row: StudentAttendanceDto) => row.studentId || row.id || '';

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, id]);
    } else {
      setSelectedStudents((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = attendances.map((s) => getStudentKey(s));
      setSelectedStudents((prev) => {
        const newSelected = [...prev];
        currentPageIds.forEach((id) => {
          if (id && !newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      const currentPageIds = attendances.map((s) => getStudentKey(s));
      setSelectedStudents((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const allCurrentPageSelected =
    attendances.length > 0 && attendances.every((s) => selectedStudents.includes(getStudentKey(s)));

  const someCurrentPageSelected =
    attendances.some((s) => selectedStudents.includes(getStudentKey(s))) && !allCurrentPageSelected;

  // Individual action handlers
  const handleIndividualAction = (
    studentId: string,
    studentName: string,
    type: 'present' | 'absent' | 'late'
  ) => {
    setPopupStudentId(studentId);
    setPopupStudentName(studentName);
    setPopupType(type);
    setPopupIsBulk(false);
    setPopupOpen(true);
  };

  // Bulk action handlers
  const handleBulkActionClick = (type: 'present' | 'absent' | 'late') => {
    setPopupType(type);
    setPopupIsBulk(true);
    setPopupStudentId(null);
    setPopupStudentName('');
    setPopupOpen(true);
  };

  const handleConfirmAction = (time?: string) => {
    if (popupIsBulk) {
      console.log(
        `Bulk action: ${popupType} for students:`,
        selectedStudents,
        time ? `at ${time}` : ''
      );
      setSelectedStudents([]);
    } else if (popupStudentId) {
      console.log(
        `Individual action: ${popupType} for student:`,
        popupStudentId,
        time ? `at ${time}` : ''
      );
    }
    setPopupOpen(false);
  };

  const handleCancelPopup = () => {
    setPopupOpen(false);
  };

  const columns: DataTableColumn<StudentAttendanceDto>[] = [
    {
      header: '#',
      accessor: (_row, index) =>
        (pagination.pageIndex - 1) * pagination.pageSize + (index || 0) + 1,
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
          className="h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-[#1FAD6C] checked:bg-[#1FAD6C] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik05IDE2LjE3TDQuODMgMTJsLTEuNDIgMS40MUw5IDE5IDIxIDdsLTEuNDEtMS40MUw5IDE2LjE3eiIvPjwvc3ZnPg==')] checked:bg-center checked:bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-1"
        />
      ),
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(getStudentKey(row))}
          onChange={(e) => handleSelectStudent(getStudentKey(row), e.target.checked)}
          className="h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-[#1FAD6C] checked:bg-[#1FAD6C] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik05IDE2LjE3TDQuODMgMTJsLTEuNDIgMS40MUw5IDE5IDIxIDdsLTEuNDEtMS40MUw5IDE2LjE3eiIvPjwvc3ZnPg==')] checked:bg-center checked:bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-1"
        />
      ),
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: 'attendance.studentName',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <CustomImage src={ProfileImage} alt="profile" className="h-full w-full object-cover" />
          </div>
          {row.teacherFullName || '-'}
          <IconButton
            variant="blue"
            ariaLabel={t('common.view')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.studentId}?tab=attendance`, {
                state: { from: 'attendance' },
              });
            }}
            className="h-8 w-8"
          >
            <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-4 w-4" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[230px]',
    },
    {
      header: 'attendance.educationalStage',
      accessor: (row) => {
        const classroom = classrooms.find((c) => c.id === row.classroomId);
        return <span>{classroom?.gradeName || '-'}</span>;
      },
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'attendance.classroom',
      accessor: (row) => <span>{isArabic ? row.classroomNameAr : row.classroomNameEn || '-'}</span>,
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'attendance.date',
      accessor: (row) => (
        <span>
          {row.date ? new Date(row.date).toLocaleDateString(isArabic ? 'ar' : 'en') : '-'}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'attendance.attendanceTime',
      accessor: (row) => {
        if (row.status === 2) {
          return (
            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              {t('attendance.absent')}
            </span>
          );
        }
        if (row.status === 3) {
          return (
            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              {t('attendance.late')}
            </span>
          );
        }
        return (
          <span className="text-sm">
            {row.checkInTime ? formatTime(row.checkInTime, currentLang) : '-'}
          </span>
        );
      },
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'attendance.departureTime',
      accessor: (row) => (
        <span className="text-sm">
          {row.checkOutTime ? formatTime(row.checkOutTime, currentLang) : '-'}
        </span>
      ),
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'attendance.earlyLeave',
      accessor: (row) => (
        <span className="text-sm text-gray-500">
          {row.status === 4 ? t('attendance.earlyLeave') : t('attendance.noEarlyLeave')}
        </span>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
    {
      header: 'attendance.createdBy',
      accessor: (row) => (
        <span className="text-sm">
          {row.createdBy?.createdByFullNane || '-'}
          {row.createdBy?.administrativePositionNameAr ||
          row.createdBy?.administrativePositionNameEn
            ? ` (${isArabic ? row.createdBy.administrativePositionNameAr : row.createdBy.administrativePositionNameEn})`
            : ''}
        </span>
      ),
      headerClassName: 'min-w-[220px]',
      className: 'text-center',
    },
    {
      header: 'attendance.actions',
      accessor: (row) => {
        const studentName = row.teacherFullName || '-';
        const studentKey = getStudentKey(row);
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-300"
              onClick={() => handleIndividualAction(studentKey, studentName, 'present')}
              title={t('attendance.present')}
            >
              <CustomImage src={CheckIcon} alt="check" className="h-4 w-4" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 transition-colors hover:bg-yellow-200"
              onClick={() => handleIndividualAction(studentKey, studentName, 'late')}
              title={t('attendance.late')}
            >
              <CustomImage src={HistoryIcon} alt="history" className="h-4 w-4" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
              onClick={() => handleIndividualAction(studentKey, studentName, 'absent')}
              title={t('attendance.absent')}
            >
              <CustomImage src={XMarkDangerIcon} alt="delete" className="h-4 w-4" />
            </button>
          </div>
        );
      },
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchStudent',
      placeholder: t('attendance.searchStudent'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      placeholder: '',
      value: selectedStageId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedStageId}
          onChange={(value) => setSelectedStageId(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(educationalStages)
              ? educationalStages.map((stage) => ({
                  value: stage?.id || '',
                  label: isArabic ? stage?.nameAr || '' : stage?.nameEn || '',
                }))
              : []
          }
          placeholder={t('attendance.educationalStage')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
      placeholder: '',
      value: selectedClassroomId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedClassroomId}
          onChange={(value) =>
            setSelectedClassroomId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={
            Array.isArray(classrooms)
              ? classrooms.map((c) => ({
                  value: c?.id || '',
                  label: isArabic ? c?.name || '' : c?.nameEn || '',
                }))
              : []
          }
          placeholder={t('attendance.classroom')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'date-filter',
      placeholder: '',
      value: selectedDate,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <div className="relative w-full">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#1FAD6C] focus:ring-1 focus:ring-[#1FAD6C]"
            placeholder={t('attendance.date')}
          />
        </div>
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStageId('');
    setSelectedClassroomId('');
    setSelectedDate('');
    setSelectedStudents([]);
  };

  const bulkActionsBar =
    selectedStudents.length > 0 ? (
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
      <Card>
        <DataTable
          data={attendances}
          columns={columns}
          keyExtractor={(row) => getStudentKey(row)}
          pagination={{
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            total: pagination.totalItems,
            totalPages: pagination.totalPages,
          }}
          onPageChange={handlePageChange}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          bulkActions={bulkActionsBar}
          isLoading={isLoading}
          emptyMessage={t('attendance.noStudents')}
          t={t}
        />
      </Card>

      {/* Attendance Confirmation Popup */}
      <AttendanceConfirmPopup
        open={popupOpen}
        type={popupType}
        isBulk={popupIsBulk}
        personName={popupStudentName}
        personType="student"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelPopup}
      />
    </div>
  );
}

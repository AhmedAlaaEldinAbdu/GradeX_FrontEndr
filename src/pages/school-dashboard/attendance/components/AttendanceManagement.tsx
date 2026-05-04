import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import Input from '@/shared/components/Input';
import AttendanceConfirmPopup from '@/pages/school-dashboard/attendance/popups/AttendanceConfirmPopup';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import CheckGreenIcon from '@gradex/assets/icons/CheckGreen.svg';
import HistoryIcon from '@gradex/assets/icons/History.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import IconButton from '@/shared/components/IconButton';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchStudentAttendance,
  bulkCreateStudentAttendance,
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
  clearSelection,
} from '@/redux/features/student-attendance/studentAttendanceSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { StudentAttendanceDto } from '@/types/studentAttendance';
import { StudentAttendanceStatus } from '@/types/studentAttendance';
import { formatTime } from '@/shared/common/common';
import { useToast } from '@/shared/context/ToastContext';
import useLanguage from '@/hooks/useLanguage';

export default function AttendanceManagement() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const schoolBranchId = getCurrentSchoolBranchId();

  // Redux state
  const { attendances, pagination, isLoading, selectedAttendanceIds } = useAppSelector(
    (state) => state.studentAttendance
  );
  const isProcessing = isLoading;
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const currentLang = useMemo(() => (isArabic ? 'ar' : 'en') as 'ar' | 'en', [isArabic]);

  // Note: Selection is managed via Redux (selectedAttendanceIds)

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'present' | 'absent' | 'late'>('present');
  const [popupIsBulk, setPopupIsBulk] = useState(false);
  const [popupStudentName, setPopupStudentName] = useState('');
  const [popupStudentId, setPopupStudentId] = useState<string | null>(null);

  // Load educational stages and classrooms for filters
  useEffect(() => {
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 1000,
        schoolBranchId: schoolBranchId || undefined,
      })
    );
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 1000,
        filters: { schoolBranchId: schoolBranchId || undefined },
      })
    );
  }, [dispatch, schoolBranchId]);

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
    attendances.length > 0 && attendances.every((s) => selectedAttendanceIds.includes(s.studentId));

  const someCurrentPageSelected =
    attendances.some((s) => selectedAttendanceIds.includes(s.studentId)) && !allCurrentPageSelected;

  const allStudentsDisabled =
    attendances.length === 0 ||
    attendances.every((s) => s.status !== null && s.status !== -1 && s.status !== 0);

  // Helper to refresh attendance list
  const refreshAttendanceList = () => {
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
  };

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

  const handleConfirmAction = async (time?: string) => {
    try {
      const statusMap = {
        present: StudentAttendanceStatus.Present,
        late: StudentAttendanceStatus.Late,
        absent: StudentAttendanceStatus.Absent,
      };

      const currentDate = new Date().toISOString();

      if (popupIsBulk) {
        // Prepare bulk request data
        const bulkData = selectedAttendanceIds.map((studentId) => ({
          studentId,
          date: currentDate,
          status: statusMap[popupType],
          delayTime: time || undefined,
        }));

        await dispatch(bulkCreateStudentAttendance(bulkData)).unwrap();

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
        refreshAttendanceList();
      } else if (popupStudentId) {
        // Individual action — use bulk-create with a single item
        await dispatch(
          bulkCreateStudentAttendance([
            {
              studentId: popupStudentId,
              date: currentDate,
              status: statusMap[popupType],
              delayTime: time || undefined,
            },
          ])
        ).unwrap();

        const successMessageMap = {
          present: 'attendance.individualAttendanceSuccess',
          late: 'attendance.individualLateSuccess',
          absent: 'attendance.individualAbsentSuccess',
        };

        showToast({
          message: successMessageMap[popupType],
          type: 'success',
        });

        dispatch(deselectAttendance(popupStudentId));
        refreshAttendanceList();
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
        <CustomCheckbox
          label=""
          checked={allCurrentPageSelected}
          indeterminate={someCurrentPageSelected}
          onChange={(checked) => handleSelectAll(checked)}
          disabled={allStudentsDisabled}
          className="!gap-0 !py-0"
        />
      ),
      accessor: (row) => {
        const hasStatus = row.status !== null && row.status !== -1 && row.status !== 0;
        const studentKey = getStudentKey(row);
        return (
          <CustomCheckbox
            label=""
            name={`checkbox-${studentKey}`}
            checked={selectedAttendanceIds.includes(studentKey)}
            onChange={(checked) => handleSelectStudent(studentKey, checked)}
            disabled={hasStatus}
            className="!gap-0 !py-0"
            inputProps={{ id: `checkbox-${studentKey}` }}
          />
        );
      },
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: 'attendance.studentName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <CustomImage
            src={ProfileImage}
            alt="profile"
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
          />

          <span className="flex-1 text-sm font-normal text-[#646969]">
            {row.teacherFullName || '-'}
          </span>
          <IconButton
            variant="blue"
            ariaLabel={t('common.view')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.studentId}?tab=attendance`, {
                state: { from: 'attendance' },
              });
            }}
            className="h-10 w-10"
          >
            <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[230px]',
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
        const hasStatus = row.status !== null && row.status !== -1 && row.status !== 0;
        const studentName = row.teacherFullName || '-';
        const studentKey = getStudentKey(row);

        if (hasStatus) {
          const typeFromStatus: Record<number, 'present' | 'absent' | 'late'> = {
            [StudentAttendanceStatus.Present]: 'present',
            [StudentAttendanceStatus.Absent]: 'absent',
            [StudentAttendanceStatus.Late]: 'late',
            [StudentAttendanceStatus.EarlyLeave]: 'present',
          };
          const editType = typeFromStatus[row.status] ?? 'present';
          return (
            <div className="flex items-center justify-center">
              <IconButton
                status="edit"
                ariaLabel={t('actions.edit')}
                title={t('actions.edit')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIndividualAction(studentKey, studentName, editType);
                }}
                className="h-8 w-8 p-0 shadow-none"
                imgClassName="h-4 w-4"
              />
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#30B97E1A] transition-colors hover:bg-green-200"
              onClick={() => handleIndividualAction(studentKey, studentName, 'present')}
              title={t('attendance.present')}
            >
              <CustomImage src={CheckGreenIcon} alt="check" className="h-5 w-5" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF8E6] transition-colors hover:bg-yellow-200"
              onClick={() => handleIndividualAction(studentKey, studentName, 'late')}
              title={t('attendance.late')}
            >
              <CustomImage src={HistoryIcon} alt="history" className="h-5 w-5" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
              onClick={() => handleIndividualAction(studentKey, studentName, 'absent')}
              title={t('attendance.absent')}
            >
              <CustomImage src={XmarkCircleRedIcon} alt="delete" className="h-5 w-5" />
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
      width: '30%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      placeholder: '',
      value: selectedStageId,
      onChange: () => {},
      width: '20%',
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
      width: '20%',
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
      width: '20%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder={t('attendance.date')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStageId('');
    setSelectedClassroomId('');
    setSelectedDate('');
    dispatch(clearSelection());
  };

  const bulkActionsBar =
    selectedAttendanceIds.length > 0 ? (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleBulkActionClick('present')}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-green-500 bg-white px-4 py-2 text-base font-medium text-green-500 transition-colors hover:bg-green-50"
        >
          <CustomImage src={CheckGreenIcon} className="h-4 w-4" alt="present" />
          <span>{t('attendance.markAllPresent')}</span>
        </button>
        <button
          onClick={() => handleBulkActionClick('late')}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#FAB915] bg-white px-4 py-2 text-base font-medium text-[#C89004] transition-colors hover:bg-yellow-50"
        >
          <CustomImage src={HistoryIcon} className="h-4 w-4" alt="late" />
          <span>{t('attendance.markAllLate')}</span>
        </button>
        <button
          onClick={() => handleBulkActionClick('absent')}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#B80817] bg-white px-4 py-2 text-base font-medium text-[#B80817] transition-colors hover:bg-red-50"
        >
          <CustomImage src={XmarkCircleRedIcon} className="h-4 w-4" alt="absent" />
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
        isProcessing={isProcessing}
      />
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import useLanguage from '@/hooks/useLanguage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import {
  approveStudentEarlyLeaveRequest,
  deleteStudentEarlyLeaveRequest,
  fetchStudentEarlyLeaveRequests,
} from '@/redux/features/studentRequestEarlyLeaveSlice';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditGreenIcon from '@gradex/assets/icons/EditGreen.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

import {
  EarlyLeaveStatus,
  type EarlyLeaveRequestDto,
} from '@/services/api/requests/requests.types';
import EarlyLeaveDetailsPopup from './EarlyLeaveDetailsPopup';
import ConfirmActionPopup from './ConfirmActionPopup';
import { formatEarlyLeaveDuration, formatEarlyLeaveTime } from './earlyLeaveFormatters';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const PAGE_SIZE = 10;

type ConfirmState = { type: 'approve' | 'delete'; request: EarlyLeaveRequestDto } | null;

const STATUS_BADGE_CLASSES: Record<EarlyLeaveStatus, string> = {
  [EarlyLeaveStatus.Pending]: 'bg-orange-100 text-orange-700',
  [EarlyLeaveStatus.Accepted]: 'bg-green-100 text-green-700',
  [EarlyLeaveStatus.Rejected]: 'bg-red-100 text-red-700',
};

const STATUS_LABEL_KEYS: Record<EarlyLeaveStatus, string> = {
  [EarlyLeaveStatus.Pending]: 'requests.earlyLeave.status.pending',
  [EarlyLeaveStatus.Accepted]: 'requests.earlyLeave.status.accepted',
  [EarlyLeaveStatus.Rejected]: 'requests.earlyLeave.status.rejected',
};

const EarlyLeaveRequestsTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { guardMutation } = useRoleAccess();
  const schoolBranchId = getCurrentSchoolBranchId();

  const { requests, isLoading, isUpdating, pagination } = useAppSelector(
    (state) => state.studentRequestEarlyLeave
  );
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const [detailsRequest, setDetailsRequest] = useState<EarlyLeaveRequestDto | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  useEffect(() => {
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 100,
        schoolBranchId: schoolBranchId || undefined,
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 100,
        filters: {
          gradeId: selectedStageId || undefined,
          schoolBranchId: schoolBranchId || undefined,
        },
      })
    );
  }, [dispatch, schoolBranchId, selectedStageId]);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(
        fetchStudentEarlyLeaveRequests({
          page,
          limit: PAGE_SIZE,
          searchTerm,
          status: selectedStatus ? (Number(selectedStatus) as EarlyLeaveStatus) : undefined,
          date: selectedDate,
          gradeId: selectedStageId || undefined,
          classroomId: selectedClassroomId || undefined,
        })
      );
    }, 350);

    return () => clearTimeout(handle);
  }, [
    dispatch,
    page,
    searchTerm,
    selectedClassroomId,
    selectedDate,
    selectedStageId,
    selectedStatus,
  ]);

  const stageOptions = useMemo(
    () =>
      educationalStages.map((stage) => ({
        value: stage.id,
        label: (isArabic && stage.nameAr) || stage.nameEn || stage.nameAr || '',
      })),
    [educationalStages, isArabic]
  );

  const classroomOptions = useMemo(
    () =>
      classrooms.map((classroom) => ({
        value: classroom.id,
        label: (isArabic && classroom.name) || classroom.nameEn || classroom.name,
      })),
    [classrooms, isArabic]
  );

  const handleConfirm = async () => {
    if (!confirm) return;

    try {
      if (confirm.type === 'approve') {
        await dispatch(approveStudentEarlyLeaveRequest(confirm.request.id)).unwrap();
        showToast({ message: t('requests.earlyLeave.approvedSuccess'), type: 'success' });
      } else {
        await dispatch(deleteStudentEarlyLeaveRequest(confirm.request.id)).unwrap();
        showToast({ message: t('requests.earlyLeave.deletedSuccess'), type: 'success' });
      }
      setConfirm(null);
    } catch (error) {
      showToast({
        message: typeof error === 'string' ? error : t('common.errorOccurred'),
        type: 'error',
      });
    }
  };

  const getStatusBadge = (status: EarlyLeaveStatus) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );

  const columns: DataTableColumn<EarlyLeaveRequestDto>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index || 0) + 1 + (page - 1) * PAGE_SIZE}
        </span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.requestPreview',
      accessor: (row) => (
        <div className="flex justify-center">
          <IconButton
            variant="darkBlue"
            ariaLabel={t('common.view')}
            className="h-10 w-10"
            onClick={() => setDetailsRequest(row)}
          >
            <CustomImage src={EyeDarkBlueIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.earlyLeave.studentName',
      accessor: (row) => (
        <UserAvatarName
          name={row.studentName}
          avatarSrc={row.studentAvatarPath}
          align="center"
          onView={
            row.studentId ? () => navigate(`/students/student-details/${row.studentId}`) : undefined
          }
        />
      ),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.requestStatus',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.earlyLeave.time',
      accessor: (row) => (
        <span className="whitespace-nowrap text-[#646969]">
          {formatEarlyLeaveTime(row.fromTime ?? row.time, i18n.language)}
        </span>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.earlyLeave.duration',
      accessor: (row) => (
        <span className="whitespace-nowrap text-[#646969]">{formatEarlyLeaveDuration(row, t)}</span>
      ),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.earlyLeave.date',
      accessor: (row) => <span className="text-[#646969]">{row.date}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.earlyLeave.stage',
      accessor: (row) => <span className="text-[#646969]">{row.stage}</span>,
      headerClassName: 'min-w-[160px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.earlyLeave.classroom',
      accessor: (row) => <span className="text-[#646969]">{row.classroom}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) =>
        row.status === EarlyLeaveStatus.Pending ? (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label={t('requests.earlyLeave.approve')}
              onClick={() => guardMutation(() => setConfirm({ type: 'approve', request: row }))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
            >
              <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={t('requests.earlyLeave.delete')}
              onClick={() => guardMutation(() => setConfirm({ type: 'delete', request: row }))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 transition-colors hover:bg-red-100"
            >
              <CustomImage src={TrashIcon} alt="" className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-label={t('common.edit')}
              onClick={() => guardMutation(() => {})}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 transition-colors hover:bg-green-100"
            >
              <CustomImage src={EditGreenIcon} alt="" className="h-5 w-5" />
            </button>
          </div>
        ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('requests.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '20%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      value: selectedStageId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStageId}
          onChange={(value) => {
            setSelectedStageId(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setSelectedClassroomId('');
            setPage(1);
          }}
          options={stageOptions}
          placeholder={t('requests.earlyLeave.stage')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
      value: selectedClassroomId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroomId}
          onChange={(value) => {
            setSelectedClassroomId(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={classroomOptions}
          placeholder={t('requests.earlyLeave.classroom')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={[
            {
              value: EarlyLeaveStatus.Pending.toString(),
              label: t('requests.earlyLeave.status.pending'),
            },
            {
              value: EarlyLeaveStatus.Accepted.toString(),
              label: t('requests.earlyLeave.status.accepted'),
            },
            {
              value: EarlyLeaveStatus.Rejected.toString(),
              label: t('requests.earlyLeave.status.rejected'),
            },
          ]}
          placeholder={t('requests.filters.status')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'date-filter',
      value: selectedDate,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setPage(1);
          }}
          placeholder={t('requests.earlyLeave.date')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStageId('');
    setSelectedClassroomId('');
    setSelectedStatus('');
    setSelectedDate('');
    setPage(1);
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={requests}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        isLoading={isLoading}
        pagination={{
          page,
          limit: PAGE_SIZE,
          total: pagination.totalItems,
          totalPages: Math.max(1, pagination.totalPages),
        }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        t={t}
      />

      <EarlyLeaveDetailsPopup
        isOpen={!!detailsRequest}
        onClose={() => setDetailsRequest(null)}
        request={detailsRequest}
      />

      <ConfirmActionPopup
        open={!!confirm}
        iconSrc={confirm?.type === 'delete' ? XMarkDangerIcon : BigSuccessIcon}
        message={
          confirm?.type === 'delete'
            ? t('requests.earlyLeave.deleteConfirm')
            : t('requests.earlyLeave.approveConfirm')
        }
        confirmLabel={
          confirm?.type === 'delete'
            ? t('requests.earlyLeave.delete')
            : t('requests.earlyLeave.approve')
        }
        confirmVariant={confirm?.type === 'delete' ? 'danger' : 'primary'}
        isProcessing={isUpdating}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!isUpdating) setConfirm(null);
        }}
      />
    </Card>
  );
};

export default EarlyLeaveRequestsTab;

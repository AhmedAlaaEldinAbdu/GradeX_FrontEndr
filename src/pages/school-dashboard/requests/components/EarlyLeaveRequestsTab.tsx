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
import {
  fetchStudentEarlyLeaveRequests,
  updateStudentEarlyLeaveStatus,
} from '@/redux/features/studentRequestEarlyLeaveSlice';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
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

const PAGE_SIZE = 10;

type ConfirmState = { type: 'accept' | 'reject'; request: EarlyLeaveRequestDto } | null;

const EarlyLeaveRequestsTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { requests, isLoading, isUpdating, pagination } = useAppSelector(
    (state) => state.studentRequestEarlyLeave
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const [detailsRequest, setDetailsRequest] = useState<EarlyLeaveRequestDto | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(
        fetchStudentEarlyLeaveRequests({
          page,
          limit: PAGE_SIZE,
          searchTerm,
          date: selectedDate,
        })
      );
    }, 350);

    return () => clearTimeout(handle);
  }, [dispatch, page, searchTerm, selectedDate]);

  const filteredData = useMemo(
    () =>
      requests.filter((row) => {
        const matchesStage = !selectedStage || row.stage === selectedStage;
        const matchesClassroom = !selectedClassroom || row.classroom === selectedClassroom;
        return matchesStage && matchesClassroom;
      }),
    [requests, selectedStage, selectedClassroom]
  );

  const toOptions = (values: string[]) =>
    Array.from(new Set(values.filter((value) => value && value !== '-'))).map((value) => ({
      value,
      label: value,
    }));

  const stageOptions = useMemo(
    () => toOptions(requests.map((request) => request.stage)),
    [requests]
  );
  const classroomOptions = useMemo(
    () => toOptions(requests.map((request) => request.classroom)),
    [requests]
  );

  const handleConfirm = async () => {
    if (!confirm) return;

    const status =
      confirm.type === 'accept' ? EarlyLeaveStatus.Accepted : EarlyLeaveStatus.Rejected;

    try {
      await dispatch(updateStudentEarlyLeaveStatus({ id: confirm.request.id, status })).unwrap();
      showToast({ message: t('studentApplications.statusUpdated'), type: 'success' });
      setConfirm(null);
    } catch (error) {
      showToast({
        message: typeof error === 'string' ? error : t('common.errorOccurred'),
        type: 'error',
      });
    }
  };

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
              aria-label={t('requests.earlyLeave.confirm')}
              onClick={() => setConfirm({ type: 'accept', request: row })}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
            >
              <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={t('requests.earlyLeave.reject')}
              onClick={() => setConfirm({ type: 'reject', request: row })}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 transition-colors hover:bg-red-100"
            >
              <CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-label={t('common.edit')}
              onClick={() => setDetailsRequest(row)}
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
      width: '30%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => {
            setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : (value as string));
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
      value: selectedClassroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) => {
            setSelectedClassroom(Array.isArray(value) ? (value[0] ?? '') : (value as string));
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
    setSelectedStage('');
    setSelectedClassroom('');
    setSelectedDate('');
    setPage(1);
  };

  const hasClientFilters = Boolean(selectedStage || selectedClassroom);
  const totalItems = hasClientFilters ? filteredData.length : pagination.totalItems;
  const totalPages = hasClientFilters
    ? Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
    : Math.max(1, pagination.totalPages);

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        isLoading={isLoading}
        pagination={{ page, limit: PAGE_SIZE, total: totalItems, totalPages }}
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
        iconSrc={confirm?.type === 'reject' ? XMarkDangerIcon : BigSuccessIcon}
        message={
          confirm?.type === 'reject'
            ? t('requests.earlyLeave.rejectConfirm')
            : t('requests.earlyLeave.acceptConfirm')
        }
        confirmLabel={
          confirm?.type === 'reject'
            ? t('requests.earlyLeave.reject')
            : t('requests.earlyLeave.confirm')
        }
        confirmVariant={confirm?.type === 'reject' ? 'danger' : 'primary'}
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

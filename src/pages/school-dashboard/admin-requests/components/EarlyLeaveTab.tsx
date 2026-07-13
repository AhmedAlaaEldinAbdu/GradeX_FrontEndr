import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchEarlyLeaves,
  fetchEarlyLeaveById,
} from '@/redux/features/teacher-requests/teacherRequestsSlice';
import type { EarlyLeaveRequestStatus } from '@/services/api/types/teacher-requests.types';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import EarlyLeaveDetailsPopup from '../popups/EarlyLeaveDetailsPopup';
import ApproveRejectConfirmationPopup from '../popups/ApproveRejectConfirmationPopup';
import type { EarlyLeaveRequestDto } from '@/services/api/types/teacher-requests.types';

const EarlyLeaveTab: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Format time from HH:mm:ss to display format (HH:mm)
  const formatTime = (timeString: string): string => {
    if (!timeString) return '--';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Format duration from HH:mm:ss to readable format
  const formatDuration = (durationString: string, t: (key: string) => string): string => {
    if (!durationString) return '--';
    const [hours, minutes] = durationString.split(':');
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    let result = '';
    if (hoursNum > 0) {
      const hourLabel =
        hoursNum === 1
          ? t('adminRequests.earlyLeave.timeUnits.hour')
          : t('adminRequests.earlyLeave.timeUnits.hours');
      result += `${hoursNum} ${hourLabel}`;
    }
    if (minutesNum > 0) {
      if (result) result += ` ${t('adminRequests.earlyLeave.timeUnits.and')} `;
      const minuteLabel =
        minutesNum === 1
          ? t('adminRequests.earlyLeave.timeUnits.minute')
          : t('adminRequests.earlyLeave.timeUnits.minutes');
      result += `${minutesNum} ${minuteLabel}`;
    }
    return result || '--';
  };

  // Format date from ISO string to DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '--';
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EarlyLeaveRequestStatus | ''>('');
  const [page, setPage] = useState(1);
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'approve' | 'reject'>('approve');
  const [selectedRequest, setSelectedRequest] = useState<EarlyLeaveRequestDto | null>(null);

  const PAGE_SIZE = 10;

  // Redux selectors
  const earlyLeaves = useAppSelector((state) => state.teacherRequests.earlyLeaves);
  const earlyLeavesPagination = useAppSelector(
    (state) => state.teacherRequests.earlyLeavesPagination
  );
  const isLoading = useAppSelector((state) => state.teacherRequests.isEarlyLeavesLoading);
  const currentEarlyLeave = useAppSelector((state) => state.teacherRequests.currentEarlyLeave);

  // Load early leaves when tab becomes active
  const loadEarlyLeaves = useCallback(() => {
    dispatch(
      fetchEarlyLeaves({
        PageNumber: page,
        PageSize: PAGE_SIZE,
        SearchTeacherName: searchTerm || undefined,
        RequestStatus:
          selectedStatus !== '' ? (selectedStatus as EarlyLeaveRequestStatus) : undefined,
      })
    );
  }, [dispatch, page, searchTerm, selectedStatus]);

  useEffect(() => {
    if (isActive) {
      loadEarlyLeaves();
    }
  }, [isActive, loadEarlyLeaves]);

  // Status mapping: 1 = Pending, 2 = Approved, 3 = Rejected
  const statusBadgeConfig = {
    1: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: t('adminRequests.earlyLeave.pending'),
    },
    2: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: t('adminRequests.earlyLeave.approved'),
    },
    3: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: t('adminRequests.earlyLeave.rejected'),
    },
  } as const;

  const handleViewDetails = (request: EarlyLeaveRequestDto) => {
    dispatch(fetchEarlyLeaveById(request.id));
    setIsDetailsPopupOpen(true);
  };

  const handleCloseDetailsPopup = () => {
    setIsDetailsPopupOpen(false);
  };

  const handleApprove = (request: EarlyLeaveRequestDto) => {
    setSelectedRequest(request);
    setConfirmationType('approve');
    setIsConfirmationOpen(true);
  };

  const handleReject = (request: EarlyLeaveRequestDto) => {
    setSelectedRequest(request);
    setConfirmationType('reject');
    setIsConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setSelectedRequest(null);
  };

  const statusOptions = [
    { value: '1', label: t('adminRequests.earlyLeave.pending') },
    { value: '2', label: t('adminRequests.earlyLeave.approved') },
    { value: '3', label: t('adminRequests.earlyLeave.rejected') },
  ];

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
      header: t('adminRequests.earlyLeave.previewRequest'),
      accessor: (row) => (
        <IconButton
          variant="darkBlue"
          ariaLabel={t('common.view')}
          imgClassName="h-5 w-5"
          onClick={() => handleViewDetails(row)}
        >
          <CustomImage src={EyeDarkBlueIcon} alt="" className="h-6 w-6" />
        </IconButton>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.applicant'),
      accessor: (row) => (
        <UserAvatarName
          name={row.teacherName}
          avatarSrc={undefined}
          onView={() => handleViewDetails(row)}
        />
      ),
      headerClassName: 'min-w-[200px]',
      className: 'min-w-[200px]',
    },
    {
      header: t('adminRequests.earlyLeave.time'),
      accessor: (row) => (
        <span className="text-gray-700">
          {formatTime(row.fromTime)} - {formatTime(row.toTime)}
        </span>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.earlyLeaveDuration'),
      accessor: (row) => <span className="text-gray-700">{formatDuration(row.duration, t)}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.requestStatus'),
      accessor: (row) => {
        const status = row.requestStatus as 1 | 2 | 3;
        const config =
          statusBadgeConfig[status as keyof typeof statusBadgeConfig] || statusBadgeConfig[1];
        return (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${config.bg} ${config.text}`}
            >
              {config.label}
            </span>
          </div>
        );
      },
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.requestDate'),
      accessor: (row) => <span className="text-gray-700">{formatDate(row.date)}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.actions'),
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          {row.requestStatus === 1 ? (
            <>
              <IconButton
                variant="success"
                ariaLabel={t('adminRequests.popup.approve')}
                className="rounded-full bg-green-100 p-2.5 hover:bg-green-200"
                onClick={() => handleApprove(row)}
              >
                <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />
              </IconButton>
              <IconButton
                variant="danger"
                ariaLabel={t('adminRequests.popup.reject')}
                className="rounded-full bg-red-100 p-2.5 hover:bg-red-200"
                onClick={() => handleReject(row)}
              >
                <CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />
              </IconButton>
            </>
          ) : (
            <IconButton
              variant="blue"
              ariaLabel={t('common.edit')}
              className="rounded-full bg-green-100 p-2.5 hover:bg-green-200"
              onClick={() => handleViewDetails(row)}
            >
              <CustomImage src={EditIcon} alt="" className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('adminRequests.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus ? String(selectedStatus) : '',
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStatus ? String(selectedStatus) : ''}
          onChange={(value) => {
            const numValue = value ? Number(Array.isArray(value) ? value[0] : value) : '';
            setSelectedStatus(numValue === '' ? '' : (numValue as EarlyLeaveRequestStatus));
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('adminRequests.earlyLeave.chooseStatus')}
          showSearch={false}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setPage(1);
  };

  return (
    <>
      <Card className="rounded-2xl" padding="lg">
        <DataTable
          data={earlyLeaves}
          columns={columns}
          keyExtractor={(row) => row.id}
          filters={filterConfigs}
          showFilters={true}
          pagination={{
            page,
            limit: PAGE_SIZE,
            total: earlyLeavesPagination.total,
            totalPages: earlyLeavesPagination.totalPages,
          }}
          onPageChange={setPage}
          onResetFilters={handleResetFilters}
          emptyMessage="adminRequests.empty"
          isLoading={isLoading}
          t={t}
        />
      </Card>
      <EarlyLeaveDetailsPopup
        isOpen={isDetailsPopupOpen}
        onClose={handleCloseDetailsPopup}
        request={currentEarlyLeave}
      />
      <ApproveRejectConfirmationPopup
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
        type={confirmationType}
        requestId={selectedRequest?.id || ''}
      />
    </>
  );
};

export default EarlyLeaveTab;

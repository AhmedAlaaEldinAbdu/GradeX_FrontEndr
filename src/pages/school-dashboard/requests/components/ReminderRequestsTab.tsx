import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import { useToast } from '@/shared/context/ToastContext';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchRequestAppointments,
  markRequestAppointmentAsViewed,
} from '@/redux/features/requestAppointmentSlice';
import type {
  RequestAppointmentDto,
  StudentRequestDto,
} from '@/services/api/requests/requests.types';
import {
  RequestAppointmentParticipant,
  StudentRequestStatus,
  StudentRequestType,
  RequestParticipantRole,
} from '@/services/api/requests/requests.types';
import MessageDetailsPopup from '../popups/MessageDetailsPopup';

const PAGE_SIZE = 10;

const formatRequestDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const emptyWhenMissing = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== '-' ? trimmed : '';
};

const STATUS_BADGE_CLASSES: Record<StudentRequestStatus, string> = {
  [StudentRequestStatus.Sent]: 'bg-purple-100 text-purple-700',
  [StudentRequestStatus.Viewed]: 'bg-green-100 text-green-700',
  [StudentRequestStatus.Replied]: 'bg-blue-100 text-blue-700',
  [StudentRequestStatus.Pending]: 'bg-orange-100 text-orange-700',
};

const STATUS_LABEL_KEYS: Record<StudentRequestStatus, string> = {
  [StudentRequestStatus.Sent]: 'requests.status.sent',
  [StudentRequestStatus.Viewed]: 'requests.status.viewed',
  [StudentRequestStatus.Replied]: 'requests.status.replied',
  [StudentRequestStatus.Pending]: 'requests.status.pending',
};

const ReminderRequestsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { appointments, isLoading, pagination } = useAppSelector(
    (state) => state.requestAppointments
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestDto | null>(null);
  const [isMarkingViewed, setIsMarkingViewed] = useState(false);

  const schoolLabel = t('requests.schoolLabel');

  const mapAppointmentToRequest = useMemo(
    () =>
      (appointment: RequestAppointmentDto): StudentRequestDto => {
        const senderIsSchool =
          appointment.appointmentSender === RequestAppointmentParticipant.School;
        const receiverIsSchool =
          appointment.appointmentReciver === RequestAppointmentParticipant.School;
        const parentName = emptyWhenMissing(appointment.parentName);
        const studentName = emptyWhenMissing(appointment.studentName);
        const requestStatus = appointment.isViewed
          ? StudentRequestStatus.Viewed
          : receiverIsSchool
            ? StudentRequestStatus.Pending
            : StudentRequestStatus.Sent;

        return {
          id: appointment.id,
          senderName: senderIsSchool ? schoolLabel : parentName,
          senderAvatarPath: null,
          senderRole: senderIsSchool
            ? RequestParticipantRole.School
            : RequestParticipantRole.Parent,
          senderId: senderIsSchool ? undefined : appointment.parentId,
          recipientName: receiverIsSchool ? schoolLabel : parentName,
          recipientAvatarPath: null,
          recipientRole: receiverIsSchool
            ? RequestParticipantRole.School
            : RequestParticipantRole.Parent,
          recipientId: receiverIsSchool ? undefined : appointment.parentId,
          messageContent: emptyWhenMissing(appointment.reason),
          status: requestStatus,
          type: StudentRequestType.Reminder,
          created: appointment.date,
          studentName,
          studentId: appointment.studentId || undefined,
          isViewed: appointment.isViewed,
          viewedAt: appointment.viewedAt,
          viewedByUserId: appointment.viewedByUserId,
          viewedByName: appointment.viewedByName,
        };
      },
    [schoolLabel]
  );

  useEffect(() => {
    dispatch(
      fetchRequestAppointments({
        page,
        limit: PAGE_SIZE,
        studentName: searchTerm.trim() || undefined,
        date: selectedDate || undefined,
      })
    );
  }, [dispatch, page, searchTerm, selectedDate]);

  const requests = useMemo(
    () => appointments.map(mapAppointmentToRequest),
    [appointments, mapAppointmentToRequest]
  );

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const matchesStatus = !selectedStatus || request.status === Number(selectedStatus);

        return matchesStatus;
      }),
    [requests, selectedStatus]
  );

  const hasClientFilters = Boolean(selectedStatus);
  const totalPages = hasClientFilters
    ? Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE))
    : Math.max(1, pagination.totalPages);
  const totalItems = hasClientFilters ? filteredRequests.length : pagination.totalItems;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleOpenPreview = (request: StudentRequestDto) => {
    setSelectedRequest(request);
  };

  const handleClosePreview = () => {
    setSelectedRequest(null);
  };

  const refreshAppointments = () => {
    dispatch(
      fetchRequestAppointments({
        page,
        limit: PAGE_SIZE,
        studentName: searchTerm.trim() || undefined,
        date: selectedDate || undefined,
      })
    );
  };

  const handleMarkViewed = async (request: StudentRequestDto) => {
    try {
      setIsMarkingViewed(true);
      await dispatch(markRequestAppointmentAsViewed(request.id)).unwrap();
      showToast({ message: t('requests.popup.markedViewed'), type: 'success' });
      refreshAppointments();
    } catch (error) {
      showToast({
        message: typeof error === 'string' ? error : t('common.errorOccurred'),
        type: 'error',
        isRaw: typeof error === 'string',
      });
      throw error;
    } finally {
      setIsMarkingViewed(false);
    }
  };

  const getStatusBadge = (status: StudentRequestStatus) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );

  const columns: DataTableColumn<StudentRequestDto>[] = [
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
            onClick={() => handleOpenPreview(row)}
          >
            <CustomImage src={EyeDarkBlueIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.popup.studentName',
      accessor: (row) => (
        <UserAvatarName
          name={row.studentName ?? ''}
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
      header: 'requests.sentTo',
      accessor: (row) => {
        const isStudent = row.recipientRole === RequestParticipantRole.Student;
        return (
          <div className="flex w-full items-center justify-center gap-2">
            <UserAvatarName
              name={row.recipientName}
              avatarSrc={row.recipientAvatarPath}
              align="center"
              onView={
                isStudent && row.recipientId
                  ? () => navigate(`/students/student-details/${row.recipientId}`)
                  : undefined
              }
            />
          </div>
        );
      },
      headerClassName: 'min-w-[220px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.filters.date',
      accessor: (row) => <span className="text-gray-600">{formatRequestDate(row.created)}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.reminder.content',
      accessor: (row) => <span className="text-gray-600">{row.messageContent}</span>,
      headerClassName: 'min-w-[160px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const canReply =
          row.recipientRole === RequestParticipantRole.School &&
          row.status === StudentRequestStatus.Pending;
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="!rounded-2xl px-6"
              disabled={!canReply}
              onClick={() => navigate(`/requests/view-message/${row.studentId ?? row.id}`)}
            >
              {t('requests.actions.sendReply')}
            </Button>
          </div>
        );
      },
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'StudentName',
      placeholder: t('requests.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={[
            { value: StudentRequestStatus.Pending.toString(), label: t('requests.status.pending') },
            { value: StudentRequestStatus.Sent.toString(), label: t('requests.status.sent') },
          ]}
          placeholder={t('requests.filters.status')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'Date',
      value: selectedDate,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setPage(1);
          }}
          placeholder={t('requests.filters.date')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDate('');
    setPage(1);
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={filteredRequests}
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

      <MessageDetailsPopup
        isOpen={Boolean(selectedRequest)}
        onClose={handleClosePreview}
        request={selectedRequest}
        onMarkViewed={handleMarkViewed}
        isMarkingViewed={isMarkingViewed}
        titleKey="requests.reminder.detailsTitle"
      />
    </Card>
  );
};

export default ReminderRequestsTab;

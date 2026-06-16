import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

import type { StudentRequestDto } from '@/services/api/requests/requests.types';
import {
  StudentRequestStatus,
  RequestParticipantRole,
} from '@/services/api/requests/requests.types';
import { MOCK_REMINDER_REQUESTS } from '../requests.mock';
import MessageDetailsPopup from '../popups/MessageDetailsPopup';

const PAGE_SIZE = 10;

const formatRequestDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const STATUS_BADGE_CLASSES: Record<StudentRequestStatus, string> = {
  [StudentRequestStatus.Sent]: 'bg-purple-100 text-purple-700',
  [StudentRequestStatus.Viewed]: 'bg-blue-100 text-blue-700',
  [StudentRequestStatus.Replied]: 'bg-green-100 text-green-700',
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestDto | null>(null);
  const [requests, setRequests] = useState<StudentRequestDto[]>(MOCK_REMINDER_REQUESTS);

  const filteredData = useMemo(
    () =>
      requests.filter((row) => {
        const matchesSearch =
          !searchTerm ||
          (row.studentName ?? '').includes(searchTerm) ||
          row.recipientName.includes(searchTerm);
        const matchesStatus = !selectedStatus || row.status === Number(selectedStatus);
        const matchesDate = !selectedDate || formatRequestDate(row.created) === selectedDate;
        return matchesSearch && matchesStatus && matchesDate;
      }),
    [requests, searchTerm, selectedStatus, selectedDate]
  );

  const handleMarkViewed = (request: StudentRequestDto) => {
    setRequests((prev) =>
      prev.map((row) =>
        row.id === request.id ? { ...row, status: StudentRequestStatus.Viewed } : row
      )
    );
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const dateOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((r) => formatRequestDate(r.created)))).map((d) => ({
        value: d,
        label: d,
      })),
    [requests]
  );

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
            onClick={() => setSelectedRequest(row)}
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
            row.studentId
              ? () => navigate(`/students/student-details/${row.studentId}`)
              : undefined
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
        const isView = row.status === StudentRequestStatus.Viewed;
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="!rounded-2xl px-6"
              onClick={() =>
                isView ? setSelectedRequest(row) : navigate(`/requests/view-message/${row.id}`)
              }
            >
              {isView ? t('requests.actions.view') : t('requests.actions.sendReply')}
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
      name: 'search',
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
            { value: StudentRequestStatus.Viewed.toString(), label: t('requests.status.viewed') },
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
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedDate}
          onChange={(value) => {
            setSelectedDate(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={dateOptions}
          placeholder={t('requests.filters.date')}
          showSearch={false}
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
        data={pageData}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{ page, limit: PAGE_SIZE, total: filteredData.length, totalPages }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        t={t}
      />

      <MessageDetailsPopup
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onMarkViewed={handleMarkViewed}
        titleKey="requests.reminder.detailsTitle"
      />
    </Card>
  );
};

export default ReminderRequestsTab;

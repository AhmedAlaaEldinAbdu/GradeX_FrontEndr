import React, { useMemo, useState } from 'react';
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

import {
  AdminMessageStatus,
  type AdminMessageDto,
  type AdminMessageParty,
} from '../admin-requests.types';
import { MOCK_ADMIN_MESSAGES } from '../admin-requests.mock';
import MessageDetailsPopup from '../popups/MessageDetailsPopup';

const PAGE_SIZE = 10;

const STATUS_BADGE_CLASSES: Record<AdminMessageStatus, string> = {
  [AdminMessageStatus.Pending]: 'bg-orange-100 text-orange-700',
  [AdminMessageStatus.Viewed]: 'bg-green-100 text-green-700',
};

const STATUS_LABEL_KEYS: Record<AdminMessageStatus, string> = {
  [AdminMessageStatus.Pending]: 'adminRequests.messages.status.pending',
  [AdminMessageStatus.Viewed]: 'adminRequests.messages.status.viewed',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const MessagesTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<AdminMessageDto[]>(MOCK_ADMIN_MESSAGES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessageDto | null>(null);

  const filteredData = useMemo(
    () =>
      messages.filter((row) => {
        const matchesSearch = !searchTerm || row.sender.name.includes(searchTerm);
        const matchesStatus = !selectedStatus || row.status === Number(selectedStatus);
        const matchesDate = !selectedDate || row.sentDate === selectedDate;
        return matchesSearch && matchesStatus && matchesDate;
      }),
    [messages, searchTerm, selectedStatus, selectedDate]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkViewed = (row: AdminMessageDto) => {
    setMessages((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: AdminMessageStatus.Viewed } : item
      )
    );
    showToast({ message: t('adminRequests.messages.toasts.markedViewed'), type: 'success' });
  };

  const renderPartyCell = (party: AdminMessageParty) => {
    if (party.isSchool) {
      return (
        <div className="flex w-full items-center justify-center">
          <span className="text-sm font-medium text-[#0E1F1F]">{party.name}</span>
        </div>
      );
    }

    return (
      <UserAvatarName
        name={party.name}
        avatarSrc={party.avatarPath}
        align="between"
        onView={party.profilePath ? () => navigate(party.profilePath as string) : undefined}
      />
    );
  };

  const columns: DataTableColumn<AdminMessageDto>[] = [
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
      header: 'adminRequests.messages.columns.preview',
      accessor: (row) => (
        <div className="flex justify-center">
          <IconButton
            variant="darkBlue"
            ariaLabel={t('common.view')}
            className="h-10 w-10"
            onClick={() => setSelectedMessage(row)}
          >
            <CustomImage src={EyeDarkBlueIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.messages.columns.sentFrom',
      accessor: (row) => renderPartyCell(row.sender),
      headerClassName: 'min-w-[220px]',
      className: 'min-w-[220px]',
    },
    {
      header: 'adminRequests.messages.columns.sentTo',
      accessor: (row) => renderPartyCell(row.recipient),
      headerClassName: 'min-w-[220px]',
      className: 'min-w-[220px]',
    },
    {
      header: 'adminRequests.messages.columns.status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[row.status]}`}
        >
          {t(STATUS_LABEL_KEYS[row.status])}
        </span>
      ),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.messages.columns.stage',
      accessor: (row) => <span className="text-gray-700">{row.stage ?? '--'}</span>,
      headerClassName: 'min-w-[160px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.messages.columns.classroom',
      accessor: (row) => <span className="text-gray-700">{row.classroom ?? '--'}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.messages.columns.sentDate',
      accessor: (row) => <span className="text-gray-600">{formatDate(row.sentDate)}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.messages.columns.content',
      accessor: (row) => <span className="text-gray-600">{row.messageContent}</span>,
      headerClassName: 'min-w-[160px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const canMarkViewed = row.status === AdminMessageStatus.Pending;
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="!rounded-2xl px-6"
              disabled={!canMarkViewed}
              onClick={() => handleMarkViewed(row)}
            >
              {t('adminRequests.messages.actions.markViewed')}
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
      placeholder: t('adminRequests.messages.searchPlaceholder'),
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
              value: String(AdminMessageStatus.Pending),
              label: t('adminRequests.messages.status.pending'),
            },
            {
              value: String(AdminMessageStatus.Viewed),
              label: t('adminRequests.messages.status.viewed'),
            },
          ]}
          placeholder={t('adminRequests.messages.filters.status')}
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
          placeholder={t('adminRequests.messages.filters.date')}
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
        emptyMessage="adminRequests.empty"
        t={t}
      />

      <MessageDetailsPopup
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
        onMarkViewed={handleMarkViewed}
      />
    </Card>
  );
};

export default MessagesTab;

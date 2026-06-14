import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

import type { StudentRequestDto } from '@/services/api/requests/requests.types';
import { StudentRequestStatus } from '@/services/api/requests/requests.types';
import { MOCK_MESSAGE_REQUESTS } from '../requests.mock';

const PAGE_SIZE = 10;

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

const MessageRequestsTable: React.FC = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // TODO(backend): swap this mock filtering for a redux thunk + service call.
  const filteredData = useMemo(() => {
    return MOCK_MESSAGE_REQUESTS.filter((row) => {
      const matchesSearch =
        !searchTerm ||
        row.senderName.includes(searchTerm) ||
        row.recipientName.includes(searchTerm);
      const matchesSender = !selectedSender || row.senderName === selectedSender;
      const matchesRecipient = !selectedRecipient || row.recipientName === selectedRecipient;
      const matchesStatus = !selectedStatus || row.status === Number(selectedStatus);
      return matchesSearch && matchesSender && matchesRecipient && matchesStatus;
    });
  }, [searchTerm, selectedSender, selectedRecipient, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const senderOptions = useMemo(
    () =>
      Array.from(new Set(MOCK_MESSAGE_REQUESTS.map((r) => r.senderName))).map((name) => ({
        value: name,
        label: name,
      })),
    []
  );
  const recipientOptions = useMemo(
    () =>
      Array.from(new Set(MOCK_MESSAGE_REQUESTS.map((r) => r.recipientName))).map((name) => ({
        value: name,
        label: name,
      })),
    []
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
      accessor: () => (
        <div className="flex justify-center">
          <IconButton variant="blue" ariaLabel={t('common.view')} className="h-10 w-10">
            <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.requestStatus',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.sentFrom',
      accessor: (row) => (
        <UserAvatarName name={row.senderName} avatarSrc={row.senderAvatarPath} align="center" />
      ),
      headerClassName: 'min-w-[220px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.sentTo',
      accessor: (row) => (
        <UserAvatarName
          name={row.recipientName}
          avatarSrc={row.recipientAvatarPath}
          align="center"
        />
      ),
      headerClassName: 'min-w-[220px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const isView = row.status === StudentRequestStatus.Viewed;
        return (
          <div className="flex items-center justify-center">
            <Button variant="outline" size="sm" className="!rounded-2xl px-6">
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
      width: '30%',
    },
    {
      type: 'custom',
      name: 'sender-filter',
      value: selectedSender,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedSender}
          onChange={(value) => {
            setSelectedSender(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={senderOptions}
          placeholder={t('requests.filters.sentFrom')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'recipient-filter',
      value: selectedRecipient,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedRecipient}
          onChange={(value) => {
            setSelectedRecipient(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={recipientOptions}
          placeholder={t('requests.filters.sentTo')}
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
            { value: StudentRequestStatus.Sent.toString(), label: t('requests.status.sent') },
            { value: StudentRequestStatus.Viewed.toString(), label: t('requests.status.viewed') },
            { value: StudentRequestStatus.Replied.toString(), label: t('requests.status.replied') },
            { value: StudentRequestStatus.Pending.toString(), label: t('requests.status.pending') },
          ]}
          placeholder={t('requests.filters.status')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSender('');
    setSelectedRecipient('');
    setSelectedStatus('');
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
        pagination={{
          page,
          limit: PAGE_SIZE,
          total: filteredData.length,
          totalPages,
        }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        t={t}
      />
    </Card>
  );
};

export default MessageRequestsTable;

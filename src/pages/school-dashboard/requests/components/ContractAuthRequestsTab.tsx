import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';

import {
  ContractAuthStatus,
  type ContractAuthRequestDto,
} from '@/services/api/requests/requests.types';
import { MOCK_CONTRACT_AUTH_REQUESTS } from '../requests.mock';

const PAGE_SIZE = 10;

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const resolveUrl = (path: string | null) =>
  path ? (path.startsWith('http') ? path : `${BASE_URL}/${path.replace(/^\/+/, '')}`) : '';

const STATUS_BADGE_CLASSES: Record<ContractAuthStatus, string> = {
  [ContractAuthStatus.Pending]: 'bg-orange-100 text-orange-700',
  [ContractAuthStatus.Authenticated]: 'bg-green-100 text-green-700',
};

const STATUS_LABEL_KEYS: Record<ContractAuthStatus, string> = {
  [ContractAuthStatus.Pending]: 'requests.contractAuth.status.pending',
  [ContractAuthStatus.Authenticated]: 'requests.contractAuth.status.authenticated',
};

const ContractAuthRequestsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const data = MOCK_CONTRACT_AUTH_REQUESTS;

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        const matchesSearch = !searchTerm || row.studentName.includes(searchTerm);
        const matchesDate = !selectedDate || row.date === selectedDate;
        return matchesSearch && matchesDate;
      }),
    [data, searchTerm, selectedDate]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const dateOptions = useMemo(
    () => Array.from(new Set(data.map((r) => r.date))).map((d) => ({ value: d, label: d })),
    [data]
  );

  const getStatusBadge = (status: ContractAuthStatus) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );

  const columns: DataTableColumn<ContractAuthRequestDto>[] = [
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
      header: 'requests.popup.studentName',
      accessor: (row) => (
        <UserAvatarName
          name={row.studentName}
          avatarSrc={row.studentAvatarPath}
          align="center"
          onView={() => navigate(`/students/student-details/${row.studentId}`)}
        />
      ),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.contractAuth.authDate',
      accessor: (row) => <span className="text-gray-600">{row.date}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.requestStatus',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.contractAuth.contract',
      accessor: (row) => (
        <div className="flex justify-center">
          <button
            type="button"
            aria-label={t('common.view')}
            disabled={!row.contractUrl}
            onClick={() => row.contractUrl && window.open(resolveUrl(row.contractUrl), '_blank')}
            className="transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CustomImage src={PdfIcon} alt="PDF" className="h-9 w-9" />
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
      width: '40%',
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
    </Card>
  );
};

export default ContractAuthRequestsTab;

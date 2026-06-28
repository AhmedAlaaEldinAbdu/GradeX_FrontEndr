import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import UserAvatarName from '@/shared/components/UserAvatarName';
import NotificationsMutedIcon from '@gradex/assets/icons/NotificationsMuted.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import type { Audience, NotificationItem } from '../notifications.mock';
import { useNavigate } from 'react-router-dom';

interface EmployeesTabProps {
  audience: Audience;
  items: NotificationItem[];
}

const PAGE_SIZE = 7;

const RECIPIENT_HEADER_KEYS: Record<Audience, string> = {
  drivers: 'notifications.table.driverName',
  employees: 'notifications.table.employeeName',
  parents: 'notifications.table.parentName',
};

const SEARCH_PLACEHOLDER_KEYS: Record<Audience, string> = {
  drivers: 'notifications.searchDriverName',
  employees: 'notifications.searchEmployeeName',
  parents: 'notifications.searchParentName',
};

const getSingleValue = (value: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? '') : value;

function EmptyNotifications() {
  const { t } = useTranslation();

  return (
    <Card
      padding="none"
      className="flex min-h-[360px] items-center justify-center rounded-3xl px-6 py-12"
    >
      <div className="flex max-w-xl flex-col items-center text-center">
        <CustomImage
          src={NotificationsMutedIcon}
          alt=""
          className="mb-7 h-[150px] w-[150px] mix-blend-luminosity"
        />
        <p className="max-w-[34rem] text-center text-base font-normal leading-7 text-[#3A3A3A]">
          {t('notifications.emptyStateDescription')}
        </p>
      </div>
    </Card>
  );
}

export default function EmployeesTab({ audience, items }: EmployeesTabProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.recipientName.toLowerCase().includes(normalizedSearch) ||
        item.subject.toLowerCase().includes(normalizedSearch);
      const matchesDate = !selectedDate || item.date === selectedDate;

      return matchesSearch && matchesDate;
    });
  }, [items, searchTerm, selectedDate]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const dateOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.date))).map((date) => ({
        value: date,
        label: date,
      })),
    [items]
  );

  const columns: DataTableColumn<NotificationItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index ?? 0) + 1 + (page - 1) * PAGE_SIZE}
        </span>
      ),
      headerClassName: 'w-[60px] text-center',
      className: 'text-center',
    },
    {
      header: RECIPIENT_HEADER_KEYS[audience],
      accessor: (row) => (
        <UserAvatarName
          name={row.recipientName}
          avatarSrc={ProfileImage}
          align="center"
          className="min-w-[220px]"
          viewCount={row.viewerCount}
          onView={(e) => {
            e.stopPropagation();
            navigate(`/teaching-staff/teachers/${row.id}`);
          }}
        />
      ),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.messageSubject',
      accessor: (row) => (
        <span className="block max-w-[260px] truncate text-base text-[#646969]">{row.subject}</span>
      ),
      headerClassName: 'min-w-[280px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.date',
      accessor: (row) => <span className="text-[#646969]">{row.date}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.attachments',
      accessor: (row) =>
        row.hasAttachment ? (
          <CustomImage src={PdfIcon} alt="PDF" className="h-10 w-8" />
        ) : (
          <span className="text-base text-[#646969]">{t('notifications.noAttachment')}</span>
        ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-4">
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('actions.edit')}
            className="h-11 w-11 shadow-none"
            imgClassName="h-5 w-5"
          />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel={t('actions.delete')}
            className="h-11 w-11 shadow-none"
            imgClassName="h-5 w-5"
          />
        </div>
      ),
      headerClassName: 'min-w-[170px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t(SEARCH_PLACEHOLDER_KEYS[audience]),
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
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedDate}
          onChange={(value) => {
            setSelectedDate(getSingleValue(value));
            setPage(1);
          }}
          options={dateOptions}
          placeholder={t('notifications.dateFilter')}
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

  if (items.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={pageData}
        columns={columns}
        keyExtractor={(row) => `${audience}-${row.id}`}
        filters={filterConfigs}
        showFilters={true}
        pagination={{ page, limit: PAGE_SIZE, total: filteredData.length, totalPages }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        emptyMessage={t('notifications.emptyStateDescription')}
        t={t}
      />
    </Card>
  );
}

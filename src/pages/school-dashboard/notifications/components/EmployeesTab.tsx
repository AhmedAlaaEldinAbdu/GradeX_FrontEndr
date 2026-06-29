import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import UserAvatarName from '@/shared/components/UserAvatarName';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchSchoolNotifications,
  resetSchoolNotifications,
} from '@/redux/features/schoolNotificationsSlice';
import {
  SchoolNotificationTarget,
  type SchoolNotificationItem,
  type SchoolNotificationRecipient,
} from '@/services/api/types/school-notification.types';
import type { Audience } from '../notifications.mock';

interface EmployeesTabProps {
  audience: Audience;
  items?: unknown[];
}

const PAGE_SIZE = 10;
const FILE_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

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

const getDateKey = (value: string) => value.split('T')[0] ?? '';

const getDateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const formatNotificationDate = (value: string, language: string) => {
  const dateKey = getDateKey(value);
  const date = getDateFromKey(dateKey);

  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB').format(date);
};

const getUniqueDateOptions = (items: SchoolNotificationItem[], language: string) =>
  Array.from(new Set(items.map((item) => getDateKey(item.created)).filter(Boolean))).map(
    (dateKey) => ({
      value: dateKey,
      label: formatNotificationDate(dateKey, language),
    })
  );

const resolveFileUrl = (path?: string | null) => {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${FILE_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const getLocalizedText = (arValue: string, enValue: string, language: string) =>
  (language === 'ar' ? arValue : enValue) || arValue || enValue || '-';

const getRecipients = (
  row: SchoolNotificationItem,
  audience: Audience
): SchoolNotificationRecipient[] => {
  if (audience === 'parents') return row.parents ?? [];
  return row.teachers ?? [];
};

const getRecipientCount = (row: SchoolNotificationItem, audience: Audience) => {
  if (audience === 'parents') return row.totalParents ?? row.parents?.length ?? 0;
  return row.totalTeachers ?? row.teachers?.length ?? 0;
};

export default function EmployeesTab({ audience }: EmployeesTabProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId() || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const {
    items: notifications,
    pagination,
    isLoading,
  } = useAppSelector((state) => state.schoolNotifications.employeeNotifications);

  useEffect(() => {
    if (!schoolBranchId) {
      dispatch(resetSchoolNotifications());
      return;
    }

    dispatch(
      fetchSchoolNotifications({
        SchoolBranchId: schoolBranchId,
        Target: SchoolNotificationTarget.Employees,
        PageIndex: page,
        PageSize: PAGE_SIZE,
      })
    );
  }, [dispatch, page, schoolBranchId]);

  useEffect(() => {
    if (
      selectedDate &&
      notifications.length > 0 &&
      notifications.every((item) => getDateKey(item.created) !== selectedDate)
    ) {
      setSelectedDate('');
    }
  }, [notifications, selectedDate]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((item) => {
      const recipientText = getRecipients(item, audience)
        .map((recipient) => recipient.fullName)
        .join(' ')
        .toLowerCase();
      const title = getLocalizedText(item.titleAr, item.titleEn, i18n.language).toLowerCase();
      const body = getLocalizedText(item.bodyAr, item.bodyEn, i18n.language).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        recipientText.includes(normalizedSearch) ||
        title.includes(normalizedSearch) ||
        body.includes(normalizedSearch);
      const matchesDate = !selectedDate || getDateKey(item.created) === selectedDate;

      return matchesSearch && matchesDate;
    });
  }, [audience, i18n.language, notifications, searchTerm, selectedDate]);

  const dateOptions = useMemo(
    () => getUniqueDateOptions(notifications, i18n.language),
    [i18n.language, notifications]
  );

  const hasActiveClientFilter = Boolean(searchTerm.trim() || selectedDate);
  const tableData = hasActiveClientFilter ? filteredData : notifications;
  const tablePagination = hasActiveClientFilter
    ? {
        page: 1,
        limit: PAGE_SIZE,
        total: tableData.length,
        totalPages: Math.max(1, Math.ceil(tableData.length / PAGE_SIZE)),
      }
    : {
        page: pagination.pageIndex,
        limit: pagination.pageSize || PAGE_SIZE,
        total: pagination.totalItems,
        totalPages: Math.max(1, pagination.totalPages),
      };

  const columns: DataTableColumn<SchoolNotificationItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index ?? 0) + 1 + (pagination.pageIndex - 1) * (pagination.pageSize || PAGE_SIZE)}
        </span>
      ),
      headerClassName: 'w-[60px] text-center',
      className: 'text-center',
    },
    {
      header: RECIPIENT_HEADER_KEYS[audience],
      accessor: (row) => {
        const recipients = getRecipients(row, audience);
        const recipientCount = getRecipientCount(row, audience);
        const additionalNamesCount = recipientCount > 1 ? recipientCount - 1 : undefined;
        const firstRecipient = recipients[0];

        return (
          <UserAvatarName
            name={firstRecipient?.fullName ?? '-'}
            avatarSrc={resolveFileUrl(firstRecipient?.imagePath) ?? ProfileImage}
            align="center"
            className="min-w-[220px]"
            viewCount={additionalNamesCount}
          />
        );
      },
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.messageSubject',
      accessor: (row) => (
        <span className="block max-w-[260px] truncate text-base text-[#646969]">
          {getLocalizedText(row.titleAr, row.titleEn, i18n.language)}
        </span>
      ),
      headerClassName: 'min-w-[280px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.date',
      accessor: (row) => (
        <span className="text-[#646969]">{formatNotificationDate(row.created, i18n.language)}</span>
      ),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.attachments',
      accessor: (row) =>
        row.attachments?.length ? (
          <CustomImage
            src={PdfIcon}
            alt={row.attachments.map((attachment) => attachment.fileName).join(', ')}
            className="h-10 w-8"
          />
        ) : (
          <span className="text-base text-[#646969]">{t('notifications.noAttachment')}</span>
        ),
      headerClassName: 'min-w-[140px] text-center',
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

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={tableData}
        columns={columns}
        keyExtractor={(row) => `${audience}-${row.id}`}
        filters={filterConfigs}
        showFilters={true}
        pagination={tablePagination}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={t('notifications.emptyStateDescription')}
        t={t}
      />
    </Card>
  );
}

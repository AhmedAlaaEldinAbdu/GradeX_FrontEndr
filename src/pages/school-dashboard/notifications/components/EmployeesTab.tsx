import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Input from '@/shared/components/Input';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLanguage } from '@/hooks/useLanguage';
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
import NotificationRecipientsPopup from '../popups/NotificationRecipientsPopup';

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

const RECIPIENT_LIST_TITLE_KEYS: Record<Audience, string> = {
  drivers: 'notifications.table.driverName',
  employees: 'notifications.employeeNames',
  parents: 'notifications.parentNames',
};

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

const getSelectedDateRange = (dateKey: string) => ({
  CreatedFrom: `${dateKey}T00:00:00.000Z`,
  CreatedTo: `${dateKey}T23:59:59.999Z`,
});

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

type RecipientIdentityProps = {
  name?: string | null;
  avatarSrc?: string | null;
  action?: ReactNode;
  isRtl: boolean;
  viewCount?: number;
  className?: string;
  widthClassName?: string;
};

const RecipientIdentity = ({
  name,
  avatarSrc,
  action,
  isRtl,
  viewCount,
  className = '',
  widthClassName = 'w-[260px]',
}: RecipientIdentityProps) => {
  const displayName = name?.trim() || '-';
  const fallbackAction =
    viewCount !== undefined && viewCount !== null ? (
      <span className="shrink-0 text-base font-medium text-[#087B48]">
        <bdi>+{viewCount}</bdi>
      </span>
    ) : null;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`inline-flex max-w-full items-center gap-3 ${widthClassName} ${className}`}
    >
      <CustomImage
        src={avatarSrc || ProfileImage}
        fallbackSrc={ProfileImage}
        alt={displayName}
        className="h-10 w-10 shrink-0 rounded-lg object-cover"
      />
      <span
        className="min-w-0 flex-1 truncate text-start text-sm font-normal text-[#646969]"
        title={displayName}
      >
        {displayName}
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
        {action ?? fallbackAction}
      </span>
    </div>
  );
};

export default function EmployeesTab({ audience }: EmployeesTabProps) {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId() || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRecipients, setSelectedRecipients] = useState<SchoolNotificationRecipient[]>([]);
  const {
    items: notifications,
    pagination,
    isLoading,
  } = useAppSelector((state) => state.schoolNotifications.employeeNotifications);

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim();

    if (!schoolBranchId) {
      dispatch(resetSchoolNotifications());
      return;
    }

    dispatch(
      fetchSchoolNotifications({
        SchoolBranchId: schoolBranchId,
        Target: SchoolNotificationTarget.Employees,
        ...(normalizedSearchTerm ? { SearchName: normalizedSearchTerm } : {}),
        ...(selectedDate ? getSelectedDateRange(selectedDate) : {}),
        PageIndex: page,
        PageSize: PAGE_SIZE,
      })
    );
  }, [dispatch, page, schoolBranchId, searchTerm, selectedDate]);

  const tablePagination = {
    page: pagination.pageIndex,
    limit: pagination.pageSize || PAGE_SIZE,
    total: pagination.totalItems,
    totalPages: Math.max(1, pagination.totalPages),
  };
  const hasActiveFilter = Boolean(searchTerm.trim() || selectedDate);
  const emptyMessage = hasActiveFilter
    ? t('common.noDataFound')
    : t('notifications.emptyStateDescription');
  const isRtl = isRTL || i18n.language.startsWith('ar') || i18n.dir(i18n.language) === 'rtl';

  const handleViewRecipient = (recipient: SchoolNotificationRecipient) => {
    if (!recipient.id) return;

    setSelectedRecipients([]);
    navigate(`/teaching-staff/teachers/${recipient.id}`);
  };

  const renderRecipientCell = (row: SchoolNotificationItem) => {
    const recipients = getRecipients(row, audience);
    const recipientCount = getRecipientCount(row, audience);
    const additionalNamesCount = recipientCount > 1 ? recipientCount - 1 : undefined;
    const firstRecipient = recipients[0];

    if (!firstRecipient) {
      return <RecipientIdentity name="-" avatarSrc={ProfileImage} isRtl={isRtl} />;
    }

    if (recipientCount > 1) {
      return (
        <button
          type="button"
          className="mx-auto rounded-lg text-start transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#117BD7]/30"
          onClick={() => setSelectedRecipients(recipients)}
        >
          <RecipientIdentity
            name={firstRecipient.fullName}
            avatarSrc={resolveFileUrl(firstRecipient.imagePath) ?? ProfileImage}
            isRtl={isRtl}
            viewCount={additionalNamesCount}
          />
        </button>
      );
    }

    return (
      <RecipientIdentity
        name={firstRecipient.fullName}
        avatarSrc={resolveFileUrl(firstRecipient.imagePath) ?? ProfileImage}
        isRtl={isRtl}
        action={
          <IconButton
            variant="blue"
            ariaLabel={t('common.view')}
            className="h-10 w-10 shrink-0"
            onClick={() => handleViewRecipient(firstRecipient)}
          >
            <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        }
      />
    );
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
      accessor: renderRecipientCell,
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
        <Input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setPage(1);
          }}
          placeholder={t('notifications.dateFilter')}
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
        data={notifications}
        columns={columns}
        keyExtractor={(row) => `${audience}-${row.id}`}
        filters={filterConfigs}
        showFilters={true}
        pagination={tablePagination}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        t={t}
      />

      <NotificationRecipientsPopup
        isOpen={selectedRecipients.length > 0}
        onClose={() => setSelectedRecipients([])}
        title={t(RECIPIENT_LIST_TITLE_KEYS[audience])}
        recipients={selectedRecipients}
        isRtl={isRtl}
        showViewAction
        viewLabel={t('common.view')}
        onViewRecipient={handleViewRecipient}
      />
    </Card>
  );
}

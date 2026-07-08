import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Input from '@/shared/components/Input';
import UserAvatarName from '@/shared/components/UserAvatarName';
import { useToast } from '@/shared/context/ToastContext';

import CheckGreenIcon from '@gradex/assets/icons/CheckGreen.svg';
import ClockBlueIcon from '@gradex/assets/icons/ClockBlue.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';

import type { ScheduledInterviewDto } from '../admin-requests.types';
import { MOCK_SCHEDULED_INTERVIEWS } from '../data/mock-scheduled-interviews';

const PAGE_SIZE = 6;

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${Number(day)}/${Number(month)}/${year}` : value;
};

const formatTime = (value: string | null, locale: string) => {
  if (!value) return '—';

  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;

  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  if (locale.startsWith('ar')) {
    return `${displayHours}:${displayMinutes} ${hours >= 12 ? 'مساءً' : 'صباحًا'}`;
  }

  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const ScheduleInterviewTab = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const filteredInterviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

    return MOCK_SCHEDULED_INTERVIEWS.filter((interview) => {
      const matchesName =
        !normalizedSearch || interview.applicantName.toLocaleLowerCase().includes(normalizedSearch);
      const matchesDate = !selectedDate || interview.interviewDate === selectedDate;
      return matchesName && matchesDate;
    });
  }, [searchTerm, selectedDate]);

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleInterviews = filteredInterviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const showStaticActionToast = (messageKey: string) => {
    showToast({
      message: t(messageKey),
      type: 'info',
    });
  };

  const columns: DataTableColumn<ScheduledInterviewDto>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index ?? 0) + 1 + (currentPage - 1) * PAGE_SIZE}
        </span>
      ),
      headerClassName: 'w-[70px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.scheduleInterview.columns.preview',
      accessor: (row) => (
        <IconButton
          variant="darkBlue"
          ariaLabel={t('adminRequests.scheduleInterview.actions.preview')}
          className="h-10 w-10 shadow-none"
          onClick={() =>
            showStaticActionToast('adminRequests.scheduleInterview.toasts.previewPending')
          }
          data-application-id={row.applicationId}
        >
          <CustomImage src={EyeDarkBlueIcon} alt="" className="h-6 w-6" />
        </IconButton>
      ),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.scheduleInterview.columns.applicantName',
      accessor: (row) => (
        <UserAvatarName
          name={row.applicantName}
          avatarSrc={row.applicantAvatarPath}
          align="between"
          className="w-full"
          onView={() =>
            showStaticActionToast('adminRequests.scheduleInterview.toasts.profilePending')
          }
        />
      ),
      headerClassName: 'min-w-[320px]',
      className: 'min-w-[320px]',
    },
    {
      header: 'adminRequests.scheduleInterview.columns.interviewDate',
      accessor: (row) => <span>{formatDate(row.interviewDate)}</span>,
      headerClassName: 'min-w-[190px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.scheduleInterview.columns.interviewTime',
      accessor: (row) => <span>{formatTime(row.interviewTime, i18n.language)}</span>,
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-3">
          <IconButton
            variant="success"
            ariaLabel={t('adminRequests.scheduleInterview.actions.accept')}
            className="h-11 w-11 shadow-none"
            onClick={() =>
              showStaticActionToast('adminRequests.scheduleInterview.toasts.actionPending')
            }
          >
            <CustomImage src={CheckGreenIcon} alt="" className="h-6 w-6" />
          </IconButton>
          <IconButton
            variant="blue"
            ariaLabel={t('adminRequests.scheduleInterview.actions.reschedule')}
            className="h-11 w-11 shadow-none"
            onClick={() =>
              showStaticActionToast('adminRequests.scheduleInterview.toasts.actionPending')
            }
          >
            <CustomImage src={ClockBlueIcon} alt="" className="h-6 w-6" />
          </IconButton>
          <IconButton
            variant="danger"
            ariaLabel={t('adminRequests.scheduleInterview.actions.reject')}
            className="h-11 w-11 shadow-none"
            onClick={() =>
              showStaticActionToast('adminRequests.scheduleInterview.toasts.actionPending')
            }
          >
            <CustomImage src={XmarkCircleRedIcon} alt="" className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[210px] text-center',
      className: 'text-center',
    },
  ];

  const filters: FilterConfig[] = [
    {
      type: 'search',
      name: 'scheduled-interview-search',
      placeholder: t('adminRequests.scheduleInterview.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'scheduled-interview-date',
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
          placeholder={t('adminRequests.scheduleInterview.datePlaceholder')}
        />
      ),
    },
  ];

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={visibleInterviews}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filters}
        showFilters
        pagination={{
          page: currentPage,
          limit: PAGE_SIZE,
          total: filteredInterviews.length,
          totalPages,
        }}
        onPageChange={setPage}
        onResetFilters={() => {
          setSearchTerm('');
          setSelectedDate('');
          setPage(1);
        }}
        emptyMessage="adminRequests.empty"
        t={t}
      />
    </Card>
  );
};

export default ScheduleInterviewTab;

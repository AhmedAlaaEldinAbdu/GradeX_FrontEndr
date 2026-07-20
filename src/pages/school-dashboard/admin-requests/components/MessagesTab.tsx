import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { MessageStatus } from '@/shared/enums/enums';
import { getCurrentSchoolBranchId } from '@/lib/auth';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

import {
  AdminMessageStatus,
  type AdminMessageDto,
  type AdminMessageParty,
} from '../admin-requests.types';
import {
  clearCurrentMessage,
  fetchTeacherMessageById,
  fetchTeacherMessages,
} from '@/redux/features/teacher-requests/teacherRequestsSlice';
import type { TeacherMessagesQueryParams } from '@/services/api/types/teacher-requests.types';
import { teacherRequestsApiService } from '@/services/api/teacher-requests/teacher-requests.service';
import { mapTeacherMessage } from '../admin-requests.mappers';
import MessageDetailsPopup from '../popups/MessageDetailsPopup';

const PAGE_SIZE = 10;

const STATUS_BADGE_CLASSES: Record<AdminMessageStatus, string> = {
  [AdminMessageStatus.Pending]: 'bg-orange-100 text-orange-700',
  [AdminMessageStatus.Sent]: 'bg-purple-100 text-purple-700',
  [AdminMessageStatus.Viewed]: 'bg-green-100 text-green-700',
  [AdminMessageStatus.Replied]: 'bg-blue-100 text-blue-700',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const getStatusLabelKey = (status: AdminMessageStatus) => {
  switch (status) {
    case AdminMessageStatus.Pending:
      return 'adminRequests.messages.status.pending';
    case AdminMessageStatus.Sent:
      return 'requests.status.sent';
    case AdminMessageStatus.Viewed:
      return 'adminRequests.messages.status.viewed';
    case AdminMessageStatus.Replied:
      return 'requests.status.replied';
    default:
      return 'adminRequests.messages.status.pending';
  }
};

const getPartyName = (party: AdminMessageParty, schoolLabel: string) =>
  party.isSchool ? party.name || schoolLabel : party.name || '-';

const mergeMessageDetails = (
  summary: AdminMessageDto | null,
  details: AdminMessageDto | null
): AdminMessageDto | null => {
  if (!summary) return details;
  if (!details) return summary;

  const isViewed = summary.isViewed === true || details.isViewed === true;

  return {
    ...summary,
    ...details,
    sender: { ...summary.sender, ...details.sender },
    recipient: { ...summary.recipient, ...details.recipient },
    status: isViewed ? AdminMessageStatus.Viewed : details.status,
    stage: details.stage ?? summary.stage,
    classroom: details.classroom ?? summary.classroom,
    sentDate: details.sentDate || summary.sentDate,
    messageContent: details.messageContent || summary.messageContent,
    isViewed,
    viewedAt: details.viewedAt ?? summary.viewedAt,
    viewedByUserId: details.viewedByUserId ?? summary.viewedByUserId,
    viewedByName: details.viewedByName ?? summary.viewedByName,
  };
};

const MessagesTab: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentSchoolBranchId = getCurrentSchoolBranchId();

  const { messages, currentMessage, messagesPagination, isMessagesLoading, isDetailsLoading } =
    useAppSelector((state) => state.teacherRequests);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessageSummary, setSelectedMessageSummary] = useState<AdminMessageDto | null>(
    null
  );
  const [statusById, setStatusById] = useState<Record<string, AdminMessageStatus>>({});
  const [markingViewedId, setMarkingViewedId] = useState<string | null>(null);

  const schoolLabel = t('requests.schoolLabel');

  const loadMessages = useCallback(() => {
    const params: TeacherMessagesQueryParams = {
      PageNumber: page,
      PageSize: PAGE_SIZE,
      SchoolBranchId: currentSchoolBranchId,
      SearchTeacherName: searchTerm.trim() || undefined,
      MessageStatus: selectedStatus ? (Number(selectedStatus) as MessageStatus) : undefined,
      Date: selectedDate || undefined,
    };
    dispatch(fetchTeacherMessages(params));
  }, [dispatch, page, searchTerm, selectedStatus, selectedDate, currentSchoolBranchId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const data = useMemo(
    () =>
      messages.map((message) => {
        const mappedMessage = mapTeacherMessage(message);
        const status = statusById[mappedMessage.id] ?? mappedMessage.status;

        return {
          ...mappedMessage,
          status,
          isViewed:
            mappedMessage.isViewed === true || status === AdminMessageStatus.Viewed
              ? true
              : mappedMessage.isViewed,
        };
      }),
    [messages, statusById]
  );

  const selectedMessageDetails = useMemo(() => {
    if (!selectedMessageId || !currentMessage) {
      return null;
    }

    const mappedMessage = mapTeacherMessage(currentMessage);
    return mappedMessage.id === selectedMessageId ? mappedMessage : null;
  }, [currentMessage, selectedMessageId]);

  const selectedMessage = useMemo(
    () => mergeMessageDetails(selectedMessageSummary, selectedMessageDetails),
    [selectedMessageSummary, selectedMessageDetails]
  );

  const handleOpenMessage = (row: AdminMessageDto) => {
    setSelectedMessageId(row.id);
    setSelectedMessageSummary(row);
    dispatch(fetchTeacherMessageById(row.id));
  };

  const handleCloseMessage = () => {
    setSelectedMessageId(null);
    setSelectedMessageSummary(null);
    dispatch(clearCurrentMessage());
  };

  const handleMarkViewed = async (message: AdminMessageDto) => {
    try {
      setMarkingViewedId(message.id);
      const response = await teacherRequestsApiService.markTeacherMessageAsViewed(message.id);

      if (!response.isSuccess) {
        throw new Error(response.message || t('common.errorOccurred'));
      }

      setStatusById((current) => ({
        ...current,
        [message.id]: AdminMessageStatus.Viewed,
      }));
      setSelectedMessageSummary((current) =>
        current?.id === message.id
          ? { ...current, status: AdminMessageStatus.Viewed, isViewed: true }
          : current
      );
      showToast({
        message: t('adminRequests.messages.toasts.markedViewed'),
        type: 'success',
      });
      loadMessages();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : t('common.errorOccurred');
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: errorMessage !== t('common.errorOccurred'),
      });
      throw error;
    } finally {
      setMarkingViewedId(null);
    }
  };

  const renderPartyCell = (party: AdminMessageParty) => {
    if (party.isSchool) {
      return (
        <div className="flex w-full items-center justify-center">
          <span className="text-sm font-medium text-[#0E1F1F]">
            {getPartyName(party, schoolLabel)}
          </span>
        </div>
      );
    }

    return (
      <UserAvatarName
        name={getPartyName(party, schoolLabel)}
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
            onClick={() => handleOpenMessage(row)}
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
          {t(getStatusLabelKey(row.status))}
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
        const isViewed = row.status === AdminMessageStatus.Viewed || row.isViewed === true;
        const isMarkingViewed = markingViewedId === row.id;
        const canMarkViewed = row.status === AdminMessageStatus.Sent && !isViewed;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="!rounded-2xl px-6"
              disabled={!canMarkViewed || isMarkingViewed}
              onClick={() => {
                void handleMarkViewed(row);
              }}
            >
              {isMarkingViewed
                ? t('adminRequests.messages.actions.markingViewed')
                : t('adminRequests.messages.actions.markViewed')}
            </Button>
          </div>
        );
      },
      headerClassName: 'min-w-[240px] text-center',
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
              value: String(AdminMessageStatus.Sent),
              label: t('requests.status.sent'),
            },
            {
              value: String(AdminMessageStatus.Viewed),
              label: t('adminRequests.messages.status.viewed'),
            },
            {
              value: String(AdminMessageStatus.Replied),
              label: t('requests.status.replied'),
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
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{
          page: messagesPagination.page,
          limit: messagesPagination.limit,
          total: messagesPagination.total,
          totalPages: messagesPagination.totalPages,
        }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        emptyMessage="adminRequests.empty"
        isLoading={isMessagesLoading}
        t={t}
      />

      <MessageDetailsPopup
        isOpen={Boolean(selectedMessageId)}
        onClose={handleCloseMessage}
        message={selectedMessage}
        isLoading={isDetailsLoading && !selectedMessageDetails}
        onMarkViewed={handleMarkViewed}
        isMarkingViewed={markingViewedId === selectedMessage?.id}
      />
    </Card>
  );
};

export default MessagesTab;

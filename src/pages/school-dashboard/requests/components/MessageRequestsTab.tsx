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
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSchoolMessages } from '@/redux/features/school-messages/schoolMessagesSlice';
import type {
  StudentRequestDto,
  RequestParticipant,
  SchoolMessageDto,
} from '@/services/api/requests/requests.types';
import {
  StudentRequestStatus,
  StudentRequestType,
  RequestParticipantRole,
  MessageStatus,
  MessageSenderType,
} from '@/services/api/requests/requests.types';
import MessageDetailsPopup from '../popups/MessageDetailsPopup';
import ParticipantsPopup from '../popups/ParticipantsPopup';

type ParticipantsView = {
  title: string;
  participants: RequestParticipant[];
};

const PAGE_SIZE = 10;

const MESSAGE_STATUS_TO_REQUEST_STATUS: Record<MessageStatus, StudentRequestStatus> = {
  [MessageStatus.Pending]: StudentRequestStatus.Pending,
  [MessageStatus.Sent]: StudentRequestStatus.Sent,
  [MessageStatus.Viewed]: StudentRequestStatus.Viewed,
  [MessageStatus.Replied]: StudentRequestStatus.Replied,
};

const REQUEST_STATUS_TO_MESSAGE_STATUS: Record<StudentRequestStatus, MessageStatus> = {
  [StudentRequestStatus.Pending]: MessageStatus.Pending,
  [StudentRequestStatus.Sent]: MessageStatus.Sent,
  [StudentRequestStatus.Viewed]: MessageStatus.Viewed,
  [StudentRequestStatus.Replied]: MessageStatus.Replied,
};

const getParticipantProfilePath = (
  role: RequestParticipantRole | undefined,
  id: string | undefined
): string | null => {
  if (!id) return null;
  if (role === RequestParticipantRole.Student) return `/students/student-details/${id}`;
  if (role === RequestParticipantRole.Teacher) return `/teaching-staff/teachers/${id}`;
  return null;
};

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

const MessageRequestsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { messages, isLoading, totalItems, totalPages } = useAppSelector(
    (state) => state.schoolMessages
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestDto | null>(null);
  const [participantsView, setParticipantsView] = useState<ParticipantsView | null>(null);

  const schoolLabel = t('requests.schoolLabel');

  const mapMessageToRequest = useMemo(
    () =>
      (message: SchoolMessageDto): StudentRequestDto => {
        const conversationStudents: RequestParticipant[] = message.students.length
          ? message.students.map((student) => ({
              id: student.studentId,
              name: student.studentName ?? '',
              avatarPath: student.studentimage,
              role: RequestParticipantRole.Student,
            }))
          : message.studentName
            ? [
                {
                  id: message.studentId,
                  name: message.studentName,
                  avatarPath: message.studentimage,
                  role: RequestParticipantRole.Student,
                },
              ]
            : [];
        const firstStudent = conversationStudents[0];

        const schoolEndpoint = {
          name: schoolLabel,
          avatarPath: null as string | null,
          role: RequestParticipantRole.School,
          id: undefined as string | undefined,
          participants: undefined as RequestParticipant[] | undefined,
        };
        const studentEndpoint = {
          name: firstStudent?.name ?? '',
          avatarPath: firstStudent?.avatarPath ?? null,
          role: RequestParticipantRole.Student,
          id: firstStudent?.id,
          participants: conversationStudents,
        };

        const isFromStudent = message.sendertype === MessageSenderType.Student;
        const isToStudent = message.recivertype === MessageSenderType.Student;
        const sender = isFromStudent ? studentEndpoint : schoolEndpoint;
        const recipient = isToStudent ? studentEndpoint : schoolEndpoint;

        return {
          id: message.messageId,
          senderName: sender.name,
          senderAvatarPath: sender.avatarPath,
          senderRole: sender.role,
          senderId: sender.id,
          senderParticipants: sender.participants,
          recipientName: recipient.name,
          recipientAvatarPath: recipient.avatarPath,
          recipientRole: recipient.role,
          recipientId: recipient.id,
          recipientParticipants: recipient.participants,
          messageContent: message.message,
          status: MESSAGE_STATUS_TO_REQUEST_STATUS[message.messageStatus],
          type: StudentRequestType.Messages,
          created: message.createdAt,
          isFromStudent,
          studentId: firstStudent?.id ?? message.studentId,
        };
      },
    [schoolLabel]
  );

  // Fetch from the backend on page / filter change (debounced search).
  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(
        fetchSchoolMessages({
          PageNumber: page,
          PageSize: PAGE_SIZE,
          SearchStudentName: searchTerm.trim() || undefined,
          MessageStatus: selectedStatus
            ? REQUEST_STATUS_TO_MESSAGE_STATUS[Number(selectedStatus) as StudentRequestStatus]
            : undefined,
          Date: selectedDate || undefined,
        })
      );
    }, 350);
    return () => clearTimeout(handle);
  }, [dispatch, page, searchTerm, selectedStatus, selectedDate]);

  const requests = useMemo(
    () => messages.map(mapMessageToRequest),
    [messages, mapMessageToRequest]
  );

  // Sender / recipient filters are not exposed by the API, so we filter the
  // fetched page client-side.
  const pageData = useMemo(
    () =>
      requests.filter((row) => {
        const matchesSender = !selectedSender || row.senderName === selectedSender;
        const matchesRecipient = !selectedRecipient || row.recipientName === selectedRecipient;
        return matchesSender && matchesRecipient;
      }),
    [requests, selectedSender, selectedRecipient]
  );

  const senderOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((row) => row.senderName).filter(Boolean))).map((name) => ({
        value: name,
        label: name,
      })),
    [requests]
  );

  const recipientOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((row) => row.recipientName).filter(Boolean))).map((name) => ({
        value: name,
        label: name,
      })),
    [requests]
  );

  const handleViewParticipant = (participant: RequestParticipant) => {
    const path = getParticipantProfilePath(participant.role, participant.id);
    if (path) navigate(path);
  };

  const renderParticipantCell = (
    participants: RequestParticipant[] | undefined,
    single: { name: string; avatarPath: string | null; role?: RequestParticipantRole; id?: string },
    title: string
  ) => {
    const isGroup = Boolean(participants && participants.length > 1);
    const display = isGroup ? participants![0] : single;

    if (!isGroup && display.role === RequestParticipantRole.School) {
      return (
        <div className="flex w-full items-center justify-center">
          <span className="text-sm font-medium text-[#0E1F1F]">{display.name}</span>
        </div>
      );
    }

    const path = getParticipantProfilePath(display.role, display.id);
    const extraCount = isGroup ? participants!.length - 1 : 0;

    const onEye = isGroup
      ? () => setParticipantsView({ title, participants: participants! })
      : path
        ? () => navigate(path)
        : null;

    return (
      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 flex-1">
          <UserAvatarName name={display.name} avatarSrc={display.avatarPath} align="start" />
        </div>

        {onEye ? (
          <IconButton
            variant="blue"
            ariaLabel={t('common.view')}
            className="h-10 w-10 shrink-0"
            onClick={onEye}
          >
            <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        ) : (
          <span className="h-10 w-10 shrink-0" aria-hidden="true" />
        )}

        <span className="w-9 shrink-0 text-center text-lg/[31px] font-normal text-[#00512E]">
          <bdi>{extraCount > 0 ? `${extraCount}+` : ''}</bdi>
        </span>
      </div>
    );
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
      header: 'requests.requestStatus',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.sentFrom',
      accessor: (row) =>
        renderParticipantCell(
          row.senderParticipants,
          {
            name: row.senderName,
            avatarPath: row.senderAvatarPath,
            role: row.senderRole,
            id: row.senderId,
          },
          t('requests.participants.sendersTitle')
        ),
      headerClassName: 'min-w-[220px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.sentTo',
      accessor: (row) =>
        renderParticipantCell(
          row.recipientParticipants,
          {
            name: row.recipientName,
            avatarPath: row.recipientAvatarPath,
            role: row.recipientRole,
            id: row.recipientId,
          },
          t('requests.participants.recipientsTitle')
        ),
      headerClassName: 'min-w-[220px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.messageContent',
      accessor: (row) => <span className="text-gray-600">{row.messageContent}</span>,
      headerClassName: 'min-w-[160px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.messageDate',
      accessor: (row) => <span className="text-gray-600">{formatRequestDate(row.created)}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const canReply = row.status === StudentRequestStatus.Pending && Boolean(row.isFromStudent);
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
          placeholder={t('requests.filters.date')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSender('');
    setSelectedRecipient('');
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
        isLoading={isLoading}
        pagination={{
          page,
          limit: PAGE_SIZE,
          total: totalItems,
          totalPages,
        }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        t={t}
      />

      <MessageDetailsPopup
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onMarkViewed={() => undefined}
      />

      <ParticipantsPopup
        isOpen={Boolean(participantsView)}
        onClose={() => setParticipantsView(null)}
        title={participantsView?.title ?? ''}
        participants={participantsView?.participants ?? []}
        onViewParticipant={handleViewParticipant}
      />
    </Card>
  );
};

export default MessageRequestsTab;

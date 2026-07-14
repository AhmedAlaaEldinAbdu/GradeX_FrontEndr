import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Input from '@/shared/components/Input';
import UserAvatarName from '@/shared/components/UserAvatarName';
import { useToast } from '@/shared/context/ToastContext';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

import {
  AdminTeacherNoteStatus,
  type AdminTeacherNoteDto,
  type AdminTeacherNoteParty,
} from '../admin-requests.types';
import TeacherNoteDetailsPopup from '../popups/TeacherNoteDetailsPopup';
import { teacherRequestsApiService } from '@/services/api/teacher-requests/teacher-requests.service';
import type { TeacherNotesQueryParams } from '@/services/api/types/teacher-requests.types';
import { NoteType } from '@/shared/enums/enums';

const PAGE_SIZE = 10;

const STATUS_BADGE_CLASSES: Record<AdminTeacherNoteStatus, string> = {
  [AdminTeacherNoteStatus.Pending]: 'bg-orange-100 text-orange-700',
  [AdminTeacherNoteStatus.Viewed]: 'bg-green-100 text-green-700',
};

const STATUS_LABEL_KEYS: Record<AdminTeacherNoteStatus, string> = {
  [AdminTeacherNoteStatus.Pending]: 'adminRequests.teacherNotes.status.pending',
  [AdminTeacherNoteStatus.Viewed]: 'adminRequests.teacherNotes.status.viewed',
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '--';
  }

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const getPartyName = (party: AdminTeacherNoteParty, schoolLabel: string) =>
  party.isSchool ? party.name || schoolLabel : party.name || '-';

const TeacherNotesTab: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState('');
  const [page, setPage] = useState(1);
  const [statusById, setStatusById] = useState<Record<string, AdminTeacherNoteStatus>>({});
  const [selectedNote, setSelectedNote] = useState<AdminTeacherNoteDto | null>(null);
  const [notes, setNotes] = useState<AdminTeacherNoteDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const schoolLabel = t('requests.schoolLabel');

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: TeacherNotesQueryParams = {
        PageNumber: page,
        PageSize: PAGE_SIZE,
        SearchTeacherName: searchTerm || undefined,
        NoteType: selectedNoteType ? (Number(selectedNoteType) as any) : undefined,
        Date: selectedDate || undefined,
      };

      const response = await teacherRequestsApiService.getTeacherNotes(params);

      if (response.isSuccess && response.data) {
        setNotes(response.data.teacherRequestMessages || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        showToast({
          message: response.message || t('common.error'),
          type: 'error',
        });
      }
    } catch (error) {
      showToast({
        message: t('common.error'),
        type: 'error',
      });
      console.error('Failed to fetch teacher notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedDate, selectedNoteType, t, showToast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const notesWithStatus = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        status: statusById[note.id] ?? note.status,
      })),
    [notes, statusById]
  );

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notesWithStatus.filter((note) => {
      const matchesDate = !selectedDate || note.sentDate.startsWith(selectedDate);
      const searchableText = [
        note.sender.name,
        note.recipient.name,
        note.stage,
        note.classroom,
        note.noteContent,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesDate && matchesSearch;
    });
  }, [notesWithStatus, searchTerm, selectedDate]);

  const markViewed = (note: AdminTeacherNoteDto) => {
    setStatusById((current) => ({
      ...current,
      [note.id]: AdminTeacherNoteStatus.Viewed,
    }));
    setSelectedNote((current) =>
      current?.id === note.id ? { ...current, status: AdminTeacherNoteStatus.Viewed } : current
    );
    showToast({
      message: t('adminRequests.teacherNotes.toasts.markedViewed'),
      type: 'success',
    });
  };

  const showProfilePendingToast = () => {
    showToast({
      message: t('adminRequests.teacherNotes.toasts.profilePending'),
      type: 'info',
    });
  };

  const renderPartyCell = (party: AdminTeacherNoteParty) => {
    if (party.isSchool) {
      return (
        <div className="flex w-full items-center justify-center">
          <span className="text-sm font-medium text-[#646969]">
            {getPartyName(party, schoolLabel)}
          </span>
        </div>
      );
    }

    return (
      <UserAvatarName
        name={getPartyName(party, schoolLabel)}
        avatarSrc={party.avatarPath}
        align="center"
        onView={showProfilePendingToast}
      />
    );
  };

  const columns: DataTableColumn<AdminTeacherNoteDto>[] = [
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
      header: 'adminRequests.teacherNotes.columns.preview',
      accessor: (row) => (
        <div className="flex justify-center">
          <IconButton
            variant="darkBlue"
            ariaLabel={t('common.view')}
            className="h-10 w-10"
            onClick={() => setSelectedNote(row)}
          >
            <CustomImage src={EyeDarkBlueIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.teacherNotes.columns.sentFrom',
      accessor: (row) => renderPartyCell(row.sender),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.teacherNotes.columns.sentTo',
      accessor: (row) => renderPartyCell(row.recipient),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.teacherNotes.columns.status',
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
      header: 'adminRequests.teacherNotes.columns.stage',
      accessor: (row) => <span className="text-gray-600">{row.stage ?? '--'}</span>,
      headerClassName: 'min-w-[170px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.teacherNotes.columns.classroom',
      accessor: (row) => <span className="text-gray-600">{row.classroom ?? '--'}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.teacherNotes.columns.sentDate',
      accessor: (row) => <span className="text-gray-600">{formatDate(row.sentDate)}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.teacherNotes.columns.content',
      accessor: (row) => (
        <span className="block max-w-[260px] truncate text-gray-600" title={row.noteContent}>
          {row.noteContent}
        </span>
      ),
      headerClassName: 'min-w-[280px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const isViewed = row.status === AdminTeacherNoteStatus.Viewed;

        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="!rounded-2xl px-6"
              disabled={isViewed}
              onClick={() => markViewed(row)}
            >
              {t('adminRequests.teacherNotes.actions.markViewed')}
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
      placeholder: t('adminRequests.teacherNotes.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'note-type-filter',
      value: selectedNoteType,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedNoteType}
          onChange={(value) => {
            setSelectedNoteType(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={[
            {
              value: String(NoteType.Behavioral),
              label: t('adminRequests.teacherNotes.noteType.behavioral'),
            },
            {
              value: String(NoteType.Academic),
              label: t('adminRequests.teacherNotes.noteType.academic'),
            },
            {
              value: String(NoteType.Medical),
              label: t('adminRequests.teacherNotes.noteType.medical'),
            },
          ]}
          placeholder={t('adminRequests.teacherNotes.filters.noteType')}
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
          placeholder={t('adminRequests.teacherNotes.filters.date')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedNoteType('');
    setPage(1);
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={filteredNotes}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{ page, limit: PAGE_SIZE, total: notes.length, totalPages }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        emptyMessage="adminRequests.empty"
        isLoading={isLoading}
        t={t}
      />

      <TeacherNoteDetailsPopup
        isOpen={Boolean(selectedNote)}
        onClose={() => setSelectedNote(null)}
        note={selectedNote}
        onMarkViewed={markViewed}
        onProfilePreview={showProfilePendingToast}
      />
    </Card>
  );
};

export default TeacherNotesTab;

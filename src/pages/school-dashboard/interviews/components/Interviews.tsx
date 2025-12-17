import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import ErrorMessage from '@/shared/components/ErrorMessage';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import AddEditInterviewPopup from '../popups/AddEditInterviewPopup';
import InterviewDetailsPopup from '../popups/InterviewDetailsPopup';
import DeletePopup from '@/shared/popups/DeletePopup';
import StyledCalendarIcon from '@gradex/assets/icons/StyledCalendar.svg';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect from '@/shared/components/CustomSelect';
import { useToast } from '@/shared/context/ToastContext';
import Card from '@/shared/components/Card';

interface Interview extends CalendarEvent {
  candidateName?: string;
  position?: string;
  supervisor?: string;
  jobAdvertisementId?: string;
  jobAdvertisementName?: string;
  schoolBranchesId?: string;
  schoolBranchName?: string;
  teacherId?: string;
  supervisorId?: string;
}

export default function Interviews() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<any>(null);
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | undefined>(undefined);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [interviewIdPendingDelete, setInterviewIdPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setInterviews([]);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchInterviews();
  }, [fetchInterviews]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // navigate('/interviews/add-interview', { state: { date: slotInfo.start } });
  };

  const handleOpenAddPopup = (date?: Date) => {
    setEditorMode('add');
    setEditingInterviewId(null);
    setEditorInitialValues(null);
    setSelectedDateForEditor(date ?? new Date());
    setIsEditorOpen(true);
  };

  const handleOpenEditPopup = (interview: Interview) => {
    setEditorMode('edit');
    setEditingInterviewId(interview.id);
    setSelectedDateForEditor(interview.start);
    setEditorInitialValues({
      schoolBranchesId: interview.schoolBranchesId ?? '',
      jobAdvertisementId: interview.jobAdvertisementId ?? '',
      teacherId: interview.teacherId ?? '',
      supervisorId: interview.supervisorId ?? '',
      interviewDate: formatDateInput(interview.start),
      startTime: formatTimeInput(interview.start),
      endTime: formatTimeInput(interview.end),
      interViewType: 0,
    });
    setIsEditorOpen(true);
  };

  const handleCloseEditorPopup = () => {
    setIsEditorOpen(false);
    setEditorMode('add');
    setEditingInterviewId(null);
    setEditorInitialValues(null);
    setSelectedDateForEditor(undefined);
  };

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleEditorSubmit = async (_values: any) => {};

  const handleRequestDelete = (interviewId: string) => {
    setInterviewIdPendingDelete(interviewId);
    setIsDeletePopupOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setInterviewIdPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!interviewIdPendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setInterviews((prev) =>
        prev.filter((interview) => interview.id !== interviewIdPendingDelete)
      );

      if (selectedInterview?.id === interviewIdPendingDelete) {
        setSelectedInterview(null);
        setDetailsOpen(false);
      }

      showToast({
        message: t('interviews.interviewDeletedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      await fetchInterviews();
      handleCancelDelete();
    } catch (error) {
      console.error('Failed to delete interview:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const contextMenuActions: ContextMenuAction[] = [
    {
      label: t('interviews.viewDetails'),
      icon: EyeFillIcon,
      onClick: (date, event) => {
        if (event) {
          const interview = interviews.find((i) => i.id === event.id);
          if (interview) {
            setSelectedInterview(interview);
            setDetailsOpen(true);
          }
        }
      },
      color: 'primary',
      showOnEvent: true,
      showOnDate: false,
    },
    {
      label: t('interviews.addInterview'),
      icon: GreenPlusIcon,
      onClick: (date) => {
        handleOpenAddPopup(date);
      },
    },
    {
      label: t('interviews.editInterview'),
      icon: EditFillIcon,
      onClick: (date, event) => {
        if (event) {
          const interview = interviews.find((i) => i.id === event.id);
          if (interview) {
            handleOpenEditPopup(interview);
          }
        }
      },
      color: 'success',
      showOnDate: false,
      showOnEvent: true,
    },
    {
      label: t('interviews.deleteInterview'),
      icon: TrashFillIcon,
      onClick: (date, event) => {
        if (event) {
          const interview = interviews.find((i) => i.id === event.id);
          if (interview) {
            handleRequestDelete(interview.id);
          }
        }
      },
      color: 'danger',
      showOnDate: false,
      showOnEvent: true,
    },
  ];

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // if (!isLoading && interviews.length === 0) {
  //   return (
  //     <EmptyState
  //       imgSrc={StyledCalendarIcon}
  //       title={t('interviews.noInterviewsMessage')}
  //       blend={true}
  //     />
  //   );
  // }

  const supervisorNames = interviews
    .map((i) => i.supervisor)
    .filter((name): name is string => Boolean(name));
  const SUPERVISOR_OPTIONS = Array.from(new Set(supervisorNames)).map((name) => ({
    value: name,
    label: name,
  }));

  return (
    <>
      <Card>
        <div className="flex gap-3 mb-5">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('interviews.searchTeacherName')}
            wrapperClassName="w-[300px]"
          />
          <CustomSelect
            value={selectedSupervisorName}
            onChange={(value) =>
              setSelectedSupervisorName(Array.isArray(value) ? (value[0] ?? '') : value)
            }
            options={SUPERVISOR_OPTIONS}
            maxHeight="200px"
            className='w-[250px]'
            placeholder={t('interviews.supervisorName')}
          />
        </div>
        <SharedCalendar
          events={interviews}
          onSelectSlot={handleSelectSlot}
          contextMenuActions={contextMenuActions}
          defaultView="month"
          height={700}
        />
        <AddEditInterviewPopup
          isOpen={isEditorOpen}
          mode={editorMode}
          initialValues={editorInitialValues}
          onClose={handleCloseEditorPopup}
          onSubmit={handleEditorSubmit}
          selectedDate={selectedDateForEditor}
        />
      </Card>

      {/* Popups */}
      <InterviewDetailsPopup
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedInterview(null);
        }}
        interview={selectedInterview}
      />
      <DeletePopup
        open={isDeletePopupOpen}
        message="interviews.confirmDeleteInterview"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}

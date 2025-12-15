import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import ErrorMessage from '@/shared/components/ErrorMessage';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import AddEditInterviewPopup, {
  type AddInterviewFormValues,
  type SelectOption as InterviewSelectOption,
  createInterviewFormDefaults,
} from '../popups/AddEditInterviewPopup';
import InterviewDetailsPopup from '../popups/InterviewDetailsPopup';
import DeletePopup from '@/shared/popups/DeletePopup';
import StyledCalendarIcon from '@gradex/assets/icons/StyledCalendar.svg';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

interface Interview extends CalendarEvent {
  candidateName?: string;
  position?: string;
  supervisor?: string;
  announcementId?: string;
  announcementName?: string;
  teacherId?: string;
  supervisorId?: string;
}

const ANNOUNCEMENT_OPTIONS: InterviewSelectOption[] = [
  { value: 'announcement-1', label: 'إعلان توظيف معلم لغة عربي' },
  { value: 'announcement-2', label: 'إعلان توظيف معلم علوم' },
  { value: 'announcement-3', label: 'إعلان توظيف معلم لغة إنجليزية' },
];

const TEACHER_OPTIONS: InterviewSelectOption[] = [
  { value: 'teacher-1', label: 'أحمد محمد' },
  { value: 'teacher-2', label: 'سارة علي' },
  { value: 'teacher-3', label: 'محمد حسن' },
  { value: 'teacher-4', label: 'فاطمة أحمد' },
];

const SUPERVISOR_OPTIONS: InterviewSelectOption[] = [
  { value: 'supervisor-1', label: 'م. أحمد حسن ابراهيم' },
  { value: 'supervisor-2', label: 'د. سارة إبراهيم' },
  { value: 'supervisor-3', label: 'أ. يوسف العتيبي' },
];

export default function Interviews() {
  const { t } = useTranslation();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<AddInterviewFormValues>(
    createInterviewFormDefaults()
  );
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | null>(null);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [interviewIdPendingDelete, setInterviewIdPendingDelete] = useState<string | null>(null);

  // TODO: Fetch interviews from API
  useEffect(() => {
    setIsLoading(false);
    // Sample data - all in December 2025 for easy testing
    setInterviews([
      {
        id: '1',
        title: 'إعلان توظيف معلم لغة عربي',
        start: new Date(2025, 11, 16, 10, 0),
        end: new Date(2025, 11, 16, 11, 0),
        candidateName: 'أحمد محمد',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-1',
        announcementName: 'إعلان توظيف معلم لغة عربي',
        teacherId: 'teacher-1',
        supervisorId: 'supervisor-1',
      },
      {
        id: '4',
        title: 'مقابلة مع محمد أحمد',
        start: new Date(2025, 11, 16, 10, 0),
        end: new Date(2025, 11, 16, 11, 0),
        candidateName: 'محمد أحمد',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-3',
        announcementName: 'إعلان توظيف معلم لغة إنجليزية',
        teacherId: 'teacher-4',
        supervisorId: 'supervisor-1',
      },
      {
        id: '4',
        title: 'مقابلة مع محمد أحمد',
        start: new Date(2025, 11, 16, 10, 0),
        end: new Date(2025, 11, 16, 11, 0),
        candidateName: 'محمد أحمد',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-3',
        announcementName: 'إعلان توظيف معلم لغة إنجليزية',
        teacherId: 'teacher-4',
        supervisorId: 'supervisor-1',
      },
      {
        id: '2',
        title: 'إعلان توظيف معلم لغة عربي - مقابلة مع سارة علي',
        start: new Date(2025, 11, 18, 14, 0),
        end: new Date(2025, 11, 18, 15, 30),
        candidateName: 'سارة علي',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-1',
        announcementName: 'إعلان توظيف معلم لغة عربي',
        teacherId: 'teacher-2',
        supervisorId: 'supervisor-1',
      },
      {
        id: '3',
        title: 'مقابلة مع محمد حسن',
        start: new Date(2025, 11, 20, 9, 0),
        end: new Date(2025, 11, 20, 10, 0),
        candidateName: 'محمد حسن',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-2',
        announcementName: 'إعلان توظيف معلم علوم',
        teacherId: 'teacher-3',
        supervisorId: 'supervisor-1',
      },
      {
        id: '4',
        title: 'مقابلة مع فاطمة أحمد',
        start: new Date(2025, 11, 25, 11, 0),
        end: new Date(2025, 11, 28, 12, 0),
        candidateName: 'فاطمة أحمد',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-3',
        announcementName: 'إعلان توظيف معلم لغة إنجليزية',
        teacherId: 'teacher-4',
        supervisorId: 'supervisor-1',
      },
      {
        id: '5',
        title: 'مقابلة مع فاطمة أحمد',
        start: new Date(2026, 0, 1, 1, 0),
        end: new Date(2026, 0, 2, 2, 0),
        candidateName: 'فاطمة أحمد',
        supervisor: 'م. أحمد حسن ابراهيم',
        announcementId: 'announcement-3',
        announcementName: 'إعلان توظيف معلم لغة إنجليزية',
        teacherId: 'teacher-4',
        supervisorId: 'supervisor-1',
      },
    ]);
  }, []);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // navigate('/interviews/add-interview', { state: { date: slotInfo.start } });
  };

  const handleOpenAddPopup = (date?: Date) => {
    setEditorMode('add');
    setEditingInterviewId(null);
    setEditorInitialValues(createInterviewFormDefaults());
    setSelectedDateForEditor(date ?? new Date());
    setIsEditorOpen(true);
  };

  const handleOpenEditPopup = (interview: Interview) => {
    setEditorMode('edit');
    setEditingInterviewId(interview.id);
    setSelectedDateForEditor(interview.start);
    setEditorInitialValues({
      announcementId: interview.announcementId ?? '',
      teacherId: interview.teacherId ?? '',
      supervisorId: interview.supervisorId ?? '',
      startTime: formatTimeInput(interview.start),
      endTime: formatTimeInput(interview.end),
    });
    setIsEditorOpen(true);
  };

  const handleCloseEditorPopup = () => {
    setIsEditorOpen(false);
    setEditorMode('add');
    setEditingInterviewId(null);
    setEditorInitialValues(createInterviewFormDefaults());
    setSelectedDateForEditor(null);
  };

  const combineDateAndTime = (baseDate: Date, time: string) => {
    const [hours, minutes] = time.split(':').map((value) => Number(value) || 0);
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const formatTimeInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const findLabel = (options: InterviewSelectOption[], value: string) =>
    options.find((option) => option.value === value)?.label ?? '';

  const handleCreateInterview = (formValues: AddInterviewFormValues) => {
    const baseDate = selectedDateForEditor ?? new Date();
    const start = combineDateAndTime(baseDate, formValues.startTime);
    const end = combineDateAndTime(baseDate, formValues.endTime);
    const teacherLabel = findLabel(TEACHER_OPTIONS, formValues.teacherId);
    const supervisorLabel = findLabel(SUPERVISOR_OPTIONS, formValues.supervisorId);
    const announcementLabel = findLabel(ANNOUNCEMENT_OPTIONS, formValues.announcementId);

    const newInterview: Interview = {
      id: `${Date.now()}`,
      title: teacherLabel || announcementLabel || t('interviews.interview'),
      start,
      end,
      candidateName: teacherLabel,
      supervisor: supervisorLabel,
      announcementName: announcementLabel,
      announcementId: formValues.announcementId,
      teacherId: formValues.teacherId,
      supervisorId: formValues.supervisorId,
    };

    setInterviews((prev) => [...prev, newInterview]);
  };

  const handleUpdateInterview = (interviewId: string, formValues: AddInterviewFormValues) => {
    setInterviews((prev) =>
      prev.map((interview) => {
        if (interview.id !== interviewId) {
          return interview;
        }

        const baseDate = selectedDateForEditor ?? interview.start;
        const start = combineDateAndTime(baseDate, formValues.startTime);
        const end = combineDateAndTime(baseDate, formValues.endTime);
        const teacherLabel = findLabel(TEACHER_OPTIONS, formValues.teacherId);
        const supervisorLabel = findLabel(SUPERVISOR_OPTIONS, formValues.supervisorId);
        const announcementLabel = findLabel(ANNOUNCEMENT_OPTIONS, formValues.announcementId);

        return {
          ...interview,
          start,
          end,
          candidateName: teacherLabel,
          supervisor: supervisorLabel,
          announcementName: announcementLabel,
          announcementId: formValues.announcementId,
          teacherId: formValues.teacherId,
          supervisorId: formValues.supervisorId,
          title: announcementLabel || teacherLabel || interview.title,
        };
      })
    );
  };

  const handleEditorSubmit = (values: AddInterviewFormValues) => {
    if (editorMode === 'edit' && editingInterviewId) {
      handleUpdateInterview(editingInterviewId, values);
    } else {
      handleCreateInterview(values);
    }
  };

  const handleRequestDelete = (interviewId: string) => {
    setInterviewIdPendingDelete(interviewId);
    setIsDeletePopupOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setInterviewIdPendingDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!interviewIdPendingDelete) {
      return;
    }

    setInterviews((prev) => prev.filter((interview) => interview.id !== interviewIdPendingDelete));

    if (selectedInterview?.id === interviewIdPendingDelete) {
      setSelectedInterview(null);
      setDetailsOpen(false);
    }

    handleCancelDelete();
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

  if (!isLoading && interviews.length === 0) {
    return <EmptyState imgSrc={StyledCalendarIcon} title={t('interviews.noInterviewsMessage')} />;
  }

  return (
    <>
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
        announcements={ANNOUNCEMENT_OPTIONS}
        teachers={TEACHER_OPTIONS}
        supervisors={SUPERVISOR_OPTIONS}
        selectedDate={selectedDateForEditor}
      />
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
      />
    </>
  );
}

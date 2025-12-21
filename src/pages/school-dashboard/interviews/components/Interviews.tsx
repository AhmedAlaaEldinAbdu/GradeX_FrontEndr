import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  createInterview,
  deleteInterview,
  editInterview,
  fetchInterviews,
} from '@/redux/features/interviews/interviewsSlice';
import type { InterviewFormProps } from '@/validations/interviews-validations';
import { InterviewType } from '@/services/api/types/interviews.types';
import type { Interview as InterviewEntity } from '@/services/api/types/interviews.types';

interface CalendarInterview extends CalendarEvent {
  candidateName?: string;
  position?: string;
  supervisor?: string;
  jobAdvertisementId?: string;
  jobAdvertisementName?: string;
  schoolBranchesId?: string;
  schoolBranchName?: string;
  teacherId?: string;
  supervisorId?: string;
  interViewType?: InterviewType;
}

type ExtendedInterviewEntity = InterviewEntity & {
  jobAdvertisementName?: string;
  nameAr?: string;
  nameEn?: string;
  schoolBranchName?: string;
};

export default function Interviews() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const {
    interviews: interviewsData,
    isLoading,
    error: errorMessage,
  } = useAppSelector((state) => state.interviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<CalendarInterview | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<any>(null);
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | undefined>(undefined);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [interviewIdPendingDelete, setInterviewIdPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInterviewsData = useCallback(async () => {
    const trimmedSearch = searchTerm.trim();
    const filters = {
      ...(trimmedSearch ? { teacherName: trimmedSearch } : {}),
      ...(selectedSupervisorName ? { supervisorName: selectedSupervisorName } : {}),
    };

    try {
      await dispatch(
        fetchInterviews({
          filters,
        })
      ).unwrap();
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');

      showToast({
        message,
        type: 'error',
        duration: 3000,
      });
    }
  }, [dispatch, searchTerm, selectedSupervisorName, showToast, t]);

  useEffect(() => {
    fetchInterviewsData();
  }, [fetchInterviewsData]);

  const calendarInterviews = useMemo<CalendarInterview[]>(() => {
    const toValidDate = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    };

    return interviewsData.map((interview: InterviewEntity) => {
      const extendedInterview = interview as ExtendedInterviewEntity;
      const start =
        toValidDate(interview.startTime) || toValidDate(interview.interviewDate) || new Date();
      const end = toValidDate(interview.endTime) || toValidDate(interview.startTime) || start;
      const jobAdvertisementLabel =
        extendedInterview.jobAdvertisementName || interview.jobAdvertisementTitle;
      const title =
        jobAdvertisementLabel ||
        interview.teacherName ||
        extendedInterview.nameEn ||
        extendedInterview.nameAr ||
        t('interviews.untitledInterview');

      return {
        id: interview.id,
        title,
        start,
        end,
        candidateName:
          interview.teacherName || extendedInterview.nameEn || extendedInterview.nameAr || title,
        position: jobAdvertisementLabel || extendedInterview.nameEn || extendedInterview.nameAr,
        supervisor: interview.supervisorName,
        jobAdvertisementId: interview.jobAdvertisementId,
        jobAdvertisementName: jobAdvertisementLabel,
        schoolBranchesId: interview.schoolBranchesId,
        schoolBranchName: extendedInterview.schoolBranchName,
        teacherId: interview.teacherId,
        supervisorId: interview.supervisorId,
        interViewType:
          (interview.interViewType as InterviewType | undefined) ?? InterviewType.ONLINE,
      };
    });
  }, [interviewsData, t]);

  const SUPERVISOR_OPTIONS = useMemo(() => {
    const names = interviewsData
      .map((interview) => interview.supervisorName)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).map((name) => ({
      value: name,
      label: name,
    }));
  }, [interviewsData]);

  const showEmptyState = !isLoading && calendarInterviews.length === 0;

  const handleSelectSlot = (_slotInfo: { start: Date; end: Date }) => {
    // navigate('/interviews/add-interview', { state: { date: slotInfo.start } });
  };

  const handleOpenAddPopup = (date?: Date) => {
    setEditorMode('add');
    setEditingInterviewId(null);
    setEditorInitialValues(null);
    setSelectedDateForEditor(date ?? new Date());
    setIsEditorOpen(true);
  };

  const handleOpenEditPopup = (interview: CalendarInterview) => {
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
      interViewType: interview.interViewType ?? InterviewType.ONLINE,
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

  const handleEditorSubmit = async (values: InterviewFormProps) => {
    try {
      const payload = {
        ...values,
        interViewType: values.interViewType as InterviewType,
      };

      if (editorMode === 'edit') {
        if (!editingInterviewId) {
          throw showToast({
            message: t('common.error'),
            type: 'error',
            duration: 3000,
          });
        }

        await dispatch(editInterview({ id: editingInterviewId, data: payload })).unwrap();
        showToast({
          message: t('interviews.interviewUpdatedSuccessfully'),
          type: 'success',
          duration: 3000,
        });
      } else {
        await dispatch(createInterview(payload)).unwrap();
        showToast({
          message: t('interviews.interviewAddedSuccessfully'),
          type: 'success',
          duration: 3000,
        });
      }

      await fetchInterviewsData();
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');

      showToast({
        message,
        type: 'error',
        duration: 3000,
      });

      throw error;
    }
  };

  const handleRequestDelete = (interviewId: string) => {
    setInterviewIdPendingDelete(interviewId);
    setShowDeletePopup(true);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setInterviewIdPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!interviewIdPendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await dispatch(deleteInterview(interviewIdPendingDelete)).unwrap();
      setShowDeletePopup(false);
      setInterviewIdPendingDelete(null);
      showToast({
        message: t('interviews.interviewDeletedSuccessfully'),
        type: 'success',
        duration: 3000,
      });
      await fetchInterviewsData();
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({
        message,
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
          const interview = calendarInterviews.find((i) => i.id === event.id);
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
          const interview = calendarInterviews.find((i) => i.id === event.id);
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
          const interview = calendarInterviews.find((i) => i.id === event.id);
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

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <>
      <Card>
        <div className="mb-5 flex gap-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('interviews.searchTeacherName')}
            wrapperClassName="w-[300px]"
          />
          <CustomSelect
            value={selectedSupervisorName}
            onChange={(value) =>
              setSelectedSupervisorName(
                Array.isArray(value)
                  ? ((value[0] as string | undefined) ?? '')
                  : ((value as string | undefined) ?? '')
              )
            }
            options={SUPERVISOR_OPTIONS}
            maxHeight="200px"
            className="w-[250px]"
            placeholder={t('interviews.supervisorName')}
          />
        </div>
        {showEmptyState && (
          <EmptyState
            imgSrc={StyledCalendarIcon}
            title={t('interviews.noInterviewsMessage')}
            blend={true}
          />
        )}
        <SharedCalendar
          events={calendarInterviews}
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
        open={showDeletePopup}
        message="interviews.confirmDeleteInterview"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}

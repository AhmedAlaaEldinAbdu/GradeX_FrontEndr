import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import AddEditInterviewPopup from '../popups/AddEditInterviewPopup';
import InterviewDetailsPopup from '../popups/InterviewDetailsPopup';
import DeletePopup from '@/shared/popups/DeletePopup';
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
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
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
  const { interviews: interviewsData, isLoading } = useAppSelector((state) => state.interviews);
  const schoolBranchesId = getCurrentSchoolBranchId();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');
  const [allSupervisors, setAllSupervisors] = useState<Array<{ value: string; label: string }>>([]);
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

  const isPastDate = useCallback((date?: Date) => {
    if (!date) {
      return false;
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return targetDate < today;
  }, []);

  const fetchInterviewsData = useCallback(async () => {
    const trimmedSearch = searchTerm.trim();
    const filters = {
      ...(trimmedSearch ? { teacherName: trimmedSearch } : {}),
      ...(selectedSupervisorName ? { supervisorName: selectedSupervisorName } : {}),
      ...(schoolBranchesId ? { schoolBranchesId } : {}),
    };

    try {
      const result = await dispatch(
        fetchInterviews({
          filters,
        })
      ).unwrap();

      // Capture all supervisors only on initial load (no filters)
      if (!trimmedSearch && !selectedSupervisorName && result?.data) {
        const names = result.data
          .map((interview: InterviewEntity) => interview.supervisorName)
          .filter((name): name is string => Boolean(name));

        const uniqueSupervisors = Array.from<string>(new Set(names)).map((name) => ({
          value: name,
          label: name,
        }));

        setAllSupervisors(uniqueSupervisors);
      }
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

  const buildIsoDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) {
      return undefined;
    }

    const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    const combined = `${dateStr}T${normalizedTime}`;
    const parsed = new Date(combined);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  };

  const handleEditorSubmit = async (values: InterviewFormProps) => {
    try {
      const interviewDateValue =
        values.interviewDate ||
        (selectedDateForEditor ? formatDateInput(selectedDateForEditor) : '');
      const normalizedStartTime = buildIsoDateTime(interviewDateValue, values.startTime);
      const normalizedEndTime = buildIsoDateTime(interviewDateValue, values.endTime);

      const payload = {
        ...values,
        interViewType: values.interViewType as InterviewType,
        startTime: normalizedStartTime ?? values.startTime,
        endTime: normalizedEndTime ?? values.endTime,
      };

      if (editorMode === 'edit') {
        if (!editingInterviewId) {
          throw showToast({
            message: t('common.error'),
            type: 'error',
            duration: 3000,
          });
        }

        await dispatch(editInterview({ id: editingInterviewId, data: payload }))
          .unwrap()
          .then(() => {
            showToast({
              message: t('interviews.interviewUpdatedSuccessfully'),
              type: 'success',
            });
            fetchInterviewsData();
          });
      } else {
        await dispatch(createInterview(payload))
          .unwrap()
          .then((res) => {
            if (res.isSuccess) {
              showToast({
                message: t('interviews.interviewAddedSuccessfully'),
                type: 'success',
              });
              fetchInterviewsData();
            }
          });
      }
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
      await dispatch(deleteInterview(interviewIdPendingDelete))
        .unwrap()
        .then((res: any) => {
          if (res === interviewIdPendingDelete || res.isSuccess) {
            setInterviewIdPendingDelete(null);
            setShowDeletePopup(false);
            fetchInterviewsData();
            showToast({
              message: t('interviews.interviewDeletedSuccessfully'),
              type: 'success',
            });
          } else {
            setInterviewIdPendingDelete(null);
            setShowDeletePopup(false);
            showToast({
              message: t('common.error'),
              type: 'error',
            });
          }
        });
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

  const hasMultipleInterviewsOnDay = useCallback(
    (date: Date) => {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const interviewsOnDay = calendarInterviews.filter((interview) => {
        const interviewDate = new Date(interview.start);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate.getTime() === targetDate.getTime();
      });

      return interviewsOnDay.length > 1;
    },
    [calendarInterviews]
  );

  const contextMenuActions: ContextMenuAction[] = [
    {
      label: t('interviews.viewDetails'),
      icon: EyeFillIcon,
      onClick: (_date, event) => {
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
      color: 'green',
      hidden: (date) => isPastDate(date),
    },
    {
      label: t('interviews.editInterview'),
      icon: EditFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const interview = calendarInterviews.find((i) => i.id === event.id);
          if (interview && !hasMultipleInterviewsOnDay(interview.start)) {
            handleOpenEditPopup(interview);
          }
        }
      },
      color: 'success',
      showOnDate: false,
      showOnEvent: true,
      hidden: (_date, event) => {
        if (event) {
          const interview = calendarInterviews.find((i) => i.id === event.id);
          return interview
            ? hasMultipleInterviewsOnDay(interview.start) || isPastDate(interview.start)
            : false;
        }
        return false;
      },
    },
    {
      label: t('interviews.deleteInterview'),
      icon: TrashFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const interview = calendarInterviews.find((i) => i.id === event.id);
          if (interview && !hasMultipleInterviewsOnDay(interview.start)) {
            handleRequestDelete(interview.id);
          }
        }
      },
      color: 'danger',
      showOnDate: false,
      showOnEvent: true,
      hidden: (_date, event) => {
        if (event) {
          const interview = calendarInterviews.find((i) => i.id === event.id);
          return interview
            ? hasMultipleInterviewsOnDay(interview.start) || isPastDate(interview.start)
            : false;
        }
        return false;
      },
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSupervisorName('');
  };

  return (
    <>
      <Card>
        <div className="mb-5 flex justify-between gap-3">
          <div className="mb-6 flex flex-1 flex-wrap gap-4 lg:flex-nowrap">
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
              options={allSupervisors}
              maxHeight="200px"
              className="w-[250px]"
              placeholder={isLoading ? t('common.loading') : t('interviews.supervisorName')}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            title={t('actions.clearFilter')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21 12a9 9 0 1 0-3.46 6.54"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <SharedCalendar
          events={calendarInterviews}
          onSelectSlot={handleSelectSlot}
          contextMenuActions={contextMenuActions}
          defaultView="month"
        />
      </Card>

      {/* Popups */}
      <AddEditInterviewPopup
        isOpen={isEditorOpen}
        mode={editorMode}
        initialValues={editorInitialValues}
        onClose={handleCloseEditorPopup}
        onSubmit={handleEditorSubmit}
        selectedDate={selectedDateForEditor}
      />

      <InterviewDetailsPopup
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedInterview(null);
        }}
        onEdit={(interviewId) => {
          const interview = calendarInterviews.find((i) => i.id === interviewId);
          if (interview) {
            setDetailsOpen(false);
            setSelectedInterview(null);
            handleOpenEditPopup(interview);
          }
        }}
        interview={selectedInterview}
      />

      <DeletePopup
        open={showDeletePopup}
        message="interviews.confirmDeleteInterview"
        itemName={
          calendarInterviews.find((item) => item.id === interviewIdPendingDelete)?.title ?? ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}

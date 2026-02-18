import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import AddEditStudentInterviewPopup from '../popups/AddEditStudentInterviewPopup';
import StudentInterviewDetailsPopup from '../popups/StudentInterviewDetailsPopup';
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
import {
  createStudentInterview,
  deleteStudentInterview,
  editStudentInterview,
  fetchStudentInterviews,
} from '@/redux/features/student-interviews/studentInterviewsSlice';
import type { StudentInterviewApiProps } from '@/validations/student-interviews-validations';
import type { StudentInterview as StudentInterviewEntity } from '@/services/api/types/student-interviews.types';

interface CalendarStudentInterview extends CalendarEvent {
  nameAr?: string;
  nameEn?: string;
  schoolBranchesId?: string;
  studentId?: string;
  studentName?: string;
  supervisorId?: string;
  supervisor?: string;
  supervisorName?: string;
  interviewDate?: string;
  startTime?: string;
  endTime?: string;
}

export default function StudentInterviewsCalendar() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { studentInterviews: studentInterviewsData, isLoading } = useAppSelector(
    (state) => state.studentInterviews
  );

  const isRTL = i18n.language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');
  const [allSupervisors, setAllSupervisors] = useState<Array<{ value: string; label: string }>>([]);

  const [selectedInterview, setSelectedInterview] = useState<CalendarStudentInterview | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<StudentInterviewApiProps | null>(
    null
  );
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | undefined>(undefined);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [interviewIdPendingDelete, setInterviewIdPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudentInterviewsData = useCallback(async () => {
    const trimmedSearch = searchTerm.trim();
    const filters = {
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
    };

    try {
      const result = await dispatch(
        fetchStudentInterviews({
          filters,
        })
      ).unwrap();

      if (!trimmedSearch && result?.data) {
        const names = result.data
          .map((item: StudentInterviewEntity) => item.supervisor || item.supervisorName)
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
  }, [dispatch, searchTerm, showToast, t]);

  useEffect(() => {
    fetchStudentInterviewsData();
  }, [fetchStudentInterviewsData]);

  const visibleStudentInterviews = useMemo(() => {
    if (!selectedSupervisorName) {
      return studentInterviewsData;
    }
    return studentInterviewsData.filter(
      (x) => (x.supervisor || x.supervisorName) === selectedSupervisorName
    );
  }, [selectedSupervisorName, studentInterviewsData]);

  const calendarStudentInterviews = useMemo<CalendarStudentInterview[]>(() => {
    const toValidDate = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    };

    return visibleStudentInterviews.map((interview: StudentInterviewEntity) => {
      const start =
        toValidDate(interview.startTime) || toValidDate(interview.interviewDate) || new Date();
      const end = toValidDate(interview.endTime) || toValidDate(interview.startTime) || start;

      const title =
        (isRTL ? interview.nameAr : interview.nameEn) ||
        interview.nameAr ||
        interview.nameEn ||
        interview.studentName ||
        t('interviews.interview');

      return {
        id: interview.id,
        title,
        start,
        end,
        nameAr: interview.nameAr,
        nameEn: interview.nameEn,
        schoolBranchesId: interview.schoolBranchesId,
        studentId: interview.studentId,
        studentName: interview.studentName,
        supervisorId: interview.supervisorId,
        supervisor: interview.supervisor,
        supervisorName: interview.supervisorName,
        interviewDate: interview.interviewDate,
        startTime: interview.startTime,
        endTime: interview.endTime,
      };
    });
  }, [isRTL, t, visibleStudentInterviews]);

  const handleOpenAddPopup = (date?: Date) => {
    setEditorMode('add');
    setEditingInterviewId(null);
    setEditorInitialValues(null);
    setSelectedDateForEditor(date ?? new Date());
    setIsEditorOpen(true);
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

    if (timeStr.includes('T')) {
      const parsed = new Date(timeStr);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    }

    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const [hourStr, minuteStr, secondStr = '00'] = (timeStr.length === 5
      ? `${timeStr}:00`
      : timeStr
    ).split(':');

    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    const second = Number(secondStr);

    if (
      Number.isNaN(year) ||
      Number.isNaN(monthIndex) ||
      Number.isNaN(day) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      Number.isNaN(second)
    ) {
      return undefined;
    }

    const utcDate = new Date(Date.UTC(year, monthIndex, day, hour, minute, second));
    return utcDate.toISOString();
  };

  const handleOpenEditPopup = (event: CalendarStudentInterview) => {
    setEditorMode('edit');
    setEditingInterviewId(event.id);
    setSelectedDateForEditor(event.start);
    setEditorInitialValues({
      nameAr: event.nameAr ?? '',
      nameEn: event.nameEn ?? '',
      schoolBranchesId: event.schoolBranchesId ?? '',
      studentId: event.studentId ?? '',
      supervisorId: event.supervisorId ?? '',
      interviewDate: formatDateInput(event.start),
      startTime: formatTimeInput(event.start),
      endTime: formatTimeInput(event.end),
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

  const handleEditorSubmit = async (values: StudentInterviewApiProps) => {
    try {
      const supervisorId = values.supervisorId ?? '';
      const interviewDate = values.interviewDate ?? '';
      const startTime = values.startTime ?? '';
      const endTime = values.endTime ?? '';

      const startIso = buildIsoDateTime(interviewDate || undefined, startTime || undefined);
      const endIso = buildIsoDateTime(interviewDate || undefined, endTime || undefined);
      const interviewDateIso = startIso;

      if (!startIso || !interviewDateIso) {
        showToast({
          message: t('common.error'),
          type: 'error',
        });
        return;
      }

      const payload = {
        ...values,
        supervisorId,
        interviewDate: interviewDateIso,
        startTime: startIso,
        endTime: endIso ?? startIso,
      };

      if (editorMode === 'add') {
        const res: any = await dispatch(createStudentInterview(payload)).unwrap();
        if (res?.isSuccess) {
          showToast({
            message: t('interviews.interviewAddedSuccessfully'),
            type: 'success',
          });
          fetchStudentInterviewsData();
        } else {
          showToast({
            message: t('common.error'),
            type: 'error',
          });
          return;
        }
      } else {
        if (!editingInterviewId) {
          return;
        }
        const res: any = await dispatch(
          editStudentInterview({ id: editingInterviewId, data: payload })
        ).unwrap();
        if (res?.isSuccess) {
          showToast({
            message: t('interviews.interviewUpdatedSuccessfully'),
            type: 'success',
          });
          fetchStudentInterviewsData();
        } else {
          showToast({
            message: t('common.error'),
            type: 'error',
          });
        }
      }
      handleCloseEditorPopup();
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({
        message,
        type: 'error',
      });
    }
  };

  const handleRequestDelete = (id: string) => {
    setInterviewIdPendingDelete(id);
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
      await dispatch(deleteStudentInterview(interviewIdPendingDelete))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess || res === interviewIdPendingDelete) {
            showToast({
              message: t('interviews.interviewDeletedSuccessfully'),
              type: 'success',
            });
            setShowDeletePopup(false);
            setInterviewIdPendingDelete(null);
            fetchStudentInterviewsData();
          } else {
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
      showToast({ message, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasMultipleInterviewsOnDay = useCallback(
    (day: Date) => {
      const targetDate = new Date(day);
      targetDate.setHours(0, 0, 0, 0);

      const interviewsOnDay = calendarStudentInterviews.filter((interview) => {
        const interviewDate = new Date(interview.start);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate.getTime() === targetDate.getTime();
      });

      return interviewsOnDay.length > 1;
    },
    [calendarStudentInterviews]
  );

  const contextMenuActions: ContextMenuAction[] = [
    {
      label: t('interviews.details'),
      icon: EyeFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const fullEvent = calendarStudentInterviews.find((e) => e.id === event.id);
          if (fullEvent) {
            setSelectedInterview(fullEvent);
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
      onClick: (date) => handleOpenAddPopup(date),
      color: 'green',
    },
    {
      label: t('interviews.editInterview'),
      icon: EditFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const fullEvent = calendarStudentInterviews.find((e) => e.id === event.id);
          if (fullEvent && !hasMultipleInterviewsOnDay(fullEvent.start)) {
            handleOpenEditPopup(fullEvent);
          }
        }
      },
      color: 'success',
      showOnEvent: true,
      showOnDate: false,
      hidden: (_date, event) => {
        if (event) {
          const fullEvent = calendarStudentInterviews.find((e) => e.id === event.id);
          return fullEvent ? hasMultipleInterviewsOnDay(fullEvent.start) : false;
        }
        return false;
      },
    },
    {
      label: t('interviews.deleteInterview'),
      icon: TrashFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const fullEvent = calendarStudentInterviews.find((e) => e.id === event.id);
          if (fullEvent && !hasMultipleInterviewsOnDay(fullEvent.start)) {
            handleRequestDelete(fullEvent.id);
          }
        }
      },
      color: 'danger',
      showOnEvent: true,
      showOnDate: false,
      hidden: (_date, event) => {
        if (event) {
          const fullEvent = calendarStudentInterviews.find((e) => e.id === event.id);
          return fullEvent ? hasMultipleInterviewsOnDay(fullEvent.start) : false;
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
              placeholder={t('studentManagement.searchByStudentName')}
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
              placeholder={isLoading ? t('common.loading') : t('interviews.supervisor')}
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
          events={calendarStudentInterviews}
          contextMenuActions={contextMenuActions}
          defaultView="month"
        />
      </Card>

      <AddEditStudentInterviewPopup
        isOpen={isEditorOpen}
        mode={editorMode}
        initialValues={editorInitialValues ?? undefined}
        onClose={handleCloseEditorPopup}
        onSubmit={handleEditorSubmit}
        selectedDate={selectedDateForEditor}
      />

      <StudentInterviewDetailsPopup
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedInterview(null);
        }}
        onEdit={(interviewId) => {
          const interview =
            calendarStudentInterviews.find((i) => i.id === interviewId) ??
            (() => {
              const entity = studentInterviewsData.find((x) => x.id === interviewId);
              if (!entity) return undefined;
              const start = new Date(entity.startTime || entity.interviewDate);
              const end = new Date(entity.endTime || entity.startTime || entity.interviewDate);
              return {
                id: entity.id,
                title:
                  (i18n.language === 'ar' ? entity.nameAr : entity.nameEn) ||
                  entity.nameAr ||
                  entity.nameEn ||
                  entity.studentName ||
                  t('interviews.interview'),
                start: Number.isNaN(start.getTime()) ? new Date() : start,
                end: Number.isNaN(end.getTime())
                  ? Number.isNaN(start.getTime())
                    ? new Date()
                    : start
                  : end,
                nameAr: entity.nameAr,
                nameEn: entity.nameEn,
                schoolBranchesId: entity.schoolBranchesId,
                studentId: entity.studentId,
                studentName: entity.studentName,
                supervisorId: entity.supervisorId,
                supervisor: entity.supervisor,
                supervisorName: entity.supervisorName,
                interviewDate: entity.interviewDate,
                startTime: entity.startTime,
                endTime: entity.endTime,
              } as CalendarStudentInterview;
            })();

          if (interview) {
            setDetailsOpen(false);
            setSelectedInterview(null);
            handleOpenEditPopup(interview);
          }
        }}
        interview={
          selectedInterview ? { id: selectedInterview.id, start: selectedInterview.start } : null
        }
      />

      <DeletePopup
        open={showDeletePopup}
        message="interviews.confirmDeleteInterview"
        itemName={
          calendarStudentInterviews.find((item) => item.id === interviewIdPendingDelete)?.title ??
          ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}

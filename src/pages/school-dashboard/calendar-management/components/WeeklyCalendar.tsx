import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, addWeeks, isSameDay, startOfWeek } from 'date-fns';
import type { ScheduleLesson } from '@/shared/components/WeeklyScheduleCalendar';
import CustomImage from '@/shared/components/CustomImage';
import LessonDetailsPopup from '../popups/LessonDetailsPopup';
import DeleteLessonPopup from '../popups/DeleteLessonPopup';
import AddEditLessonPopup, { type LessonPopupDefaults } from '../popups/AddEditLessonPopup';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useLanguage } from '@/hooks/useLanguage';
import {
  fetchLessons,
  fetchLessonByIdSilent,
  updateLesson,
  deleteLessonById,
  recoverAllLessons,
} from '@/redux/features/lessons/lessonsSlice';
import { fetchMonthlyCalendarEvents } from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import { fetchAcademicCalendarsForWeek } from '@/redux/features/academic-calendar/academicCalendarSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import {
  getEducationalStages,
  getEducationalStagesBySubSystemId,
  getLKSchoolStages,
} from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import AlertCircleBlue16Icon from '@/assets/icons/AlertCircleBlue16.svg';
import WeeklyCalendarFilters, { type WeeklyFilterOption } from './WeeklyCalendarFilters';
import WeeklyCalendarToolbar from './WeeklyCalendarToolbar';
import WeeklyTimetableGrid, { type LessonMenuAction } from './WeeklyTimetableGrid';
import { printElement } from './MonthlyCalendarItems';
import {
  DEFAULT_WORKING_DAYS,
  WEEK_STARTS_ON,
  buildTimetableRows,
  formatMinutes,
  formatWeekRange,
  getWorkingDaysFromSchedules,
  toDateKey,
  toTimetableEvents,
  toTimetableLessons,
  type TimetableLesson,
  type TimetableRow,
} from './WeeklyCalendarItems';

const FILTERS_STORAGE_KEY = 'weeklyCalendar.filters.v2';
const PRINT_AREA_ID = 'weekly-calendar-print-area';
const LOOKUP_PAGE_SIZE = 10000;
const ALL_STAGE_NAMES = ['الكل', 'all'];

type PersistedFilters = {
  subSystemId?: string;
  stageId?: string;
  gradeId?: string;
  classroomId?: string;
};

const readPersistedFilters = (): PersistedFilters => {
  try {
    const raw = window.sessionStorage.getItem(FILTERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedFilters) : {};
  } catch {
    return {};
  }
};

const getCurrentWeekStart = () => startOfWeek(new Date(), { weekStartsOn: WEEK_STARTS_ON });

const toScheduleLesson = (lesson: TimetableLesson): ScheduleLesson => ({
  id: lesson.id,
  subject: lesson.subject,
  teacherName: lesson.teacherName,
  startTime: lesson.startTime,
  endTime: lesson.endTime,
  duration: lesson.duration,
  dayIndex: lesson.dayIndex,
  periodIndex: 0,
});

const getErrorText = (error: unknown, fallback: string) =>
  typeof error === 'string' ? error : (error as { message?: string })?.message || fallback;

export default function WeeklyCalendar() {
  const { t, i18n } = useTranslation();
  const { isArabic } = useLanguage();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { guardMutation } = useRoleAccess();
  const currentLang = i18n.language;
  const schoolBranchId = getCurrentSchoolBranchId() ?? undefined;

  const [initialFilters] = useState(readPersistedFilters);
  const [subSystemId, setSubSystemId] = useState(initialFilters.subSystemId ?? '');
  const [stageId, setStageId] = useState(initialFilters.stageId ?? '');
  const [gradeId, setGradeId] = useState(initialFilters.gradeId ?? '');
  const [classroomId, setClassroomId] = useState(initialFilters.classroomId ?? '');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getCurrentWeekStart);

  const [selectedLesson, setSelectedLesson] = useState<ScheduleLesson | null>(null);
  const [lessonPendingDelete, setLessonPendingDelete] = useState<TimetableLesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [movingLessonId, setMovingLessonId] = useState<string | null>(null);
  const [lessonPopup, setLessonPopup] = useState<{
    mode: 'add' | 'edit';
    lessonId?: string;
    defaults?: LessonPopupDefaults;
  } | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ subSystemId, stageId, gradeId, classroomId })
      );
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  }, [subSystemId, stageId, gradeId, classroomId]);

  const schoolAcademicSubSystems = useAppSelector(
    (state) => state.academicSubSystems.schoolAcademicSubSystems
  );
  const {
    educationalStages: gradesList,
    lkEducationalStages,
    isLoading: isLoadingGrades,
  } = useAppSelector((state) => state.educationalStages);
  const { classrooms: classroomsList, isLoading: isLoadingClassrooms } = useAppSelector(
    (state) => state.classrooms
  );
  const { lessons: apiLessons, isLoading: isLoadingLessons } = useAppSelector(
    (state) => state.lessons
  );
  const { events: apiEvents } = useAppSelector((state) => state.monthlyCalendar);
  const {
    weekCalendarsWithDetails: academicCalendars,
    isLoadingWeekCalendars: isLoadingAcademicCalendars,
  } = useAppSelector((state) => state.academicCalendar);

  useEffect(() => {
    dispatch(
      getSchoolAcademicSubSystems({ pageIndex: 1, pageSize: LOOKUP_PAGE_SIZE, schoolBranchId })
    );
  }, [dispatch, schoolBranchId]);

  const lkStagesCount = lkEducationalStages.length;
  useEffect(() => {
    if (lkStagesCount === 0) dispatch(getLKSchoolStages());
  }, [dispatch, lkStagesCount]);

  useEffect(() => {
    if (subSystemId) {
      dispatch(
        getEducationalStagesBySubSystemId({
          academicSubSystemId: subSystemId,
          params: { pageIndex: 1, pageSize: LOOKUP_PAGE_SIZE },
        })
      );
    } else {
      dispatch(getEducationalStages({ pageIndex: 1, pageSize: LOOKUP_PAGE_SIZE, schoolBranchId }));
    }
  }, [dispatch, subSystemId, schoolBranchId]);

  useEffect(() => {
    if (!gradeId) return;
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: LOOKUP_PAGE_SIZE,
        filters: { gradeId, ...(schoolBranchId && { schoolBranchId }) },
      })
    );
  }, [dispatch, gradeId, schoolBranchId]);

  const reloadLessons = useCallback(() => {
    if (!classroomId) return;
    dispatch(
      fetchLessons({
        filters: {
          gradeId: gradeId || undefined,
          classroomId,
          schoolBranchesId: schoolBranchId,
        },
      })
    );
  }, [dispatch, classroomId, gradeId, schoolBranchId]);

  useEffect(() => {
    reloadLessons();
  }, [reloadLessons]);

  useEffect(() => {
    if (!classroomId) return;
    dispatch(
      fetchMonthlyCalendarEvents({
        page: 1,
        limit: 100,
        filters: { schoolBranchId, grade: gradeId },
      })
    );
  }, [dispatch, classroomId, gradeId, schoolBranchId]);

  useEffect(() => {
    if (!schoolBranchId || !gradeId || !classroomId) return;
    dispatch(
      fetchAcademicCalendarsForWeek({
        schoolBranchId,
        gradeId,
        weekStart: currentWeekStart.toISOString(),
        weekEnd: addDays(currentWeekStart, 6).toISOString(),
      })
    );
  }, [dispatch, currentWeekStart, schoolBranchId, gradeId, classroomId]);

  const subSystemOptions = useMemo<WeeklyFilterOption[]>(
    () => schoolAcademicSubSystems.map((s) => ({ value: s.id, label: s.name })),
    [schoolAcademicSubSystems]
  );

  const stageOptions = useMemo<WeeklyFilterOption[]>(
    () =>
      lkEducationalStages
        .filter((stage) => !ALL_STAGE_NAMES.includes(stage.nameAR?.trim().toLowerCase()))
        .filter((stage) => !ALL_STAGE_NAMES.includes(stage.nameEN?.trim().toLowerCase()))
        .map((stage) => ({
          value: stage.id,
          label: isArabic ? stage.nameAR : stage.nameEN || stage.nameAR,
        })),
    [lkEducationalStages, isArabic]
  );

  const gradeOptions = useMemo<WeeklyFilterOption[]>(
    () =>
      gradesList
        .filter((grade) => !stageId || !grade.lkSchoolStageId || grade.lkSchoolStageId === stageId)
        .map((grade) => ({
          value: grade.id,
          label: isArabic ? grade.nameAr : grade.nameEn || grade.nameAr,
        })),
    [gradesList, stageId, isArabic]
  );

  const classroomOptions = useMemo<WeeklyFilterOption[]>(
    () =>
      gradeId
        ? classroomsList.map((c) => ({
            value: c.id,
            label: isArabic ? c.name : c.nameEn || c.name,
          }))
        : [],
    [classroomsList, gradeId, isArabic]
  );

  const resetFrom = (level: 'subSystem' | 'stage' | 'grade') => {
    if (level === 'subSystem') setStageId('');
    if (level !== 'grade') setGradeId('');
    setClassroomId('');
  };

  const rows = useMemo(() => buildTimetableRows(academicCalendars ?? []), [academicCalendars]);

  const timetableLessons = useMemo(() => {
    const lessons = toTimetableLessons(apiLessons ?? [], currentWeekStart, currentLang);
    const query = searchTerm.trim().toLowerCase();
    if (!query) return lessons;
    return lessons.filter(
      (lesson) =>
        lesson.subject.toLowerCase().includes(query) ||
        lesson.teacherName?.toLowerCase().includes(query)
    );
  }, [apiLessons, currentWeekStart, currentLang, searchTerm]);

  const timetableEvents = useMemo(
    () => toTimetableEvents(apiEvents ?? [], currentWeekStart, currentLang),
    [apiEvents, currentWeekStart, currentLang]
  );

  const eventDays = useMemo(
    () => new Set(timetableEvents.map((event) => event.dayIndex)),
    [timetableEvents]
  );

  const workingDays = useMemo(() => {
    if (!academicCalendars?.length) return DEFAULT_WORKING_DAYS;
    const days = new Set<number>();
    academicCalendars.forEach((calendar) =>
      getWorkingDaysFromSchedules(calendar.daySchedules).forEach((day) => days.add(day))
    );
    return Array.from(days);
  }, [academicCalendars]);

  const visibleDays = useMemo(() => {
    const days = new Set(workingDays);
    timetableLessons.forEach((lesson) => days.add(lesson.dayIndex));
    return Array.from(days).sort((a, b) => a - b);
  }, [workingDays, timetableLessons]);

  const isCurrentWeek = isSameDay(currentWeekStart, getCurrentWeekStart());
  const isLoading = isLoadingLessons || isLoadingAcademicCalendars;

  const openAddLessonPopup = (slot: Pick<LessonPopupDefaults, 'date' | 'startTime' | 'endTime'>) =>
    setLessonPopup({
      mode: 'add',
      defaults: { subSystemId, gradeId, classroomId, ...slot },
    });

  const handleAddLesson = () =>
    guardMutation(() => {
      if (!classroomId) {
        showToast({ message: t('lesson.popup.chooseClassroomFirst'), type: 'info' });
        return;
      }
      openAddLessonPopup({
        date: toDateKey(isCurrentWeek ? new Date() : currentWeekStart),
      });
    });

  const handleEmptyCellClick = (dayIndex: number, row: TimetableRow) =>
    guardMutation(() =>
      openAddLessonPopup({
        date: toDateKey(addDays(currentWeekStart, dayIndex)),
        startTime: formatMinutes(row.start),
        endTime: formatMinutes(row.end),
      })
    );

  const handleRecoverLessons = () =>
    guardMutation(async () => {
      setIsRecovering(true);
      try {
        await dispatch(recoverAllLessons()).unwrap();
        showToast({ message: t('weeklyCalendar.lessonsRecoveredSuccessfully'), type: 'success' });
        reloadLessons();
      } catch (error) {
        showToast({
          message: getErrorText(error, t('weeklyCalendar.recoverLessonsFailed')),
          type: 'error',
          duration: 5000,
          isRaw: true,
        });
      } finally {
        setIsRecovering(false);
      }
    });

  const showComingSoon = () => showToast({ message: t('common.comingSoon'), type: 'info' });

  const handlePrint = () => {
    const area = document.getElementById(PRINT_AREA_ID);
    if (area) {
      printElement(
        area,
        `${t('weeklyCalendar.title')} - ${formatWeekRange(currentWeekStart, currentLang)}`
      );
    }
  };

  const handleConfirmDelete = async (applyToAllWeeks: boolean) => {
    if (!lessonPendingDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteLessonById({ id: lessonPendingDelete.id, applyToAllWeeks })).unwrap();
      reloadLessons();
      showToast({ message: t('weeklyCalendar.lessonDeletedSuccessfully'), type: 'success' });
      setLessonPendingDelete(null);
    } catch (error) {
      showToast({
        message: getErrorText(error, t('common.error')),
        type: 'error',
        duration: 3000,
        isRaw: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLessonDrop = (lesson: TimetableLesson, dayIndex: number, row: TimetableRow) =>
    guardMutation(async () => {
      const date = toDateKey(addDays(currentWeekStart, dayIndex));
      const startTime = formatMinutes(row.start);
      const endTime = formatMinutes(row.start + lesson.duration);

      setMovingLessonId(lesson.id);
      try {
        const fullLesson = await dispatch(fetchLessonByIdSilent(lesson.id)).unwrap();
        await dispatch(
          updateLesson({
            id: fullLesson.id,
            materialId: fullLesson.materialId,
            teacherId: fullLesson.teacherId,
            bookId: fullLesson.bookId,
            gradeId: fullLesson.gradeId,
            classroomId: fullLesson.classroomId,
            schoolBranchesId: fullLesson.schoolBranchesId,
            date: new Date(`${date}T${startTime}:00`).toISOString(),
            startTime,
            endTime,
            classworkFromPage: fullLesson.classworkFromPage,
            classworkToPage: fullLesson.classworkToPage,
            homeworkFromPage: fullLesson.homeworkFromPage,
            homeworkToPage: fullLesson.homeworkToPage,
            homeworkDescriptionAr: fullLesson.homeworkDescriptionAr || '',
            homeworkDescriptionEn: fullLesson.homeworkDescriptionEn || '',
            isHomeworkForAllStudents: fullLesson.isHomeworkForAllStudents,
            applyToAllWeeks: false,
            lessonsStudent: fullLesson.lessonsStudent.map((s) => ({ studentId: s.studentId })),
            attachments: fullLesson.attachments.map((a) => ({
              fileName: a.fileName,
              fileUrl: a.fileUrl,
            })),
          })
        ).unwrap();
        showToast({ message: t('weeklyCalendar.lessonUpdatedSuccessfully'), type: 'success' });
        reloadLessons();
      } catch (error) {
        showToast({
          message: getErrorText(error, t('common.error')),
          type: 'error',
          duration: 3000,
          isRaw: true,
        });
      } finally {
        setMovingLessonId(null);
      }
    });

  const lessonActions: LessonMenuAction[] = [
    {
      id: 'view-details',
      label: t('weeklyCalendar.viewDetails'),
      icon: EyeFillIcon,
      color: 'text-blue-600 hover:bg-blue-50',
      onClick: (lesson) => setSelectedLesson(toScheduleLesson(lesson)),
    },
    {
      id: 'edit-lesson',
      label: t('weeklyCalendar.editLesson'),
      icon: EditFilledIcon,
      color: 'text-green-500 hover:bg-green-50',
      actionKey: 'edit',
      onClick: (lesson) =>
        setLessonPopup({
          mode: 'edit',
          lessonId: lesson.id,
          defaults: { subSystemId, gradeId, classroomId },
        }),
    },
    {
      id: 'delete-lesson',
      label: t('weeklyCalendar.deleteLesson'),
      icon: TrashFillIcon,
      color: 'text-red-500 hover:bg-red-50',
      actionKey: 'delete',
      onClick: (lesson) => setLessonPendingDelete(lesson),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WeeklyCalendarFilters
        subSystemId={subSystemId}
        stageId={stageId}
        gradeId={gradeId}
        classroomId={classroomId}
        subSystemOptions={subSystemOptions}
        stageOptions={stageOptions}
        gradeOptions={gradeOptions}
        classroomOptions={classroomOptions}
        onSubSystemChange={(value) => {
          setSubSystemId(value);
          resetFrom('subSystem');
        }}
        onStageChange={(value) => {
          setStageId(value);
          resetFrom('stage');
        }}
        onGradeChange={(value) => {
          setGradeId(value);
          resetFrom('grade');
        }}
        onClassroomChange={setClassroomId}
        isGradesLoading={isLoadingGrades}
        isClassroomsLoading={isLoadingClassrooms}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={() => {
          setSubSystemId('');
          setStageId('');
          setGradeId('');
          setClassroomId('');
          setSearchTerm('');
        }}
      />

      <WeeklyCalendarToolbar
        weekLabel={formatWeekRange(currentWeekStart, currentLang)}
        isCurrentWeek={isCurrentWeek}
        onPreviousWeek={() => setCurrentWeekStart((week) => addWeeks(week, -1))}
        onNextWeek={() => setCurrentWeekStart((week) => addWeeks(week, 1))}
        onCurrentWeek={() => setCurrentWeekStart(getCurrentWeekStart())}
        onPrint={handlePrint}
        onAddLesson={handleAddLesson}
        onCopyWeek={() => guardMutation(showComingSoon)}
        onApplyToPeriod={() => guardMutation(showComingSoon)}
        onRestoreDefaults={handleRecoverLessons}
        isRestoring={isRecovering}
      />

      {!classroomId ? (
        <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white text-center">
          <p className="text-base font-semibold text-[black]">
            {t('weeklyCalendar.filters.sectionLabel')}
          </p>
          <p className="text-sm text-[#9D9D9D]">{t('weeklyCalendar.selectClassroomPrompt')}</p>
        </div>
      ) : isLoading ? (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#A7F3D0] border-t-[#1E7A52]" />
        </div>
      ) : (
        <WeeklyTimetableGrid
          id={PRINT_AREA_ID}
          weekStart={currentWeekStart}
          days={visibleDays}
          rows={rows}
          lessons={timetableLessons}
          events={timetableEvents}
          eventDays={eventDays}
          lessonActions={lessonActions}
          movingLessonId={movingLessonId}
          onLessonClick={(lesson) => setSelectedLesson(toScheduleLesson(lesson))}
          onEmptyCellClick={handleEmptyCellClick}
          onLessonDrop={handleLessonDrop}
        />
      )}

      <div className="flex justify-start">
        <div className="flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-[17px] py-[13px] md:w-auto md:min-w-[347px]">
          <span className="flex shrink-0 items-center justify-center rounded-full bg-[rgba(219,234,254,0.7)] p-1">
            <CustomImage src={AlertCircleBlue16Icon} alt="" />
          </span>
          <p className="text-start text-sm leading-[19.6px] text-[#475569]">
            <span className="font-semibold text-[#334155]">{t('weeklyCalendar.tip.label')}</span>{' '}
            {t('weeklyCalendar.tip.dragLesson')}
          </p>
        </div>
      </div>

      <LessonDetailsPopup
        isOpen={Boolean(selectedLesson)}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
        onEdit={(lesson) => {
          setSelectedLesson(null);
          setLessonPopup({
            mode: 'edit',
            lessonId: lesson.id,
            defaults: { subSystemId, gradeId, classroomId },
          });
        }}
      />

      <AddEditLessonPopup
        isOpen={Boolean(lessonPopup)}
        onClose={() => setLessonPopup(null)}
        onSaved={reloadLessons}
        mode={lessonPopup?.mode ?? 'add'}
        lessonId={lessonPopup?.lessonId}
        defaults={lessonPopup?.defaults}
      />

      <DeleteLessonPopup
        open={Boolean(lessonPendingDelete)}
        lessonName={lessonPendingDelete?.subject ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLessonPendingDelete(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}

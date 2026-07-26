import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Input from '@/shared/components/Input';
import UserAvatarName from '@/shared/components/UserAvatarName';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLanguage } from '@/hooks/useLanguage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import {
  deleteLessonById,
  fetchDirectLessons,
  startLesson,
} from '@/redux/features/lessons/lessonsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import type { DirectLessonsQueryParams, Lesson } from '@/services/api/types/lessons.types';
import VideoConferenceIcon from '@gradex/assets/icons/VideoConference.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import StartLiveClassPopup from '../popups/StartLiveClassPopup';
import { type LiveClassRow, type LiveClassStatus } from './live-classes-data';

const PAGE_SIZE = 10;

const statusClassName: Record<LiveClassStatus, string> = {
  draft: 'bg-[#FEF8E6] text-[#C89004]',
  started: 'bg-[#DFF8ED] text-[#1A9F58]',
  completed: 'bg-[#E6F3FE] text-[#117BD7]',
  cancelled: 'bg-red-100 text-red-500',
};

const STATUS_TO_API: Record<LiveClassStatus, number> = {
  draft: 1,
  started: 2,
  completed: 3,
  cancelled: 4,
};

const toTimeValue = (time?: string): string => {
  if (!time) return '';
  const match = time.match(/(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : time;
};

const buildDateTime = (date?: string, time?: string): Date | null => {
  if (!date) return null;
  const datePart = date.split('T')[0];
  const timePart = toTimeValue(time) || '00:00';
  const value = new Date(`${datePart}T${timePart}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
};

const getStatusFromLesson = (lesson: Lesson): LiveClassStatus => {
  const lessonStatus = Number(lesson.lessonStatus);

  if (lessonStatus === STATUS_TO_API.draft) return 'draft';
  if (lessonStatus === STATUS_TO_API.started) return 'started';
  if (lessonStatus === STATUS_TO_API.completed) return 'completed';
  if (lessonStatus === STATUS_TO_API.cancelled) return 'cancelled';

  const now = new Date();
  const startsAt = buildDateTime(lesson.date, lesson.startTime);
  const endsAt = buildDateTime(lesson.date, lesson.endTime);

  if (startsAt && endsAt && now >= startsAt && now <= endsAt) return 'started';
  if (startsAt && now < startsAt) return 'draft';
  if (endsAt && now > endsAt) return 'completed';

  return 'draft';
};

const formatDate = (value: string, locale: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale);
};

const mapLessonToRow = (lesson: Lesson, isArabic: boolean, locale: string): LiveClassRow => ({
  id: lesson.id,
  teacherId: lesson.teacherId,
  classroomId: lesson.classroomId,
  lessonStatus: lesson.lessonStatus,
  subject:
    (isArabic ? lesson.materialNameAr : lesson.materialNameEn) ||
    lesson.materialNameAr ||
    lesson.materialNameEn ||
    '',
  teacherName: lesson.teacherName || '',
  status: getStatusFromLesson(lesson),
  stage:
    (isArabic ? lesson.gradeNameAr : lesson.gradeNameEn) ||
    lesson.gradeNameAr ||
    lesson.gradeNameEn,
  classroom:
    (isArabic ? lesson.classroomNameAr : lesson.classroomNameEn) ||
    lesson.classroomNameAr ||
    lesson.classroomNameEn ||
    '',
  date: formatDate(lesson.date, locale),
  dateValue: lesson.date?.split('T')[0] || '',
  startsAt: toTimeValue(lesson.startTime),
  endsAt: toTimeValue(lesson.endTime),
});

export default function LiveClassesList() {
  const { t } = useTranslation();
  const { isArabic, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();

  const directLessons = useAppSelector((state) => state.lessons.directLessons);
  const directLessonsPagination = useAppSelector((state) => state.lessons.directLessonsPagination);
  const isLoadingDirectLessons = useAppSelector((state) => state.lessons.isLoadingDirectLessons);
  const isDeleting = useAppSelector((state) => state.lessons.isDeleting);
  const isStarting = useAppSelector((state) => state.lessons.isStarting);
  const teachers = useAppSelector((state) => state.teachers.teachers);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  const [search, setSearch] = useState('');
  const [teacher, setTeacher] = useState('');
  const [classroom, setClassroom] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClassRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LiveClassRow | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const rows = useMemo(
    () => directLessons.map((lesson) => mapLessonToRow(lesson, isArabic, currentLanguage)),
    [currentLanguage, directLessons, isArabic]
  );

  const teacherOptions = useMemo(() => {
    const options = new Map<string, string>();
    teachers.forEach((teacherItem) => {
      if (teacherItem.id && teacherItem.fullName) {
        options.set(teacherItem.id, teacherItem.fullName);
      }
    });
    return Array.from(options, ([value, label]) => ({ value, label }));
  }, [teachers]);

  const classroomOptions = useMemo(() => {
    const options = new Map<string, string>();
    classrooms.forEach((classroomItem) => {
      const label = (isArabic ? classroomItem.name : classroomItem.nameEn) || classroomItem.name;
      if (classroomItem.id && label) {
        options.set(classroomItem.id, label);
      }
    });
    return Array.from(options, ([value, label]) => ({ value, label }));
  }, [classrooms, isArabic]);

  const statusOptions = [
    { value: String(STATUS_TO_API.draft), label: t('eLearning.liveClasses.status.draft') },
    { value: String(STATUS_TO_API.started), label: t('eLearning.liveClasses.status.started') },
    { value: String(STATUS_TO_API.completed), label: t('eLearning.liveClasses.status.completed') },
    { value: String(STATUS_TO_API.cancelled), label: t('eLearning.liveClasses.status.cancelled') },
  ];

  const requestParams = useMemo<DirectLessonsQueryParams | null>(() => {
    if (!schoolBranchId) return null;

    return {
      schoolBranchesId: schoolBranchId,
      pageIndex: page,
      pageSize: PAGE_SIZE,
      ...(classroom && { classroomId: classroom }),
      ...(teacher && { teacherId: teacher }),
      ...(search.trim() && { matieralName: search.trim() }),
      ...(status && { lessonStatus: Number(status) }),
      ...(date && { date: `${date}T00:00:00.000Z` }),
    };
  }, [classroom, date, page, schoolBranchId, search, status, teacher]);
  const hasActiveFilters = Boolean(search || teacher || classroom || status || date);

  useEffect(() => {
    if (!requestParams) return;
    dispatch(fetchDirectLessons(requestParams));
  }, [dispatch, requestParams]);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(
      fetchTeachers({
        page: 1,
        limit: 1000,
        filters: { schoolBranchesId: schoolBranchId },
      })
    );
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 1000,
        filters: { schoolBranchId },
      })
    );
  }, [dispatch, schoolBranchId]);

  const filteredClasses = useMemo(
    () => rows.filter((item) => !deletedIds.includes(item.id)),
    [deletedIds, rows]
  );

  const totalPages = Math.max(directLessonsPagination.totalPages, 1);
  const totalItems = directLessonsPagination.totalItems;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshDirectLessons = () => {
    if (!schoolBranchId) return;
    if (requestParams) {
      dispatch(fetchDirectLessons(requestParams));
    }
  };

  const columns: DataTableColumn<LiveClassRow>[] = [
    {
      header: '#',
      accessor: (_row, index = 0) => (page - 1) * PAGE_SIZE + index + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.management',
      accessor: (row) => {
        const canStartLesson = row.status === 'draft' && !isStarting;

        return (
          <button
            type="button"
            disabled={!canStartLesson}
            onClick={() => {
              if (!canStartLesson) return;
              setSelectedLiveClass(row);
            }}
            className={`inline-flex min-w-[112px] items-center justify-center rounded-2xl border px-5 py-2 text-sm font-medium transition-colors ${
              canStartLesson
                ? 'border-green-500 bg-white text-green-500 hover:bg-green-50'
                : 'cursor-not-allowed border-[#DDE0E0] bg-gray-100 text-[#9AA0A0]'
            }`}
          >
            {t('eLearning.liveClasses.startNow')}
          </button>
        );
      },
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.subject',
      accessor: (row) => <span>{row.subject}</span>,
      headerClassName: 'min-w-[160px]',
    },
    {
      header: 'eLearning.liveClasses.table.teacherName',
      accessor: (row) => (
        <UserAvatarName
          name={row.teacherName}
          align="between"
          onView={() => {
            if (!row.teacherId) return;
            navigate(`/teaching-staff/teachers/${row.teacherId}`);
          }}
        />
      ),
      headerClassName: 'min-w-[260px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.status',
      accessor: (row) => (
        <span
          className={`inline-flex min-w-[104px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium ${statusClassName[row.status]}`}
        >
          {t(`eLearning.liveClasses.status.${row.status}`)}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.stage',
      accessor: (row) => <span>{row.stage}</span>,
      headerClassName: 'min-w-[190px]',
    },
    {
      header: 'eLearning.liveClasses.table.classroom',
      accessor: (row) => <span>{row.classroom}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'eLearning.liveClasses.table.date',
      accessor: (row) => <span>{row.date}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.startsAt',
      accessor: (row) => <span>{row.startsAt}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.endsAt',
      accessor: (row) => <span>{row.endsAt}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('actions.edit')}
            onClick={() => navigate(`/lms/live-classes/${row.id}/edit`)}
          />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel={t('actions.delete')}
            onClick={() => setPendingDelete(row)}
          />
        </div>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'live-classes-search',
      placeholder: t('eLearning.liveClasses.searchPlaceholder'),
      value: search,
      onChange: (value) => {
        setSearch(value as string);
        setPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'live-classes-teacher',
      value: teacher,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={teacher}
          onChange={(value) => {
            setTeacher(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={teacherOptions}
          placeholder={t('eLearning.liveClasses.filters.teacher')}
          showSearch={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'live-classes-classroom',
      value: classroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={classroom}
          onChange={(value) => {
            setClassroom(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={classroomOptions}
          placeholder={t('eLearning.liveClasses.filters.classroom')}
          showSearch={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'live-classes-status',
      value: status,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={status}
          onChange={(value) => {
            setStatus(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('eLearning.liveClasses.filters.status')}
          showSearch={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'live-classes-date',
      value: date,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <Input
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setPage(1);
          }}
          aria-label={t('eLearning.liveClasses.filters.date')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setTeacher('');
    setClassroom('');
    setStatus('');
    setDate('');
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await dispatch(deleteLessonById({ id: pendingDelete.id, applyToAllWeeks: false })).unwrap();
      setDeletedIds((prev) => [...prev, pendingDelete.id]);
      setPendingDelete(null);
      refreshDirectLessons();
      showToast({
        message: 'eLearning.liveClasses.deletedSuccessfully',
        type: 'success',
      });
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: typeof error === 'string',
      });
    }
  };

  const handleStartLiveClass = async (meetingLink: string) => {
    if (!selectedLiveClass) return;

    try {
      await dispatch(startLesson({ lessonId: selectedLiveClass.id, meetingLink })).unwrap();
      refreshDirectLessons();
      showToast({
        message: 'eLearning.liveClasses.startedSuccessfully',
        type: 'success',
      });
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: typeof error === 'string',
      });
      throw error;
    }
  };

  const shouldShowEmptyState =
    !isLoadingDirectLessons && filteredClasses.length === 0 && !hasActiveFilters;
  const shouldShowContent =
    filteredClasses.length > 0 || hasActiveFilters || isLoadingDirectLessons;

  return (
    <>
      {shouldShowEmptyState ? (
        <Card className="flex min-h-56 items-center justify-center rounded-2xl" padding="sm">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <CustomImage
              src={VideoConferenceIcon}
              alt={t('eLearning.liveClasses.emptyTitle')}
              className="h-36 w-36 mix-blend-luminosity"
            />
            <p className="text-base font-normal leading-5 text-[#3A3A3A]">
              {t('eLearning.liveClasses.emptyTitle')}
            </p>
          </div>
        </Card>
      ) : shouldShowContent ? (
        <Card className="overflow-hidden rounded-3xl" padding="md">
          <DataTable
            data={filteredClasses}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page,
              limit: PAGE_SIZE,
              total: totalItems,
              totalPages,
            }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            emptyMessage={t('common.noResults')}
            isLoading={isLoadingDirectLessons}
            t={t}
          />
        </Card>
      ) : null}

      <StartLiveClassPopup
        isOpen={!!selectedLiveClass}
        liveClass={selectedLiveClass}
        onClose={() => setSelectedLiveClass(null)}
        onStart={handleStartLiveClass}
        isStarting={isStarting}
      />

      <DeletePopup
        open={!!pendingDelete}
        message="eLearning.liveClasses.confirmDelete"
        itemName={pendingDelete?.subject ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}

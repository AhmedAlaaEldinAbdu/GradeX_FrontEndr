import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import Loading from '@/shared/components/Loading';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import {
  fetchSchoolCourses,
  deleteSchoolCourse,
} from '@/redux/features/school-course/schoolCourseSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import {
  SchoolCourseStatus,
  type SchoolCourse,
  type SchoolCourseQueryParams,
} from '@/services/api/types/school-course.types';
import CourseCard, { type CourseItem } from './CourseCard';
import BookOpenBadgeIcon from '@gradex/assets/icons/BookOpenBadge.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';

function formatDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function toCourseItem(course: SchoolCourse, isArabic: boolean): CourseItem {
  const dateRange = [formatDate(course.startDate), formatDate(course.endDate)]
    .filter(Boolean)
    .join(' - ');

  return {
    id: course.id,
    title: (isArabic ? course.nameAr : course.nameEn) || course.nameAr || course.nameEn || '',
    description: (isArabic ? course.descriptionAr : course.descriptionEn) || '',
    instructor: course.teacherName || '',
    status: (course.status as any) ?? 1, // Default to ActiveCompleted if not provided
    progress: course.progressPercentage ?? 0,
    studentsCount: course.studentsCount ?? 0,
    subject: (isArabic ? course.materialNameAr : course.materialNameEn) || '',
    dateRange,
    lessons: `${course.addedLecturesCount ?? 0}/${course.totalLectures ?? 0}`,
    coverImage: course.coverImage,
    materialNameAr: course.materialNameAr || '',
    materialNameEn: course.materialNameEn || '',
  };
}

export default function TrainingCoursesList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isArabic = i18n.language === 'ar';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('');
  const [pendingDelete, setPendingDelete] = useState<CourseItem | null>(null);

  const courses = useAppSelector((s) => s.schoolCourses.courses);
  const isLoading = useAppSelector((s) => s.schoolCourses.isLoading);
  const isDeleting = useAppSelector((s) => s.schoolCourses.isDeleting);
  const materials = useAppSelector((s) => s.subjects.subjects);
  const classrooms = useAppSelector((s) => s.classrooms.classrooms);

  const queryParams: SchoolCourseQueryParams = useMemo(
    () => ({
      schoolBranchId: schoolBranchId || undefined,
      PageNumber: 1,
      PageSize: 10,
      Search: search || undefined,
      MaterialId: subject || undefined,
      ClassRoomId: grade || undefined,
      Status: status ? (Number(status) as SchoolCourseStatus) : undefined,
    }),
    [schoolBranchId, search, subject, grade, status]
  );

  // Fetch courses whenever the branch or any server-side filter changes.
  useEffect(() => {
    dispatch(fetchSchoolCourses(queryParams));
  }, [dispatch, queryParams]);

  // Load the filter option sources (materials + classrooms) once per branch.
  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(fetchClassrooms({ page: 1, limit: 100, filters: { schoolBranchId } }));
  }, [dispatch, schoolBranchId]);

  const subjectOptions = useMemo(
    () => materials.map((m) => ({ value: m.id, label: m.name })),
    [materials]
  );
  const gradeOptions = useMemo(
    () => classrooms.map((c) => ({ value: c.id, label: isArabic ? c.name : c.nameEn || c.name })),
    [classrooms, isArabic]
  );
  const statusOptions = [
    { value: String(1), label: t('eLearning.courses.status.activeCompleted') },
    { value: String(2), label: t('eLearning.courses.status.activeIncomplete') },
    { value: String(3), label: t('eLearning.courses.status.endedCompleted') },
    { value: String(4), label: t('eLearning.courses.status.endedIncomplete') },
    { value: String(5), label: t('eLearning.courses.status.notStarted') },
  ];

  const hasActiveFilters = Boolean(search || subject || grade || status);

  const courseItems = useMemo(
    () => courses.map((course) => toCourseItem(course, isArabic)),
    [courses, isArabic]
  );

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setGrade('');
    setStatus('');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteSchoolCourse(pendingDelete.id)).unwrap();
      setPendingDelete(null);
      // Refetch so the summary counts + list stay in sync.
      dispatch(fetchSchoolCourses(queryParams));
    } catch (error) {
      showToast({ message: (error as string) || t('common.errorOccurred'), type: 'error' });
    }
  };

  const handleView = (course: CourseItem) => navigate(`/lms/courses/${course.id}`);

  const handleEdit = (course: CourseItem) => navigate(`/lms/courses/${course.id}/edit`);

  const selectClass = 'min-w-[160px]';

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-start gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('eLearning.courses.searchPlaceholder')}
          wrapperClassName="min-w-[220px]"
        />
        <CustomSelect
          value={subject}
          onChange={(v) => setSubject(v as string)}
          options={subjectOptions}
          placeholder={t('eLearning.courses.filters.subject')}
          className={selectClass}
        />
        <CustomSelect
          value={grade}
          onChange={(v) => setGrade(v as string)}
          options={gradeOptions}
          placeholder={t('eLearning.courses.filters.grades')}
          className={selectClass}
        />
        <CustomSelect
          value={status}
          onChange={(v) => setStatus(v as string)}
          options={statusOptions}
          placeholder={t('eLearning.courses.filters.status')}
          showSearch={false}
          className={selectClass}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-[48px] shrink-0 items-center gap-2 rounded-2xl border border-green-500 bg-green-500/10 px-4 text-sm font-normal text-green-500"
          >
            <CustomImage src={CancelXGreenIcon} alt="" className="h-5 w-5" />
            {t('eLearning.onlineExams.clearFilter')}
          </button>
        )}
      </div>

      {/* List */}
      {isLoading && courseItems.length === 0 ? (
        <Loading />
      ) : courseItems.length === 0 ? (
        <Card className="rounded-3xl border border-black-100" padding="md">
          <EmptyState
            icon={
              <CustomImage
                src={BookOpenBadgeIcon}
                alt=""
                className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
              />
            }
            description={t('eLearning.courses.emptyDescription')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {courseItems.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <DeletePopup
        open={!!pendingDelete}
        message="eLearning.courses.confirmDelete"
        itemName={pendingDelete?.title ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </div>
  );
}

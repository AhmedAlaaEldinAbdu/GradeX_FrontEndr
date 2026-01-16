import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import PopupMessage from '@/shared/popups/PopupMessage';
import SelectStudentsPopup, { type Student } from '../popups/SelectStudentsPopup';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import CustomImage from '@/shared/components/CustomImage';

// API Services
import { getSubjects } from '@/services/api/subjects/subjects.service';
import { getTeachers } from '@/services/api/teachers/teachers.service';
import { fetchEducationalStages } from '@/services/api/educational-stages/educational-stages.service';
import { getBooks } from '@/services/api/books/books.service';
import { getClassrooms } from '@/services/api/classrooms/classrooms.service';
import { lessonsApiService } from '@/services/api/lessons/lessons.service';
import { STATIC_SCHOOL_BRANCH_ID } from '@/redux/features/teacher-attendance';
import { useLanguage } from '@/hooks/useLanguage';

// Types
import type { Subject } from '@/types/subjects';
import type { Teacher } from '@/types/teachers';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import type { Book, BookGrade } from '@/types/books';
import type { Classroom } from '@/services/api/types/classrooms.types';
import type { CreateLessonRequest, Lesson } from '@/services/api/types/lessons.types';

export interface LessonFormData {
  materialId: string;
  teacherId: string;
  gradeId: string;
  classroomId: string;
  bookId: string;
  classworkFromPage: string;
  classworkToPage: string;
  homeworkFromPage: string;
  homeworkToPage: string;
  descriptionAr: string;
  descriptionEn: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface LessonAttachmentData {
  fileName: string;
  oldFile?: string;
  fileUrl?: string;
}

export interface LessonData extends LessonFormData {
  id: string;
  attachments?: LessonAttachmentData[];
  selectedStudents?: Student[];
  isHomeworkForAllStudents?: boolean;
}

interface LessonFormProps {
  mode: 'add' | 'edit';
  initialData?: LessonData | Lesson;
}

// Helper to convert Lesson to LessonData format
function mapLessonToFormData(lesson: Lesson): LessonData {
  return {
    id: lesson.id,
    materialId: lesson.materialId,
    teacherId: lesson.teacherId,
    gradeId: lesson.gradeId,
    classroomId: lesson.classroomId,
    bookId: lesson.bookId,
    classworkFromPage: String(lesson.classworkFromPage),
    classworkToPage: String(lesson.classworkToPage),
    homeworkFromPage: String(lesson.homeworkFromPage),
    homeworkToPage: String(lesson.homeworkToPage),
    descriptionAr: lesson.homeworkDescriptionAr || '',
    descriptionEn: lesson.homeworkDescriptionEn || '',
    date: lesson.date ? lesson.date.split('T')[0] : '',
    startTime: lesson.startTime ? lesson.startTime.substring(0, 5) : '',
    endTime: lesson.endTime ? lesson.endTime.substring(0, 5) : '',
    isHomeworkForAllStudents: lesson.isHomeworkForAllStudents,
    attachments:
      lesson.attachments?.map((a) => ({
        fileName: a.fileName,
        oldFile: a.fileName,
        fileUrl: a.fileUrl,
      })) || [],
    selectedStudents:
      lesson.lessonsStudent?.map((s) => ({
        id: s.studentId,
        name: s.studentName || '',
      })) || [],
  };
}

export default function LessonForm({ mode, initialData }: LessonFormProps) {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get date and time from URL params if available (for add mode)
  const dateParam = searchParams.get('date');
  const startTimeParam = searchParams.get('startTime');
  const endTimeParam = searchParams.get('endTime');

  // Normalize initialData
  const normalizedInitialData = useMemo(() => {
    if (!initialData) return undefined;
    if ('materialId' in initialData && !('materialNameAr' in initialData)) {
      return initialData as LessonData;
    }
    return mapLessonToFormData(initialData as Lesson);
  }, [initialData]);

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const [sendTo, setSendTo] = useState<'all' | 'specific'>(
    normalizedInitialData?.isHomeworkForAllStudents === false ? 'specific' : 'all'
  );
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<LessonAttachmentData[]>(
    normalizedInitialData?.attachments || []
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(
    normalizedInitialData?.selectedStudents || []
  );
  const [isSelectStudentsPopupOpen, setIsSelectStudentsPopupOpen] = useState(false);

  // API Data States
  const [materials, setMaterials] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<EducationalStageResponse[]>([]);
  const [bookGrades, setBookGrades] = useState<BookGrade[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Loading States
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    defaultValues: {
      materialId: normalizedInitialData?.materialId || '',
      teacherId: normalizedInitialData?.teacherId || '',
      gradeId: normalizedInitialData?.gradeId || '',
      classroomId: normalizedInitialData?.classroomId || '',
      bookId: normalizedInitialData?.bookId || '',
      classworkFromPage: normalizedInitialData?.classworkFromPage || '',
      classworkToPage: normalizedInitialData?.classworkToPage || '',
      homeworkFromPage: normalizedInitialData?.homeworkFromPage || '',
      homeworkToPage: normalizedInitialData?.homeworkToPage || '',
      descriptionAr: normalizedInitialData?.descriptionAr || '',
      descriptionEn: normalizedInitialData?.descriptionEn || '',
      date: normalizedInitialData?.date || dateParam || '',
      startTime: normalizedInitialData?.startTime || startTimeParam || '',
      endTime: normalizedInitialData?.endTime || endTimeParam || '',
    },
  });

  const watchedGradeId = watch('gradeId');
  const watchedMaterialId = watch('materialId');

  // Fetch Materials (Subjects)
  const fetchMaterials = useCallback(async () => {
    setIsLoadingMaterials(true);
    try {
      const response = await getSubjects({ PageIndex: 1, PageSize: 100 });
      setMaterials(response.data?.materialDto || []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setIsLoadingMaterials(false);
    }
  }, []);

  // Fetch Teachers
  const fetchTeachers = useCallback(async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await getTeachers({
        PageIndex: 1,
        PageSize: 100,
        SchoolBranchId: STATIC_SCHOOL_BRANCH_ID,
      });
      setTeachers(response.data?.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, []);

  // Fetch Grades
  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    try {
      const response = await fetchEducationalStages({ pageIndex: 1, pageSize: 100 });
      setGrades(response?.gradeDtos || []);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setIsLoadingGrades(false);
    }
  }, []);

  // Fetch Books - depends on materialId and gradeId
  const fetchBooksData = useCallback(async (materialId: string, gradeId: string) => {
    if (!materialId || !gradeId) {
      setBookGrades([]);
      return;
    }
    setIsLoadingBooks(true);
    try {
      const response = await getBooks({ MaterialId: materialId, GradeId: gradeId });
      setBookGrades(response.data?.bookGradeDto || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  // Fetch Classrooms - depends on gradeId
  const fetchClassroomsData = useCallback(async (gradeId: string) => {
    if (!gradeId) {
      setClassrooms([]);
      return;
    }
    setIsLoadingClassrooms(true);
    try {
      const response = await getClassrooms({ gradeId: gradeId });
      setClassrooms(response.data?.classroomDto || []);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    } finally {
      setIsLoadingClassrooms(false);
    }
  }, []);

  // Initial data fetches
  useEffect(() => {
    fetchMaterials();
    fetchTeachers();
    fetchGrades();
  }, [fetchMaterials, fetchTeachers, fetchGrades]);

  // Fetch books when material or grade changes
  useEffect(() => {
    if (watchedMaterialId && watchedGradeId) {
      fetchBooksData(watchedMaterialId, watchedGradeId);
    } else {
      setBookGrades([]);
      setValue('bookId', '');
    }
  }, [watchedMaterialId, watchedGradeId, fetchBooksData, setValue]);

  // Fetch classrooms when grade changes
  useEffect(() => {
    if (watchedGradeId) {
      fetchClassroomsData(watchedGradeId);
    } else {
      setClassrooms([]);
      setValue('classroomId', '');
    }
  }, [watchedGradeId, fetchClassroomsData, setValue]);

  // Build options for selects
  const materialOptions = useMemo(() => {
    return materials.map((m) => ({
      value: m.id,
      label: isArabic ? m.name : m.nameEn || m.name,
    }));
  }, [materials, isArabic]);

  const teacherOptions = useMemo(() => {
    return teachers.map((t) => ({
      value: t.id,
      label: t.fullName,
    }));
  }, [teachers]);

  const gradeOptions = useMemo(() => {
    return grades.map((g) => ({
      value: g.id,
      label: isArabic ? g.nameAr : g.nameEn,
    }));
  }, [grades, isArabic]);

  const bookOptions = useMemo(() => {
    const books: Book[] = [];
    bookGrades.forEach((bg) => {
      bg.bookDtos.forEach((book) => books.push(book));
    });
    return books.map((b) => ({
      value: b.id,
      label: b.name,
    }));
  }, [bookGrades]);

  const classroomOptions = useMemo(() => {
    return classrooms.map((c) => ({
      value: c.id,
      label: isArabic ? c.name : c.nameEn || c.name,
    }));
  }, [classrooms, isArabic]);

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (normalizedInitialData) {
      reset({
        materialId: normalizedInitialData.materialId,
        teacherId: normalizedInitialData.teacherId,
        gradeId: normalizedInitialData.gradeId,
        classroomId: normalizedInitialData.classroomId,
        bookId: normalizedInitialData.bookId,
        classworkFromPage: normalizedInitialData.classworkFromPage,
        classworkToPage: normalizedInitialData.classworkToPage,
        homeworkFromPage: normalizedInitialData.homeworkFromPage,
        homeworkToPage: normalizedInitialData.homeworkToPage,
        descriptionAr: normalizedInitialData.descriptionAr,
        descriptionEn: normalizedInitialData.descriptionEn,
        date: normalizedInitialData.date,
        startTime: normalizedInitialData.startTime,
        endTime: normalizedInitialData.endTime,
      });
      setSendTo(normalizedInitialData.isHomeworkForAllStudents === false ? 'specific' : 'all');
      setExistingAttachments(normalizedInitialData.attachments || []);
      setSelectedStudents(normalizedInitialData.selectedStudents || []);
    }
  }, [normalizedInitialData, reset]);

  const onSubmit = async (data: LessonFormData) => {
    try {
      const request: CreateLessonRequest = {
        materialId: data.materialId,
        teacherId: data.teacherId,
        gradeId: data.gradeId,
        classroomId: data.classroomId,
        bookId: data.bookId,
        classworkFromPage: parseInt(data.classworkFromPage) || 0,
        classworkToPage: parseInt(data.classworkToPage) || 0,
        homeworkFromPage: parseInt(data.homeworkFromPage) || 0,
        homeworkToPage: parseInt(data.homeworkToPage) || 0,
        homeworkDescriptionAr: data.descriptionAr || undefined,
        homeworkDescriptionEn: data.descriptionEn || undefined,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        startTime: data.startTime || '08:00',
        endTime: data.endTime || '09:00',
        isHomeworkForAllStudents: sendTo === 'all',
        schoolBranchesId: STATIC_SCHOOL_BRANCH_ID,
      };

      // If sending to specific students, add lessonsStudent array
      if (sendTo === 'specific' && selectedStudents.length > 0) {
        request.lessonsStudent = selectedStudents.map((student) => ({
          studentId: student.id,
        }));
      }

      // For edit mode, include existing attachments metadata
      if (mode === 'edit' && existingAttachments.length > 0) {
        request.attachments = existingAttachments;
      }

      if (mode === 'add') {
        await lessonsApiService.createLesson(request, attachmentFiles);
      } else if (normalizedInitialData?.id) {
        await lessonsApiService.updateLesson(
          { ...request, id: normalizedInitialData.id },
          attachmentFiles
        );
      }

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t(
          mode === 'add' ? 'lesson.lessonAddedSuccessfully' : 'lesson.lessonUpdatedSuccessfully'
        ),
      });
    } catch (error) {
      console.error('Failed to save lesson:', error);
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.errorOccurred'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/school/calendar/weekly');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachmentFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileDelete = (index?: number) => {
    if (index !== undefined) {
      const totalExisting = existingAttachments.length;
      if (index < totalExisting) {
        // Deleting an existing attachment
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
      } else {
        // Deleting a new file attachment
        const newFileIndex = index - totalExisting;
        setAttachmentFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
      }
    } else {
      setAttachmentFiles([]);
      setExistingAttachments([]);
    }
  };

  // Combine existing attachment names and new file names for display
  const allAttachmentNames = [
    ...existingAttachments.map((a) => a.fileName),
    ...attachmentFiles.map((f) => f.name),
  ];

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Schedule Information Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('lesson.scheduleInfo')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Date */}
              <FormField
                label={t('lesson.date')}
                required
                error={errors.date?.message}
                htmlFor="date"
              >
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => <Input {...field} type="date" id="date" />}
                />
              </FormField>

              {/* Start Time */}
              <FormField
                label={t('lesson.startTime')}
                required
                error={errors.startTime?.message}
                htmlFor="startTime"
              >
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => <Input {...field} type="time" id="startTime" />}
                />
              </FormField>

              {/* End Time */}
              <FormField
                label={t('lesson.endTime')}
                required
                error={errors.endTime?.message}
                htmlFor="endTime"
              >
                <Controller
                  name="endTime"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => <Input {...field} type="time" id="endTime" />}
                />
              </FormField>
            </div>
          </div>

          {/* Grade & Classroom Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Grade */}
              <FormField
                label={t('lesson.grade')}
                required
                error={errors.gradeId?.message}
                htmlFor="gradeId"
              >
                <Controller
                  name="gradeId"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={gradeOptions}
                      placeholder={
                        isLoadingGrades ? t('lesson.loadingGrades') : t('lesson.selectGrade')
                      }
                      disabled={isLoadingGrades}
                    />
                  )}
                />
              </FormField>

              {/* Classroom */}
              <FormField
                label={t('lesson.classroom')}
                required
                error={errors.classroomId?.message}
                htmlFor="classroomId"
              >
                <Controller
                  name="classroomId"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={classroomOptions}
                      placeholder={
                        !watchedGradeId
                          ? t('lesson.selectGradeFirst')
                          : isLoadingClassrooms
                            ? t('lesson.loadingClassrooms')
                            : classroomOptions.length === 0
                              ? t('lesson.noClassroomsAvailable')
                              : t('lesson.selectClassroom')
                      }
                      disabled={!watchedGradeId || isLoadingClassrooms}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Subject Name & Teacher Name */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Subject Name */}
              <FormField
                label={t('lesson.subjectName')}
                required
                error={errors.materialId?.message}
                htmlFor="materialId"
              >
                <Controller
                  name="materialId"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={materialOptions}
                      placeholder={
                        isLoadingMaterials
                          ? t('lesson.loadingMaterials')
                          : t('lesson.selectSubject')
                      }
                      disabled={isLoadingMaterials}
                    />
                  )}
                />
              </FormField>

              {/* Teacher Name */}
              <FormField
                label={t('lesson.teacherName')}
                required
                error={errors.teacherId?.message}
                htmlFor="teacherId"
              >
                <Controller
                  name="teacherId"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={teacherOptions}
                      placeholder={
                        isLoadingTeachers ? t('lesson.loadingTeachers') : t('lesson.selectTeacher')
                      }
                      disabled={isLoadingTeachers}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Book Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('lesson.book')}
            </h3>
            <FormField label={t('lesson.bookName')} htmlFor="bookId">
              <Controller
                name="bookId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={bookOptions}
                    placeholder={
                      !watchedMaterialId || !watchedGradeId
                        ? t('lesson.selectMaterialFirst')
                        : isLoadingBooks
                          ? t('lesson.loadingBooks')
                          : bookOptions.length === 0
                            ? t('lesson.noBooksAvailable')
                            : t('lesson.selectBook')
                    }
                    disabled={!watchedMaterialId || !watchedGradeId || isLoadingBooks}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Classwork Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('lesson.classwork')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* From Page */}
              <FormField label={t('lesson.fromPage')} htmlFor="classworkFromPage">
                <Controller
                  name="classworkFromPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder={t('lesson.pageNumber')}
                      id="classworkFromPage"
                      min={0}
                    />
                  )}
                />
              </FormField>

              {/* To Page */}
              <FormField label={t('lesson.toPage')} htmlFor="classworkToPage">
                <Controller
                  name="classworkToPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder={t('lesson.pageNumber')}
                      id="classworkToPage"
                      min={0}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Homework Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('lesson.homework')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* From Page */}
              <FormField label={t('lesson.fromPage')} htmlFor="homeworkFromPage">
                <Controller
                  name="homeworkFromPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder={t('lesson.pageNumber')}
                      id="homeworkFromPage"
                      min={0}
                    />
                  )}
                />
              </FormField>

              {/* To Page */}
              <FormField label={t('lesson.toPage')} htmlFor="homeworkToPage">
                <Controller
                  name="homeworkToPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder={t('lesson.pageNumber')}
                      id="homeworkToPage"
                      min={0}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* Descriptions */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Description Arabic */}
              <FormField label={t('lesson.descriptionAr')} htmlFor="descriptionAr">
                <Controller
                  name="descriptionAr"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('lesson.enterDescription')}
                      id="descriptionAr"
                    />
                  )}
                />
              </FormField>

              {/* Description English */}
              <FormField label={t('lesson.descriptionEn')} htmlFor="descriptionEn">
                <Controller
                  name="descriptionEn"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('lesson.enterDescription')}
                      id="descriptionEn"
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Send To Section */}
          <div className="mb-6">
            <FormField label={t('lesson.sendTo')} required htmlFor="sendTo">
              <div className="flex items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sendTo"
                    value="all"
                    checked={sendTo === 'all'}
                    onChange={() => {
                      setSendTo('all');
                      setSelectedStudents([]);
                    }}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{t('lesson.all')}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sendTo"
                    value="specific"
                    checked={sendTo === 'specific'}
                    onChange={() => {
                      setSendTo('specific');
                      setIsSelectStudentsPopupOpen(true);
                    }}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{t('lesson.specificStudents')}</span>
                </label>
              </div>
            </FormField>

            {/* Selected students indicator */}
            {sendTo === 'specific' && selectedStudents.length > 0 && (
              <div
                className="mt-3 flex cursor-pointer items-center gap-2"
                onClick={() => setIsSelectStudentsPopupOpen(true)}
              >
                {/* Stacked Avatars */}
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {selectedStudents.slice(0, 3).map((student, index) => (
                    <div
                      key={student.id}
                      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100"
                      style={{ zIndex: 3 - index }}
                    >
                      <CustomImage
                        src={student.avatar || DefaultAvatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {selectedStudents.length > 3 && (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200"
                      style={{ zIndex: 0 }}
                    >
                      <span className="text-xs text-gray-600">+{selectedStudents.length - 3}</span>
                    </div>
                  )}
                </div>
                {/* First student name or count */}
                <span className="text-sm text-gray-600">
                  {selectedStudents.length === 1
                    ? selectedStudents[0].name
                    : t('lesson.studentsSelected', { count: selectedStudents.length })}
                </span>
              </div>
            )}

            {/* Button to open popup when specific is selected but no students yet */}
            {sendTo === 'specific' && selectedStudents.length === 0 && (
              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setIsSelectStudentsPopupOpen(true)}
                >
                  {t('lesson.selectStudentsButton')}
                </Button>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="mb-6">
            <FileUpload
              label={t('lesson.attachments')}
              accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml,application/pdf"
              onChange={handleFileChange}
              onDelete={handleFileDelete}
              fileNames={allAttachmentNames}
              uploadText={t('lesson.clickToUpload')}
              formatHints={['GIF', 'SVG', 'JPG', 'PNG', 'PDF']}
              optional={true}
              multiple={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.saving')
                : t(mode === 'add' ? 'common.add' : 'common.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Success/Error Popup */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        onClose={() => {
          setShowPopupMessage({ show: false, type: 'success', message: '' });
          if (showPopupMessage.type === 'success') {
            navigate('/school/calendar/weekly');
          }
        }}
      />

      {/* Select Students Popup */}
      <SelectStudentsPopup
        isOpen={isSelectStudentsPopupOpen}
        onClose={() => setIsSelectStudentsPopupOpen(false)}
        onConfirm={(students) => setSelectedStudents(students)}
        initialSelectedStudents={selectedStudents}
        classroomId={watch('classroomId') || undefined}
      />
    </>
  );
}

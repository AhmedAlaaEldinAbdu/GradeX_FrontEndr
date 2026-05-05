import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import PopupMessage from '@/shared/popups/PopupMessage';
import SelectStudentsPopup, { type Student } from '../popups/SelectStudentsPopup';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers as fetchTeachersThunk } from '@/redux/features/teachers/teachersSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { fetchClassrooms as fetchClassroomsThunk } from '@/redux/features/classrooms/classroomsSlice';
import { createLesson, updateLessonWithAttachments } from '@/redux/features/lessons/lessonsSlice';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { tokenManager } from '@/lib/auth/token-manager';

// Types
import type { Book } from '@/types/books';
import type { CreateLessonRequest, Lesson } from '@/services/api/types/lessons.types';
import { useLessonValidations } from '@/validations/lessons-validations';

export type LessonType = 'in-person' | 'remote';

export interface LessonFormData {
  lessonType: LessonType | '';
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
    lessonType: 'in-person',
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
        avatar: s.studentProfilePicture || '',
      })) || [],
  };
}

export default function LessonForm({ mode, initialData }: LessonFormProps) {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { validateStartTime, validateEndTime } = useLessonValidations();
  const scrollToFirstError = useScrollToFirstError<LessonFormData>();
  const userData = tokenManager.getUserData();
  const schoolBranchId = userData?.schoolBrancheId ?? userData?.schoolBranchId ?? undefined;

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
    // If there are selected students, set to 'specific', otherwise 'all'
    normalizedInitialData?.selectedStudents && normalizedInitialData.selectedStudents.length > 0
      ? 'specific'
      : 'all'
  );
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<LessonAttachmentData[]>(
    normalizedInitialData?.attachments || []
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(
    normalizedInitialData?.selectedStudents || []
  );
  const [isSelectStudentsPopupOpen, setIsSelectStudentsPopupOpen] = useState(false);

  // Redux state (lookup lists + loading)
  const { subjects: materials, isLoading: isLoadingMaterials } = useAppSelector(
    (state) => state.subjects
  );
  const { teachers, isLoading: isLoadingTeachers } = useAppSelector((state) => state.teachers);
  const { educationalStages: grades, isLoading: isLoadingGrades } = useAppSelector(
    (state) => state.educationalStages
  );
  const { bookGrades, isLoading: isLoadingBooks } = useAppSelector((state) => state.books);
  const { classrooms, isLoading: isLoadingClassrooms } = useAppSelector(
    (state) => state.classrooms
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    defaultValues: {
      lessonType: normalizedInitialData?.lessonType || '',
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

  // Initial data fetches
  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(
      fetchTeachersThunk({
        page: 1,
        limit: 100,
        filters: schoolBranchId ? { schoolBranchId } : {},
      })
    );
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 100,
        schoolBranchId: schoolBranchId || undefined,
      })
    );
  }, [dispatch, schoolBranchId]);

  // Fetch books when material or grade changes
  useEffect(() => {
    if (watchedMaterialId && watchedGradeId) {
      dispatch(
        fetchBooks({
          page: 1,
          limit: 100,
          filters: {
            materialId: watchedMaterialId,
            gradeId: watchedGradeId,
            schoolBranchesId: schoolBranchId || undefined,
          },
        })
      );
    } else {
      setValue('bookId', '');
    }
  }, [dispatch, watchedMaterialId, watchedGradeId, schoolBranchId, setValue]);

  // Fetch classrooms when grade changes
  useEffect(() => {
    if (watchedGradeId) {
      dispatch(
        fetchClassroomsThunk({
          page: 1,
          limit: 100,
          filters: {
            gradeId: watchedGradeId,
            schoolBranchId: schoolBranchId || undefined,
          },
        })
      );
    } else {
      setValue('classroomId', '');
    }
  }, [dispatch, watchedGradeId, schoolBranchId, setValue]);

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
        lessonType: normalizedInitialData.lessonType || '',
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
      // If there are selected students, set to 'specific', otherwise 'all'
      const hasStudents =
        normalizedInitialData.selectedStudents && normalizedInitialData.selectedStudents.length > 0;
      setSendTo(hasStudents ? 'specific' : 'all');
      setExistingAttachments(normalizedInitialData.attachments || []);
      setSelectedStudents(normalizedInitialData.selectedStudents || []);
    }
  }, [normalizedInitialData, reset]);

  const onSubmit = async (data: LessonFormData) => {
    try {
      if (!schoolBranchId) {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: t('common.errorOccurred'),
        });
        return;
      }

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
        schoolBranchesId: schoolBranchId,
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
        await dispatch(createLesson({ data: request, attachmentFiles })).unwrap();
      } else if (normalizedInitialData?.id) {
        await dispatch(
          updateLessonWithAttachments({
            data: { ...request, id: normalizedInitialData.id },
            attachmentFiles,
          })
        ).unwrap();
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
    navigate('/calendar/weekly');
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
        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)}>
          {/* Hidden date field */}
          <Controller
            name="date"
            control={control}
            render={({ field }) => <input {...field} type="hidden" />}
          />

          {/* Main Info Section */}
          <div className="mb-6">
            {/* Lesson Type */}
            <div className="mb-4">
              <FormField
                label={t('lesson.lessonType')}
                required
                error={errors.lessonType?.message}
                htmlFor="lessonType"
              >
                <Controller
                  name="lessonType"
                  control={control}
                  rules={{ required: t('lesson.validation.lessonTypeRequired') }}
                  render={({ field }) => (
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={field.name}
                          value="in-person"
                          checked={field.value === 'in-person'}
                          onChange={() => field.onChange('in-person')}
                          onBlur={field.onBlur}
                          className="h-4 w-4"
                        />
                        <span className="text-base text-black-800">{t('lesson.inPerson')}</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={field.name}
                          value="remote"
                          checked={field.value === 'remote'}
                          onChange={() => field.onChange('remote')}
                          onBlur={field.onBlur}
                          className="h-4 w-4"
                        />
                        <span className="text-base text-black-800">{t('lesson.remote')}</span>
                      </label>
                    </div>
                  )}
                />
              </FormField>
            </div>

            {/* Time fields */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('lesson.startTime')}
                required
                error={errors.startTime?.message}
                htmlFor="startTime"
              >
                <Controller
                  name="startTime"
                  control={control}
                  rules={{
                    required: t('common.required'),
                    validate: validateStartTime,
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="time"
                      id="startTime"
                      icon={<CustomImage src={ClockIcon} className="h-5 w-5" />}
                    />
                  )}
                />
              </FormField>

              <FormField
                label={t('lesson.endTime')}
                required
                error={errors.endTime?.message}
                htmlFor="endTime"
              >
                <Controller
                  name="endTime"
                  control={control}
                  rules={{
                    required: t('common.required'),
                    validate: (value) => validateEndTime(value, watch('startTime')),
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="time"
                      id="endTime"
                      icon={<CustomImage src={ClockIcon} className="h-5 w-5" />}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* Subject & Teacher */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('lesson.subjectName')}
                required
                error={errors.materialId?.message}
                htmlFor="materialId"
              >
                <Controller
                  name="materialId"
                  control={control}
                  rules={{ required: t('lesson.validation.subjectRequired') }}
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

              <FormField
                label={t('lesson.teacherName')}
                required
                error={errors.teacherId?.message}
                htmlFor="teacherId"
              >
                <Controller
                  name="teacherId"
                  control={control}
                  rules={{ required: t('lesson.validation.teacherRequired') }}
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

            {/* Educational Stage & Grade/Classroom */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('lesson.grade')}
                required
                error={errors.gradeId?.message}
                htmlFor="gradeId"
              >
                <Controller
                  name="gradeId"
                  control={control}
                  rules={{ required: t('lesson.validation.gradeRequired') }}
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

              <FormField
                label={t('lesson.classroom')}
                required
                error={errors.classroomId?.message}
                htmlFor="classroomId"
              >
                <Controller
                  name="classroomId"
                  control={control}
                  rules={{ required: t('lesson.validation.classroomRequired') }}
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

            {/* Book Name */}
            <FormField
              label={t('lesson.bookName')}
              optional
              error={errors.bookId?.message}
              htmlFor="bookId"
            >
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
          <div className="mb-6 rounded-2xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-lg font-bold text-[#3A3A3A]">
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
          <div className="mb-6 rounded-2xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-lg font-bold text-[#3A3A3A]">
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
          </div>

          <div className="mb-6">
            {/* Descriptions */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Description Arabic */}
              <FormField label={t('lesson.descriptionAr')} htmlFor="descriptionAr">
                <Controller
                  name="descriptionAr"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
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
                    <TextArea
                      {...field}
                      placeholder={t('lesson.enterDescription')}
                      id="descriptionEn"
                    />
                  )}
                />
              </FormField>
            </div>

            {/* Send To */}
            <div className="mt-4">
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
                      className="h-4 w-4"
                    />
                    <span className="text-base text-black-800">{t('lesson.all')}</span>
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
                      className="h-4 w-4"
                    />
                    <span className="text-base text-black-800">{t('lesson.specificStudents')}</span>
                  </label>
                </div>
              </FormField>

              {/* Selected students indicator */}
              {sendTo === 'specific' && selectedStudents.length > 0 && (
                <div
                  className="mt-3 flex cursor-pointer items-center gap-2"
                  onClick={() => setIsSelectStudentsPopupOpen(true)}
                >
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {selectedStudents.slice(0, 1).map((student) => (
                      <div
                        key={student.id}
                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-gray-100"
                        // style={{ zIndex: 3 - index }}
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
                        className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-gray-200"
                        style={{ zIndex: 0 }}
                      >
                        <span className="text-xs text-gray-600">
                          +{selectedStudents.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedStudents.length === 1 ? (
                      selectedStudents[0].name
                    ) : (
                      <span>
                        {selectedStudents[0].name}{' '}
                        <span className="text-green-500">+{selectedStudents.length - 1}</span>
                      </span>
                    )}
                  </span>
                </div>
              )}

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

            {/* Attachments */}
            <div className="mt-4">
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
            navigate('/calendar/weekly');
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

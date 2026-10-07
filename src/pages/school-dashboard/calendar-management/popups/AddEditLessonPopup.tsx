import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { tokenManager } from '@/lib/auth/token-manager';
import { getErrorMessage } from '@/lib/http';
import { useLessonValidations } from '@/validations/lessons-validations';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import {
  createLesson,
  fetchLessonByIdSilent,
  updateLessonWithAttachments,
} from '@/redux/features/lessons/lessonsSlice';
import EducationalStagesApiService from '@/services/api/educational-stages/educational-stages.service';
import classroomApiService from '@/services/api/classrooms/classrooms.service';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import type { Classroom } from '@/services/api/types/classrooms.types';
import type { CreateLessonRequest } from '@/services/api/types/lessons.types';
import type { Book } from '@/types/books';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import PlusWhite16Icon from '@/assets/icons/PlusWhite16.svg';
import ImageUploadGreenIcon from '@/assets/icons/ImageUploadGreen.svg';
import {
  PopupField,
  PopupPickerInput,
  PopupRadio,
  PopupSelect,
  PopupTextInput,
  type PopupSelectOption,
} from '../components/AcademicCalendarPopupFields';
import type { LessonAttachmentData, LessonFormData } from '../components/LessonForm';
import { buildLessonDateTime, mapLessonToFormData } from '../components/LessonFormUtils';
import SelectStudentsPopup, { type Student } from './SelectStudentsPopup';

const LOOKUP_LIMIT = 100;
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_FILES = 'image/png,image/jpg,image/jpeg,image/gif,image/svg+xml,application/pdf';

type LessonPopupFormValues = LessonFormData & { subSystemId: string };

export type LessonPopupDefaults = {
  subSystemId?: string;
  gradeId?: string;
  classroomId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};

interface AddEditLessonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  mode: 'add' | 'edit';
  lessonId?: string;
  defaults?: LessonPopupDefaults;
}

const buildDefaultValues = (defaults?: LessonPopupDefaults): LessonPopupFormValues => ({
  lessonType: 'in-person',
  subSystemId: defaults?.subSystemId ?? '',
  gradeId: defaults?.gradeId ?? '',
  classroomId: defaults?.classroomId ?? '',
  materialId: '',
  teacherId: '',
  bookId: '',
  classworkFromPage: '',
  classworkToPage: '',
  homeworkFromPage: '',
  homeworkToPage: '',
  descriptionAr: '',
  descriptionEn: '',
  date: defaults?.date ?? '',
  startTime: defaults?.startTime ?? '',
  endTime: defaults?.endTime ?? '',
  applyToAllWeeks: false,
});

type PageRangeProps = {
  fromName: 'classworkFromPage' | 'homeworkFromPage';
  toName: 'classworkToPage' | 'homeworkToPage';
  fromLabel: string;
  toLabel: string;
  control: ReturnType<typeof useForm<LessonPopupFormValues>>['control'];
};

function PageRangeFields({ fromName, toName, fromLabel, toLabel, control }: PageRangeProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {(
        [
          [fromName, fromLabel],
          [toName, toLabel],
        ] as const
      ).map(([name, label]) => (
        <PopupField key={name} name={name} label={label}>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputMode="numeric"
              />
            )}
          />
        </PopupField>
      ))}
    </div>
  );
}

export default function AddEditLessonPopup({
  isOpen,
  onClose,
  onSaved,
  mode,
  lessonId,
  defaults,
}: AddEditLessonPopupProps) {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { validateStartTime, validateEndTime } = useLessonValidations();
  const scrollToFirstError = useScrollToFirstError<LessonPopupFormValues>();
  const isEdit = mode === 'edit';
  const userData = tokenManager.getUserData();
  const schoolBranchId = userData?.schoolBrancheId ?? userData?.schoolBranchId ?? undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonPopupFormValues>({ defaultValues: buildDefaultValues(defaults) });

  const subSystemId = watch('subSystemId');
  const gradeId = watch('gradeId');
  const classroomId = watch('classroomId');
  const materialId = watch('materialId');
  const applyToAllWeeks = watch('applyToAllWeeks');
  const lessonType = watch('lessonType');

  const isContextLocked = Boolean(defaults?.gradeId && defaults?.classroomId);

  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [sendTo, setSendTo] = useState<'all' | 'specific'>('all');
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<LessonAttachmentData[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [grades, setGrades] = useState<EducationalStageResponse[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);

  const schoolAcademicSubSystems = useAppSelector(
    (state) => state.academicSubSystems.schoolAcademicSubSystems
  );
  const { subjects, isLoading: isLoadingSubjects } = useAppSelector((state) => state.subjects);
  const { teachers, isLoading: isLoadingTeachers } = useAppSelector((state) => state.teachers);
  const { bookGrades, isLoading: isLoadingBooks } = useAppSelector((state) => state.books);

  useEffect(() => {
    if (!isOpen) return;

    setSendTo('all');
    setSelectedStudents([]);
    setAttachmentFiles([]);
    setExistingAttachments([]);

    if (!isEdit || !lessonId) {
      reset(buildDefaultValues(defaults));
      return;
    }

    let cancelled = false;
    setIsLoadingLesson(true);
    dispatch(fetchLessonByIdSilent(lessonId))
      .unwrap()
      .then((lesson) => {
        if (cancelled) return;
        const data = mapLessonToFormData(lesson);
        reset({
          ...buildDefaultValues(defaults),
          lessonType: data.lessonType || 'in-person',
          gradeId: data.gradeId,
          classroomId: data.classroomId,
          materialId: data.materialId,
          teacherId: data.teacherId,
          bookId: data.bookId,
          classworkFromPage: data.classworkFromPage,
          classworkToPage: data.classworkToPage,
          homeworkFromPage: data.homeworkFromPage,
          homeworkToPage: data.homeworkToPage,
          descriptionAr: data.descriptionAr,
          descriptionEn: data.descriptionEn,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          applyToAllWeeks: data.applyToAllWeeks,
        });
        setSelectedStudents(data.selectedStudents ?? []);
        setSendTo(data.selectedStudents?.length ? 'specific' : 'all');
        setExistingAttachments(data.attachments ?? []);
      })
      .catch((error) => {
        if (cancelled) return;
        showToast({ message: getErrorMessage(error), type: 'error', isRaw: true });
        onClose();
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLesson(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, lessonId]);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(
      fetchTeachers({
        page: 1,
        limit: LOOKUP_LIMIT,
        filters: schoolBranchId ? { schoolBranchId } : {},
      })
    );
    dispatch(
      getSchoolAcademicSubSystems({ pageIndex: 1, pageSize: 10000, schoolBranchId: schoolBranchId })
    );
  }, [dispatch, isOpen, schoolBranchId]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoadingGrades(true);
    const request = subSystemId
      ? EducationalStagesApiService.fetchEducationalStagesBySubSystemId(subSystemId, {
          pageIndex: 1,
          pageSize: LOOKUP_LIMIT,
        })
      : EducationalStagesApiService.fetchEducationalStages({
          pageIndex: 1,
          pageSize: LOOKUP_LIMIT,
        });
    request
      .then((response) => !cancelled && setGrades(response?.gradeDtos ?? []))
      .catch(() => !cancelled && setGrades([]))
      .finally(() => !cancelled && setIsLoadingGrades(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, subSystemId]);

  useEffect(() => {
    if (!isOpen || !gradeId) {
      setClassrooms([]);
      return;
    }
    let cancelled = false;
    setIsLoadingClassrooms(true);
    classroomApiService
      .getClassrooms({
        PageIndex: 1,
        PageSize: LOOKUP_LIMIT,
        GradeId: gradeId,
        SchoolBranchId: schoolBranchId,
      })
      .then((response) => !cancelled && setClassrooms(response?.data?.classroomDto ?? []))
      .catch(() => !cancelled && setClassrooms([]))
      .finally(() => !cancelled && setIsLoadingClassrooms(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, gradeId, schoolBranchId]);

  useEffect(() => {
    if (!isOpen || !classroomId || !gradeId) return;
    dispatch(
      fetchSubjects({
        page: 1,
        limit: LOOKUP_LIMIT,
        filters: { schoolBranchesId: schoolBranchId, gradeId },
      })
    );
  }, [dispatch, isOpen, classroomId, gradeId, schoolBranchId]);

  useEffect(() => {
    if (!isOpen || !materialId || !gradeId) return;
    dispatch(
      fetchBooks({
        page: 1,
        limit: LOOKUP_LIMIT,
        filters: { materialId, gradeId, schoolBranchesId: schoolBranchId },
      })
    );
  }, [dispatch, isOpen, materialId, gradeId, schoolBranchId]);

  useEffect(() => {
    if (subSystemId || !gradeId || schoolAcademicSubSystems.length === 0) return;
    const grade = grades.find((item) => item.id === gradeId);
    const gradeSystemId =
      grade?.academicSubSystemId ??
      grade?.academicSubSystemGradeId ??
      grade?.academicSubSystemGradeDto?.id;
    if (gradeSystemId && schoolAcademicSubSystems.some((s) => s.id === gradeSystemId)) {
      setValue('subSystemId', gradeSystemId);
    }
  }, [subSystemId, gradeId, grades, schoolAcademicSubSystems, setValue]);

  const subSystemOptions = useMemo<PopupSelectOption[]>(
    () => schoolAcademicSubSystems.map((s) => ({ value: s.id, label: s.name })),
    [schoolAcademicSubSystems]
  );
  const gradeOptions = useMemo<PopupSelectOption[]>(
    () => grades.map((g) => ({ value: g.id, label: isArabic ? g.nameAr : g.nameEn || g.nameAr })),
    [grades, isArabic]
  );
  const classroomOptions = useMemo<PopupSelectOption[]>(
    () => classrooms.map((c) => ({ value: c.id, label: isArabic ? c.name : c.nameEn || c.name })),
    [classrooms, isArabic]
  );
  const subjectOptions = useMemo<PopupSelectOption[]>(
    () => subjects.map((m) => ({ value: m.id, label: isArabic ? m.name : m.nameEn || m.name })),
    [subjects, isArabic]
  );
  const teacherOptions = useMemo<PopupSelectOption[]>(
    () => teachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
    [teachers]
  );
  const bookOptions = useMemo<PopupSelectOption[]>(() => {
    const books: Book[] = bookGrades.flatMap((bookGrade) => bookGrade.bookDtos);
    return books.map((book) => ({ value: book.id, label: book.name }));
  }, [bookGrades]);

  const closeAndReset = () => {
    reset(buildDefaultValues(defaults));
    onClose();
  };

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const accepted: File[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        showToast({ message: t('lesson.popup.fileTooLarge', { name: file.name }), type: 'error' });
      } else {
        accepted.push(file);
      }
    });
    if (accepted.length) setAttachmentFiles((prev) => [...prev, ...accepted]);
  };

  const attachmentNames = [
    ...existingAttachments.map((attachment, index) => ({
      key: `existing-${index}`,
      name: attachment.fileName,
      remove: () => setExistingAttachments((prev) => prev.filter((_, i) => i !== index)),
    })),
    ...attachmentFiles.map((file, index) => ({
      key: `new-${index}-${file.name}`,
      name: file.name,
      remove: () => setAttachmentFiles((prev) => prev.filter((_, i) => i !== index)),
    })),
  ];

  const onSubmit = async (data: LessonPopupFormValues) => {
    if (!schoolBranchId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
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
      date: buildLessonDateTime(data.date, data.startTime),
      startTime: data.startTime || '08:00',
      endTime: data.endTime || '09:00',
      isHomeworkForAllStudents: sendTo === 'all',
      applyToAllWeeks: data.applyToAllWeeks,
      schoolBranchesId: schoolBranchId,
    };

    if (sendTo === 'specific' && selectedStudents.length > 0) {
      request.lessonsStudent = selectedStudents.map((student) => ({ studentId: student.id }));
    }
    if (isEdit && existingAttachments.length > 0) {
      request.attachments = existingAttachments;
    }

    try {
      if (isEdit && lessonId) {
        await dispatch(
          updateLessonWithAttachments({ data: { ...request, id: lessonId }, attachmentFiles })
        ).unwrap();
      } else {
        await dispatch(createLesson({ data: request, attachmentFiles })).unwrap();
      }
      onSaved(t(isEdit ? 'lesson.lessonUpdatedSuccessfully' : 'lesson.lessonAddedSuccessfully'));
      closeAndReset();
    } catch (error) {
      showToast({
        message: typeof error === 'string' ? error : t('common.errorOccurred'),
        type: 'error',
        isRaw: typeof error === 'string',
      });
    }
  };

  const selectPlaceholder = (loading: boolean, fallback: string) =>
    loading ? t('common.loading') : fallback;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeAndReset}
        showHeader={false}
        placement="end"
        closeOnOverlayClick={false}
        panelClassName="max-w-[650px]! rounded-e-none rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
        contentClassName="flex min-h-0 flex-col overflow-hidden! p-0!"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
          <div className="flex flex-col gap-1 text-start">
            <h2 className="text-xl leading-7 font-bold text-[black]">
              {t(isEdit ? 'lesson.editTitle' : 'lesson.addTitle')}
            </h2>
            <p className="text-xs leading-4 text-[#9D9D9D]">
              {t(isEdit ? 'lesson.popup.subtitleEdit' : 'lesson.popup.subtitleAdd')}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAndReset}
            aria-label={t('common.close')}
            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
          >
            <CustomImage src={CloseXGreenIcon} alt="" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-5 overflow-y-auto px-8 py-6">
          {isLoadingLesson ? (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70">
              <div className="size-10 animate-spin rounded-full border-4 border-[#A7F3D0] border-t-[#1E7A52]" />
            </div>
          ) : null}

          <PopupField name="lessonType" label={t('lesson.lessonType')} required>
            <div className="flex flex-wrap items-center gap-6">
              <PopupRadio
                checked={lessonType === 'in-person'}
                label={t('lesson.inPerson')}
                onSelect={() => setValue('lessonType', 'in-person')}
              />
              <PopupRadio
                checked={lessonType === 'remote'}
                label={t('lesson.remote')}
                onSelect={() => setValue('lessonType', 'remote')}
              />
            </div>
          </PopupField>

          <PopupField name="date" label={t('lesson.date')} required error={errors.date?.message}>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'common.required' }}
              render={({ field }) => (
                <PopupPickerInput
                  name={field.name}
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('common.chooseDate')}
                  hasError={Boolean(errors.date)}
                />
              )}
            />
          </PopupField>

          <PopupField name="subSystemId" label={t('lesson.popup.academicSystem')}>
            <Controller
              name="subSystemId"
              control={control}
              render={({ field }) => (
                <PopupSelect
                  name={field.name}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue('gradeId', '');
                    setValue('classroomId', '');
                    setValue('materialId', '');
                    setValue('bookId', '');
                  }}
                  options={subSystemOptions}
                  placeholder={t('lesson.popup.selectAcademicSystem')}
                  disabled={isContextLocked}
                />
              )}
            />
          </PopupField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PopupField
              name="startTime"
              label={t('lesson.startTime')}
              required
              error={errors.startTime?.message}
            >
              <Controller
                name="startTime"
                control={control}
                rules={{ required: 'common.required', validate: validateStartTime }}
                render={({ field }) => (
                  <PopupPickerInput
                    name={field.name}
                    type="time"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('lesson.selectStartTime')}
                    hasError={Boolean(errors.startTime)}
                  />
                )}
              />
            </PopupField>
            <PopupField
              name="endTime"
              label={t('lesson.endTime')}
              required
              error={errors.endTime?.message}
            >
              <Controller
                name="endTime"
                control={control}
                rules={{
                  required: 'common.required',
                  validate: (value) => validateEndTime(value, watch('startTime')),
                }}
                render={({ field }) => (
                  <PopupPickerInput
                    name={field.name}
                    type="time"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('lesson.selectEndTime')}
                    hasError={Boolean(errors.endTime)}
                  />
                )}
              />
            </PopupField>
          </div>

          <label
            htmlFor="apply-to-all-weeks"
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]/50 px-[15px] py-[5px]"
          >
            <span className="text-sm leading-5 font-medium text-[black]">
              {t('lesson.applyToAllWeeks')}
            </span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input
                id="apply-to-all-weeks"
                type="checkbox"
                role="switch"
                checked={applyToAllWeeks}
                onChange={(event) => setValue('applyToAllWeeks', event.target.checked)}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-[#E2E8F0] transition-colors peer-checked:bg-[#1E7A52] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1E7A52]/30" />
              <span className="absolute start-0.5 top-0.5 size-5 rounded-full border border-[#CBD5E1] bg-white transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
            </span>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PopupField
              name="gradeId"
              label={t('lesson.grade')}
              required
              error={errors.gradeId?.message}
            >
              <Controller
                name="gradeId"
                control={control}
                rules={{ required: 'lesson.validation.gradeRequired' }}
                render={({ field }) => (
                  <PopupSelect
                    name={field.name}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue('classroomId', '');
                      setValue('materialId', '');
                      setValue('bookId', '');
                    }}
                    onBlur={field.onBlur}
                    options={gradeOptions}
                    placeholder={selectPlaceholder(isLoadingGrades, t('lesson.popup.selectGrade'))}
                    disabled={isContextLocked || isLoadingGrades}
                    hasError={Boolean(errors.gradeId)}
                  />
                )}
              />
            </PopupField>
            <PopupField
              name="classroomId"
              label={t('lesson.classroom')}
              required
              error={errors.classroomId?.message}
            >
              <Controller
                name="classroomId"
                control={control}
                rules={{ required: 'lesson.validation.classroomRequired' }}
                render={({ field }) => (
                  <PopupSelect
                    name={field.name}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue('materialId', '');
                      setValue('bookId', '');
                    }}
                    onBlur={field.onBlur}
                    options={classroomOptions}
                    placeholder={
                      !gradeId
                        ? t('lesson.selectGradeFirst')
                        : selectPlaceholder(isLoadingClassrooms, t('lesson.popup.selectClassroom'))
                    }
                    disabled={isContextLocked || !gradeId || isLoadingClassrooms}
                    hasError={Boolean(errors.classroomId)}
                  />
                )}
              />
            </PopupField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PopupField
              name="materialId"
              label={t('lesson.subjectName')}
              required
              error={errors.materialId?.message}
            >
              <Controller
                name="materialId"
                control={control}
                rules={{ required: 'lesson.validation.subjectRequired' }}
                render={({ field }) => (
                  <PopupSelect
                    name={field.name}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue('bookId', '');
                    }}
                    onBlur={field.onBlur}
                    options={subjectOptions}
                    placeholder={
                      !classroomId
                        ? t('lesson.selectClassroomFirst')
                        : selectPlaceholder(isLoadingSubjects, t('lesson.selectSubject'))
                    }
                    disabled={!classroomId || isLoadingSubjects}
                    hasError={Boolean(errors.materialId)}
                  />
                )}
              />
            </PopupField>
            <PopupField
              name="teacherId"
              label={t('lesson.teacherName')}
              required
              error={errors.teacherId?.message}
            >
              <Controller
                name="teacherId"
                control={control}
                rules={{ required: 'lesson.validation.teacherRequired' }}
                render={({ field }) => (
                  <PopupSelect
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={teacherOptions}
                    placeholder={selectPlaceholder(
                      isLoadingTeachers,
                      t('lesson.popup.selectTeacher')
                    )}
                    disabled={isLoadingTeachers}
                    hasError={Boolean(errors.teacherId)}
                  />
                )}
              />
            </PopupField>
          </div>

          <PopupField
            name="bookId"
            label={t('lesson.bookName')}
            required
            error={errors.bookId?.message}
          >
            <Controller
              name="bookId"
              control={control}
              rules={{ required: 'lesson.validation.bookNameRequired' }}
              render={({ field }) => (
                <PopupSelect
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={bookOptions}
                  placeholder={
                    !materialId
                      ? t('lesson.popup.selectSubjectFirst')
                      : isLoadingBooks
                        ? t('common.loading')
                        : bookOptions.length === 0
                          ? t('lesson.noBooksAvailable')
                          : t('lesson.selectBook')
                  }
                  disabled={!materialId || isLoadingBooks}
                  hasError={Boolean(errors.bookId)}
                />
              )}
            />
          </PopupField>

          <PageRangeFields
            control={control}
            fromName="classworkFromPage"
            toName="classworkToPage"
            fromLabel={t('lesson.popup.classworkFrom')}
            toLabel={t('lesson.popup.classworkTo')}
          />
          <PageRangeFields
            control={control}
            fromName="homeworkFromPage"
            toName="homeworkToPage"
            fromLabel={t('lesson.popup.homeworkFrom')}
            toLabel={t('lesson.popup.homeworkTo')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PopupField name="descriptionAr" label={t('lesson.popup.descriptionAr')}>
              <Controller
                name="descriptionAr"
                control={control}
                render={({ field }) => (
                  <PopupTextInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </PopupField>
            <PopupField name="descriptionEn" label={t('lesson.popup.descriptionEn')}>
              <Controller
                name="descriptionEn"
                control={control}
                render={({ field }) => (
                  <PopupTextInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </PopupField>
          </div>

          <PopupField name="sendTo" label={t('lesson.sendTo')} required>
            <div className="flex flex-wrap items-center gap-6">
              <PopupRadio
                checked={sendTo === 'all'}
                label={t('lesson.all')}
                onSelect={() => {
                  setSendTo('all');
                  setSelectedStudents([]);
                }}
              />
              <PopupRadio
                checked={sendTo === 'specific'}
                label={t('lesson.specificStudents')}
                onSelect={() => {
                  setSendTo('specific');
                  setIsStudentsPopupOpen(true);
                }}
              />
              {sendTo === 'specific' ? (
                <button
                  type="button"
                  onClick={() => setIsStudentsPopupOpen(true)}
                  className="text-xs font-semibold text-[#1E7A52] hover:underline"
                >
                  {selectedStudents.length > 0
                    ? t('lesson.studentsSelected', { count: selectedStudents.length })
                    : t('lesson.selectStudentsButton')}
                </button>
              ) : null}
            </div>
          </PopupField>

          <PopupField name="attachments" label={t('lesson.popup.attachments')}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILES}
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#1E7A52] p-[26px] transition-colors ${
                isDragging ? 'bg-[#ECFDF5]' : 'bg-[#ECFDF5]/30 hover:bg-[#ECFDF5]/60'
              }`}
            >
              <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-[#ECFDF5]">
                <CustomImage src={ImageUploadGreenIcon} alt="" />
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sm leading-5 font-semibold text-[#1E7A52]">
                  {t('lesson.popup.clickToUpload')}
                </span>
                <span className="text-xs leading-4 text-[#9D9D9D]">
                  {t('lesson.popup.dragAndDrop')}
                </span>
              </span>
              <span className="text-xs leading-4 text-[#9D9D9D]" dir="auto">
                {t('lesson.popup.uploadHint', { size: MAX_FILE_SIZE_MB })}
              </span>
            </button>

            {attachmentNames.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {attachmentNames.map((file) => (
                  <li
                    key={file.key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]/50 px-3 py-2 text-xs text-[#1E293B]"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={file.remove}
                      aria-label={t('common.delete')}
                      className="shrink-0 text-[#F43F5E] hover:underline"
                    >
                      {t('common.delete')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </PopupField>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
          <Button
            actionKey={isEdit ? 'edit' : 'add'}
            onClick={handleSubmit(onSubmit, scrollToFirstError)}
            disabled={isSubmitting || isLoadingLesson}
            icon={
              isEdit ? undefined : <CustomImage src={PlusWhite16Icon} alt="" className="block" />
            }
            className="h-10 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-6! py-2.5! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! drop-shadow-[0px_1px_1px_rgba(5,150,105,0.2)] hover:bg-[#1E7A52]/90!"
          >
            {isSubmitting ? t('common.saving') : t(isEdit ? 'common.save' : 'common.add')}
          </Button>
          <button
            type="button"
            onClick={closeAndReset}
            disabled={isSubmitting}
            className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4]"
          >
            {t('common.cancel')}
          </button>
        </div>
      </Modal>

      <SelectStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        onConfirm={setSelectedStudents}
        initialSelectedStudents={selectedStudents}
        classroomId={classroomId || undefined}
      />
    </>
  );
}

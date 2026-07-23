import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ValidationError } from 'yup';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import FileUpload from '@/shared/components/FileUpload';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import PopupMessage from '@/shared/popups/PopupMessage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { createLesson, updateLessonWithAttachments } from '@/redux/features/lessons/lessonsSlice';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { LiveClassSchema } from '@/validations/live-class-validations';
import type {
  CreateLessonRequest,
  Lesson,
  LessonAttachmentInput,
  UpdateLessonRequest,
} from '@/services/api/types/lessons.types';
import type { Book } from '@/types/books';
import SelectStudentsPopup, { type SelectedStudent } from '../popups/SelectStudentsPopup';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

type ClassType = 'inPerson' | 'remote';
type HomeworkAudience = 'all' | 'specific';

type LiveClassFormData = {
  classType: ClassType;
  fromTime: string;
  toTime: string;
  subject: string;
  teacher: string;
  stage: string;
  grade: string;
  book: string;
  classWorkFromPage: string;
  classWorkToPage: string;
  homeworkFromPage: string;
  homeworkToPage: string;
  homeworkDescAr: string;
  homeworkDescEn: string;
  addHomework: boolean;
  sendHomeworkTo: HomeworkAudience;
  selectedStudents: SelectedStudent[];
  attachments: File[];
};

const INITIAL_DATA: LiveClassFormData = {
  classType: 'remote',
  fromTime: '',
  toTime: '',
  subject: '',
  teacher: '',
  stage: '',
  grade: '',
  book: '',
  classWorkFromPage: '',
  classWorkToPage: '',
  homeworkFromPage: '',
  homeworkToPage: '',
  homeworkDescAr: '',
  homeworkDescEn: '',
  addHomework: false,
  sendHomeworkTo: 'all',
  selectedStudents: [],
  attachments: [],
};

const FILE_FORMATS = [
  'GIF',
  'SVG',
  'JPG',
  'PNG',
  'PDF',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX',
  'TXT',
  'PPT',
  'PPTX',
];
const FILE_ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx';

const parseArabicTime = (time?: string): string => {
  if (!time) return '';
  const match = time.trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  let hour = Number(match[1]);
  if (time.includes('مساء') && hour < 12) hour += 12;
  if (time.includes('صباح') && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const buildLiveClassDateTime = (time: string, sourceDate?: string): string => {
  const parsedSourceDate = sourceDate ? new Date(sourceDate) : null;
  const now =
    parsedSourceDate && !Number.isNaN(parsedSourceDate.getTime()) ? parsedSourceDate : new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const timePart = time.split(':').length === 3 ? time : `${time}:00`;
  const date = new Date(`${datePart}T${timePart}`);

  return Number.isNaN(date.getTime()) ? now.toISOString() : date.toISOString();
};

type BackendValidationError = {
  propertyName?: string;
  identifier?: string | null;
  errorMessage?: string;
  errorCode?: string | null;
};

type LessonMutationResult = {
  isSuccess?: boolean;
  message?: string;
  validationErrors?: BackendValidationError[] | string[] | Record<string, string | string[]> | null;
};

const BACKEND_FIELD_TO_FORM_FIELD: Record<string, string> = {
  MaterialId: 'subject',
  TeacherId: 'teacher',
  GradeId: 'stage',
  ClassroomId: 'grade',
  BookId: 'book',
  StartTime: 'fromTime',
  EndTime: 'toTime',
  HomeworkName: 'homeworkName',
  HomeworkFromPage: 'homeworkFromPage',
  HomeworkToPage: 'homeworkToPage',
  HomeworkDescriptionAr: 'homeworkDescAr',
  HomeworkDescriptionEn: 'homeworkDescEn',
};

const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  HOMEWORK_NAME_REQUIRED: 'eLearning.liveClasses.add.validation.homeworkNameRequired',
  HOMEWORK_FROM_PAGE_MUST_BE_GREATER_THAN_ZERO:
    'eLearning.liveClasses.add.validation.homeworkPageGreaterThanZero',
  HOMEWORK_TO_PAGE_MUST_BE_GREATER_THAN_ZERO:
    'eLearning.liveClasses.add.validation.homeworkPageGreaterThanZero',
};

const getBackendErrorMessage = (message?: string): string => {
  if (!message) return 'common.errorOccurred';
  return BACKEND_ERROR_MESSAGES[message] || message;
};

const getApiValidationErrors = (result: LessonMutationResult): Record<string, string> => {
  const next: Record<string, string> = {};
  const validationErrors = result.validationErrors;

  if (Array.isArray(validationErrors)) {
    validationErrors.forEach((item) => {
      if (typeof item === 'string') {
        next.form = getBackendErrorMessage(item);
        return;
      }

      const backendField = item.propertyName || item.identifier || '';
      const formField = BACKEND_FIELD_TO_FORM_FIELD[backendField] || 'form';
      if (!next[formField]) {
        next[formField] = getBackendErrorMessage(item.errorMessage || item.errorCode || undefined);
      }
    });
    return next;
  }

  if (validationErrors && typeof validationErrors === 'object') {
    Object.entries(validationErrors).forEach(([backendField, messages]) => {
      const formField = BACKEND_FIELD_TO_FORM_FIELD[backendField] || 'form';
      const message = Array.isArray(messages) ? messages[0] : messages;
      if (message && !next[formField]) {
        next[formField] = getBackendErrorMessage(message);
      }
    });
  }

  return next;
};

const hasExistingHomework = (lesson: Lesson): boolean =>
  Boolean(
    (lesson.homeworkFromPage ?? 0) > 0 ||
      (lesson.homeworkToPage ?? 0) > 0 ||
      lesson.homeworkName ||
      lesson.homeworkDescription ||
      lesson.homeworkDescriptionAr ||
      lesson.homeworkDescriptionEn ||
      lesson.lessonsStudent?.length
  );

type LiveClassFormProps = {
  mode: 'add' | 'edit';
  initialData?: Lesson;
};

export default function LiveClassForm({ mode, initialData }: LiveClassFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';
  const isEdit = mode === 'edit';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [data, setData] = useState<LiveClassFormData>(INITIAL_DATA);
  const [existingAttachments, setExistingAttachments] = useState<LessonAttachmentInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isMessageRaw?: boolean;
  }>({ show: false, type: 'success', message: '' });
  const scrollToFirstError = useScrollToFirstError();

  const materials = useAppSelector((s) => s.subjects.subjects);
  const teachers = useAppSelector((s) => s.teachers.teachers);
  const grades = useAppSelector((s) => s.grades.grades);
  const classrooms = useAppSelector((s) => s.classrooms.classrooms);
  const { bookGrades, isLoading: isLoadingBooks } = useAppSelector((s) => s.books);
  const isCreatingLesson = useAppSelector((s) => s.lessons.isCreating);
  const isUpdatingLesson = useAppSelector((s) => s.lessons.isUpdating);
  const isSubmitting = isCreatingLesson || isUpdatingLesson;

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(fetchTeachers({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(fetchGrades(schoolBranchId));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!data.stage) return;
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          gradeId: data.stage,
          ...(schoolBranchId && { schoolBranchId }),
        },
      })
    );
  }, [dispatch, schoolBranchId, data.stage]);

  useEffect(() => {
    if (!data.subject || !data.stage) return;
    dispatch(
      fetchBooks({
        page: 1,
        limit: 100,
        filters: {
          materialId: data.subject,
          gradeId: data.stage,
          schoolBranchesId: schoolBranchId || undefined,
        },
      })
    );
  }, [data.stage, data.subject, dispatch, schoolBranchId]);

  useEffect(() => {
    if (!isEdit || !initialData) return;
    const selectedStudents =
      initialData.lessonsStudent?.map((student) => ({
        id: student.studentId,
        name: student.studentName || '',
        avatar: student.studentProfilePicture || null,
      })) || [];

    setData((prev) => ({
      ...prev,
      subject: initialData.materialId || '',
      teacher: initialData.teacherId || '',
      stage: initialData.gradeId || '',
      grade: initialData.classroomId || '',
      book: initialData.bookId || '',
      fromTime: parseArabicTime(initialData.startTime),
      toTime: parseArabicTime(initialData.endTime),
      classWorkFromPage: String(initialData.classworkFromPage ?? ''),
      classWorkToPage: String(initialData.classworkToPage ?? ''),
      homeworkFromPage: String(initialData.homeworkFromPage ?? ''),
      homeworkToPage: String(initialData.homeworkToPage ?? ''),
      homeworkDescAr: initialData.homeworkDescriptionAr || '',
      homeworkDescEn: initialData.homeworkDescriptionEn || '',
      addHomework: hasExistingHomework(initialData),
      sendHomeworkTo: initialData.isHomeworkForAllStudents ? 'all' : 'specific',
      selectedStudents,
    }));
    setExistingAttachments(
      initialData.attachments?.map((attachment) => ({
        fileName: attachment.fileName,
        oldFile: attachment.fileName,
        fileUrl: attachment.fileUrl,
      })) || []
    );
  }, [isEdit, initialData]);

  const subjectOptions = useMemo(
    () => materials.map((m) => ({ value: m.id, label: m.name })),
    [materials]
  );
  const teacherOptions = useMemo(
    () => teachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
    [teachers]
  );
  const stageOptions = useMemo(
    () => grades.map((g) => ({ value: g.id, label: isArabic ? g.nameAr : g.nameEn })),
    [grades, isArabic]
  );
  const gradeOptions = useMemo(
    () =>
      classrooms
        .filter((c) => c.gradeId === data.stage)
        .map((c) => ({ value: c.id, label: isArabic ? c.name : c.nameEn || c.name })),
    [classrooms, data.stage, isArabic]
  );
  const bookOptions = useMemo(() => {
    const books: Book[] = [];
    bookGrades.forEach((bookGrade) => {
      bookGrade.bookDtos.forEach((book) => books.push(book));
    });

    return books.map((book) => ({ value: book.id, label: book.name }));
  }, [bookGrades]);

  const selectedClassrooms = useMemo(() => {
    const option = gradeOptions.find((o) => o.value === data.grade);
    return option ? [{ id: option.value, name: option.label }] : [];
  }, [gradeOptions, data.grade]);

  const set =
    <K extends keyof LiveClassFormData>(key: K) =>
    (value: LiveClassFormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key] && !prev.form && !prev.homeworkName) return prev;

        const next = { ...prev };
        delete next[key];
        delete next.form;

        if (
          key === 'homeworkFromPage' ||
          key === 'homeworkToPage' ||
          key === 'homeworkDescAr' ||
          key === 'homeworkDescEn'
        ) {
          delete next.homeworkName;
        }

        return next;
      });
    };

  const base = 'eLearning.liveClasses.add';
  const titleKey = isEdit ? `${base}.editTitle` : `${base}.title`;

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.liveClasses.title'), path: '/lms/live-classes' },
    { label: t(titleKey) },
  ];

  const handleCancel = () => navigate('/lms/live-classes');

  const handleAddHomeworkChange = (checked: boolean) => {
    setData((prev) => ({
      ...prev,
      addHomework: checked,
      ...(!checked && {
        homeworkFromPage: '',
        homeworkToPage: '',
        homeworkDescAr: '',
        homeworkDescEn: '',
        sendHomeworkTo: 'all' as HomeworkAudience,
        selectedStudents: [],
      }),
    }));
    if (!checked) {
      setIsStudentsPopupOpen(false);
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.addHomework;
      delete next.homeworkName;
      delete next.homeworkFromPage;
      delete next.homeworkToPage;
      delete next.homeworkDescAr;
      delete next.homeworkDescEn;
      delete next.sendHomeworkTo;
      delete next.selectedStudents;
      delete next.form;
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      await LiveClassSchema.validate(data, { abortEarly: false });
      setErrors({});
      if (!schoolBranchId) {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: 'common.errorOccurred',
        });
        return;
      }

      const homeworkDescription = data.addHomework
        ? data.homeworkDescAr || data.homeworkDescEn || ''
        : '';
      const selectedSubjectName =
        subjectOptions.find((option) => option.value === data.subject)?.label ||
        t(`${base}.homework`);
      const request: CreateLessonRequest = {
        lessonsStudent:
          data.addHomework && data.sendHomeworkTo === 'specific'
            ? data.selectedStudents.map((student) => ({ studentId: student.id }))
            : undefined,
        materialId: data.subject,
        classworkFromPage: Number(data.classWorkFromPage) || 0,
        bookId: data.book,
        applyToAllWeeks: false,
        endTime: data.toTime,
        homeworkFromPage: data.addHomework ? Number(data.homeworkFromPage) || 0 : 0,
        isHomeworkForAllStudents: !data.addHomework || data.sendHomeworkTo === 'all',
        isDirectLesson: true,
        homeworkDescription,
        homeworkDescriptionAr: data.addHomework ? data.homeworkDescAr || undefined : undefined,
        homeworkDescriptionEn: data.addHomework ? data.homeworkDescEn || undefined : undefined,
        homeworkName: data.addHomework ? homeworkDescription || selectedSubjectName : undefined,
        classroomId: data.grade,
        date: buildLiveClassDateTime(data.fromTime, initialData?.date),
        startTime: data.fromTime,
        addHomework: data.addHomework,
        gradeId: data.stage,
        classworkToPage: Number(data.classWorkToPage) || 0,
        homeworkToPage: data.addHomework ? Number(data.homeworkToPage) || 0 : 0,
        teacherId: data.teacher,
        schoolBranchesId: schoolBranchId,
      };

      let result: LessonMutationResult;
      if (isEdit && initialData?.id) {
        const updateRequest: UpdateLessonRequest = {
          ...request,
          id: initialData.id,
          attachments: existingAttachments,
        };
        result = await dispatch(
          updateLessonWithAttachments({ data: updateRequest, attachmentFiles: data.attachments })
        ).unwrap();
      } else {
        result = await dispatch(
          createLesson({ data: request, attachmentFiles: data.attachments })
        ).unwrap();
      }

      if (result?.isSuccess === false) {
        const apiErrors = getApiValidationErrors(result);
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          scrollToFirstError(apiErrors);
          return;
        }

        setShowPopupMessage({
          show: true,
          type: 'error',
          message: getBackendErrorMessage(result.message),
          isMessageRaw: !BACKEND_ERROR_MESSAGES[result.message || ''],
        });
        return;
      }

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: isEdit ? `${base}.updatedSuccessfully` : `${base}.createdSuccessfully`,
      });
    } catch (error) {
      const next: Record<string, string> = {};
      if (error instanceof ValidationError) {
        error.inner.forEach((item) => {
          if (item.path && !next[item.path]) next[item.path] = item.message;
        });
        setErrors(next);
        scrollToFirstError(next);
        return;
      }
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: typeof error === 'string' ? error : 'common.errorOccurred',
        isMessageRaw: typeof error === 'string',
      });
    }
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={titleKey} />

      <Card>
        <div className="flex flex-col gap-6">
          {/* Timing + subject/teacher + stage/grade */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <FormField
              label={t(`${base}.fromTime`)}
              required
              name="fromTime"
              error={errors.fromTime}
            >
              <Input
                type="time"
                value={data.fromTime}
                onChange={(e) => set('fromTime')(e.target.value)}
                icon={<CustomImage src={ClockIcon} className="h-5 w-5" />}
              />
            </FormField>
            <FormField label={t(`${base}.toTime`)} required name="toTime" error={errors.toTime}>
              <Input
                type="time"
                value={data.toTime}
                onChange={(e) => set('toTime')(e.target.value)}
                icon={<CustomImage src={ClockIcon} className="h-5 w-5" />}
              />
            </FormField>

            <FormField label={t(`${base}.subject`)} required name="subject" error={errors.subject}>
              <CustomSelect
                value={data.subject}
                onChange={(v) => {
                  setData((prev) => ({ ...prev, subject: v as string, book: '' }));
                  setErrors({});
                }}
                options={subjectOptions}
                placeholder={t(`${base}.subjectPlaceholder`)}
                error={!!errors.subject}
              />
            </FormField>
            <FormField label={t(`${base}.teacher`)} required name="teacher" error={errors.teacher}>
              <CustomSelect
                value={data.teacher}
                onChange={(v) => set('teacher')(v as string)}
                options={teacherOptions}
                placeholder={t(`${base}.teacherPlaceholder`)}
                error={!!errors.teacher}
              />
            </FormField>

            <FormField label={t(`${base}.stage`)} required name="stage" error={errors.stage}>
              <CustomSelect
                value={data.stage}
                onChange={(v) => {
                  setData((prev) => ({
                    ...prev,
                    stage: v as string,
                    grade: '',
                    book: '',
                    selectedStudents: [],
                  }));
                  setErrors({});
                }}
                options={stageOptions}
                placeholder={t(`${base}.stagePlaceholder`)}
                showSearch={false}
                error={!!errors.stage}
              />
            </FormField>
            <FormField label={t(`${base}.grade`)} required name="grade" error={errors.grade}>
              <CustomSelect
                value={data.grade}
                onChange={(v) => {
                  setData((prev) => ({ ...prev, grade: v as string, selectedStudents: [] }));
                  setErrors({});
                }}
                options={gradeOptions}
                placeholder={t(`${base}.gradePlaceholder`)}
                showSearch={false}
                disabled={!data.stage}
                error={!!errors.grade}
              />
            </FormField>
          </div>

          {/* Book */}
          <FormField label={t(`${base}.book`)} required name="book" error={errors.book}>
            <CustomSelect
              value={data.book}
              onChange={(v) => set('book')(v as string)}
              options={bookOptions}
              placeholder={
                !data.subject
                  ? t(`${base}.subjectPlaceholder`)
                  : !data.stage
                    ? t(`${base}.stagePlaceholder`)
                    : isLoadingBooks
                      ? t(`${base}.loadingBooks`)
                      : bookOptions.length === 0
                        ? t(`${base}.noBooksAvailable`)
                        : t(`${base}.bookPlaceholder`)
              }
              showSearch={false}
              disabled={!data.subject || !data.stage || isLoadingBooks}
              error={!!errors.book}
            />
          </FormField>

          {/* Class work */}
          <div className="rounded-2xl border border-[#DDE0E0] p-4">
            <h3 className="mb-4 text-start text-lg font-medium text-[#0E1F1F]">
              {t(`${base}.classWork`)}
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <FormField label={t(`${base}.fromPage`)} optional name="classWorkFromPage">
                <Input
                  type="number"
                  min={1}
                  value={data.classWorkFromPage}
                  onChange={(e) => set('classWorkFromPage')(e.target.value)}
                  placeholder={t(`${base}.pagePlaceholder`)}
                />
              </FormField>
              <FormField label={t(`${base}.toPage`)} optional name="classWorkToPage">
                <Input
                  type="number"
                  min={1}
                  value={data.classWorkToPage}
                  onChange={(e) => set('classWorkToPage')(e.target.value)}
                  placeholder={t(`${base}.pagePlaceholder`)}
                />
              </FormField>
            </div>
          </div>

          {/* Homework */}
          <div className="rounded-2xl border border-[#DDE0E0] p-4">
            <div className="mb-4 flex flex-col items-start gap-2">
              <h3 className="text-start text-lg font-medium text-[#0E1F1F]">
                {t(`${base}.homework`)}
              </h3>
              <div className="flex flex-col items-start gap-2 text-base font-normal text-black-800">
                <span>{t(`${base}.addHomework`)}</span>
                <div className="flex gap-6 text-right">
                  <div className="flex items-center justify-end">
                    <label
                      htmlFor="addHomeworkSwitch"
                      className="relative inline-flex h-6 w-11 cursor-pointer items-center"
                    >
                      <input
                        id="addHomeworkSwitch"
                        type="checkbox"
                        checked={data.addHomework}
                        onChange={(event) => handleAddHomeworkChange(event.target.checked)}
                        className="peer sr-only"
                        aria-label={t(`${base}.addHomework`)}
                      />
                      <div className="peer-unchecked:bg-gray-200 h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-green-600"></div>
                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {data.addHomework && (
              <div className="flex flex-col gap-5">
                <div data-form-field="homeworkName">
                  <FormErrorMessage message={errors.homeworkName || errors.form} />
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <FormField
                    label={t(`${base}.fromPage`)}
                    optional
                    name="homeworkFromPage"
                    error={errors.homeworkFromPage}
                  >
                    <Input
                      type="number"
                      min={1}
                      value={data.homeworkFromPage}
                      onChange={(e) => set('homeworkFromPage')(e.target.value)}
                      placeholder={t(`${base}.pagePlaceholder`)}
                    />
                  </FormField>
                  <FormField
                    label={t(`${base}.toPage`)}
                    optional
                    name="homeworkToPage"
                    error={errors.homeworkToPage}
                  >
                    <Input
                      type="number"
                      min={1}
                      value={data.homeworkToPage}
                      onChange={(e) => set('homeworkToPage')(e.target.value)}
                      placeholder={t(`${base}.pagePlaceholder`)}
                    />
                  </FormField>

                  <FormField
                    label={t(`${base}.descAr`)}
                    optional
                    name="homeworkDescAr"
                    error={errors.homeworkDescAr}
                  >
                    <TextArea
                      value={data.homeworkDescAr}
                      onChange={(e) => set('homeworkDescAr')(e.target.value)}
                      placeholder={t(`${base}.descPlaceholder`)}
                    />
                  </FormField>
                  <FormField
                    label={t(`${base}.descEn`)}
                    optional
                    name="homeworkDescEn"
                    error={errors.homeworkDescEn}
                  >
                    <TextArea
                      value={data.homeworkDescEn}
                      onChange={(e) => set('homeworkDescEn')(e.target.value)}
                      placeholder={t(`${base}.descPlaceholder`)}
                    />
                  </FormField>
                </div>

                <FormField
                  label={t(`${base}.sendHomeworkTo`)}
                  required
                  name="sendHomeworkTo"
                  error={errors.sendHomeworkTo || errors.selectedStudents}
                >
                  <div className="flex items-center gap-8 pt-1">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="sendHomeworkTo"
                        value="all"
                        checked={data.sendHomeworkTo === 'all'}
                        onChange={() => {
                          setData((prev) => ({
                            ...prev,
                            sendHomeworkTo: 'all',
                            selectedStudents: [],
                          }));
                          setErrors({});
                        }}
                        className="h-4 w-4 accent-green-500"
                      />
                      <span className="text-base font-normal text-black-800">
                        {t(`${base}.all`)}
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="sendHomeworkTo"
                        value="specific"
                        checked={data.sendHomeworkTo === 'specific'}
                        onChange={() => {
                          set('sendHomeworkTo')('specific');
                          setIsStudentsPopupOpen(true);
                        }}
                        className="h-4 w-4 accent-green-500"
                      />
                      <span className="text-base font-normal text-black-800">
                        {t(`${base}.specificStudents`)}
                      </span>
                    </label>
                  </div>
                </FormField>

                {/* Selected students summary — first student + remaining count. */}
                {data.sendHomeworkTo === 'specific' && data.selectedStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsStudentsPopupOpen(true)}
                    className="mt-3 flex items-center gap-3 self-start text-start"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#DDE0E0]">
                      <CustomImage
                        src={data.selectedStudents[0].avatar || DefaultAvatar}
                        fallbackSrc={DefaultAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-normal text-[#3A3A3A]">
                      {data.selectedStudents[0].name}
                    </span>
                    {data.selectedStudents.length > 1 && (
                      <span className="text-sm font-bold text-green-500">
                        +{data.selectedStudents.length - 1}
                      </span>
                    )}
                  </button>
                )}

                {data.sendHomeworkTo === 'specific' && data.selectedStudents.length === 0 && (
                  <div className="flex">
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setIsStudentsPopupOpen(true)}
                    >
                      {t(`${base}.selectStudentsButton`)}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attachments (optional) */}
          <FileUpload
            id="live-class-attachments"
            label={t(`${base}.attachments`)}
            optional
            multiple
            uploadText={t(`${base}.uploadText`)}
            formatHints={FILE_FORMATS}
            accept={FILE_ACCEPT}
            maxSize={10}
            onFilesChange={(files) => set('attachments')(files)}
          />

          {/* Footer — pinned to the end (left in RTL) with the primary action last,
              matching the design and the CourseForm pattern. */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting
                ? t(isEdit ? 'common.updating' : 'common.saving')
                : t(isEdit ? 'common.saveChanges' : 'common.add')}
            </Button>
          </div>
        </div>
      </Card>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isMessageRaw ?? false}
        onClose={() => {
          const wasSuccess = showPopupMessage.type === 'success';
          setShowPopupMessage({ show: false, type: 'success', message: '' });
          if (wasSuccess) {
            navigate('/lms/live-classes');
          }
        }}
      />

      <SelectStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        classrooms={selectedClassrooms}
        value={data.selectedStudents.map((s) => s.id)}
        onConfirm={(students) => set('selectedStudents')(students)}
      />
    </div>
  );
}

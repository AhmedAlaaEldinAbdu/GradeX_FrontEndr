import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import Input from '@/shared/components/Input';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import SelectStudentsPopup, { type SelectedStudent } from '../popups/SelectStudentsPopup';
import type { AIExamBasicInfoProps } from '@/validations/ai-exam-validations';
import StudentAvatar from '@/assets/images/profile.png';

const EXAM_LANGUAGE_CODES = ['ar', 'en', 'de', 'fr', 'ru'];
const EXAM_LANGUAGE_LABEL_KEYS: Record<(typeof EXAM_LANGUAGE_CODES)[number], string> = {
  ar: 'eLearning.onlineExams.addAI.languageOptions.ar',
  en: 'eLearning.onlineExams.addAI.languageOptions.en',
  de: 'languageSwitcher.languages.de',
  fr: 'languageSwitcher.languages.fr',
  ru: 'languageSwitcher.languages.ru',
};

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'all', labelKey: 'eLearning.onlineExams.addAI.fields.allClasses' },
  { value: 'specific', labelKey: 'eLearning.onlineExams.addAI.fields.specificStudents' },
];

const normalizeSelectValue = (value: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? '') : value;
const normalizeMultiValue = (value: string | string[]) =>
  (Array.isArray(value) ? value : [value]).filter(Boolean);

const getNextDateValue = (dateValue?: string) => {
  if (!dateValue) return undefined;

  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

const AIExamBasicInfoStep = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId();
  const isArabic = i18n.language === 'ar';
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<AIExamBasicInfoProps>();
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([]);

  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const isLoadingAcademicSystems = useAppSelector((state) => state.academicSystems.isLoading);
  const gradesList = useAppSelector((state) => state.grades.grades);
  const isLoadingGrades = useAppSelector((state) => state.grades.isLoading);
  const classroomsList = useAppSelector((state) => state.classrooms.classrooms);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const bookGrades = useAppSelector((state) => state.books.bookGrades);
  const isLoadingBooks = useAppSelector((state) => state.books.isLoading);

  const academicSystem = useWatch({ control, name: 'academicSystem' });
  const subject = useWatch({ control, name: 'subject' });
  const grades = useWatch({ control, name: 'grades' });
  const classrooms = useWatch({ control, name: 'classrooms' });
  const studentIds = useWatch({ control, name: 'studentIds' });
  const startDate = useWatch({ control, name: 'startDate' });
  const selectedGradeIds = useMemo(() => (Array.isArray(grades) ? grades : []), [grades]);
  const selectedClassroomIds = useMemo(
    () => (Array.isArray(classrooms) ? classrooms : []),
    [classrooms]
  );
  const selectedStudentIds = useMemo(
    () => (Array.isArray(studentIds) ? studentIds : []),
    [studentIds]
  );
  const selectedGradeIdsKey = selectedGradeIds.join('|');
  const selectedClassroomIdsKey = selectedClassroomIds.join('|');

  useEffect(() => {
    dispatch(
      getAcademicSystems({
        pageIndex: 1,
        pageSize: 10000,
        ...(schoolBranchId && { schoolBranchId }),
      })
    );
    if (schoolBranchId) {
      dispatch(
        fetchSubjects({
          page: 1,
          limit: 10000,
          filters: { schoolBranchesId: schoolBranchId },
        })
      );
    }
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!academicSystem) return;

    dispatch(
      fetchGrades({
        PageIndex: 1,
        PageSize: 1000,
        AcdemicsystemId: academicSystem,
        SchoolBranchId: schoolBranchId,
      })
    );
  }, [academicSystem, dispatch, schoolBranchId]);

  useEffect(() => {
    if (!academicSystem || selectedGradeIds.length === 0) return;

    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          academicSystemId: academicSystem,
          ...(selectedGradeIds.length === 1 && { gradeId: selectedGradeIds[0] }),
          ...(schoolBranchId && { schoolBranchId }),
        },
      })
    );
  }, [academicSystem, dispatch, schoolBranchId, selectedGradeIds, selectedGradeIdsKey]);

  useEffect(() => {
    if (!subject || selectedGradeIds.length === 0) {
      setValue('bookId', '', { shouldDirty: true, shouldValidate: true });
      setValue('pageFrom', '', { shouldDirty: true, shouldValidate: true });
      setValue('pageTo', '', { shouldDirty: true, shouldValidate: true });
      return;
    }

    dispatch(
      fetchBooks({
        page: 1,
        limit: 1000,
        filters: {
          materialId: subject,
          ...(selectedGradeIds.length === 1 && { gradeId: selectedGradeIds[0] }),
          schoolBranchesId: schoolBranchId || undefined,
        },
      })
    );
  }, [dispatch, schoolBranchId, selectedGradeIds, selectedGradeIdsKey, setValue, subject]);

  useEffect(() => {
    setSelectedStudents([]);
    setValue('studentIds', [], { shouldDirty: true, shouldValidate: true });
    setValue('targetAudience', 'all', { shouldDirty: true, shouldValidate: true });
  }, [selectedClassroomIdsKey, setValue]);

  const academicSystemOptions = useMemo<CustomSelectOption[]>(
    () =>
      academicSystems
        .map((system) => ({
          value: system.id,
          label: (isArabic ? system.nameAr : system.nameEn) || system.nameAr || system.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [academicSystems, isArabic]
  );

  const gradeOptions = useMemo<CustomSelectOption[]>(
    () =>
      gradesList
        .map((grade) => ({
          value: grade.id,
          label: (isArabic ? grade.nameAr : grade.nameEn) || grade.nameAr || grade.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [gradesList, isArabic]
  );

  const classroomOptions = useMemo<CustomSelectOption[]>(() => {
    const gradeIds = new Set(selectedGradeIds);

    return classroomsList
      .filter((classroom) => gradeIds.has(classroom.gradeId))
      .map((classroom) => ({
        value: classroom.id,
        label: (isArabic ? classroom.name : classroom.nameEn) || classroom.name || classroom.nameEn,
      }))
      .filter((option) => Boolean(option.value && option.label));
  }, [classroomsList, isArabic, selectedGradeIds]);

  const subjectOptions = useMemo<CustomSelectOption[]>(
    () =>
      subjects
        .map((subject) => ({
          value: subject.id,
          label: (isArabic ? subject.name : subject.nameEn) || subject.name || subject.nameEn || '',
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [isArabic, subjects]
  );

  const bookOptions = useMemo<CustomSelectOption[]>(() => {
    const gradeIds = new Set(selectedGradeIds);
    const options = new Map<string, CustomSelectOption>();

    bookGrades.forEach((bookGrade) => {
      const matchesGrade = selectedGradeIds.length === 0 || gradeIds.has(bookGrade.gradeId);
      const matchesSubject = !subject || bookGrade.materialId === subject;

      if (!matchesGrade || !matchesSubject) return;

      bookGrade.bookDtos.forEach((book) => {
        if (!book.id || !book.name || options.has(book.id)) return;
        options.set(book.id, {
          value: book.id,
          label: book.name,
        });
      });
    });

    return Array.from(options.values());
  }, [bookGrades, selectedGradeIds, subject]);

  // Classrooms handed to the popup so it can load their students.
  const selectedClassrooms = useMemo(() => {
    const classroomIds = new Set(selectedClassroomIds);

    return classroomsList
      .filter((classroom) => classroomIds.has(classroom.id))
      .map((classroom) => ({
        id: classroom.id,
        name: (isArabic ? classroom.name : classroom.nameEn) || classroom.name || classroom.nameEn,
      }));
  }, [classroomsList, isArabic, selectedClassroomIds]);

  const languageOptions = EXAM_LANGUAGE_CODES.map((code) => ({
    value: code,
    label: t(EXAM_LANGUAGE_LABEL_KEYS[code]),
  }));
  const endDateMin = getNextDateValue(startDate);

  return (
    <div className="space-y-8">
      {/* Exam titles */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.titleAr')}
          required
          htmlFor="titleAr"
          name="titleAr"
          error={errors.titleAr?.message}
        >
          <Controller
            name="titleAr"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="titleAr"
                placeholder={t('eLearning.onlineExams.addAI.fields.titleArPlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.titleEn')}
          required
          htmlFor="titleEn"
          name="titleEn"
          error={errors.titleEn?.message}
        >
          <Controller
            name="titleEn"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="titleEn"
                placeholder={t('eLearning.onlineExams.addAI.fields.titleEnPlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      {/* Topic + language */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.topic')}
          required
          htmlFor="topic"
          name="topic"
          error={errors.topic?.message}
        >
          <Controller
            name="topic"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="topic"
                placeholder={t('eLearning.onlineExams.addAI.fields.topicPlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.language')}
          required
          htmlFor="language"
          name="language"
          error={errors.language?.message}
        >
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="language"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={languageOptions}
                placeholder={t('eLearning.onlineExams.addAI.fields.languagePlaceholder')}
                error={!!errors.language}
              />
            )}
          />
        </FormField>
      </div>

      {/* Subject + academic system */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.subject')}
          required
          htmlFor="subject"
          name="subject"
          error={errors.subject?.message}
        >
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="subject"
                value={(field.value as string) ?? ''}
                onChange={(value) => {
                  field.onChange(normalizeSelectValue(value));
                  setValue('bookId', '', { shouldDirty: true, shouldValidate: true });
                  setValue('pageFrom', '', { shouldDirty: true, shouldValidate: true });
                  setValue('pageTo', '', { shouldDirty: true, shouldValidate: true });
                }}
                options={subjectOptions}
                placeholder={
                  isLoadingSubjects
                    ? t('common.loading')
                    : t('eLearning.onlineExams.addAI.fields.subjectPlaceholder')
                }
                disabled={isLoadingSubjects}
                error={!!errors.subject}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('grades.academicSystemLabel')}
          required
          htmlFor="academicSystem"
          name="academicSystem"
          error={errors.academicSystem?.message}
        >
          <Controller
            name="academicSystem"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="academicSystem"
                value={(field.value as string) ?? ''}
                onChange={(value) => {
                  field.onChange(normalizeSelectValue(value));
                  setValue('grades', [], { shouldDirty: true, shouldValidate: true });
                  setValue('classrooms', [], { shouldDirty: true, shouldValidate: true });
                  setValue('bookId', '', { shouldDirty: true, shouldValidate: true });
                  setValue('pageFrom', '', { shouldDirty: true, shouldValidate: true });
                  setValue('pageTo', '', { shouldDirty: true, shouldValidate: true });
                  setValue('studentIds', [], { shouldDirty: true, shouldValidate: true });
                  setValue('targetAudience', 'all', { shouldDirty: true, shouldValidate: true });
                  setSelectedStudents([]);
                }}
                options={academicSystemOptions}
                placeholder={
                  isLoadingAcademicSystems ? t('common.loading') : t('grades.selectAcademicSystem')
                }
                disabled={isLoadingAcademicSystems}
                error={!!errors.academicSystem}
              />
            )}
          />
        </FormField>
      </div>

      {/* Grades + classrooms */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('requests.addMessage.gradeLabel')}
          required
          htmlFor="grades"
          name="grades"
          error={errors.grades?.message}
        >
          <Controller
            name="grades"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="grades"
                isMulti
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(value) => {
                  field.onChange(normalizeMultiValue(value));
                  setValue('classrooms', [], { shouldDirty: true, shouldValidate: true });
                  setValue('bookId', '', { shouldDirty: true, shouldValidate: true });
                  setValue('pageFrom', '', { shouldDirty: true, shouldValidate: true });
                  setValue('pageTo', '', { shouldDirty: true, shouldValidate: true });
                  setValue('studentIds', [], { shouldDirty: true, shouldValidate: true });
                  setValue('targetAudience', 'all', { shouldDirty: true, shouldValidate: true });
                  setSelectedStudents([]);
                }}
                options={gradeOptions}
                placeholder={
                  !academicSystem
                    ? t('grades.selectAcademicSystem')
                    : isLoadingGrades
                      ? t('common.loading')
                      : t('requests.addMessage.gradePlaceholder')
                }
                disabled={!academicSystem || isLoadingGrades}
                error={!!errors.grades}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('requests.addMessage.classroomLabel')}
          required
          htmlFor="classrooms"
          name="classrooms"
          error={errors.classrooms?.message}
        >
          <Controller
            name="classrooms"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="classrooms"
                isMulti
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(value) => {
                  field.onChange(normalizeMultiValue(value));
                  setValue('studentIds', [], { shouldDirty: true, shouldValidate: true });
                  setValue('targetAudience', 'all', { shouldDirty: true, shouldValidate: true });
                  setSelectedStudents([]);
                }}
                options={classroomOptions}
                placeholder={
                  selectedGradeIds.length === 0
                    ? t('requests.addMessage.selectGradeFirst')
                    : isLoadingClassrooms
                      ? t('common.loading')
                      : t('requests.addMessage.classroomPlaceholder')
                }
                disabled={selectedGradeIds.length === 0 || isLoadingClassrooms}
                error={!!errors.classrooms}
              />
            )}
          />
        </FormField>
      </div>

      {/* Book + page range */}
      <FormField
        label={t('eLearning.onlineExams.addAI.fields.book')}
        required
        htmlFor="bookId"
        name="bookId"
        error={errors.bookId?.message}
      >
        <Controller
          name="bookId"
          control={control}
          render={({ field }) => (
            <CustomSelect
              id="bookId"
              value={(field.value as string) ?? ''}
              onChange={(value) => field.onChange(normalizeSelectValue(value))}
              options={bookOptions}
              placeholder={
                !subject || selectedGradeIds.length === 0
                  ? t('eLearning.onlineExams.addAI.fields.selectSubjectAndGradeFirst')
                  : isLoadingBooks
                    ? t('eLearning.onlineExams.addAI.fields.loadingBooks')
                    : bookOptions.length === 0
                      ? t('eLearning.onlineExams.addAI.fields.noBooksAvailable')
                      : t('eLearning.onlineExams.addAI.fields.bookPlaceholder')
              }
              disabled={!subject || selectedGradeIds.length === 0 || isLoadingBooks}
              error={!!errors.bookId}
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.pageFrom')}
          required
          htmlFor="pageFrom"
          name="pageFrom"
          error={errors.pageFrom?.message}
        >
          <Controller
            name="pageFrom"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="pageFrom"
                type="number"
                min={1}
                placeholder={t('eLearning.onlineExams.addAI.fields.pageFromPlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.pageTo')}
          required
          htmlFor="pageTo"
          name="pageTo"
          error={errors.pageTo?.message}
        >
          <Controller
            name="pageTo"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="pageTo"
                type="number"
                min={1}
                placeholder={t('eLearning.onlineExams.addAI.fields.pageToPlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      {/* Target audience (radio group, full width) */}
      <div data-form-field="targetAudience">
        <span className="required mb-1 block text-start text-base font-normal text-black-800">
          {t('eLearning.onlineExams.addAI.fields.targetAudience')}
        </span>
        <Controller
          name="targetAudience"
          control={control}
          render={({ field }) => (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-8">
                {TARGET_AUDIENCE_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;
                  const isSpecificOption = option.value === 'specific';
                  const isSpecificDisabled = isSpecificOption && selectedClassroomIds.length === 0;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isSpecificDisabled}
                      onClick={() => {
                        if (isSpecificDisabled) return;

                        if (isSpecificOption) {
                          setIsStudentsOpen(true);
                        } else {
                          field.onChange(option.value);
                          setValue('studentIds', [], { shouldDirty: true, shouldValidate: true });
                          setSelectedStudents([]);
                        }
                      }}
                      className={`flex items-center gap-2 ${
                        isSpecificDisabled ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                          isSelected ? 'border-green-500' : 'border-[#878F8F]'
                        }`}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-green-500" />}
                      </span>
                      <span className="text-sm font-normal text-[#646969]">
                        {t(option.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Preview of the chosen students, shown when "specific students" is selected. */}
              {field.value === 'specific' && selectedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsStudentsOpen(true)}
                  className="flex items-center gap-3 self-start text-start"
                >
                  <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-[#E6E6E6]">
                    <CustomImage
                      src={selectedStudents[0].avatar || StudentAvatar}
                      fallbackSrc={StudentAvatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xl font-normal text-[#4D4D4D]">
                    {selectedStudents[0].name}
                  </span>
                  {selectedStudents.length > 1 && (
                    <span className="text-xl font-bold text-green-500">
                      {t('eLearning.onlineExams.addAI.moreStudents', {
                        num: selectedStudents.length - 1,
                      })}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        />
        <div data-form-field="studentIds">
          <FormErrorMessage
            message={errors.targetAudience?.message ?? errors.studentIds?.message}
          />
        </div>
      </div>

      {/* Start + end dates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.startDate')}
          required
          htmlFor="startDate"
          name="startDate"
          error={errors.startDate?.message}
        >
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="startDate"
                type="date"
                placeholder={t('eLearning.onlineExams.addAI.fields.startDatePlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.endDate')}
          required
          htmlFor="endDate"
          name="endDate"
          error={errors.endDate?.message}
        >
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="endDate"
                type="date"
                min={endDateMin}
                placeholder={t('eLearning.onlineExams.addAI.fields.endDatePlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      <SelectStudentsPopup
        isOpen={isStudentsOpen}
        onClose={() => setIsStudentsOpen(false)}
        classrooms={selectedClassrooms}
        value={selectedStudentIds}
        requireSelection
        onConfirm={(students) => {
          if (students.length === 0) return;

          setSelectedStudents(students);
          setValue('targetAudience', 'specific', { shouldDirty: true, shouldValidate: true });
          setValue(
            'studentIds',
            students.map((student) => student.id),
            { shouldDirty: true, shouldValidate: true }
          );
        }}
      />
    </div>
  );
};

export default AIExamBasicInfoStep;

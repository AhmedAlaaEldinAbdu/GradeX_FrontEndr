import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import SelectStudentsPopup, { type SelectedStudent } from '../popups/SelectStudentsPopup';
import type { QuestionBankBasicInfoProps } from '@/validations/question-bank-exam-validations';
import StudentAvatar from '@/assets/images/profile.png';

// TODO: replace these placeholder options with data from the backend.
const SUBJECT_OPTIONS = [
  { value: 'math', label: 'الرياضيات' },
  { value: 'science', label: 'العلوم' },
  { value: 'arabic', label: 'اللغة العربية' },
];
const STAGE_OPTIONS = [
  { value: 'primary', label: 'الابتدائية' },
  { value: 'intermediate', label: 'الأعدادية' },
  { value: 'secondary', label: 'الثانوية' },
];
const GRADE_OPTIONS = [
  { value: 'grade-1-2', label: 'ع 1/2' },
  { value: 'grade-2-2', label: 'ع 2/2' },
  { value: 'grade-3-2', label: 'ع 3/2' },
];
const TOTAL_POINTS_VALUES = [10, 20, 50, 100];
const DURATION_VALUES = [15, 30, 45, 60, 90, 120];

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'all', labelKey: 'eLearning.onlineExams.addQuestionBank.fields.allClasses' },
  { value: 'specific', labelKey: 'eLearning.onlineExams.addQuestionBank.fields.specificStudents' },
];

const RESULT_VISIBILITY_OPTIONS = [
  { value: 'afterExam', labelKey: 'eLearning.onlineExams.addQuestionBank.fields.resultAfterExam' },
  {
    value: 'afterEachQuestion',
    labelKey: 'eLearning.onlineExams.addQuestionBank.fields.resultAfterEachQuestion',
  },
];
const DEFAULT_RESULT_VISIBILITY = RESULT_VISIBILITY_OPTIONS[0].value;

const QuestionBankBasicInfoStep = () => {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<QuestionBankBasicInfoProps>();
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([]);

  // Classrooms handed to the popup so it can load their students.
  const grades = useWatch({ control, name: 'grades' });
  const resultVisibility = useWatch({ control, name: 'resultVisibility' });

  useEffect(() => {
    if (!resultVisibility) {
      setValue('resultVisibility', DEFAULT_RESULT_VISIBILITY, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [resultVisibility, setValue]);

  const selectedClassrooms = useMemo(() => {
    const ids = Array.isArray(grades) ? grades : [];
    return GRADE_OPTIONS.filter((option) => ids.includes(option.value)).map((option) => ({
      id: option.value,
      name: option.label,
    }));
  }, [grades]);

  const totalPointsOptions = TOTAL_POINTS_VALUES.map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const durationOptions = DURATION_VALUES.map((minutes) => ({
    value: String(minutes),
    label: `${minutes} ${t('eLearning.onlineExams.details.minuteUnit')}`,
  }));

  return (
    <div className="space-y-8">
      {/* Exam titles */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.titleAr')}
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
                placeholder={t('eLearning.onlineExams.addQuestionBank.fields.titleArPlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.titleEn')}
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
                placeholder={t('eLearning.onlineExams.addQuestionBank.fields.titleEnPlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      {/* Subject + stage */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.subject')}
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
                onChange={(value) => field.onChange(value)}
                options={SUBJECT_OPTIONS}
                placeholder={t('eLearning.onlineExams.addQuestionBank.fields.subjectPlaceholder')}
                error={!!errors.subject}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.stage')}
          required
          htmlFor="stage"
          name="stage"
          error={errors.stage?.message}
        >
          <Controller
            name="stage"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="stage"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={STAGE_OPTIONS}
                placeholder={t('eLearning.onlineExams.addQuestionBank.fields.stagePlaceholder')}
                error={!!errors.stage}
              />
            )}
          />
        </FormField>
      </div>

      {/* Grade (multi-select, full width) */}
      <FormField
        label={t('eLearning.onlineExams.addQuestionBank.fields.grade')}
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
                field.onChange(Array.isArray(value) ? value : [value]);
                setValue('targetAudience', 'all', { shouldDirty: true, shouldValidate: true });
                setSelectedStudents([]);
              }}
              options={GRADE_OPTIONS}
              placeholder={t('eLearning.onlineExams.addQuestionBank.fields.gradePlaceholder')}
              error={!!errors.grades}
            />
          )}
        />
      </FormField>

      {/* Target audience (radio group, full width) */}
      <div data-form-field="targetAudience">
        <span className="required mb-1 block text-start text-base font-normal text-black-800">
          {t('eLearning.onlineExams.addQuestionBank.fields.targetAudience')}
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
                  const isSpecificDisabled = isSpecificOption && selectedClassrooms.length === 0;

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
                      {t('eLearning.onlineExams.addQuestionBank.moreStudents', {
                        num: selectedStudents.length - 1,
                      })}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        />
        <FormErrorMessage message={errors.targetAudience?.message} />
      </div>

      {/* Start + end dates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.startDate')}
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
                placeholder={t('eLearning.onlineExams.addQuestionBank.fields.startDatePlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.endDate')}
          optional
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
                placeholder={t('eLearning.onlineExams.addQuestionBank.fields.endDatePlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      {/* Total points + duration */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.totalPoints')}
          required
          htmlFor="totalPoints"
          name="totalPoints"
          error={errors.totalPoints?.message}
        >
          <Controller
            name="totalPoints"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="totalPoints"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={totalPointsOptions}
                placeholder={t(
                  'eLearning.onlineExams.addQuestionBank.fields.totalPointsPlaceholder'
                )}
                error={!!errors.totalPoints}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.examDuration')}
          optional
          htmlFor="examDuration"
          name="duration"
          error={errors.duration?.message}
        >
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="examDuration"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={durationOptions}
                placeholder={t(
                  'eLearning.onlineExams.addQuestionBank.fields.examDurationPlaceholder'
                )}
                error={!!errors.duration}
              />
            )}
          />
        </FormField>
      </div>

      {/* Passing grade + result visibility */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addQuestionBank.fields.passingGrade')}
          required
          htmlFor="passingGrade"
          name="passingGrade"
          error={errors.passingGrade?.message}
        >
          <Controller
            name="passingGrade"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="passingGrade"
                type="number"
                min={0}
                max={100}
                placeholder={t(
                  'eLearning.onlineExams.addQuestionBank.fields.passingGradePlaceholder'
                )}
              />
            )}
          />
        </FormField>

        <div data-form-field="resultVisibility">
          <span className="required mb-1 block text-start text-base font-normal text-black-800">
            {t('eLearning.onlineExams.addQuestionBank.fields.resultVisibility')}
          </span>
          <Controller
            name="resultVisibility"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap items-center gap-8 pt-2">
                {RESULT_VISIBILITY_OPTIONS.map((option) => {
                  const isSelected = (field.value || DEFAULT_RESULT_VISIBILITY) === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className="flex items-center gap-2"
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
            )}
          />
          <FormErrorMessage message={errors.resultVisibility?.message} />
        </div>
      </div>

      <SelectStudentsPopup
        isOpen={isStudentsOpen}
        onClose={() => setIsStudentsOpen(false)}
        classrooms={selectedClassrooms}
        value={selectedStudents.map((s) => s.id)}
        requireSelection
        onConfirm={(students) => {
          if (students.length === 0) return;

          setSelectedStudents(students);
          setValue('targetAudience', 'specific', { shouldDirty: true, shouldValidate: true });
        }}
      />
    </div>
  );
};

export default QuestionBankBasicInfoStep;

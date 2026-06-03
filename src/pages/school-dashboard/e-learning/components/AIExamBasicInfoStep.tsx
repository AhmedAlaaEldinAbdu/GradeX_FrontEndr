import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import type { AIExamBasicInfoProps } from '@/validations/ai-exam-validations';
import StudentAvatar from '@/assets/images/profile.png';

const TOPIC_OPTIONS = [
  { value: 'multiplying-fractions', label: 'ضرب الكسور' },
  { value: 'division', label: 'القسمة' },
];
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
const DURATION_VALUES = [15, 30, 45, 60, 90, 120];

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'all', labelKey: 'eLearning.onlineExams.addAI.fields.allClasses' },
  { value: 'specific', labelKey: 'eLearning.onlineExams.addAI.fields.specificStudents' },
];

const SELECTED_STUDENTS_PREVIEW = {
  name: 'علي محمد',
  extraCount: 30,
  avatar: StudentAvatar,
};

const AIExamBasicInfoStep = () => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<AIExamBasicInfoProps>();

  const languageOptions = [
    { value: 'ar', label: t('eLearning.onlineExams.addAI.languageOptions.ar') },
    { value: 'en', label: t('eLearning.onlineExams.addAI.languageOptions.en') },
  ];
  const durationOptions = DURATION_VALUES.map((minutes) => ({
    value: String(minutes),
    label: `${minutes} ${t('eLearning.onlineExams.details.minuteUnit')}`,
  }));

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
              <CustomSelect
                id="topic"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={TOPIC_OPTIONS}
                placeholder={t('eLearning.onlineExams.addAI.fields.topicPlaceholder')}
                error={!!errors.topic}
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

      {/* Subject + stage */}
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
                onChange={(value) => field.onChange(value)}
                options={SUBJECT_OPTIONS}
                placeholder={t('eLearning.onlineExams.addAI.fields.subjectPlaceholder')}
                error={!!errors.subject}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.stage')}
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
                placeholder={t('eLearning.onlineExams.addAI.fields.stagePlaceholder')}
                error={!!errors.stage}
              />
            )}
          />
        </FormField>
      </div>

      {/* Grade (multi-select, full width) */}
      <FormField
        label={t('eLearning.onlineExams.addAI.fields.grade')}
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
              onChange={(value) => field.onChange(Array.isArray(value) ? value : [value])}
              options={GRADE_OPTIONS}
              placeholder={t('eLearning.onlineExams.addAI.fields.gradePlaceholder')}
              error={!!errors.grades}
            />
          )}
        />
      </FormField>

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

              {/* Preview of the chosen students, shown when "specific students" is selected. */}
              {field.value === 'specific' && (
                <div className="flex items-center gap-3">
                  <div className="h-[52px] w-[52px] overflow-hidden rounded-lg border border-[#E6E6E6]">
                    <CustomImage
                      src={SELECTED_STUDENTS_PREVIEW.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xl font-normal text-[#4D4D4D]">
                    {SELECTED_STUDENTS_PREVIEW.name}
                  </span>
                  <span className="text-xl font-bold text-green-500">
                    {t('eLearning.onlineExams.addAI.moreStudents', {
                      num: SELECTED_STUDENTS_PREVIEW.extraCount,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        />
        <FormErrorMessage message={errors.targetAudience?.message} />
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
                placeholder={t('eLearning.onlineExams.addAI.fields.endDatePlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      {/* Passing grade + duration */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.passingGrade')}
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
                placeholder={t('eLearning.onlineExams.addAI.fields.passingGradePlaceholder')}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.duration')}
          optional
          htmlFor="duration"
          name="duration"
          error={errors.duration?.message}
        >
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="duration"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={durationOptions}
                placeholder={t('eLearning.onlineExams.addAI.fields.durationPlaceholder')}
                error={!!errors.duration}
              />
            )}
          />
        </FormField>
      </div>
    </div>
  );
};

export default AIExamBasicInfoStep;

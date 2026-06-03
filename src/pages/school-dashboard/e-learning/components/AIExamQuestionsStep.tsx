import type { CSSProperties } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import Button from '@/shared/components/Button';
import { useLanguage } from '@/hooks/useLanguage';
import type { AIExamProps } from '@/validations/ai-exam-validations';

const QUESTION_COUNT_VALUES = [5, 10, 15, 20, 25, 30];
const TOTAL_POINTS_VALUES = [10, 20, 50, 100];
const DURATION_VALUES = [15, 30, 45, 60, 90, 120];

const RESULT_VISIBILITY_OPTIONS = [
  { value: 'afterExam', labelKey: 'eLearning.onlineExams.addAI.fields.resultAfterExam' },
  {
    value: 'afterEachQuestion',
    labelKey: 'eLearning.onlineExams.addAI.fields.resultAfterEachQuestion',
  },
];

const DIFFICULTY_SLIDERS = [
  { name: 'difficultyEasy', labelKey: 'eLearning.onlineExams.difficulty.easy', color: '#1A9F58' },
  {
    name: 'difficultyMedium',
    labelKey: 'eLearning.onlineExams.difficulty.medium',
    color: '#F8951B',
  },
  { name: 'difficultyHard', labelKey: 'eLearning.onlineExams.difficulty.hard', color: '#DD0417' },
] as const;

const AIExamQuestionsStep = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const {
    control,
    formState: { errors },
  } = useFormContext<AIExamProps>();

  const minuteUnit = t('eLearning.onlineExams.details.minuteUnit');
  const questionCountOptions = QUESTION_COUNT_VALUES.map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const totalPointsOptions = TOTAL_POINTS_VALUES.map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const durationOptions = DURATION_VALUES.map((minutes) => ({
    value: String(minutes),
    label: `${minutes} ${minuteUnit}`,
  }));

  return (
    <div className="space-y-8">
      {/* Number of questions + total points */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.fields.numberOfQuestions')}
          required
          htmlFor="numberOfQuestions"
          name="numberOfQuestions"
          error={errors.numberOfQuestions?.message}
        >
          <Controller
            name="numberOfQuestions"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="numberOfQuestions"
                value={(field.value as string) ?? ''}
                onChange={(value) => field.onChange(value)}
                options={questionCountOptions}
                placeholder={t('eLearning.onlineExams.addAI.fields.numberOfQuestionsPlaceholder')}
                error={!!errors.numberOfQuestions}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.fields.totalPoints')}
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
                placeholder={t('eLearning.onlineExams.addAI.fields.totalPointsPlaceholder')}
                error={!!errors.totalPoints}
              />
            )}
          />
        </FormField>
      </div>

      {/* Passing grade + exam duration */}
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
          label={t('eLearning.onlineExams.addAI.fields.examDuration')}
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
                placeholder={t('eLearning.onlineExams.addAI.fields.examDurationPlaceholder')}
                error={!!errors.duration}
              />
            )}
          />
        </FormField>
      </div>

      {/* Result visibility (radio group) */}
      <div data-form-field="resultVisibility">
        <span className="required mb-1 block text-start text-base font-normal text-black-800">
          {t('eLearning.onlineExams.addAI.fields.resultVisibility')}
        </span>
        <Controller
          name="resultVisibility"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap items-center gap-8 pt-2">
              {RESULT_VISIBILITY_OPTIONS.map((option) => {
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
                    <span className="text-sm font-normal text-[#646969]">{t(option.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
        <FormErrorMessage message={errors.resultVisibility?.message} />
      </div>

      {/* Difficulty distribution (optional sliders) */}
      <div>
        <span className="mb-1 block text-start text-base font-normal text-black-800">
          {t('eLearning.onlineExams.addAI.fields.difficultyDistribution')}
          <span className="text-sm font-normal text-gray-500"> ({t('schools.optional')}) </span>
        </span>
        <div className="space-y-4 pt-2">
          {DIFFICULTY_SLIDERS.map((slider) => (
            <div key={slider.name} className="flex items-center gap-4">
              <span className="w-16 text-start text-sm font-normal text-[#3A3A3A]">
                {t(slider.labelKey)}
              </span>
              <Controller
                name={slider.name}
                control={control}
                render={({ field }) => {
                  const value = Number(field.value) || 0;
                  const fillDirection = isRTL ? 'to right' : 'to left';
                  const trackBackground = `linear-gradient(${fillDirection}, ${slider.color} 0%, ${slider.color} ${value}%, #DDE0E0 ${value}%, #DDE0E0 100%)`;
                  return (
                    <input
                      type="range"
                      dir={isRTL ? 'ltr' : 'rtl'}
                      min={0}
                      max={100}
                      value={value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      className="difficulty-slider flex-1"
                      style={
                        {
                          '--slider-bg': trackBackground,
                          '--slider-color': slider.color,
                        } as CSSProperties
                      }
                    />
                  );
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Generate explanation toggle */}
      <Controller
        name="generateExplanation"
        control={control}
        render={({ field }) => (
          <CustomCheckbox
            checked={!!field.value}
            onChange={(checked) => field.onChange(checked)}
            label={t('eLearning.onlineExams.addAI.fields.generateExplanation')}
            textClassName="text-sm font-normal text-[#646969]"
          />
        )}
      />

      {/* Classification questions (sub-flow pending design) */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-normal text-[#0E1F1F]">
          {t('eLearning.onlineExams.addAI.fields.classificationsTitle')}
        </span>
        <Button type="button" variant="outline" size="sm" disabled>
          {t('eLearning.onlineExams.addAI.addButton')}
        </Button>
      </div>
    </div>
  );
};

export default AIExamQuestionsStep;

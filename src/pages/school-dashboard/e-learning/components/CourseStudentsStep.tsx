import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import SelectStudentsPopup from '../popups/SelectStudentsPopup';
import DefaultAvatar from '@gradex/assets/images/profile.png';

export type StudentsData = {
  stage: string;
  grades: string[];
  audience: 'all' | 'specific';
  selectedStudents: string[];
};

export const INITIAL_STUDENTS_DATA: StudentsData = {
  stage: '',
  grades: [],
  audience: 'all',
  selectedStudents: [],
};

type CourseStudentsStepProps = {
  data: StudentsData;
  onChange: (data: StudentsData) => void;
};

export default function CourseStudentsStep({ data, onChange }: CourseStudentsStepProps) {
  const { t } = useTranslation();
  const [popupOpen, setPopupOpen] = useState(false);

  const set = (partial: Partial<StudentsData>) => onChange({ ...data, ...partial });

  const stageOptions = (['prep1', 'prep2', 'prep3'] as const).map((key) => ({
    value: key,
    label: t(`eLearning.courses.add.samples.stages.${key}`),
  }));
  const gradeOptions = (['g1', 'g2', 'g3', 'g4'] as const).map((key) => ({
    value: key,
    label: t(`eLearning.courses.add.samples.grades.${key}`),
  }));

  return (
    <div className="flex flex-col gap-5">
      <FormField label={t('eLearning.courses.add.students.stage')} required>
        <CustomSelect
          value={data.stage}
          onChange={(v) => set({ stage: v as string })}
          options={stageOptions}
          placeholder={t('eLearning.courses.add.students.stagePlaceholder')}
          showSearch={false}
        />
      </FormField>

      <FormField label={t('eLearning.courses.add.students.grade')} required>
        <CustomSelect
          value={data.grades}
          onChange={(v) => set({ grades: v as string[] })}
          options={gradeOptions}
          placeholder={t('eLearning.courses.add.students.gradePlaceholder')}
          isMulti
          showSearch={false}
        />
      </FormField>

      <FormField label={t('eLearning.courses.add.students.audience')} required>
        <div className="flex items-center gap-8 pt-1">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="audience"
              value="all"
              checked={data.audience === 'all'}
              onChange={() => set({ audience: 'all', selectedStudents: [] })}
              className="h-4 w-4 accent-green-500"
            />
            <span className="text-base font-normal text-black-800">
              {t('eLearning.courses.add.students.allClasses')}
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="audience"
              value="specific"
              checked={data.audience === 'specific'}
              onChange={() => {
                set({ audience: 'specific' });
                setPopupOpen(true);
              }}
              className="h-4 w-4 accent-green-500"
            />
            <span className="text-base font-normal text-black-800">
              {t('eLearning.courses.add.students.specific')}
            </span>
          </label>
        </div>
      </FormField>

      {/* Selected students preview (only when targeting specific students) */}
      {data.audience === 'specific' && data.selectedStudents.length > 0 && (
        <button
          type="button"
          onClick={() => setPopupOpen(true)}
          className="flex items-center gap-3 self-start text-start"
        >
          {data.selectedStudents.length > 1 && (
            <span className="text-sm font-medium text-green-500">
              {t('eLearning.courses.add.students.moreStudents', {
                count: data.selectedStudents.length - 1,
              })}
            </span>
          )}
          <span className="text-base font-normal text-[#3A3A3A]">
            {t('eLearning.selectStudents.sampleStudent')}
          </span>
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#DDE0E0]">
            <CustomImage src={DefaultAvatar} alt="" className="h-full w-full object-cover" />
          </div>
        </button>
      )}

      <SelectStudentsPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        value={data.selectedStudents}
        onConfirm={(ids) => set({ selectedStudents: ids })}
      />
    </div>
  );
}

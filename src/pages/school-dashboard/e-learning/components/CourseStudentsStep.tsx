import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchClassroomsByGrade } from '@/redux/features/classrooms/classroomsSlice';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import SelectStudentsPopup from '../popups/SelectStudentsPopup';

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
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';
  const schoolBranchId = getCurrentSchoolBranchId();
  const [popupOpen, setPopupOpen] = useState(false);

  const grades = useAppSelector((s) => s.grades.grades);
  const gradeClassrooms = useAppSelector((s) => s.classrooms.gradeClassrooms);
  const isLoadingClassrooms = useAppSelector((s) => s.classrooms.isLoadingGradeClassrooms);

  // Stage (grade level) options come from the grades endpoint.
  useEffect(() => {
    if (schoolBranchId) dispatch(fetchGrades(schoolBranchId));
  }, [dispatch, schoolBranchId]);

  // When returning to the step with a stage already chosen, reload its classrooms.
  useEffect(() => {
    if (data.stage) dispatch(fetchClassroomsByGrade(data.stage));
  }, [dispatch, data.stage]);

  const set = (partial: Partial<StudentsData>) => onChange({ ...data, ...partial });

  const handleStageChange = (gradeId: string) => {
    // Switching stage invalidates the previously picked classrooms/students.
    // The effect above reloads this stage's classrooms once `data.stage` updates.
    set({ stage: gradeId, grades: [], selectedStudents: [] });
  };

  const stageOptions = useMemo(
    () => grades.map((g) => ({ value: g.id, label: isArabic ? g.nameAr : g.nameEn })),
    [grades, isArabic]
  );

  // الصف options are the classrooms that belong to the selected stage.
  const gradeOptions = useMemo(
    () =>
      gradeClassrooms.map((c) => ({ value: c.id, label: isArabic ? c.name : c.nameEn || c.name })),
    [gradeClassrooms, isArabic]
  );

  // The classrooms actually picked — handed to the popup so it can load their students.
  const selectedClassrooms = useMemo(
    () =>
      gradeClassrooms
        .filter((c) => data.grades.includes(c.id))
        .map((c) => ({ id: c.id, name: isArabic ? c.name : c.nameEn || c.name })),
    [gradeClassrooms, data.grades, isArabic]
  );

  return (
    <div className="flex flex-col gap-5">
      <FormField label={t('eLearning.courses.add.students.stage')} required>
        <CustomSelect
          value={data.stage}
          onChange={(v) => handleStageChange(v as string)}
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
          disabled={!data.stage || isLoadingClassrooms}
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

      {/* Selected students summary (only when targeting specific students) */}
      {data.audience === 'specific' && data.selectedStudents.length > 0 && (
        <button
          type="button"
          onClick={() => setPopupOpen(true)}
          className="self-start text-start text-sm font-medium text-green-500"
        >
          {t('eLearning.courses.add.selectedCount', { count: data.selectedStudents.length })}
        </button>
      )}

      <SelectStudentsPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        classrooms={selectedClassrooms}
        value={data.selectedStudents}
        onConfirm={(ids) => set({ selectedStudents: ids })}
      />
    </div>
  );
}

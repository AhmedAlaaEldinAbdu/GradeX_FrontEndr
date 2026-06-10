import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';

export type BasicInfoData = {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  subject: string;
  teacher: string;
  startDate: string;
  endDate: string;
  lessonsCount: string;
  lessonDuration: string;
  coverImage: File | null;
  /** Existing cover URL (edit mode display only). */
  coverImageUrl?: string;
};

export const INITIAL_BASIC_INFO_DATA: BasicInfoData = {
  nameAr: '',
  nameEn: '',
  descAr: '',
  descEn: '',
  subject: '',
  teacher: '',
  startDate: '',
  endDate: '',
  lessonsCount: '',
  lessonDuration: '',
  coverImage: null,
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

const LESSONS_COUNT_VALUES = Array.from({ length: 30 }, (_, i) => String(i + 1));
const LESSON_DURATION_VALUES = ['15', '30', '45', '60'];

/** Build select options from a base list, ensuring the current value is always present. */
const withSelectedValue = (base: string[], current: string) => {
  const values =
    current && !base.includes(current)
      ? [...base, current].sort((a, b) => Number(a) - Number(b))
      : base;
  return values.map((v) => ({ value: v, label: v }));
};

type CourseBasicInfoStepProps = {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
};

export default function CourseBasicInfoStep({ data, onChange }: CourseBasicInfoStepProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';
  const schoolBranchId = getCurrentSchoolBranchId();

  const materials = useAppSelector((s) => s.subjects.subjects);
  const teachers = useAppSelector((s) => s.teachers.teachers);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(fetchTeachers({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
  }, [dispatch, schoolBranchId]);

  const subjectOptions = useMemo(
    () => materials.map((m) => ({ value: m.id, label: m.name })),
    [materials]
  );
  const teacherOptions = useMemo(
    () => teachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
    [teachers]
  );

  const lessonsCountOptions = useMemo(
    () => withSelectedValue(LESSONS_COUNT_VALUES, data.lessonsCount),
    [data.lessonsCount]
  );
  const lessonDurationOptions = useMemo(
    () => withSelectedValue(LESSON_DURATION_VALUES, data.lessonDuration),
    [data.lessonDuration]
  );

  const set = (key: keyof BasicInfoData) => (value: string) => onChange({ ...data, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      <FormField label={t('eLearning.courses.add.fields.nameAr')} required>
        <Input
          value={data.nameAr}
          onChange={(e) => set('nameAr')(e.target.value)}
          placeholder={t('eLearning.courses.add.fields.nameArPlaceholder')}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.nameEn')} required>
        <Input
          value={data.nameEn}
          onChange={(e) => set('nameEn')(e.target.value)}
          placeholder={t('eLearning.courses.add.fields.nameEnPlaceholder')}
        />
      </FormField>

      <FormField label={t('eLearning.courses.add.fields.descAr')} optional>
        <TextArea
          value={data.descAr}
          onChange={(e) => set('descAr')(e.target.value)}
          placeholder={t('eLearning.courses.add.fields.descArPlaceholder')}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.descEn')} optional>
        <TextArea
          value={data.descEn}
          onChange={(e) => set('descEn')(e.target.value)}
          placeholder={t('eLearning.courses.add.fields.descEnPlaceholder')}
        />
      </FormField>

      <FormField label={t('eLearning.courses.add.fields.subject')} required>
        <CustomSelect
          value={data.subject}
          onChange={(v) => set('subject')(v as string)}
          options={subjectOptions}
          placeholder={t('eLearning.courses.add.fields.subjectPlaceholder')}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.teacher')} required>
        <CustomSelect
          value={data.teacher}
          onChange={(v) => set('teacher')(v as string)}
          options={teacherOptions}
          placeholder={t('eLearning.courses.add.fields.teacherPlaceholder')}
        />
      </FormField>

      <FormField label={t('eLearning.courses.add.fields.startDate')} required>
        <Input
          type="date"
          value={data.startDate}
          onChange={(e) => set('startDate')(e.target.value)}
          placeholder={t('eLearning.courses.add.fields.startDatePlaceholder')}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.endDate')} optional>
        <Input
          type="date"
          value={data.endDate}
          onChange={(e) => set('endDate')(e.target.value)}
          placeholder={t('eLearning.courses.add.fields.endDatePlaceholder')}
        />
      </FormField>

      <FormField label={t('eLearning.courses.add.fields.lessonsCount')} required>
        <CustomSelect
          value={data.lessonsCount}
          onChange={(v) => set('lessonsCount')(v as string)}
          options={lessonsCountOptions}
          placeholder={t('eLearning.courses.add.fields.lessonsCountPlaceholder')}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.lessonDuration')} optional>
        <CustomSelect
          value={data.lessonDuration}
          onChange={(v) => set('lessonDuration')(v as string)}
          options={lessonDurationOptions}
          placeholder={t('eLearning.courses.add.fields.lessonDurationPlaceholder')}
          showSearch={false}
        />
      </FormField>

      <div className="md:col-span-2">
        <FileUpload
          id="course-cover"
          label={t('eLearning.courses.add.fields.cover')}
          required
          uploadText={t('eLearning.courses.add.uploadText')}
          formatHints={FILE_FORMATS}
          accept={FILE_ACCEPT}
          maxSize={10}
          fileName={data.coverImageUrl ? data.coverImageUrl.split('/').pop() : undefined}
          fileUrl={data.coverImageUrl}
          onChange={(e) =>
            // Selecting a new cover replaces the existing one (drop the old URL preview).
            onChange({ ...data, coverImage: e.target.files?.[0] ?? null, coverImageUrl: undefined })
          }
          onDelete={() => onChange({ ...data, coverImage: null, coverImageUrl: undefined })}
        />
      </div>
    </div>
  );
}

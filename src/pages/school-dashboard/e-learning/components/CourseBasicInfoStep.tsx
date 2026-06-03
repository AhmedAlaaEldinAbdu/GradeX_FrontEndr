import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';

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

const LESSONS_COUNT_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const LESSON_DURATION_OPTIONS = ['15', '30', '45', '60'].map((v) => ({ value: v, label: v }));

type CourseBasicInfoStepProps = {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
};

export default function CourseBasicInfoStep({ data, onChange }: CourseBasicInfoStepProps) {
  const { t } = useTranslation();

  const set = (key: keyof BasicInfoData) => (value: string) => onChange({ ...data, [key]: value });

  const subjectOptions = [{ value: 'math', label: t('eLearning.courses.add.samples.subject') }];
  const teacherOptions = [{ value: 'ahmed', label: t('eLearning.courses.add.samples.teacher') }];

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
          showSearch={false}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.teacher')} required>
        <CustomSelect
          value={data.teacher}
          onChange={(v) => set('teacher')(v as string)}
          options={teacherOptions}
          placeholder={t('eLearning.courses.add.fields.teacherPlaceholder')}
          showSearch={false}
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
          options={LESSONS_COUNT_OPTIONS}
          placeholder={t('eLearning.courses.add.fields.lessonsCountPlaceholder')}
        />
      </FormField>
      <FormField label={t('eLearning.courses.add.fields.lessonDuration')} optional>
        <CustomSelect
          value={data.lessonDuration}
          onChange={(v) => set('lessonDuration')(v as string)}
          options={LESSON_DURATION_OPTIONS}
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
        />
      </div>
    </div>
  );
}

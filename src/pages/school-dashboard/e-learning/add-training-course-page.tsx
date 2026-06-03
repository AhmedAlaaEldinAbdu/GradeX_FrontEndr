import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import StepIndicator from '@/shared/components/StepIndicator';
import EmptyState from '@/shared/components/EmptyState';
import CustomImage from '@/shared/components/CustomImage';
import SelectStudentsPopup from './popups/SelectStudentsPopup';
import DocumentEditOutlineIcon from '@gradex/assets/icons/DocumentEditOutline.svg';
import PeopleOutlineIcon from '@gradex/assets/icons/PeopleOutline.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import BookOpenBadgeIcon from '@gradex/assets/icons/BookOpenBadge.svg';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

type CourseForm = {
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

const INITIAL_FORM: CourseForm = {
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

const TOTAL_STEPS = 3;

export default function AddTrainingCoursePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CourseForm>(INITIAL_FORM);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);

  const update = (key: keyof CourseForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.courses.title'), path: '/lms/courses' },
    { label: t('eLearning.courses.add.title') },
  ];

  const steps = [
    {
      id: 1,
      label: t('eLearning.courses.add.steps.basic'),
      icon: <CustomImage src={DocumentEditOutlineIcon} alt="" className="h-5 w-5" />,
    },
    {
      id: 2,
      label: t('eLearning.courses.add.steps.students'),
      icon: <CustomImage src={PeopleOutlineIcon} alt="" className="h-5 w-5" />,
    },
    {
      id: 3,
      label: t('eLearning.courses.add.steps.lectures'),
      icon: <CustomImage src={BookIcon} alt="" className="h-5 w-5" />,
    },
  ];

  const subjectOptions = [{ value: 'math', label: 'مادة الرياضيات' }];
  const teacherOptions = [{ value: 'ahmed', label: 'أحمد معتز حسن' }];
  const lessonsCountOptions = Array.from({ length: 30 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));
  const lessonDurationOptions = ['15', '30', '45', '60'].map((v) => ({ value: v, label: v }));

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step — submission will be wired to the API in a later step.
      navigate('/lms/courses');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="eLearning.courses.add.title" />

      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Step 1 — basic information */}
      {currentStep === 1 && (
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <FormField label={t('eLearning.courses.add.fields.nameAr')} required>
              <Input
                value={form.nameAr}
                onChange={(e) => update('nameAr')(e.target.value)}
                placeholder={t('eLearning.courses.add.fields.nameArPlaceholder')}
              />
            </FormField>
            <FormField label={t('eLearning.courses.add.fields.nameEn')} required>
              <Input
                value={form.nameEn}
                onChange={(e) => update('nameEn')(e.target.value)}
                placeholder={t('eLearning.courses.add.fields.nameEnPlaceholder')}
              />
            </FormField>

            <FormField label={t('eLearning.courses.add.fields.descAr')} optional>
              <TextArea
                value={form.descAr}
                onChange={(e) => update('descAr')(e.target.value)}
                placeholder={t('eLearning.courses.add.fields.descArPlaceholder')}
              />
            </FormField>
            <FormField label={t('eLearning.courses.add.fields.descEn')} optional>
              <TextArea
                value={form.descEn}
                onChange={(e) => update('descEn')(e.target.value)}
                placeholder={t('eLearning.courses.add.fields.descEnPlaceholder')}
              />
            </FormField>

            <FormField label={t('eLearning.courses.add.fields.subject')} required>
              <CustomSelect
                value={form.subject}
                onChange={(v) => update('subject')(v as string)}
                options={subjectOptions}
                placeholder={t('eLearning.courses.add.fields.subjectPlaceholder')}
                showSearch={false}
              />
            </FormField>
            <FormField label={t('eLearning.courses.add.fields.teacher')} required>
              <CustomSelect
                value={form.teacher}
                onChange={(v) => update('teacher')(v as string)}
                options={teacherOptions}
                placeholder={t('eLearning.courses.add.fields.teacherPlaceholder')}
                showSearch={false}
              />
            </FormField>

            <FormField label={t('eLearning.courses.add.fields.startDate')} required>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update('startDate')(e.target.value)}
                placeholder={t('eLearning.courses.add.fields.startDatePlaceholder')}
              />
            </FormField>
            <FormField label={t('eLearning.courses.add.fields.endDate')} optional>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => update('endDate')(e.target.value)}
                placeholder={t('eLearning.courses.add.fields.endDatePlaceholder')}
              />
            </FormField>

            <FormField label={t('eLearning.courses.add.fields.lessonsCount')} required>
              <CustomSelect
                value={form.lessonsCount}
                onChange={(v) => update('lessonsCount')(v as string)}
                options={lessonsCountOptions}
                placeholder={t('eLearning.courses.add.fields.lessonsCountPlaceholder')}
              />
            </FormField>
            <FormField label={t('eLearning.courses.add.fields.lessonDuration')} optional>
              <CustomSelect
                value={form.lessonDuration}
                onChange={(v) => update('lessonDuration')(v as string)}
                options={lessonDurationOptions}
                placeholder={t('eLearning.courses.add.fields.lessonDurationPlaceholder')}
                showSearch={false}
              />
            </FormField>

            <div className="md:col-span-2">
              <FileUpload
                label={t('eLearning.courses.add.fields.cover')}
                required
                uploadText={t('eLearning.courses.add.uploadText')}
                formatHints={[
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
                ]}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
              />
            </div>
          </div>

          <NavButtons
            currentStep={currentStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onCancel={() => navigate('/lms/courses')}
          />
        </Card>
      )}

      {/* Step 2 — students */}
      {currentStep === 2 && (
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
          <div className="flex flex-col items-center gap-4 py-6">
            {selectedStudents.length > 0 ? (
              <p className="text-base font-normal text-[#3A3A3A]">
                {t('eLearning.courses.add.selectedCount', { count: selectedStudents.length })}
              </p>
            ) : (
              <p className="text-base font-normal text-[#646969]">
                {t('eLearning.courses.add.studentsPlaceholder')}
              </p>
            )}
            <Button variant="outline" imgSrc={PlusIcon} onClick={() => setStudentsOpen(true)}>
              {t('eLearning.courses.add.selectStudents')}
            </Button>
          </div>

          <NavButtons
            currentStep={currentStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onCancel={() => navigate('/lms/courses')}
          />
        </Card>
      )}

      {/* Step 3 — lectures */}
      {currentStep === 3 && (
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
          <EmptyState
            icon={
              <CustomImage
                src={BookOpenBadgeIcon}
                alt=""
                className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
              />
            }
            description={t('eLearning.courses.add.lecturesPlaceholder')}
          />

          <NavButtons
            currentStep={currentStep}
            isLast
            onPrevious={handlePrevious}
            onNext={handleNext}
            onCancel={() => navigate('/lms/courses')}
          />
        </Card>
      )}

      <SelectStudentsPopup
        isOpen={studentsOpen}
        onClose={() => setStudentsOpen(false)}
        value={selectedStudents}
        onConfirm={setSelectedStudents}
      />
    </div>
  );
}

function NavButtons({
  currentStep,
  isLast = false,
  onPrevious,
  onNext,
  onCancel,
}: {
  currentStep: number;
  isLast?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex items-center justify-between">
      <div>
        {currentStep > 1 && (
          <Button variant="outline" onClick={onPrevious}>
            {t('common.previous')}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={onNext}>
          {isLast ? t('common.save') : t('common.next')}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

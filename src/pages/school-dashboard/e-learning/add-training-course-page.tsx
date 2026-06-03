import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import StepIndicator from '@/shared/components/StepIndicator';
import CustomImage from '@/shared/components/CustomImage';
import CourseBasicInfoStep, {
  INITIAL_BASIC_INFO_DATA,
  type BasicInfoData,
} from './components/CourseBasicInfoStep';
import CourseStudentsStep, {
  INITIAL_STUDENTS_DATA,
  type StudentsData,
} from './components/CourseStudentsStep';
import CourseLecturesStep, {
  INITIAL_LECTURES_DATA,
  type LecturesData,
} from './components/CourseLecturesStep';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import PeopleSolidIcon from '@gradex/assets/icons/PeopleSolid.svg';
import ContractGrayIcon from '@gradex/assets/icons/ContractGray.svg';

const TOTAL_STEPS = 3;

export default function AddTrainingCoursePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>(INITIAL_BASIC_INFO_DATA);
  const [students, setStudents] = useState<StudentsData>(INITIAL_STUDENTS_DATA);
  const [lectures, setLectures] = useState<LecturesData>(INITIAL_LECTURES_DATA);

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
      icon: <CustomImage src={FilesFillGreenIcon} alt="" className="h-6 w-6" />,
    },
    {
      id: 2,
      label: t('eLearning.courses.add.steps.students'),
      icon: <CustomImage src={PeopleSolidIcon} alt="" className="h-6 w-6" />,
    },
    {
      id: 3,
      label: t('eLearning.courses.add.steps.lectures'),
      icon: <CustomImage src={ContractGrayIcon} alt="" className="h-6 w-6" />,
    },
  ];

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

      <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
        {/* Step 1 — basic information */}
        {currentStep === 1 && <CourseBasicInfoStep data={basicInfo} onChange={setBasicInfo} />}

        {/* Step 2 — students */}
        {currentStep === 2 && <CourseStudentsStep data={students} onChange={setStudents} />}

        {/* Step 3 — lectures */}
        {currentStep === 3 && <CourseLecturesStep data={lectures} onChange={setLectures} />}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/lms/courses')}>
              {t('common.cancel')}
            </Button>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                {t('common.previous')}
              </Button>
            )}
            <Button variant="primary" onClick={handleNext}>
              {currentStep === TOTAL_STEPS ? t('common.add') : t('common.next')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

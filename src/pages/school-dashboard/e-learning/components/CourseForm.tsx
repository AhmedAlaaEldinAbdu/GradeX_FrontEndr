import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import StepIndicator from '@/shared/components/StepIndicator';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { useToast } from '@/shared/context/ToastContext';
import {
  createSchoolCourse,
  updateSchoolCourse,
  fetchSchoolCourseById,
} from '@/redux/features/school-course/schoolCourseSlice';
import type { CreateSchoolCourseRequest } from '@/services/api/types/school-course.types';
import CourseBasicInfoStep, {
  INITIAL_BASIC_INFO_DATA,
  type BasicInfoData,
} from './CourseBasicInfoStep';
import CourseStudentsStep, { INITIAL_STUDENTS_DATA, type StudentsData } from './CourseStudentsStep';
import CourseLecturesStep, { INITIAL_LECTURES_DATA, type LecturesData } from './CourseLecturesStep';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import PeopleSolidIcon from '@gradex/assets/icons/PeopleSolid.svg';
import ContractGrayIcon from '@gradex/assets/icons/ContractGray.svg';

const TOTAL_STEPS = 3;

export type CourseFormMode = 'add' | 'edit';

const toIso = (date: string): string => (date ? new Date(date).toISOString() : '');

type CourseFormProps = {
  mode: CourseFormMode;
};

export default function CourseForm({ mode }: CourseFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();

  const isEdit = mode === 'edit';
  const titleKey = isEdit ? 'eLearning.courses.edit.title' : 'eLearning.courses.add.title';
  const schoolBranchId = getCurrentSchoolBranchId();

  const isCreating = useAppSelector((s) => s.schoolCourses.isCreating);
  const isUpdating = useAppSelector((s) => s.schoolCourses.isUpdating);
  const currentCourse = useAppSelector((s) => s.schoolCourses.currentCourse);
  const isSubmitting = isCreating || isUpdating;

  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>(INITIAL_BASIC_INFO_DATA);
  const [students, setStudents] = useState<StudentsData>(INITIAL_STUDENTS_DATA);
  const [lectures, setLectures] = useState<LecturesData>(INITIAL_LECTURES_DATA);

  // Edit mode: load the course, then prefill the basic-info step from it.
  useEffect(() => {
    if (isEdit && id) dispatch(fetchSchoolCourseById(id));
  }, [isEdit, id, dispatch]);

  useEffect(() => {
    if (!isEdit || !currentCourse || currentCourse.id !== id) return;
    setBasicInfo({
      nameAr: currentCourse.nameAr ?? '',
      nameEn: currentCourse.nameEn ?? '',
      descAr: currentCourse.descriptionAr ?? '',
      descEn: currentCourse.descriptionEn ?? '',
      subject: currentCourse.materialId ?? '',
      teacher: currentCourse.teacherId ?? '',
      startDate: currentCourse.startDate ? currentCourse.startDate.slice(0, 10) : '',
      endDate: currentCourse.endDate ? currentCourse.endDate.slice(0, 10) : '',
      lessonsCount: currentCourse.totalLectures != null ? String(currentCourse.totalLectures) : '',
      lessonDuration:
        currentCourse.lectureDuration != null ? String(currentCourse.lectureDuration) : '',
      coverImage: null,
      coverImageUrl: currentCourse.coverImage ?? undefined,
    });
  }, [isEdit, currentCourse, id]);

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.courses.title'), path: '/lms/courses' },
    { label: t(titleKey) },
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

  const buildPayload = (): CreateSchoolCourseRequest => ({
    nameAr: basicInfo.nameAr,
    nameEn: basicInfo.nameEn,
    descriptionAr: basicInfo.descAr || undefined,
    descriptionEn: basicInfo.descEn || undefined,
    startDate: toIso(basicInfo.startDate),
    endDate: basicInfo.endDate ? toIso(basicInfo.endDate) : undefined,
    materialId: basicInfo.subject,
    teacherId: basicInfo.teacher,
    schoolBranchId: schoolBranchId ?? '',
    totalLectures: Number(basicInfo.lessonsCount) || 0,
    lectureDuration: basicInfo.lessonDuration ? Number(basicInfo.lessonDuration) : undefined,
    coverImage: basicInfo.coverImage,
    classRoomIds: students.grades,
    studentIds: students.audience === 'specific' ? students.selectedStudents : [],
    isCourseForAllStudents: students.audience === 'all',
    lectures:
      lectures.source === 'manual'
        ? lectures.items.map((lecture) => ({
            nameAr: lecture.nameAr,
            nameEn: lecture.nameEn,
            duration: lecture.duration ? Number(lecture.duration) : undefined,
            video: lecture.video,
            attachments: lecture.attachments,
          }))
        : [],
  });

  const submit = async () => {
    if (!schoolBranchId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      return;
    }
    try {
      const payload = buildPayload();
      if (isEdit && id) {
        await dispatch(updateSchoolCourse({ ...payload, id })).unwrap();
      } else {
        await dispatch(createSchoolCourse(payload)).unwrap();
      }
      navigate('/lms/courses');
    } catch (error) {
      showToast({ message: (error as string) || t('common.errorOccurred'), type: 'error' });
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      void submit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={titleKey} />

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
            <Button variant="primary" onClick={handleNext} loading={isSubmitting}>
              {currentStep === TOTAL_STEPS
                ? isEdit
                  ? t('common.save')
                  : t('common.add')
                : t('common.next')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

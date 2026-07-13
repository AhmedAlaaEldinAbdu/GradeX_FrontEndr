import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationError } from 'yup';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import StepIndicator from '@/shared/components/StepIndicator';
import CustomImage from '@/shared/components/CustomImage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
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
import CourseLecturesStep, {
  INITIAL_LECTURES_DATA,
  type Lecture,
  type LecturesData,
} from './CourseLecturesStep';
import {
  CourseBasicInfoSchema,
  CourseLecturesSchema,
  CourseStudentsSchema,
} from '@/validations/course-validations';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import PeopleSolidIcon from '@gradex/assets/icons/PeopleSolid.svg';
import ContractGrayIcon from '@gradex/assets/icons/ContractGray.svg';

const TOTAL_STEPS = 3;

export type CourseFormMode = 'add' | 'edit';

const toIso = (date: string): string => (date ? new Date(date).toISOString() : '');

type BasicInfoErrors = Partial<Record<keyof BasicInfoData, string>>;
type StudentsErrors = Partial<Record<keyof StudentsData, string>>;
type LecturesErrors = {
  items?: Array<Partial<Record<keyof Lecture, string>>>;
};
type CourseStepErrors = BasicInfoErrors | StudentsErrors | LecturesErrors;
type CourseValidationSchema<TValues> = {
  validate: (values: TValues, options: { abortEarly: boolean }) => Promise<unknown>;
};

const normalizeValidationPath = (path: string) => path.replace(/\[(\d+)\]/g, '.$1');

const setNestedError = (target: Record<string, unknown>, path: string, message: string) => {
  const parts = normalizeValidationPath(path).split('.').filter(Boolean);
  let current: Record<string, unknown> | unknown[] = target;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const nextPart = parts[index + 1];
    const nextIsArrayIndex = nextPart !== undefined && /^\d+$/.test(nextPart);

    if (isLast) {
      if (Array.isArray(current)) {
        current[Number(part)] = message;
      } else {
        current[part] = message;
      }
      return;
    }

    if (Array.isArray(current)) {
      const arrayIndex = Number(part);
      if (!current[arrayIndex]) current[arrayIndex] = nextIsArrayIndex ? [] : {};
      current = current[arrayIndex] as Record<string, unknown> | unknown[];
      return;
    }

    if (!current[part]) current[part] = nextIsArrayIndex ? [] : {};
    current = current[part] as Record<string, unknown> | unknown[];
  });
};

const getValidationErrors = (error: unknown): CourseStepErrors => {
  if (!(error instanceof ValidationError)) return {};

  const errors: Record<string, unknown> = {};
  const validationErrors = error.inner.length > 0 ? error.inner : [error];

  validationErrors.forEach((validationError) => {
    if (!validationError.path) return;
    setNestedError(errors, validationError.path, validationError.message);
  });

  return errors as CourseStepErrors;
};

const validateStep = async <TValues, TErrors extends CourseStepErrors>(
  schema: CourseValidationSchema<TValues>,
  values: TValues
) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} as TErrors };
  } catch (error) {
    return { isValid: false, errors: getValidationErrors(error) as TErrors };
  }
};

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
  const [basicInfoErrors, setBasicInfoErrors] = useState<BasicInfoErrors>({});
  const [studentsErrors, setStudentsErrors] = useState<StudentsErrors>({});
  const [lecturesErrors, setLecturesErrors] = useState<LecturesErrors>({});
  const scrollToFirstError = useScrollToFirstError();

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

    setStudents({
      stage: currentCourse.gradeId ? [currentCourse.gradeId] : [],
      grades: (currentCourse.courseClassRooms ?? []).map((c) => c.classRoomId),
      audience: currentCourse.isCourseForAllStudents ? 'all' : 'specific',
      selectedStudents: (currentCourse.courseStudents ?? []).map((s) => ({
        id: s.studentId,
        name: s.studentFullName,
      })),
    });

    const lectureItems = (currentCourse.lectures ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((lecture) => ({
        id: lecture.id,
        nameAr: lecture.nameAr ?? '',
        nameEn: lecture.nameEn ?? '',
        duration: lecture.durationInMinutes != null ? String(lecture.durationInMinutes) : '',
        video: null,
        videoUrl: lecture.videoUrl ?? undefined,
        videoName: lecture.videoName ?? undefined,
        attachments: [],
        existingAttachments: lecture.attachments ?? [],
      }));
    setLectures({
      source: 'manual',
      items: lectureItems.length ? lectureItems : INITIAL_LECTURES_DATA.items,
      selectedCourseId: '',
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
    studentIds:
      students.audience === 'specific' ? students.selectedStudents.map((s) => s.id) : [],
    isCourseForAllStudents: students.audience === 'all',
    lectures: lectures.items.map((lecture, index) => ({
      // Temp client ids (newLecture) start with "lec-"; omit so the API creates them.
      id: lecture.id.startsWith('lec-') ? undefined : lecture.id,
      nameAr: lecture.nameAr,
      nameEn: lecture.nameEn,
      durationInMinutes: lecture.duration ? Number(lecture.duration) : undefined,
      sortOrder: index,
      sourceType: 0,
      video: lecture.video,
      attachments: lecture.attachments,
    })),
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

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      if (currentStep === 1) {
        const result = await validateStep<BasicInfoData, BasicInfoErrors>(
          CourseBasicInfoSchema,
          basicInfo
        );
        setBasicInfoErrors(result.errors);
        if (!result.isValid) {
          scrollToFirstError(result.errors as Record<string, unknown>);
          return;
        }
      }

      if (currentStep === 2) {
        const result = await validateStep<StudentsData, StudentsErrors>(
          CourseStudentsSchema,
          students
        );
        setStudentsErrors(result.errors);
        if (!result.isValid) {
          scrollToFirstError(result.errors as Record<string, unknown>);
          return;
        }
      }

      setCurrentStep((prev) => prev + 1);
    } else {
      const result = await validateStep<LecturesData, LecturesErrors>(
        CourseLecturesSchema,
        lectures
      );
      setLecturesErrors(result.errors);
      if (!result.isValid) {
        scrollToFirstError(result.errors as Record<string, unknown>);
        return;
      }

      void submit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleBasicInfoChange = (next: BasicInfoData) => {
    setBasicInfo(next);
    if (Object.keys(basicInfoErrors).length > 0) setBasicInfoErrors({});
  };

  const handleStudentsChange = (next: StudentsData) => {
    setStudents(next);
    if (Object.keys(studentsErrors).length > 0) setStudentsErrors({});
  };

  const handleLecturesChange = (next: LecturesData) => {
    setLectures(next);
    if (Object.keys(lecturesErrors).length > 0) setLecturesErrors({});
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={titleKey} />

      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
        {/*
          All steps stay mounted (inactive ones hidden) so transient widget state —
          e.g. the FileUpload previews for the cover image and lecture videos — survives
          navigating between steps.
        */}
        {/* Step 1 — basic information */}
        <div className={currentStep === 1 ? '' : 'hidden'}>
          <CourseBasicInfoStep
            data={basicInfo}
            onChange={handleBasicInfoChange}
            errors={basicInfoErrors}
          />
        </div>

        {/* Step 2 — students */}
        <div className={currentStep === 2 ? '' : 'hidden'}>
          <CourseStudentsStep
            data={students}
            onChange={handleStudentsChange}
            errors={studentsErrors}
          />
        </div>

        {/* Step 3 — lectures */}
        <div className={currentStep === 3 ? '' : 'hidden'}>
          <CourseLecturesStep
            data={lectures}
            onChange={handleLecturesChange}
            errors={lecturesErrors}
          />
        </div>

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
            <Button variant="primary" onClick={() => void handleNext()} loading={isSubmitting}>
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

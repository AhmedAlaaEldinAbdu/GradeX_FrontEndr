import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Loading from '@/shared/components/Loading';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSchoolCourseById } from '@/redux/features/school-course/schoolCourseSlice';
import CourseStudentsViewPopup from './popups/CourseStudentsViewPopup';
import LearningCover from '@gradex/assets/images/Learning.png';
import DefaultAvatar from '@gradex/assets/images/profile.png';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const resolveUrl = (path?: string | null): string =>
  path ? (path.startsWith('http') ? path : `${BASE_URL}/${path.replace(/^\/+/, '')}`) : '';

const formatDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-black-900">{label}:</span>
      <div className="text-sm font-normal text-[#646969]">{children}</div>
    </div>
  );
}

export default function CourseDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const isArabic = i18n.language === 'ar';

  const course = useAppSelector((s) => s.schoolCourses.currentCourse);
  const isLoading = useAppSelector((s) => s.schoolCourses.isLoading);
  const [studentsOpen, setStudentsOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchSchoolCourseById(id));
  }, [dispatch, id]);

  const loaded = course && course.id === id;
  const name = loaded ? (isArabic ? course.nameAr : course.nameEn) || course.nameAr : '';

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.courses.title'), path: '/lms/courses' },
    { label: name },
  ];

  if (isLoading && !loaded) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <Loading />
      </div>
    );
  }

  if (!loaded) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <Card className="rounded-3xl border border-black-100" padding="md">
          <p className="py-10 text-center text-sm text-[#646969]">{t('common.noDataFound')}</p>
        </Card>
      </div>
    );
  }

  const subjectName = (isArabic ? course.materialNameAr : course.materialNameEn) || '';
  const stageName = (isArabic ? course.gradeName : course.gradeNameEn) || '';
  const description = (isArabic ? course.descriptionAr : course.descriptionEn) || '';
  const dateRange = [formatDate(course.startDate), formatDate(course.endDate)]
    .filter(Boolean)
    .join(' - ');
  const lessons = `${course.totalLectures ?? 0} ${t('eLearning.courses.lessonsUnit')} / ${
    course.lectureDuration ?? 0
  } ${t('eLearning.courses.details.perLessonDuration')}`;
  const students = course.courseStudents ?? [];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={name} />

      <div className="space-y-6">
        {/* Cover */}
        <div className="h-[280px] w-full overflow-hidden rounded-3xl">
          <CustomImage
            src={resolveUrl(course.coverImage) || LearningCover}
            fallbackSrc={LearningCover}
            alt={name}
            className="h-[150px] w-full object-cover sm:h-[250px] md:h-[350px]"
          />
        </div>

        {/* Info */}
        <Card className="rounded-3xl border border-black-100" padding="lg">
          <div className="flex flex-col gap-6">
            <h3 className="text-start text-base font-medium text-black-900">{name}</h3>

            <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
              <InfoRow label={t('eLearning.courses.add.fields.teacher')}>
                <UserAvatarName
                  name={course.teacherFullName ?? ''}
                  align="start"
                  size="sm"
                  onView={
                    course.teacherId ? () => navigate(`/teachers/${course.teacherId}`) : undefined
                  }
                />
              </InfoRow>

              <InfoRow label={t('eLearning.courses.details.date')}>{dateRange}</InfoRow>

              <InfoRow label={t('eLearning.courses.details.subjectName')}>{subjectName}</InfoRow>

              <InfoRow label={t('eLearning.courses.add.fields.lessonsCount')}>{lessons}</InfoRow>
            </div>

            <InfoRow label={t('eLearning.courses.details.description')}>
              <p className="leading-relaxed">{description}</p>
            </InfoRow>

            {stageName && (
              <InfoRow label={t('eLearning.courses.add.students.stage')}>{stageName}</InfoRow>
            )}

            {(course.courseClassRooms?.length ?? 0) > 0 && (
              <InfoRow label={t('eLearning.courses.details.grade')}>
                <div className="flex flex-wrap gap-2">
                  {course.courseClassRooms?.map((c) => (
                    <Badge key={c.classRoomId} variant="success" size="sm">
                      {isArabic ? c.classRoomName : c.classRoomNameEn || c.classRoomName}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            )}

            {/* Students */}
            <InfoRow label={t('eLearning.selectStudents.title')}>
              {course.isCourseForAllStudents ? (
                <span>{t('eLearning.courses.add.students.allClasses')}</span>
              ) : students.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setStudentsOpen(true)}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#DDE0E0]">
                    <CustomImage
                      src={DefaultAvatar}
                      fallbackSrc={DefaultAvatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[#3A3A3A]">{students[0].studentFullName}</span>
                  {students.length > 1 && (
                    <span className="font-medium text-green-500">
                      {t('eLearning.courses.add.students.moreStudents', {
                        count: students.length - 1,
                      })}
                    </span>
                  )}
                </button>
              ) : (
                <span>-</span>
              )}
            </InfoRow>
          </div>
        </Card>

        {/* Lectures */}
        {(course.lectures?.length ?? 0) > 0 && (
          <Card className="rounded-3xl border border-black-100" padding="lg">
            <div className="flex flex-col gap-6">
              <h3 className="text-start text-base font-medium text-black-900">
                {t('eLearning.courses.details.lectures')}
              </h3>

              <div className="space-y-6">
                {course.lectures?.map((lecture) => (
                  <div key={lecture.id} className="rounded-xl border border-black-100 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <h4 className="text-sm font-medium text-black-900">
                        {isArabic ? lecture.nameAr : lecture.nameEn}
                      </h4>
                      |
                      {lecture.durationInMinutes && (
                        <p className="text-xs text-[#646969]">
                          {lecture.durationInMinutes}{' '}
                          {t('eLearning.courses.details.perLessonDuration')}
                        </p>
                      )}
                    </div>

                    {/* Video */}
                    {lecture.videoUrl && (
                      <div className="mb-4">
                        <ExistingFileDisplay
                          filePath={lecture.videoUrl}
                          fileName={lecture.videoName || 'Video'}
                          className="mb-2"
                          showDownloadButton={false}
                        />
                      </div>
                    )}

                    {/* Attachments */}
                    {(lecture.attachments?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <p className="flex text-xs font-medium text-black-900">
                          {t('common.attachments')}
                        </p>
                        {lecture.attachments?.map((attachment, idx) => (
                          <ExistingFileDisplay
                            key={idx}
                            filePath={attachment.fileUrl}
                            fileName={attachment.fileName}
                            className="mb-2"
                            showViewButton={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CourseStudentsViewPopup
        isOpen={studentsOpen}
        onClose={() => setStudentsOpen(false)}
        students={students}
      />
    </div>
  );
}

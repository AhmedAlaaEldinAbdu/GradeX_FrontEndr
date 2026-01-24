import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import Loading from '@/shared/components/Loading';
import { useAppSelector } from '@/hooks/useRedux';
import { teacherApiService } from '@/services/api/teachers/teachers.service';
import { STATIC_SCHOOL_BRANCH_ID } from '@/redux/features/teacher-attendance/teacherAttendanceSlice';
import type { TeacherAssignmentListItem } from '@/types/teacherAssignment';

interface PersonalDataTabProps {
  teacherId: string;
  isActive?: boolean;
}

export default function PersonalDataTab({ teacherId, isActive = true }: PersonalDataTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  // Redux state for personal data
  const teacherPersonalData = useAppSelector((state) => state.teachers.teacherPersonalData);
  const isLoadingPersonalData = useAppSelector((state) => state.teachers.isLoadingPersonalData);
  const personalDataError = useAppSelector((state) => state.teachers.personalDataError);

  // Local state for assignment data
  const [assignmentsData, setAssignmentsData] = useState<TeacherAssignmentListItem[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  // Fetch assignments when component becomes active
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !isActive) return;

      setIsLoadingAssignments(true);
      try {
        const data = await teacherApiService.getTeacherAssignmentList({
          TeacherId: teacherId,
          SchoolBranchesId: STATIC_SCHOOL_BRANCH_ID,
        });
        if (data?.teacherAssignmentDto) {
          setAssignmentsData(data.teacherAssignmentDto);
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [teacherId, isActive]);

  // Helper functions for placement info
  const getGradeName = (assignment: TeacherAssignmentListItem) =>
    currentLang === 'ar'
      ? assignment.gradeNameAR
      : assignment.gradeNameEN || assignment.gradeNameAR;

  const getMaterialName = (assignment: TeacherAssignmentListItem) =>
    currentLang === 'ar'
      ? assignment.materialNameAR
      : assignment.materialNameEN || assignment.materialNameAR;

  const getOrdinal = (num: number, lang: 'ar' | 'en') => {
    if (lang === 'ar') {
      const ordinals = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
      return ordinals[num - 1] || num.toString();
    } else {
      const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
      return ordinals[num - 1] || num.toString();
    }
  };

  // Aggregate placement data
  const allSubjects = [...new Set(assignmentsData.map((a) => getMaterialName(a)).filter(Boolean))];
  const allGrades = [...new Set(assignmentsData.map((a) => getGradeName(a)).filter(Boolean))];
  const allClassrooms = assignmentsData.flatMap((a) => a.classrooms || []);
  const uniqueClassrooms = allClassrooms.filter(
    (classroom, index, self) => index === self.findIndex((c) => c.id === classroom.id)
  );
  const booksByMaterial = assignmentsData.map((assignment, index) => ({
    materialName: getMaterialName(assignment),
    materialIndex: index + 1,
    books: assignment.books || [],
  }));

  if (!isActive || (isLoadingPersonalData && !teacherPersonalData)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (personalDataError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{personalDataError}</p>
      </div>
    );
  }

  if (!teacherPersonalData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">{t('common.noData')}</p>
      </div>
    );
  }

  const { personalData, qualifications, trainingCourses, languages, technicalSkill, attachment } =
    teacherPersonalData;

  const addressParts = [
    personalData.districtName,
    personalData.streetName,
    personalData.buildingNumber,
    currentLang === 'ar' ? personalData.cityAR : personalData.cityEn,
    currentLang === 'ar' ? personalData.regionAr : personalData.regionEn,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : t('common.notAvailable');

  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US');
    } catch {
      return t('common.notAvailable');
    }
  };

  const attachmentsList = [];
  if (attachment.resumeFile) {
    attachmentsList.push({
      id: 'resume',
      name: t('teachers.details.resume'),
      type: 'pdf' as const,
      size: '',
      url: attachment.resumeFile,
    });
  }
  attachment.qualificationcertificateUrls?.forEach((url, index) => {
    attachmentsList.push({
      id: `qual-${index}`,
      name: `${t('teachers.details.qualificationCertificate')} ${index + 1}`,
      type: 'pdf' as const,
      size: '',
      url,
    });
  });
  attachment.trainingCoursecertificateUrls?.forEach((url, index) => {
    attachmentsList.push({
      id: `training-${index}`,
      name: `${t('teachers.details.trainingCertificate')} ${index + 1}`,
      type: 'pdf' as const,
      size: '',
      url,
    });
  });

  return (
    <div className="space-y-6">
      {/* Placement Info Card */}
      {assignmentsData.length > 0 && (
        <Card>
          <div className="space-y-4">
            {/* Subjects and Grades Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* All Subjects */}
              <div className="text-start">
                <span className="text-sm text-gray-600">{t('teachers.placement.subject')}: </span>
                <span className="font-medium text-gray-900">
                  {allSubjects.length > 0 ? allSubjects.join(' - ') : t('common.notAvailable')}
                </span>
              </div>

              {/* All Educational Stages */}
              <div className="text-start">
                <span className="text-sm text-gray-600">{t('teachers.placement.stage')}: </span>
                <span className="font-medium text-gray-900">
                  {allGrades.length > 0 ? allGrades.join(' - ') : t('common.notAvailable')}
                </span>
              </div>
            </div>

            {/* All Classrooms Row */}
            <div className="text-start">
              <span className="text-sm text-gray-600">{t('teachers.placement.classrooms')}: </span>
              <div className="mt-1 flex flex-wrap gap-2">
                {uniqueClassrooms.length > 0 ? (
                  uniqueClassrooms.map((classroom) => (
                    <span
                      key={classroom.id}
                      className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                    >
                      {currentLang === 'ar'
                        ? classroom.nameAR
                        : classroom.nameEN || classroom.nameAR}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">{t('common.notAvailable')}</span>
                )}
              </div>
            </div>

            {/* Books Section - Full-width bordered boxes grouped by material */}
            {booksByMaterial.map(
              (materialBooks, idx) =>
                materialBooks.books.length > 0 && (
                  <div key={idx} className="space-y-2 text-start">
                    {/* Books in bordered boxes */}
                    {materialBooks.books.map((book) => (
                      <div
                        key={book.id}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                      >
                        {/* Material Title */}
                        <p className="text-sm font-medium text-gray-900">
                          {t('teachers.placement.details.bookName')}{' '}
                          {booksByMaterial.length > 1
                            ? `${t('teachers.placement.details.materialPrefix')} ${getOrdinal(idx + 1, currentLang)}`
                            : ''}
                          :
                        </p>
                        <p>
                          <span className="text-sm text-gray-600">
                            {t('teachers.placement.details.bookName')}:{' '}
                          </span>
                          <span className="text-sm text-gray-900">{book.name}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>
        </Card>
      )}

      {/* Loading indicator for assignments */}
      {isLoadingAssignments && assignmentsData.length === 0 && (
        <Card>
          <div className="flex h-24 items-center justify-center">
            <Loading />
          </div>
        </Card>
      )}

      {/* Profile Picture and Attachments */}
      <Card>
        {/* Profile Picture - Centered */}
        <div className="mb-8 flex justify-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-gray-100 shadow-md">
            <CustomImage
              src={teacherPersonalData.pictureProfilePath || DefaultAvatar}
              alt={teacherPersonalData.fullName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <h3 className="mb-4 text-start text-lg font-semibold text-gray-900">
            {t('teachers.details.attachments')}
          </h3>
          {attachmentsList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {attachmentsList.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <CustomImage src={PdfIcon} alt="PDF" className="h-5 w-5" />
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      )}
                    </div>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={attachment.name}
                    className="rounded-lg p-2 text-primary-600 transition-colors hover:bg-gray-200"
                    title={t('common.download')}
                  >
                    <CustomImage src={DownloadIcon} alt="Download" className="h-5 w-5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.personalInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            label={t('teachers.details.phone')}
            value={`${personalData.countryCode} ${personalData.phoneNumber}`}
          />
          <InfoRow label={t('teachers.details.email')} value={personalData.email} />
          <InfoRow
            label={t('teachers.details.maritalStatus')}
            value={personalData.socialStatus || t('common.notAvailable')}
          />
          <InfoRow
            label={t('teachers.details.nationality')}
            value={
              (currentLang === 'ar' ? personalData.nationalAr : personalData.nationalEn) ||
              t('common.notAvailable')
            }
          />
          <InfoRow
            label={t('teachers.details.country')}
            value={
              (currentLang === 'ar' ? personalData.countryAr : personalData.countryEN) ||
              t('common.notAvailable')
            }
          />
          <InfoRow
            label={t('teachers.details.residenceCountry')}
            value={
              (currentLang === 'ar'
                ? personalData.countryOfResidenceAR
                : personalData.countryOfResidenceEN) || t('common.notAvailable')
            }
          />
          <InfoRow
            label={t('teachers.details.idNumber')}
            value={personalData.identityNumber || t('common.notAvailable')}
          />
          <InfoRow
            label={t('teachers.details.idType')}
            value={personalData.identityType || t('common.notAvailable')}
          />
          <InfoRow
            label={t('teachers.details.dateOfBirth')}
            value={formatDate(personalData.berthDate)}
          />
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <InfoRow label={t('teachers.details.address')} value={fullAddress} />
        </div>
      </Card>

      {/* Educational Qualifications */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.educationalQualifications')}
        </h3>
        {qualifications.length > 0 ? (
          qualifications.map((qualification) => (
            <div
              key={qualification.id}
              className="grid grid-cols-1 gap-y-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <InfoRow label={t('teachers.details.university')} value={qualification.university} />
              <InfoRow label={t('teachers.details.degree')} value={qualification.degree} />
              <InfoRow label={t('teachers.details.subject')} value={qualification.subject} />
              <InfoRow
                label={t('teachers.details.graduationYear')}
                value={qualification.graduationYear}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500">{t('common.noData')}</p>
        )}
      </Card>

      {/* Training Courses */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.trainingCourses')}
        </h3>
        {trainingCourses.length > 0 ? (
          trainingCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-1 gap-y-4 md:grid-cols-2">
              <InfoRow label={t('teachers.details.courseName')} value={course.courseName} />
              <InfoRow label={t('teachers.details.duration')} value={course.duration} />
            </div>
          ))
        ) : (
          <p className="text-gray-500">{t('common.noData')}</p>
        )}
      </Card>

      {/* Work Experience */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.workExperience')}
        </h3>
        <div className="space-y-4">
          <p className="text-gray-500">{t('common.notAvailable')}</p>
        </div>
      </Card>

      {/* Skills and Languages */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.skillsAndLanguages')}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="text-start">
            <p className="mb-2 text-sm text-gray-600">{t('teachers.details.languagesAndLevels')}</p>
            {languages.length > 0 ? (
              <ul className="space-y-1 text-gray-900">
                {languages.map((lang, index) => (
                  <li key={index}>
                    {lang.language}: {lang.level}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">{t('common.noData')}</p>
            )}
          </div>
          <div className="text-start">
            <p className="mb-2 text-sm text-gray-600">{t('teachers.details.computerSkills')}</p>
            {technicalSkill?.technicalApps?.length > 0 ? (
              <ul className="space-y-1 text-gray-900">
                {technicalSkill.technicalApps.map((skill, index) => (
                  <li key={index}>{skill.level ? `${skill.name} — ${skill.level}` : skill.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">{t('common.noData')}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="text-start">
      <span className="text-sm text-gray-600">{label}: </span>
      <span className="text-gray-900">
        <bdi>{value}</bdi>
      </span>
    </div>
  );
}

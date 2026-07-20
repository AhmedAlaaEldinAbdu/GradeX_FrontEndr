/**
 * Mappers: TeacherRequests API DTOs → admin-requests view models.
 *
 * TODO(api): All field names below are best-effort guesses (modeled on the
 * existing `ApplicationsJobAdvertisement` DTO). Once the real TeacherRequests
 * response schemas are provided, this file is the ONLY place that needs
 * updating — the UI components consume the stable view models.
 */
import type {
  JobApplicationRequestDto,
  TeacherMessageDto,
} from '@/services/api/types/teacher-requests.types';
import {
  type AdminMessageDto,
  type AdminMessageParty,
  AdminMessageStatus,
} from './admin-requests.types';
import type {
  JobApplicationDto,
  JobApplicationAttachment,
  JobApplicationCourse,
  JobApplicationExperience,
  JobApplicationLanguage,
  JobApplicationQualification,
  WorkType,
  EmployeeApplicationStatus,
} from './admin-requests.types';

type LooseRecord = Record<string, unknown>;

/** API host without the trailing `/api`, for building file URLs. */
const FILE_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace('/api', '');

const toFileUrl = (path: unknown): string | null => {
  if (path === null || path === undefined || path === '') return null;
  const value = String(path);
  return /^https?:\/\//.test(value) ? value : `${FILE_BASE_URL}/${value}`;
};

const str = (value: unknown, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value);

const numOr = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstDefined = (...values: unknown[]): unknown =>
  values.find((value) => value !== null && value !== undefined && value !== '');

const asArray = (value: unknown): LooseRecord[] =>
  Array.isArray(value) ? (value as LooseRecord[]) : [];

const formatDate = (value: unknown): string => {
  const raw = str(value).trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toISOString().split('T')[0];
};

const buildPeriod = (startDate: unknown, endDate: unknown, isPresent?: unknown): string => {
  const start = formatDate(startDate);
  if (!start) return '';
  if (isPresent) return `${start} - Present`;
  const end = formatDate(endDate);
  return end ? `${start} - ${end}` : start;
};

const fileNameFromPath = (path: string, fallback: string): string => {
  const clean = path.split('?')[0];
  const segments = clean.split('/').filter(Boolean);
  return segments[segments.length - 1] || fallback;
};

const mapCourse = (raw: LooseRecord): JobApplicationCourse => ({
  id: str(raw.id),
  name: str(firstDefined(raw.name, raw.courseName)),
  providerName: str(raw.providerName),
  startDate: formatDate(raw.startDate),
  endDate: formatDate(raw.endDate),
  certificateImage: toFileUrl(raw.certificateImage),
  duration:
    buildPeriod(raw.startDate, raw.endDate) || str(firstDefined(raw.duration, raw.period, '-')),
});

const mapExperience = (raw: LooseRecord): JobApplicationExperience => ({
  id: str(raw.id),
  title: str(
    firstDefined(
      raw.title,
      raw.jobTitle,
      raw.name,
      [raw.teacherLevelNameAr, raw.teacherLevelNameEn, raw.schoolName]
        .map((v) => str(v).trim())
        .filter(Boolean)
        .join(' - ')
    )
  ),
  period:
    buildPeriod(raw.startDate, raw.endDate, raw.isPresent) ||
    str(firstDefined(raw.period, raw.duration)),
  teacherLevelNameAr: str(raw.teacherLevelNameAr),
  teacherLevelNameEn: str(raw.teacherLevelNameEn),
  schoolName: str(raw.schoolName),
  startDate: formatDate(raw.startDate),
  endDate: formatDate(raw.endDate),
  isPresent: Boolean(raw.isPresent),
  attachments: asArray(raw.attachments).map((a, index) => ({
    id: str(firstDefined(a.id, index)),
    file: str(a.file),
  })),
});

const mapLanguage = (raw: LooseRecord): JobApplicationLanguage => ({
  id: str(raw.id),
  name: str(firstDefined(raw.name, raw.languageName, raw.lkLanguageNameAr, raw.lkLanguageNameEn)),
  level: str(
    firstDefined(raw.level, raw.languageLevel, raw.lkLanguageLevelNameAr, raw.lkLanguageLevelNameEn)
  ),
  nameAr: str(raw.lkLanguageNameAr),
  nameEn: str(raw.lkLanguageNameEn),
  levelAr: str(raw.lkLanguageLevelNameAr),
  levelEn: str(raw.lkLanguageLevelNameEn),
});

const mapAttachment = (raw: LooseRecord, index: number): JobApplicationAttachment => ({
  id: str(firstDefined(raw.id, raw.key), String(index)),
  name: str(firstDefined(raw.name, raw.fileName)),
  size: str(firstDefined(raw.size, raw.fileSize)),
  url: toFileUrl(firstDefined(raw.url, raw.path, raw.filePath)),
});

const joinText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) => str(item).trim())
      .filter(Boolean)
      .join(' - ');
  }
  return str(value).trim();
};

const toTeacherProfilePath = (teacherId: unknown): string | null => {
  const id = str(teacherId).trim();
  return id ? `/teaching-staff/teachers/${id}` : null;
};

const mapMessageParty = (
  dto: TeacherMessageDto,
  side: 'sender' | 'recipient'
): AdminMessageParty => {
  const isSender = side === 'sender';
  // Based on the provided DTO, the sender is always the teacher and the recipient is the school.
  // We can make this more robust if the API provides more party information.
  const isSchool = !isSender;

  return {
    name: isSender ? dto.teacherName : dto.schoolBranchNameAr,
    avatarPath: null, // Not available in the DTO
    profilePath: isSender ? toTeacherProfilePath(dto.teacherId) : null,
    isSchool,
  };
};

const mapAdminMessageStatus = (sendType: number): AdminMessageStatus => {
  // Mapping sendType to a status. This is a guess and might need adjustment.
  // 2 could mean "Sent". We'll need to see other values for other statuses.
  switch (sendType) {
    case 2:
      return AdminMessageStatus.Sent;
    // Add other cases as they become known
    default:
      return AdminMessageStatus.Pending;
  }
};

export const mapTeacherMessage = (dto: TeacherMessageDto): AdminMessageDto => {
  const isViewed = dto.isViewed === true;

  return {
    id: dto.id,
    sender: mapMessageParty(dto, 'sender'),
    recipient: mapMessageParty(dto, 'recipient'),
    status: isViewed ? AdminMessageStatus.Viewed : mapAdminMessageStatus(dto.sendType),
    stage: joinText(dto.grades) || null,
    classroom: joinText(dto.classrooms) || null,
    sentDate: dto.createdAt,
    messageContent: dto.message,
    isViewed,
    viewedAt: dto.viewedAt ?? null,
    viewedByUserId: dto.viewedByUserId ?? null,
    viewedByName: dto.viewedByName ?? null,
  };
};

/**
 * Map a TeacherRequests job-application DTO to the table/details view model.
 */
export const mapJobApplication = (dto: JobApplicationRequestDto): JobApplicationDto => {
  // Cast through `unknown`: detail fields (TODO) aren't on the list DTO yet.
  const r = dto as unknown as LooseRecord;

  const qualificationsRaw = asArray(
    firstDefined(r.qualifications, r.jobAdvertisementQualifications)
  );
  const qualifications: JobApplicationQualification[] = qualificationsRaw.map((q, index) => ({
    id: str(firstDefined(q.id, index)),
    lkQualificationId: str(q.lkQualificationId),
    qualificationNameAr: str(firstDefined(q.qualificationNameAr, q.nameAr)),
    qualificationNameEn: str(firstDefined(q.qualificationNameEn, q.nameEn)),
    countryUniversityId: str(q.countryUniversityId),
    countryUniversityNameAr: str(q.countryUniversityNameAr),
    countryUniversityNameEn: str(q.countryUniversityNameEn),
    graduationYear: firstDefined(q.graduationYear, q.graduationDate) as number | string | undefined,
    lkUniversityId: str(q.lkUniversityId),
    universityNameAr: str(q.universityNameAr),
    universityNameEn: str(q.universityNameEn),
    college: str(q.college),
  }));

  const firstQualification = qualifications[0];

  const experiencesRaw = asArray(firstDefined(r.experience, r.experiences, r.previousExperiences));
  const coursesRaw = asArray(firstDefined(r.courses, r.trainingCourses));

  const derivedAttachments: JobApplicationAttachment[] = [];

  const resumePath = toFileUrl(firstDefined(r.resumeFile, r.cvPath, r.cvUrl));
  if (resumePath) {
    derivedAttachments.push({
      id: 'resume-file',
      name: fileNameFromPath(resumePath, 'Resume'),
      size: '-',
      url: resumePath,
    });
  }

  coursesRaw.forEach((course, index) => {
    const cert = toFileUrl(course.certificateImage);
    if (cert) {
      derivedAttachments.push({
        id: str(firstDefined(course.id, `course-cert-${index}`)),
        name: fileNameFromPath(cert, `Course Certificate ${index + 1}`),
        size: '-',
        url: cert,
      });
    }
  });

  experiencesRaw.forEach((exp, expIndex) => {
    asArray(exp.attachments).forEach((att, attIndex) => {
      const file = toFileUrl(att.file);
      if (file) {
        derivedAttachments.push({
          id: str(firstDefined(att.id, `experience-att-${expIndex}-${attIndex}`)),
          name: fileNameFromPath(file, `Experience Attachment ${attIndex + 1}`),
          size: '-',
          url: file,
        });
      }
    });
  });

  return {
    id: str(firstDefined(r.applicationJobAdvertismentId, r.id)),
    applicationJobAdvertismentId: str(firstDefined(r.applicationJobAdvertismentId, r.id)),
    jobAdvertismentId: str(r.jobAdvertismentId),
    teacherId: str(r.teacherId),
    schoolBranchesId: str(firstDefined(r.schoolBranchesId, r.schoolBranchId)),
    supervisorId: str(r.supervisorId),
    announcementName: str(
      firstDefined(r.jobAdvertismentNameAr, r.jobAdvertismentNameEn, r.announcementName)
    ),
    applicantName: str(firstDefined(r.teacherFullName, r.fullName, r.applicantName)),
    applicantAvatarPath: toFileUrl(
      firstDefined(r.pictureProfilePath, r.teacherPictureProfilePath, r.teacherImagePath, r.imagePath, r.avatarPath)
    ),
    teacherPictureProfilePath: toFileUrl(
      firstDefined(r.pictureProfilePath, r.teacherPictureProfilePath, r.teacherImagePath, r.imagePath, r.avatarPath)
    ),
    role: str(
      firstDefined(
        r.subjectName,
        r.jobTitle,
        r.role,
        asArray(firstDefined(r.experience, r.experiences))[0]?.teacherLevelNameAr,
        asArray(firstDefined(r.experience, r.experiences))[0]?.teacherLevelNameEn
      )
    ),
    cvUrl: resumePath,
    workType: numOr(firstDefined(r.workShedule, r.workType)) as WorkType,
    qualification: str(
      firstDefined(
        firstQualification?.qualificationNameAr,
        firstQualification?.qualificationNameEn,
        // jobAdvertisementQualifications from the list response
        asArray(r.jobAdvertisementQualifications)[0]?.nameAr,
        asArray(r.jobAdvertisementQualifications)[0]?.nameEn,
        r.qualification
      )
    ),
    experienceYears: numOr(firstDefined(r.yearsExperience, r.experienceYears)),
    country: str(
      firstDefined(
        r.lkCountryNameAr,
        r.lkCountryNameEn,
        // jobAdvertisementCountries[0] is the fallback when lkCountryName* are null
        asArray(r.jobAdvertisementCountries)[0]?.nameAr,
        asArray(r.jobAdvertisementCountries)[0]?.nameEn,
        r.countryName,
        r.country
      )
    ),
    nationality: str(firstDefined(r.nationalityNameAr, r.nationalityNameEn, r.nationality)),
    address: str(r.address),
    email: str(firstDefined(r.teacherEmail, r.email)),
    phone: str(firstDefined(r.teacherPhoneNumber, r.phoneNumber, r.phone)),
    whatsapp: str(firstDefined(r.teacherPhoneNumber, r.phoneNumber, r.phone)),
    status: numOr(firstDefined(r.applicationStatus, r.status)) as EmployeeApplicationStatus,

    // ── Details (TODO(api): confirm once the details response is provided) ──
    maritalStatus: str(
      firstDefined(
        r.socialStatusNameAr,
        r.socialStatusNameEn,
        r.maritalStatusName,
        r.socialStatus,
        r.maritalStatus
      )
    ),
    residenceCountry: str(
      firstDefined(r.residenceCountryName, r.residenceCountry, r.lkCountryNameAr, r.lkCountryNameEn)
    ),
    nationalId: str(firstDefined(r.nationalIdentityNumber, r.identityNumber, r.nationalId)),
    birthDate: str(firstDefined(r.dateOfBirth, r.birthDate)),
    idType: str(
      firstDefined(
        r.identityTypeNameAr,
        r.identityTypeNameEn,
        r.identityTypeName,
        r.identityType,
        r.idType
      )
    ),
    university: str(
      firstDefined(
        firstQualification?.universityNameAr,
        firstQualification?.universityNameEn,
        r.universityName,
        r.university
      )
    ),
    subject: str(firstDefined(r.subjectName, r.subject)),
    graduationYear: str(
      firstDefined(firstQualification?.graduationYear, r.graduationYear, r.graduationDate)
    ),
    qualifications,
    courses: coursesRaw.map(mapCourse),
    previousExperiences: experiencesRaw.map(mapExperience),
    languages: asArray(r.languages).map(mapLanguage),
    attachments: [
      ...asArray(firstDefined(r.attachments, r.files)).map(mapAttachment),
      ...derivedAttachments,
    ],
  };
};

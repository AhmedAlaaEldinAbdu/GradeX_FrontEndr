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
  WorkType,
  JobApplicationStatus,
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

const mapCourse = (raw: LooseRecord): JobApplicationCourse => ({
  name: str(firstDefined(raw.name, raw.courseName)),
  duration: str(firstDefined(raw.duration, raw.period)),
});

const mapExperience = (raw: LooseRecord): JobApplicationExperience => ({
  title: str(firstDefined(raw.title, raw.jobTitle, raw.name)),
  period: str(firstDefined(raw.period, raw.duration)),
});

const mapLanguage = (raw: LooseRecord): JobApplicationLanguage => ({
  name: str(firstDefined(raw.name, raw.languageName)),
  level: str(firstDefined(raw.level, raw.languageLevel)),
});

const mapAttachment = (raw: LooseRecord, index: number): JobApplicationAttachment => ({
  id: str(firstDefined(raw.id, raw.key), String(index)),
  name: str(firstDefined(raw.name, raw.fileName)),
  size: str(firstDefined(raw.size, raw.fileSize)),
  url: (firstDefined(raw.url, raw.path, raw.filePath) as string | undefined) ?? null,
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
  return {
    id: dto.id,
    sender: mapMessageParty(dto, 'sender'),
    recipient: mapMessageParty(dto, 'recipient'),
    status: mapAdminMessageStatus(dto.sendType),
    stage: joinText(dto.grades) || null,
    classroom: joinText(dto.classrooms) || null,
    sentDate: dto.createdAt,
    messageContent: dto.message,
  };
};

/**
 * Map a TeacherRequests job-application DTO to the table/details view model.
 */
export const mapJobApplication = (dto: JobApplicationRequestDto): JobApplicationDto => {
  // Cast through `unknown`: detail fields (TODO) aren't on the list DTO yet.
  const r = dto as unknown as LooseRecord;

  const firstQualification = asArray(r.jobAdvertisementQualifications)[0];

  return {
    id: str(firstDefined(r.applicationJobAdvertismentId, r.id)),
    announcementName: str(
      firstDefined(r.jobAdvertismentNameAr, r.jobAdvertismentNameEn, r.announcementName)
    ),
    applicantName: str(firstDefined(r.teacherFullName, r.fullName, r.applicantName)),
    applicantAvatarPath:
      (firstDefined(r.teacherImagePath, r.imagePath, r.avatarPath) as string | undefined) ?? null,
    role: str(firstDefined(r.subjectName, r.jobTitle, r.role)),
    cvUrl: toFileUrl(firstDefined(r.resumeFile, r.cvPath, r.cvUrl)),
    workType: numOr(firstDefined(r.workShedule, r.workType)) as WorkType,
    qualification: str(
      firstDefined(firstQualification?.nameAr, firstQualification?.nameEn, r.qualification)
    ),
    experienceYears: numOr(firstDefined(r.yearsExperience, r.experienceYears)),
    country: str(firstDefined(r.lkCountryNameAr, r.lkCountryNameEn, r.countryName, r.country)),
    nationality: str(firstDefined(r.nationalityNameAr, r.nationalityNameEn, r.nationality)),
    address: str(r.address),
    email: str(firstDefined(r.teacherEmail, r.email)),
    phone: str(firstDefined(r.teacherPhoneNumber, r.phoneNumber, r.phone)),
    whatsapp: str(firstDefined(r.teacherPhoneNumber, r.phoneNumber, r.phone)),
    status: numOr(firstDefined(r.applicationStatus, r.status)) as JobApplicationStatus,

    // ── Details (TODO(api): confirm once the details response is provided) ──
    maritalStatus: str(firstDefined(r.maritalStatusName, r.maritalStatus)),
    residenceCountry: str(firstDefined(r.residenceCountryName, r.residenceCountry)),
    nationalId: str(firstDefined(r.identityNumber, r.nationalId)),
    birthDate: str(firstDefined(r.dateOfBirth, r.birthDate)),
    idType: str(firstDefined(r.identityTypeName, r.idType)),
    university: str(firstDefined(r.universityName, r.university)),
    subject: str(firstDefined(r.subjectName, r.subject)),
    graduationYear: str(firstDefined(r.graduationYear, r.graduationDate)),
    courses: asArray(firstDefined(r.courses, r.trainingCourses)).map(mapCourse),
    previousExperiences: asArray(firstDefined(r.previousExperiences, r.experiences)).map(
      mapExperience
    ),
    languages: asArray(r.languages).map(mapLanguage),
    attachments: asArray(firstDefined(r.attachments, r.files)).map(mapAttachment),
  };
};

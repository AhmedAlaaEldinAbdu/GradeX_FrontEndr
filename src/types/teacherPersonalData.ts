// ============================================================================
// Personal Data
// ============================================================================

export interface TeacherPersonalData {
  countryCode: string;
  phoneNumber: string;
  email: string;
  socialStatus: string | null;
  nationalAr: string | null;
  nationalEn: string | null;
  countryAr: string | null;
  countryEN: string | null;
  countryOfResidenceAR: string | null;
  countryOfResidenceEN: string | null;
  identityType: string | null;
  identityNumber: string | null;
  berthDate: string;
  regionAr: string | null;
  regionEn: string | null;
  cityAR: string | null;
  cityEn: string | null;
  districtName: string | null;
  streetName: string | null;
  buildingNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  locationUrl: string | null;
}

// ============================================================================
// Qualification
// ============================================================================

export interface TeacherQualification {
  id: string;
  university: string;
  degree: string;
  subject: string;
  graduationYear: string;
}

// ============================================================================
// Training Course
// ============================================================================

export interface TeacherTrainingCourse {
  id: string;
  courseName: string;
  duration: string;
}

// ============================================================================
// Language
// ============================================================================

export interface TeacherLanguage {
  language: string;
  level: string;
}

// ============================================================================
// Technical Skill
// ============================================================================

export interface TechnicalApp {
  name: string;
  level: string;
}

export interface TeacherTechnicalSkill {
  levelArabicName: string | null;
  levelEnglishName: string | null;
  technicalApps: TechnicalApp[];
}

// ============================================================================
// Attachment
// ============================================================================

export interface TeacherAttachment {
  resumeFile: string | null;
  trainingCoursecertificateUrls: string[];
  qualificationcertificateUrls: string[];
}

// ============================================================================
// Teacher Personal Data Details
// ============================================================================

export interface TeacherPersonalDataDetails {
  id: string;
  fullName: string;
  pictureProfilePath: string | null;
  personalData: TeacherPersonalData;
  qualifications: TeacherQualification[];
  trainingCourses: TeacherTrainingCourse[];
  languages: TeacherLanguage[];
  technicalSkill: TeacherTechnicalSkill;
  attachment: TeacherAttachment;
}

// ============================================================================
// API Response
// ============================================================================

export interface TeacherPersonalDataResponse {
  data: TeacherPersonalDataDetails;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface TeacherPersonalDataQueryParams {
  Id: string;
}

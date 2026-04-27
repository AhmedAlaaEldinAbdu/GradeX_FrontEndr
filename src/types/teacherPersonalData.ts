// ============================================================================
// Personal Data
// ============================================================================

export interface TeacherPersonalData {
  countryCode: string;
  phoneNumber: string;
  email: string;
  socialStatus: number | null;
  nationalAr: string | null;
  nationalEn: string | null;
  countryAr: string | null;
  countryEN: string | null;
  countryOfResidenceAR: string | null;
  countryOfResidenceEN: string | null;
  identityType: number | null;
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
  arabicName: string | null;
  englishName: string | null;
  graduationYear: number | null;
  college: string | null;
  specialty: string | null;
  qualificationStudyType: number | null;
}

// ============================================================================
// Training Course
// ============================================================================

export interface TeacherTrainingCourse {
  name: string | null;
  providerName: string | null;
  startDate: string | null;
  endDate: string | null;
}

// ============================================================================
// Language
// ============================================================================

export interface TeacherLanguage {
  arabicName: string | null;
  englishName: string | null;
  levelArabicName: string | null;
  levelEnglishName: string | null;
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
  trainingCoursecertificateUrls: Array<string | null>;
  qualificationcertificateUrls: Array<string | null>;
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
  technicalSkill: TeacherTechnicalSkill | null;
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

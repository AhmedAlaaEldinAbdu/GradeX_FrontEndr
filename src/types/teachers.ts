export interface TeacherSubject {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface TeacherEducationalStage {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface TeacherClassroom {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  lkCountryId: string | null;
  countryName: string | null;
  appLanguage: number;
  userType: number;
  email: string;
  countryCode: string | null;
  phoneNumber: string | null;
  cityId: string | null;
  cityName: string | null;
  regionId: string | null;
  regionName: string | null;
  districtName: string | null;
  streetName: string | null;
  buildingNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  locationUrl: string | null;
  token: string;
  phoneNumberConfirmed: boolean;
  pictureProfilePath: string | null;
  job: number;
  berthDate: string | null;
  nationalityId: string | null;
  nationalityName: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectNameAr?: string | null;
  subjectNameEn?: string | null;
  subjects?: TeacherSubject[];
  educationalStages?: TeacherEducationalStage[];
  classrooms?: TeacherClassroom[];
}

export interface TeacherListData {
  teachers: Teacher[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface TeacherListResponse {
  data: TeacherListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface TeacherQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SearchTerm?: string;
  SubjectId?: string;
  EducationalStageId?: string;
  ClassroomId?: string;
  SchoolBranchId?: string;
  Language?: string;
}

export interface TeacherFilters {
  SearchTerm?: string;
  subjectId?: string;
  educationalStageId?: string;
  classroomId?: string;
  schoolBranchId?: string;
  schoolBranchesId?: string;
  SchoolBranchId?: string;
  Language?: string;
}

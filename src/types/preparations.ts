export interface PreparationClassRoom {
  id: string;
  classRoomId: string;
  nameAr: string;
  nameEn: string | null;
}

export interface PreparationAttachment {
  id: string;
  fileName: string;
  filePath: string;
}

export interface Preparation {
  id: string;
  preparationNumber: number;
  schoolBrancheId: string;
  preparationDate: string;
  gradeId: string;
  gradeNameAr: string;
  gradeNameEn: string;
  classRooms: PreparationClassRoom[];
  materialId: string;
  materialNameAr: string;
  materialNameEn: string;
  topic: string;
  content: string;
  bookId: string;
  bookName: string;
  fromPage: number;
  toPage: number;
  attachments: PreparationAttachment[];
  createdby: string;
  createdName: string | null;
  teacherId: string;
  teacherName: string | null;
}

export interface PreparationListData {
  preparations: Preparation[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface PreparationListResponse {
  data: PreparationListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface PreparationQueryParams {
  schoolBranchId?: string;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  GradeId?: string;
  ClassRoomId?: string;
  Date?: string;
}

export interface CreatePreparationRequest {
  schoolBranchId: string;
  preparationNumber: number;
  preparationDate: string;
  teacherId: string;
  gradeId: string;
  classRoomIds: string[];
  materialId: string;
  topic: string;
  content: string;
  bookId?: string;
  bookName?: string;
  fromPage?: number;
  toPage?: number;
  attachments?: File[];
}

export interface UpdatePreparationRequest extends CreatePreparationRequest {
  id: string;
}

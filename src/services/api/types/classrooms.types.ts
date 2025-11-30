/**
 * Classroom Types
 * Type definitions for classroom management
 */

export interface Classroom {
    id: string;
    academicSystemId: string;
    academicSystemName: string;
    gradeId: string;
    gradeName: string;
    name: string;
    nameEn: string;
    alias: string | null;
    aliasEn: string | null;
    studentNumber: number;
    note: string | null;
    noteEn: string | null;
    imagePath: string | null;
    creationDate: string;
}

export interface ClassroomListData {
    classroomDto: Classroom[];
    totalItems: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
}

export interface ClassroomListResponse {
    data: ClassroomListData;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
}

export interface ClassroomQueryParams {
    pageIndex?: number;
    pageSize?: number;
    name?: string;
    academicSystemId?: string;
    gradeId?: string;
}

export interface ClassroomDto {
    academicSystemId: string;
    gradeId: string;
    name: string;
    nameEn: string;
    alias?: string;
    aliasEn?: string;
    studentNumber: number;
    note?: string;
    noteEn?: string;
    image?: File | string;
}

export interface CreateClassroomRequest {
    dtos: ClassroomDto[];
}

export interface UpdateClassroomRequest {
    academicSystemId: string;
    gradeId: string;
    name: string;
    nameEn: string;
    alias?: string;
    aliasEn?: string;
    note?: string;
    noteEn?: string;
    studentNumber: number;
    image?: File | string;
    imagePath?: string | null;
}

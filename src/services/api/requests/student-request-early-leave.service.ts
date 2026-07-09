import { axiosClient } from '@/lib/http';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { studentsApiService } from '@/services/api/students/students.service';
import type { ApiResponseModel } from '../config';
import type { StudentDto } from '../types/students.types';
import { getStudentFullName } from '../types/students.types';
import { StudentRequestEarlyLeaveEndpoints } from '../endpoints/student-request-early-leave-endpoints';
import type {
  CreateStudentEarlyLeaveRequest,
  EarlyLeaveRequestDto,
  EarlyLeaveStatus,
  StudentEarlyLeaveRequestApiDto,
  StudentEarlyLeaveRequestsListResponse,
  StudentEarlyLeaveRequestsQueryParams,
} from './requests.types';
import { EarlyLeaveStatus as EarlyLeaveStatusValues } from './requests.types';

type UnknownRecord = Record<string, unknown>;

type ListPayload = {
  pageIndex?: number;
  PageIndex?: number;
  pageNumber?: number;
  PageNumber?: number;
  totalPages?: number;
  TotalPages?: number;
  totalItems?: number;
  TotalItems?: number;
  totalCount?: number;
  TotalCount?: number;
  pageSize?: number;
  PageSize?: number;
  studentRequestEarlyLeaves?: StudentEarlyLeaveRequestApiDto[];
  StudentRequestEarlyLeaves?: StudentEarlyLeaveRequestApiDto[];
  studentRequestEarlyLeaveDtos?: StudentEarlyLeaveRequestApiDto[];
  StudentRequestEarlyLeaveDtos?: StudentEarlyLeaveRequestApiDto[];
  studentRequestEarlyLeaveDto?: StudentEarlyLeaveRequestApiDto[];
  StudentRequestEarlyLeaveDto?: StudentEarlyLeaveRequestApiDto[];
  studentEarlyLeaveRequests?: StudentEarlyLeaveRequestApiDto[];
  StudentEarlyLeaveRequests?: StudentEarlyLeaveRequestApiDto[];
  studentEarlyLeaveRequestDtos?: StudentEarlyLeaveRequestApiDto[];
  StudentEarlyLeaveRequestDtos?: StudentEarlyLeaveRequestApiDto[];
  earlyLeaveRequests?: StudentEarlyLeaveRequestApiDto[];
  EarlyLeaveRequests?: StudentEarlyLeaveRequestApiDto[];
  requests?: StudentEarlyLeaveRequestApiDto[];
  Requests?: StudentEarlyLeaveRequestApiDto[];
  items?: StudentEarlyLeaveRequestApiDto[];
  Items?: StudentEarlyLeaveRequestApiDto[];
  data?: StudentEarlyLeaveRequestApiDto[];
  Data?: StudentEarlyLeaveRequestApiDto[];
};

const STUDENT_NAME_KEYS = [
  'studentName',
  'StudentName',
  'studentFullName',
  'StudentFullName',
  'fullName',
  'FullName',
  'name',
  'Name',
];
const GRADE_KEYS = [
  'grade',
  'Grade',
  'gradeName',
  'GradeName',
  'gradeNameAr',
  'GradeNameAr',
  'gradeNameEn',
  'GradeNameEn',
  'gradeNameEN',
  'GradeNameEN',
  'educationalStage',
  'EducationalStage',
  'stage',
  'Stage',
];
const CLASSROOM_KEYS = [
  'classroom',
  'Classroom',
  'classroomName',
  'ClassroomName',
  'classroomNameAr',
  'ClassroomNameAr',
  'classroomNameEn',
  'ClassroomNameEn',
  'classroomNameEN',
  'ClassroomNameEN',
  'className',
  'ClassName',
];

const LIST_KEYS = [
  'studentRequestEarlyLeaves',
  'StudentRequestEarlyLeaves',
  'studentRequestEarlyLeaveDtos',
  'StudentRequestEarlyLeaveDtos',
  'studentRequestEarlyLeaveDto',
  'StudentRequestEarlyLeaveDto',
  'studentEarlyLeaveRequests',
  'StudentEarlyLeaveRequests',
  'studentEarlyLeaveRequestDtos',
  'StudentEarlyLeaveRequestDtos',
  'earlyLeaveRequests',
  'EarlyLeaveRequests',
  'requests',
  'Requests',
  'items',
  'Items',
  'data',
  'Data',
];

const serializeParams = (params?: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams.toString();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

const withSchoolBranch = (
  params?: StudentEarlyLeaveRequestsQueryParams
): StudentEarlyLeaveRequestsQueryParams => {
  const schoolBranchId = getCurrentSchoolBranchId();
  return {
    ...(params ?? {}),
    SchoolBrancheId: params?.SchoolBrancheId || schoolBranchId || undefined,
  };
};

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {};

const getValue = (source: UnknownRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in source) return source[key];
    const matchedKey = Object.keys(source).find(
      (sourceKey) => sourceKey.toLowerCase() === key.toLowerCase()
    );
    if (matchedKey) return source[matchedKey];
  }
  return undefined;
};

const pickString = (source: UnknownRecord, keys: string[]): string | null => {
  for (const key of keys) {
    const value = getValue(source, [key]);
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return null;
};

const pickNumber = (source: UnknownRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = getValue(source, [key]);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) return numericValue;
    }
  }
  return null;
};

const normalizeStatus = (status: unknown): EarlyLeaveStatus => {
  const numericStatus = Number(status);
  if (
    numericStatus === EarlyLeaveStatusValues.Pending ||
    numericStatus === EarlyLeaveStatusValues.Accepted ||
    numericStatus === EarlyLeaveStatusValues.Rejected
  ) {
    return numericStatus;
  }
  return EarlyLeaveStatusValues.Pending;
};

const formatDate = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB');
};

const parseTimeParts = (value: string | null): { hours: number; minutes: number } | null => {
  if (!value) return null;

  const timeValue = value.includes('T') ? (value.split('T')[1] ?? value) : value;
  const match = timeValue.match(/^(\d{1,2}):(\d{1,2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
};

const normalizeTime = (value: string | null): string => {
  const parts = parseTimeParts(value);
  if (!value) return '-';
  if (!parts) return value;

  return `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`;
};

const parseTimeMinutes = (value: string | null): number | null => {
  const parts = parseTimeParts(value);
  if (!parts) return null;
  const { hours, minutes } = parts;
  return hours * 60 + minutes;
};

const parseDurationMinutes = (value: string | null): number | null => {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === '-') return null;

  const timeMatch = normalized.match(/^(\d+):(\d{1,2})(?::\d{1,2})?$/);
  if (timeMatch) {
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      return hours * 60 + minutes;
    }
  }

  const hoursMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
  if (hoursMatch) {
    const hours = Number(hoursMatch[1]);
    return Number.isFinite(hours) ? Math.round(hours * 60) : null;
  }

  const minutesMatch = normalized.match(/^(\d+)\s*(m|min|mins|minute|minutes)$/);
  if (minutesMatch) {
    const minutes = Number(minutesMatch[1]);
    return Number.isFinite(minutes) ? minutes : null;
  }

  const numericDuration = Number(normalized);
  if (Number.isFinite(numericDuration)) {
    return numericDuration <= 24 ? Math.round(numericDuration * 60) : Math.round(numericDuration);
  }

  return null;
};

const calculateDurationMinutes = (
  fromTime: string | null,
  toTime: string | null
): number | null => {
  const fromMinutes = parseTimeMinutes(fromTime);
  const toMinutes = parseTimeMinutes(toTime);
  if (fromMinutes === null || toMinutes === null) return null;

  return toMinutes >= fromMinutes ? toMinutes - fromMinutes : toMinutes + 24 * 60 - fromMinutes;
};

const studentDisplayName = (student?: StudentDto): string | null => {
  if (!student) return null;
  return getStudentFullName(student) || student.name || null;
};

const needsStudentLookup = (item: StudentEarlyLeaveRequestApiDto): boolean => {
  const source = asRecord(item);
  const studentId = pickString(source, ['studentId', 'StudentId']);
  if (!studentId) return false;

  const hasName = pickString(source, STUDENT_NAME_KEYS);
  const hasGrade = pickString(source, GRADE_KEYS);
  const hasClassroom = pickString(source, CLASSROOM_KEYS);

  return !hasName || !hasGrade || !hasClassroom;
};

const fetchStudentDetails = async (
  items: StudentEarlyLeaveRequestApiDto[]
): Promise<Map<string, StudentDto>> => {
  const ids = Array.from(
    new Set(
      items
        .filter(needsStudentLookup)
        .map((item) => pickString(asRecord(item), ['studentId', 'StudentId']))
        .filter((id): id is string => Boolean(id))
    )
  );

  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const student = await studentsApiService.getStudentById(id);
        return [id, student] as const;
      } catch {
        return null;
      }
    })
  );

  return new Map(entries.filter((entry): entry is readonly [string, StudentDto] => Boolean(entry)));
};

const mapEarlyLeaveRequest = (
  item: StudentEarlyLeaveRequestApiDto,
  index: number,
  student?: StudentDto
): EarlyLeaveRequestDto => {
  const source = asRecord(item);
  const id =
    pickString(source, [
      'id',
      'Id',
      'requestId',
      'RequestId',
      'studentRequestEarlyLeaveId',
      'StudentRequestEarlyLeaveId',
    ]) ?? `early-leave-${index}`;
  const studentId = pickString(source, ['studentId', 'StudentId']) ?? student?.id ?? '';
  const fromTime = pickString(source, ['fromTime', 'FromTime']);
  const toTime = pickString(source, ['toTime', 'ToTime']);
  const time = normalizeTime(fromTime);
  const date = pickString(source, ['date', 'Date', 'requestDate', 'createdAt']);
  const grade = pickString(source, GRADE_KEYS) ?? student?.grade ?? '-';
  const classroom = pickString(source, CLASSROOM_KEYS) ?? student?.className ?? '-';
  const duration = pickString(source, ['duration', 'Duration']);
  const durationMinutes =
    parseDurationMinutes(duration) ?? calculateDurationMinutes(fromTime, toTime);

  return {
    id,
    studentId,
    studentName: pickString(source, STUDENT_NAME_KEYS) ?? studentDisplayName(student) ?? '-',
    studentAvatarPath:
      pickString(source, ['studentAvatarPath', 'studentImage', 'studentimage', 'profilePicture']) ??
      student?.profilePicture ??
      null,
    time,
    duration: duration ?? (durationMinutes === null ? '-' : String(durationMinutes)),
    fromTime,
    toTime,
    durationMinutes,
    date: formatDate(date),
    stage: grade,
    classroom,
    status: normalizeStatus(
      getValue(source, ['requestStatus', 'RequestStatus', 'status', 'Status'])
    ),
  };
};

const isLikelyEarlyLeaveItem = (value: unknown): boolean => {
  const source = asRecord(value);
  if (!Object.keys(source).length) return false;

  return Boolean(
    pickString(source, [
      'id',
      'Id',
      'requestId',
      'RequestId',
      'studentRequestEarlyLeaveId',
      'StudentRequestEarlyLeaveId',
    ]) ||
      pickString(source, ['studentId', 'StudentId']) ||
      pickString(source, ['fromTime', 'FromTime']) ||
      pickString(source, ['toTime', 'ToTime']) ||
      pickString(source, ['requestStatus', 'RequestStatus', 'status', 'Status'])
  );
};

const hasListPayload = (value: unknown, depth = 0): boolean => {
  if (Array.isArray(value)) return true;

  const data = asRecord(value);
  if (!Object.keys(data).length) return false;

  return LIST_KEYS.some((key) => {
    const candidate = getValue(data, [key]);
    return Array.isArray(candidate) || (depth < 2 && hasListPayload(candidate, depth + 1));
  });
};

const extractPayload = (responseData: unknown): unknown => {
  const envelope = asRecord(responseData);
  const dataPayload = envelope.data;
  const valuePayload = envelope.value;

  if (hasListPayload(dataPayload)) return dataPayload;
  if (hasListPayload(valuePayload)) return valuePayload;

  return dataPayload ?? valuePayload ?? responseData;
};

const extractItems = (payload: unknown, depth = 0): StudentEarlyLeaveRequestApiDto[] => {
  if (Array.isArray(payload)) return payload;

  const data = asRecord(payload) as ListPayload;
  for (const key of LIST_KEYS) {
    const list = getValue(data, [key]);
    if (Array.isArray(list)) return list;
    if (depth < 2 && hasListPayload(list)) {
      return extractItems(list, depth + 1);
    }
  }

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.some(isLikelyEarlyLeaveItem)) {
      return value as StudentEarlyLeaveRequestApiDto[];
    }
    if (depth < 2 && hasListPayload(value)) {
      const nestedList = extractItems(value, depth + 1);
      if (nestedList.length > 0) return nestedList;
    }
  }

  if (isLikelyEarlyLeaveItem(data)) return [data as StudentEarlyLeaveRequestApiDto];
  return [];
};

const buildListResponse = async (
  payload: unknown,
  params?: StudentEarlyLeaveRequestsQueryParams
): Promise<StudentEarlyLeaveRequestsListResponse> => {
  const data = asRecord(payload) as ListPayload;
  const items = extractItems(payload);
  const students = await fetchStudentDetails(items);
  const requests = items.map((item, index) => {
    const studentId = pickString(asRecord(item), ['studentId', 'StudentId']);
    return mapEarlyLeaveRequest(item, index, studentId ? students.get(studentId) : undefined);
  });

  return {
    requests,
    pageIndex:
      pickNumber(data, ['pageIndex', 'PageIndex', 'pageNumber', 'PageNumber']) ??
      params?.PageNumber ??
      1,
    totalPages:
      pickNumber(data, ['totalPages', 'TotalPages']) ??
      Math.max(1, Math.ceil(requests.length / (params?.PageSize ?? 10))),
    totalItems:
      pickNumber(data, ['totalItems', 'TotalItems', 'totalCount', 'TotalCount']) ?? requests.length,
    pageSize: pickNumber(data, ['pageSize', 'PageSize']) ?? params?.PageSize ?? 10,
  };
};

export async function getStudentEarlyLeaveRequests(
  params?: StudentEarlyLeaveRequestsQueryParams
): Promise<StudentEarlyLeaveRequestsListResponse> {
  const requestParams = withSchoolBranch(params);
  const response = await axiosClient.get<ApiResponseModel<unknown>>(
    StudentRequestEarlyLeaveEndpoints.getAll,
    { params: requestParams, paramsSerializer: { serialize: serializeParams } }
  );

  return buildListResponse(extractPayload(response.data), requestParams);
}

export async function getStudentEarlyLeaveRequestById(id: string): Promise<EarlyLeaveRequestDto> {
  const response = await axiosClient.get<ApiResponseModel<StudentEarlyLeaveRequestApiDto>>(
    StudentRequestEarlyLeaveEndpoints.getById(id)
  );
  const payload = extractPayload(response.data) as StudentEarlyLeaveRequestApiDto;
  const studentId = pickString(asRecord(payload), ['studentId', 'StudentId']);
  let student: StudentDto | undefined;

  if (studentId && needsStudentLookup(payload)) {
    try {
      student = await studentsApiService.getStudentById(studentId);
    } catch {
      student = undefined;
    }
  }

  return mapEarlyLeaveRequest(payload, 0, student);
}

export async function createStudentEarlyLeaveRequest(
  data: CreateStudentEarlyLeaveRequest
): Promise<EarlyLeaveRequestDto> {
  const formData = new FormData();
  formData.append('StudentId', data.StudentId);
  formData.append('SchoolBranchId', data.SchoolBranchId);
  formData.append('Date', data.Date);
  formData.append('FromTime', data.FromTime);
  formData.append('ToTime', data.ToTime);
  formData.append('Reason', data.Reason);

  const response = await axiosClient.post<ApiResponseModel<StudentEarlyLeaveRequestApiDto>>(
    StudentRequestEarlyLeaveEndpoints.create,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  const payload = extractPayload(response.data) as StudentEarlyLeaveRequestApiDto;
  return mapEarlyLeaveRequest(payload, 0);
}

export async function approveStudentEarlyLeaveRequest(
  id: string
): Promise<ApiResponseModel<null>> {
  const response = await axiosClient.get<ApiResponseModel<null>>(
    StudentRequestEarlyLeaveEndpoints.approve,
    { params: { Id: id } }
  );
  return response.data;
}

export async function deleteStudentEarlyLeaveRequest(id: string): Promise<ApiResponseModel<null>> {
  const formData = new FormData();
  formData.append('Id', id);

  const response = await axiosClient.delete<ApiResponseModel<null>>(
    StudentRequestEarlyLeaveEndpoints.delete,
    {
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
}

export const studentRequestEarlyLeaveApiService = {
  getStudentEarlyLeaveRequests,
  getStudentEarlyLeaveRequestById,
  createStudentEarlyLeaveRequest,
  approveStudentEarlyLeaveRequest,
  deleteStudentEarlyLeaveRequest,
};

export default studentRequestEarlyLeaveApiService;

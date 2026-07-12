import type { AxiosResponse } from 'axios';
import { axiosClient } from '@/lib/http';
import AIExamEndpoints from '../endpoints/ai-exam-endpoints';
import type {
  AIExamApiEnvelope,
  AIExamDashboardStatsQueryParams,
  AIExamDetailsQueryParams,
  AIExamStudentResult,
  AIExamStudentsResultsData,
  AIExamStudentsResultsQueryParams,
  AIExamsListQueryParams,
  CreateAIExamRequest,
  CreateAIExamResponse,
  GenerateAIExamQuestionsRequest,
  GenerateAIExamQuestionsResponse,
  GetAIExamDashboardStatsResponse,
  GetAIExamQuestionsStatsResponse,
  GetAIExamResultsDistributionResponse,
  GetAIExamSummaryResponse,
  GetAIExamStudentsResultsResponse,
  GetAIExamsResponse,
} from '../types/ai-exam.types';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getStringValue = (record: UnknownRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }

  return undefined;
};

const getNumberValue = (record: UnknownRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return undefined;
};

const getStudentsResultsArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];

  const arrayKeys = [
    'students',
    'studentResults',
    'examStudents',
    'results',
    'items',
    'data',
    'value',
  ];
  for (const key of arrayKeys) {
    const value = data[key];
    if (Array.isArray(value)) return value;
    if (isRecord(value)) {
      const nested = getStudentsResultsArray(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
};

const normalizeAIExamStudentResult = (value: unknown, index: number): AIExamStudentResult => {
  const record: UnknownRecord = isRecord(value) ? value : {};
  const nestedStudent = isRecord(record.student) ? record.student : undefined;
  const studentId =
    getStringValue(record, ['studentId', 'studentID', 'id', 'userId']) ||
    (nestedStudent ? getStringValue(nestedStudent, ['id', 'studentId', 'userId']) : undefined) ||
    `student-${index}`;
  const studentName =
    getStringValue(record, ['studentName', 'studentFullName', 'fullName', 'name']) ||
    (nestedStudent
      ? getStringValue(nestedStudent, ['studentName', 'fullName', 'name'])
      : undefined) ||
    '';
  const rating = getStringValue(record, ['rating', 'grade', 'gradeLetter', 'rate']) ?? null;
  const score = getNumberValue(record, ['score', 'percentage', 'successRate', 'totalScore']);
  const timeInSeconds = getNumberValue(record, ['timeSeconds', 'averageTimeSeconds']);
  const timeMinutes =
    getNumberValue(record, [
      'timeMinutes',
      'timeTakenMinutes',
      'averageTimeMinutes',
      'durationMinutes',
      'totalTimeMinutes',
      'timeTaken',
    ]) ?? (timeInSeconds ? Math.round(timeInSeconds / 60) : 0);

  return {
    studentId,
    studentName,
    rating,
    score: score ?? null,
    timeMinutes,
  };
};

const normalizeAIExamStudentsResults = (
  data: unknown,
  params: AIExamStudentsResultsQueryParams
): AIExamStudentsResultsData => {
  const record = isRecord(data) ? data : undefined;
  const students = getStudentsResultsArray(data).map(normalizeAIExamStudentResult);
  const pageIndex = record
    ? (getNumberValue(record, ['pageIndex', 'pageNumber', 'page']) ?? params.PageNumber ?? 1)
    : (params.PageNumber ?? 1);
  const pageSize = record
    ? (getNumberValue(record, ['pageSize', 'limit']) ?? params.PageSize ?? 10)
    : (params.PageSize ?? 10);
  const totalItems = record
    ? (getNumberValue(record, ['totalItems', 'totalCount', 'total']) ?? students.length)
    : students.length;
  const totalPages = record
    ? (getNumberValue(record, ['totalPages', 'pagesCount']) ??
      (pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0))
    : pageSize > 0
      ? Math.ceil(totalItems / pageSize)
      : 0;

  return {
    students,
    pageIndex,
    totalPages,
    totalItems,
    pageSize,
  };
};

export async function getAIExamDashboardStats(
  params: AIExamDashboardStatsQueryParams
): Promise<GetAIExamDashboardStatsResponse> {
  const response: AxiosResponse<GetAIExamDashboardStatsResponse> = await axiosClient.get(
    AIExamEndpoints.getDashboardStats,
    { params }
  );

  if (!response?.data?.data) {
    return {
      data: {
        successRate: 0,
        activeExamsCount: 0,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getAIExams(params: AIExamsListQueryParams): Promise<GetAIExamsResponse> {
  const response: AxiosResponse<GetAIExamsResponse> = await axiosClient.get(
    AIExamEndpoints.getAll,
    {
      params,
      paramsSerializer: {
        serialize: (raw) => {
          const search = new URLSearchParams();
          Object.entries(raw).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            search.append(key, String(value));
          });
          return search.toString();
        },
      },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        exams: [],
        pageIndex: params.PageNumber ?? 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params.PageSize ?? 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getAIExamSummary(
  params: AIExamDetailsQueryParams
): Promise<GetAIExamSummaryResponse> {
  const response: AxiosResponse<GetAIExamSummaryResponse> = await axiosClient.get(
    AIExamEndpoints.getExamSummary,
    { params }
  );

  if (!response?.data?.data) {
    return {
      data: null,
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getAIExamQuestionsStats(
  params: AIExamDetailsQueryParams
): Promise<GetAIExamQuestionsStatsResponse> {
  const response: AxiosResponse<GetAIExamQuestionsStatsResponse> = await axiosClient.get(
    AIExamEndpoints.getExamQuestionsStats,
    { params }
  );

  if (!response?.data?.data) {
    return {
      data: [],
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getAIExamResultsDistribution(
  params: AIExamDetailsQueryParams
): Promise<GetAIExamResultsDistributionResponse> {
  const response: AxiosResponse<GetAIExamResultsDistributionResponse> = await axiosClient.get(
    AIExamEndpoints.getExamResultsDistribution,
    { params }
  );

  if (!response?.data?.data) {
    return {
      data: [],
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getAIExamStudentsResults(
  params: AIExamStudentsResultsQueryParams
): Promise<GetAIExamStudentsResultsResponse> {
  const response: AxiosResponse<AIExamApiEnvelope<unknown>> = await axiosClient.get(
    AIExamEndpoints.getExamStudentsResults,
    {
      params,
      paramsSerializer: {
        serialize: (raw) => {
          const search = new URLSearchParams();
          Object.entries(raw).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            search.append(key, String(value));
          });
          return search.toString();
        },
      },
    }
  );

  if (!response?.data) {
    return {
      data: normalizeAIExamStudentsResults(null, params),
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return {
    data: normalizeAIExamStudentsResults(response.data.data, params),
    isSuccess: response.data.isSuccess,
    message: response.data.message,
    validationErrors: response.data.validationErrors,
  };
}

export async function generateAIExamQuestions(
  data: GenerateAIExamQuestionsRequest
): Promise<GenerateAIExamQuestionsResponse> {
  const response: AxiosResponse<GenerateAIExamQuestionsResponse> = await axiosClient.post(
    AIExamEndpoints.generateQuestions,
    data
  );
  return response.data;
}

export async function createAIExam(data: CreateAIExamRequest): Promise<CreateAIExamResponse> {
  const response: AxiosResponse<CreateAIExamResponse> = await axiosClient.post(
    AIExamEndpoints.create,
    data
  );
  return response.data;
}

export const aiExamApiService = {
  getAIExamDashboardStats,
  getAIExams,
  getAIExamSummary,
  getAIExamQuestionsStats,
  getAIExamResultsDistribution,
  getAIExamStudentsResults,
  generateAIExamQuestions,
  createAIExam,
};

export default aiExamApiService;

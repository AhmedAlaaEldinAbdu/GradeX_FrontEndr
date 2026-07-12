import type { AxiosResponse } from 'axios';
import { axiosClient } from '@/lib/http';
import AIExamEndpoints from '../endpoints/ai-exam-endpoints';
import type {
  AIExamDashboardStatsQueryParams,
  AIExamDetailsQueryParams,
  AIExamsListQueryParams,
  CreateAIExamRequest,
  CreateAIExamResponse,
  GenerateAIExamQuestionsRequest,
  GenerateAIExamQuestionsResponse,
  GetAIExamDashboardStatsResponse,
  GetAIExamQuestionsStatsResponse,
  GetAIExamResultsDistributionResponse,
  GetAIExamSummaryResponse,
  GetAIExamsResponse,
} from '../types/ai-exam.types';

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
  generateAIExamQuestions,
  createAIExam,
};

export default aiExamApiService;

import type { AxiosResponse } from 'axios';
import { axiosClient } from '@/lib/http';
import AIExamEndpoints from '../endpoints/ai-exam-endpoints';
import type {
  AIExamsListQueryParams,
  CreateAIExamRequest,
  CreateAIExamResponse,
  GenerateAIExamQuestionsRequest,
  GenerateAIExamQuestionsResponse,
  GetAIExamsResponse,
} from '../types/ai-exam.types';

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
  getAIExams,
  generateAIExamQuestions,
  createAIExam,
};

export default aiExamApiService;

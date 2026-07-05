import type { AxiosResponse } from 'axios';
import { axiosClient } from '@/lib/http';
import AIExamEndpoints from '../endpoints/ai-exam-endpoints';
import type {
  CreateAIExamRequest,
  CreateAIExamResponse,
  GenerateAIExamQuestionsRequest,
  GenerateAIExamQuestionsResponse,
} from '../types/ai-exam.types';

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
  generateAIExamQuestions,
  createAIExam,
};

export default aiExamApiService;

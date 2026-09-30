import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { GradeEndpoints } from '../endpoints/grade-endpoints';
import type {
  GradeDetailsDto,
  GradeDetailsResponse,
  GradeListResponse,
  GradeQueryParams,
  StagesWithGradesQueryParams,
  StagesWithGradesResponse,
} from '../types/grades.types';

export async function getGrades(params?: GradeQueryParams): Promise<GradeListResponse> {
  const response = await axiosClient.get<GradeListResponse>(GradeEndpoints.getGrades, { params });
  return response.data;
}

export async function getGradeById(id: string): Promise<GradeDetailsDto> {
  const response: AxiosResponse<GradeDetailsResponse> = await axiosClient.get(
    GradeEndpoints.getGradeById(id)
  );
  return response.data.value;
}

export async function getStagesWithGrades(
  params?: StagesWithGradesQueryParams
): Promise<StagesWithGradesResponse> {
  const response: AxiosResponse<StagesWithGradesResponse> = await axiosClient.get(
    GradeEndpoints.getStagesWithGrades,
    { params }
  );
  return response.data;
}

export const gradeApiService = { getGrades, getGradeById, getStagesWithGrades };
export default gradeApiService;

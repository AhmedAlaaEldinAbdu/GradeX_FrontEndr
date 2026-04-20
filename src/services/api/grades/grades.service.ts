import { axiosClient } from '@/lib/http';
import { GradeEndpoints } from '../endpoints/grade-endpoints';
import type { GradeListResponse, GradeQueryParams } from '../types/grades.types';

export async function getGrades(params?: GradeQueryParams): Promise<GradeListResponse> {
  const response = await axiosClient.get<GradeListResponse>(GradeEndpoints.getGrades, { params });
  return response.data;
}

export const gradeApiService = { getGrades };
export default gradeApiService;

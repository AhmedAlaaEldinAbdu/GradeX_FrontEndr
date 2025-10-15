/**
 * Response Interceptors
 * Transform responses before they are returned
 */

/**
 * Log responses in development mode
 */
export const responseLoggerInterceptor = async (response: Response): Promise<Response> => {
  if (import.meta.env.DEV) {
    const clonedResponse = response.clone();
    const data = await clonedResponse.json().catch(() => null);
    console.log('📥 Response:', {
      status: response.status,
      statusText: response.statusText,
      data,
    });
  }
  return response;
};

/**
 * Transform response data structure
 * Customize this based on your API response format
 */
export const responseTransformInterceptor = async (response: Response): Promise<Response> => {
  // You can add custom response transformation here
  return response;
};

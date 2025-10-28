import axios, { Method } from "axios";

interface ApiOptions {
  url: string;
  method?: Method;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api"; // ✅ fallback if not set

export const apiCall = async <T = any>(options: ApiOptions): Promise<T> => {
  try {
    const response = await axios({
      url: `${baseURL}${options.url}`,
      method: options.method || "GET",
      data: options.data || {},
      params: options.params || {},
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);

    // ✅ return structured error response instead of throwing
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.response?.data?.error || error.message || "API request failed",
      data: null,
    } as any;
  }
};

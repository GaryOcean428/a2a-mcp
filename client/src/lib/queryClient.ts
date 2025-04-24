import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiBaseUrl } from "../config";

/**
 * Helper function to throw meaningful errors for non-ok responses
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse JSON error first
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        throw new Error(errorData.error || `${res.status}: ${res.statusText}`);
      } else {
        // Fall back to text
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

/**
 * Normalized API request function that handles relative paths
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Build full URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`;
  
  console.log(`API Request: ${method} ${fullUrl}`);
  
  try {
    // Add more headers for better cross-domain cookie handling
    const res = await fetch(fullUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Essential for cookies
    });
    
    // Skip throwing for caller-handled errors
    if (!res.ok && method === 'POST' && (url === '/api/login' || url === '/api/register')) {
      return res;
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request Error: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function with proper error handling
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const urlPath = queryKey[0] as string;
      // Build full URL if it's a relative path
      const fullUrl = urlPath.startsWith('http') ? urlPath : `${getApiBaseUrl()}${urlPath}`;
      
      console.log(`Query request: ${fullUrl}`);
      
      const res = await fetch(fullUrl, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Unauthorized access handled: ${fullUrl}`);
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query request error:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth(enabled: boolean = true) {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled, // Allow disabling the query
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: 1000,
    // Only retry on network errors, not auth errors
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log authentication errors for debugging (but only if enabled)
  if (error && enabled) {
    console.log("[AUTH] Authentication check failed:", error.message);
  }

  return {
    user,
    isLoading: enabled ? isLoading : false,
    isAuthenticated: !!user,
    error: enabled ? error : null,
  };
}

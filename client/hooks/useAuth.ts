'use client';

import { useGetMeQuery } from "@/redux/features/auth/authApi";

export const useAuth = () => {
  const { data, isLoading, isError } = useGetMeQuery({});

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user,
    isError,
  };
};
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL, // ✅ dynamic
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // optional: attach token if using localStorage
      // const token = (getState() as RootState).auth.token;
      // if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['Auth'], // ✅ important

  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: '/login',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'], // ✅ refresh user data
    }),

    getMe: builder.query<User, void>({
      query: () => '/me',
      providesTags: ['Auth'],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi;
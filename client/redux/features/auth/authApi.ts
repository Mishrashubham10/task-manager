import { api } from '@/lib/services/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
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

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // REGISTER MUTATION
    register: builder.mutation({
      query: (data) => ({
        url: '/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // LOGIN MUTATION
    login: builder.mutation({
      query: (data) => ({
        url: '/login',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // GET-ME QUERY
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['User'],
    }),

    // LOGOUT MUTATION
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // LOGOUT ALL MUTATION
    logoutAll: builder.mutation({
      query: () => ({
        url: '/logout-all',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLogoutAllMutation,
} = authApi;
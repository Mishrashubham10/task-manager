import { api } from '@/lib/services/api';

export const taskApi = api.injectEndpoints({
  // GET TASKS QUERY
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),

    // CREATE TASK MUTATION
    createTask: builder.mutation({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation } = taskApi;
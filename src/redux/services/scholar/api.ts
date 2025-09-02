// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL, // or process.env...
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; // adjust path
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
  // credentials: 'include', // only if you also use cookies
});

// Define a service using a base URL and expected endpoints
export const scholarApi = createApi({
  reducerPath: "scholar",
  baseQuery,
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/signup",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/verify",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    resendCode: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/resend-code",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/forgot-password",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/reset-password",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    accountSetup: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/account",
        method: "PATCH",
        body: body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useSignupMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAccountSetupMutation,
} = scholarApi;

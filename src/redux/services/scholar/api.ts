// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

export type TxStatus = "success" | "failed" | "abandoned" | "pending";
export type TxType = "funding" | "refund" | "adjustment";

export interface TxItem {
  _id: string;
  ref: string;
  scholarshipId?: string;
  scholarshipTitle?: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  message?: string;
  createdAt: string; // ISO
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}
export interface Paged<T> {
  data: T[];
  meta: PageMeta;
}

export type TxQuery = {
  page?: number; // default 1
  limit?: number; // default 10
  q?: string; // matches ref/message/scholarshipTitle
  status?: TxStatus;
  type?: TxType;
  dateFrom?: string; // ISO (inclusive)
  dateTo?: string; // ISO (inclusive)
};

export interface ScholarshipStats {
  total: number;
  active: number;
  draft: number;
}
// near the top, with your types
export type PatchMarkStep =
  | "details"
  | "eligibility"
  | "selection"
  | "documents";

export type UpdatePatch = {
  title?: string;
  category?: ScholarshipCategory;
  funding?: { plan?: FundingPlanKey; amount?: number };
  eligibility?: {
    description?: string;
    minimumQualifications?: string;
    fieldOfStudy?: string;
    recipients?: number;
  };
  selectionMethod?: SelectionMethod;
  documents?: {
    personal?: string[];
    educational?: string[];
    deadline?: string;
    complete?: boolean;
  };
  currentStep?: number;
  markStep?: PatchMarkStep;
};



export interface MiniScholarship {
  _id: string;
  title: string;
  category: string;
  active: boolean;
  selectionMethod?: "SelfSelection" | "MatchedScholar";
  createdAt: string;
}

export type ScholarshipCategory =
  | "WASSCE"
  | "Undergraduate"
  | "Masters"
  | "PHD"
  | "Secondary";
export type FundingPlanKey = "FOUR_YEARS" | "ANNUAL" | "QUARTERLY" | "MONTHLY";
export type SelectionMethod = "SelfSelection" | "MatchedScholar";




export interface Scholarship {
  _id: string;
  title: string;
  category: ScholarshipCategory;
  funding?: {
    plan?: FundingPlanKey;
    amount?: number;
    reference?: string;
    isPaid?: boolean;
    paidAt?: string;
    lastError?: string;
  };
  eligibility?: {
    description?: string;
    minimumQualifications?: string;
    fieldOfStudy?: string;
    recipients?: number;
  };
  selectionMethod?: SelectionMethod;
  documents?: {
    personal?: string[];
    educational?: string[];
    deadline?: string;
    complete?: boolean;
  };
  steps: {
    details: boolean;
    funding: boolean;
    eligibility: boolean;
    selection: boolean;
    documents: boolean;
    submitted: boolean;
  };
  currentStep: number;
  active: boolean;
}

// redux/services/scholar/api.ts
export interface MiniScholarship {
  _id: string;
  title: string;
  category: string;
  active: boolean;
  selectionMethod?: "SelfSelection" | "MatchedScholar";
  createdAt: string;
}
export interface PageMeta {
  page: number;       // 1-based
  limit: number;
  total: number;      // total items
}
export interface Paged<T> {
  data: T[];
  meta: PageMeta;
}

export type ScholarshipsQuery = {
  page?: number;        // default 1
  limit?: number;       // default 10
  q?: string;
  status?: "active" | "draft";
  category?: string;
  method?: "SelfSelection" | "MatchedScholar";
};

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
  tagTypes: ["Transactions", "Scholarships"],
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
    getAccount: builder.query({
      query: () => "/scholars/api/account",
    }),

    //sponsors
    sponsorSignup: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/signup",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    verifySponsorEmail: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/verify",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    resendSponsorCode: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/resend-code",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    sponsorsLogin: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    forgotSponsorPassword: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/forgot-password",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    resetSposorPassword: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/reset-password",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }),
    initScholarshipFunding: builder.mutation<
      { authorization_url: string; reference: string },
      { scholarshipId: string; amount: number }
    >({
      query: (body) => ({
        url: "/sponsors/api/payment/wallet/initialize",
        method: "POST",
        body,
      }),
    }),
    verifyScholarshipFunding: builder.query<
      { msg: string; scholarshipId: string; nextStep: number },
      { reference: string }
    >({
      query: ({ reference }) =>
        `/sponsors/api/payment/wallet/callback/${reference}`,
    }),
    /* createScholarship: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/scholarship",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }), */
    /* updateScholarship: builder.mutation({
      query: ({ id, body }) => ({
        url: `/sponsors/api/scholarship/${id}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }),
    }), */
    getScholarshipById: builder.query({
      query: (id) => `/sponsors/api/scholarship/${id}`,
    }),

    //new routes
    createScholarship: builder.mutation<
      Scholarship,
      { title: string; category: ScholarshipCategory }
    >({
      query: (body) => ({
        url: "/sponsors/api/scholarship",
        method: "POST",
        body,
      }),
      invalidatesTags: (r) => (r ? [{ type: "Scholarships", id: r._id }] : []),
    }),

    getScholarship: builder.query<Scholarship, string>({
      query: (id) => `/sponsors/api/scholarship/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Scholarships", id }],
    }),

    updateScholarship: builder.mutation<
      Scholarship,
      { id: string; patch: UpdatePatch }
    >({
      query: ({ id, patch }) => ({
        url: `/sponsors/api/scholarship/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Scholarships", id }],
    }),

    initFunding: builder.mutation<
      { authorization_url: string; reference: string },
      { id: string; plan: FundingPlanKey; amount: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/sponsors/api/scholarship/${id}/fund/init`,
        method: "POST",
        body,
      }),
    }),

    verifyFunding: builder.query<
      { status: string; scholarship: Scholarship },
      { reference: string }
    >({
      query: ({ reference }) => `/sponsors/api/scholarship/verify/${reference}`,
      providesTags: (r) =>
        r ? [{ type: "Scholarships", id: r.scholarship._id }] : [],
    }),

    submitScholarship: builder.mutation<
      { active: boolean; scholarship: Scholarship },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/sponsors/api/scholarship/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Scholarships", id }],
    }),
    getTransactions: builder.query<Paged<TxItem>, TxQuery | void>({
      query: (arg) => {
        const p = new URLSearchParams();
        const {
          page = 1,
          limit = 10,
          q,
          status,
          type,
          dateFrom,
          dateTo,
        } = arg ?? {};
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (q) p.set("q", q);
        if (status) p.set("status", status);
        if (type) p.set("type", type);
        if (dateFrom) p.set("dateFrom", dateFrom);
        if (dateTo) p.set("dateTo", dateTo);
        return `/sponsors/api/scholarship/transactions?${p.toString()}`;
      },
      providesTags: ["Transactions"],
    }),
    /*  getMyScholarships: builder.query<MiniScholarship[], void>({
      query: () => `/sponsors/api/scholarship/mine`,
      providesTags: ["Scholarships"],
    }), */
    getMyScholarships: builder.query<
      Paged<MiniScholarship>,
      ScholarshipsQuery | void
    >({
      query: (arg) => {
        const p = new URLSearchParams();
        const { page = 1, limit = 10, q, status, category, method } = arg ?? {};
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (q) p.set("q", q);
        if (status) p.set("status", status);
        if (category) p.set("category", category);
        if (method) p.set("method", method);
        return `/sponsors/api/scholarship/mine?${p.toString()}`;
      },
      providesTags: ["Scholarships"],
    }),
    getScholarshipStats: builder.query<ScholarshipStats, void>({
      query: () => `/sponsors/api/scholarship/stats`,
      providesTags: ["Scholarships"],
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
  useGetAccountQuery,
  useSponsorSignupMutation,
  useResendSponsorCodeMutation,
  useForgotSponsorPasswordMutation,
  useResetSposorPasswordMutation,
  useVerifySponsorEmailMutation,
  useSponsorsLoginMutation,
  useInitScholarshipFundingMutation,
  useLazyVerifyScholarshipFundingQuery,
  //useCreateScholarshipMutation,
  //useUpdateScholarshipMutation,
  useGetScholarshipByIdQuery,
  //new routes
  useCreateScholarshipMutation,
  useGetScholarshipQuery,
  useUpdateScholarshipMutation,
  useInitFundingMutation,
  useSubmitScholarshipMutation,
  useLazyVerifyFundingQuery,
  useGetMyScholarshipsQuery,

  useGetTransactionsQuery,
  useGetScholarshipStatsQuery,
  useLazyGetScholarshipStatsQuery,
} = scholarApi;

// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

/* =========================
 * Types
 * ========================= */

// near your other types
export type UpdatePatch = {
  title?: string;
  category?: ScholarshipCategory;
  funding?: { plan?: FundingPlanKey; amount?: number };
  eligibility?: {
    description?: string;
    minimumQualifications?: string;
    fieldOfStudy?: string;
    fieldOfStudyKey?: string; // ← add this
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
  removeLogo?: boolean;
};

// tiny runtime check
const isFormData = (v: unknown): v is FormData =>
  typeof FormData !== "undefined" && v instanceof FormData;

// near your other types
export type FieldCatalogItem = {
  key: string; // canonical value to store
  label: string; // user-facing label
  parentKey: string; // e.g. it_broad, engineering_broad
  variants?: string[];
};

export type FieldParentsRow = { parentKey: string; count: number };

export type ScholarshipCategory =
  | "WASSCE"
  | "Undergraduate"
  | "Masters"
  | "PHD"
  | "Secondary";

export type FundingPlanKey = "FOUR_YEARS" | "ANNUAL" | "QUARTERLY" | "MONTHLY";
export type SelectionMethod = "SelfSelection" | "MatchedScholar";

export type ScholarshipItem = {
  _id: string;
  title: string;
  category: ScholarshipCategory;
  selectionMethod: SelectionMethod;
  eligibility?: {
    description?: string;
    minimumQualifications?: string;
    fieldOfStudy?: string;
    fieldOfStudyKey?: string;
    recipients?: number;
  };
  active?: boolean;
  createdAt?: string;
  // Returned by aggregation (optional; present in some responses)
  sponsorId?: string;
  sponsorName?: string;
  documents?: {
    personal?: string[];
    educational?: string[];
    deadline?: string;
    complete?: boolean;
  };
  logo?: { url?: string; public_id?: string } | null;
};

export type GetActiveScholarshipsArgs = {
  selectionMethod?: SelectionMethod;
  category?: ScholarshipCategory;
  fieldOfStudy?: string;
  minQualification?: string;
  page?: number;
  limit?: number;
  q?: string;
};

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
  page: number; // 1-based
  limit: number;
  total: number; // total items
  // (pages can be derived on the client if needed)
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

export type PatchMarkStep =
  | "details"
  | "eligibility"
  | "selection"
  | "documents";

/* export type UpdatePatch = {
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
}; */

export interface MiniScholarship {
  _id: string;
  title: string;
  category: string;
  active: boolean;
  selectionMethod?: "SelfSelection" | "MatchedScholar";
  createdAt: string;
}

export type ScholarshipsQuery = {
  page?: number; // default 1
  limit?: number; // default 10
  q?: string;
  status?: "active" | "draft";
  category?: string;
  method?: "SelfSelection" | "MatchedScholar";
};

export type LogoMeta = {
  url: string;
  public_id?: string;
};

export interface Scholarship {
  _id: string;
  title: string;
  logo?: LogoMeta;
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
    fieldOfStudyKey?: string; // ← add this
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

type Api<T> = { message: string; data: T };

export type MatchArgs = { id: string; page?: number; limit?: number };

export type MatchResponse = {
  scholarshipId: string;
  totalMatches: number;
  page: number;
  limit: number;
  data: any[]; // you can replace `any` with your Scholar shape if you have one
};

/* =========================
 * Base Query
 * ========================= */

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL, // or process.env...
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; // adjust path if needed
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
  // credentials: 'include',
});

/* =========================
 * API Slice
 * ========================= */

export const scholarApi = createApi({
  reducerPath: "scholar",
  baseQuery,
  tagTypes: [
    "Transactions",
    "Scholarships",
    "MyApplications",
    "DeactivationRequest",
    "SponsorDeactivationRequest",
    "ProfileStep",
    "Verification",
    "Countries",
    "ScholarMatches",
    "ScholarProfileStep",
    "ScholarVerification",
  ],
  endpoints: (builder) => ({
    /* ---------------------------
     * Scholar Auth & Account
     * --------------------------- */
    signup: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/signup",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/verify",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    resendCode: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/resend-code",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/forgot-password",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/auth/reset-password",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    accountSetup: builder.mutation({
      query: (body) => ({
        url: "/scholars/api/account",
        method: "PATCH",
        body,
      }),
    }),
    getAccount: builder.query({
      query: () => "/scholars/api/account",
    }),

    /* ---------- SCHOLAR — profile wizard steps ---------- */
    getScholarStep: builder.query<any, string>({
      query: (stepKey) => `/scholars/api/profile/step/${stepKey}`,
      transformResponse: (r: Api<any>) => r.data,
      providesTags: (_r, _e, stepKey) => [
        { type: "ScholarProfileStep", id: stepKey },
      ],
    }),
    saveScholarStep: builder.mutation<any, { stepKey: string; payload: any }>({
      query: (body) => ({
        url: `/scholars/api/profile/step`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { stepKey }) => [
        { type: "ScholarProfileStep", id: stepKey },
      ],
    }),

    /* ---------- SCHOLAR — uploads (verification + avatar) ---------- */
    uploadScholarVerification: builder.mutation<
      any,
      { idType: string; file: File }
    >({
      query: ({ idType, file }) => {
        const fd = new FormData();
        fd.append("idType", idType);
        fd.append("file", file);
        return {
          url: `/scholars/api/profile/upload/verification`,
          method: "POST",
          body: fd,
        };
      },
      invalidatesTags: [
        { type: "ScholarVerification", id: "doc" },
        { type: "ScholarProfileStep", id: "verification" },
      ],
    }),
    uploadScholarProfilePicture: builder.mutation<
      {
        message: string;
        data: {
          url: string;
          public_id: string;
          width: number;
          height: number;
          bytes: number;
          format: string;
          uploadedAt: string;
        };
      },
      { file: File }
    >({
      query: ({ file }) => {
        const fd = new FormData();
        fd.append("file", file);
        return {
          url: `/scholars/api/profile/upload-picture`,
          method: "POST",
          body: fd,
        };
      },
      // if your profile step for avatar is "personal" or "photo", invalidate it:
      invalidatesTags: [{ type: "ScholarProfileStep", id: "personal" }],
    }),

    /* ---------------------------
     * NEW — Scholar-facing Scholarships (secured)
     * --------------------------- */

    // UPDATED: returns Paged<ScholarshipItem>
    getActiveScholarships: builder.query<
      Paged<ScholarshipItem>,
      GetActiveScholarshipsArgs | void
    >({
      query: (args) => {
        const p = new URLSearchParams();
        const {
          page = 1,
          limit = 12,
          selectionMethod,
          category,
          fieldOfStudy,
          minQualification,
          q,
        } = args ?? {};
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (selectionMethod) p.set("selectionMethod", selectionMethod);
        if (category) p.set("category", category);
        if (fieldOfStudy) p.set("fieldOfStudy", fieldOfStudy);
        if (minQualification) p.set("minimumQualifications", minQualification);
        if (q) p.set("q", q);
        return {
          url: `/scholars/api/scholarships?${p.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((s) => ({
                type: "Scholarships" as const,
                id: s._id,
              })),
              { type: "Scholarships" as const, id: "LIST" },
            ]
          : [{ type: "Scholarships" as const, id: "LIST" }],
    }),

    // NEW: recommended (server derives from scholar profile). Optional overrides: selectionMethod, page, limit
    getRecommendedScholarships: builder.query<
      Paged<ScholarshipItem>,
      {
        page?: number;
        limit?: number;
        selectionMethod?: SelectionMethod;
      } | void
    >({
      query: (args) => {
        const p = new URLSearchParams();
        const {
          page = 1,
          limit = 12,
          selectionMethod = "SelfSelection",
        } = args ?? {};
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (selectionMethod) p.set("selectionMethod", selectionMethod);
        return {
          url: `/scholars/api/scholarships/recommended?${p.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((s) => ({
                type: "Scholarships" as const,
                id: s._id,
              })),
              { type: "Scholarships" as const, id: "LIST" },
            ]
          : [{ type: "Scholarships" as const, id: "LIST" }],
    }),

    // NEW: detail for a single ACTIVE scholarship
    getActiveScholarshipDetail: builder.query<
      { scholarship: ScholarshipItem },
      string
    >({
      query: (id) => `/scholars/api/scholarships/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Scholarships", id }],
    }),

    getDeactivationRequest: builder.query<
      { status: string; deactivationRequest?: any },
      void
    >({
      query: () => `/scholars/api/account/deactivation-request`,
      transformResponse: (raw: any) => raw?.data,
      providesTags: ["DeactivationRequest"],
    }),
    requestDeactivation: builder.mutation<
      { message: string; data?: { status: string } },
      { reason: string }
    >({
      query: (body) => ({
        url: `/scholars/api/account/deactivation-request`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DeactivationRequest"],
    }),

    /*    utility endpoints */

    // inside endpoints: (builder) => ({
    // ...keep existing endpoints...

    getFieldParents: builder.query<FieldParentsRow[], void>({
      query: () => `/api/catalog/parents`,
      transformResponse: (r: {
        data: Array<{ parentKey: string; count: number }>;
      }) => r.data,
    }),

    getFields: builder.query<
      FieldCatalogItem[],
      { q?: string; parentKey?: string } | void
    >({
      query: (args) => {
        const p = new URLSearchParams();
        if (args?.q) p.set("q", args.q);
        if (args?.parentKey) p.set("parentKey", args.parentKey);
        return `/api/catalog/fields${p.toString() ? `?${p.toString()}` : ""}`;
      },
      transformResponse: (r: { data: FieldCatalogItem[] }) => r.data,
    }),

    // OPTIONAL (if you want users to suggest new fields from the UI)
    createField: builder.mutation<
      { message: string; data: FieldCatalogItem },
      { key: string; label: string; parentKey: string; variants?: string[] }
    >({
      query: (body) => ({
        url: `/api/catalog/fields`,
        method: "POST",
        body,
      }),
      // keep the list fresh
      invalidatesTags: (_r, _e, _a) => [{ type: "Countries", id: "noop" }], // or attach a real tag if you like
    }),
    // ...

    /* ---------------------------
     * Sponsor-side endpoints (unchanged)
     * --------------------------- */
    sponsorSignup: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/signup",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    verifySponsorEmail: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/verify",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    resendSponsorCode: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/resend-code",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    sponsorsLogin: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    forgotSponsorPassword: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/forgot-password",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    resetSposorPassword: builder.mutation({
      query: (body) => ({
        url: "/sponsors/api/auth/reset-password",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
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

    getScholarshipById: builder.query({
      query: (id) => `/sponsors/api/scholarship/${id}`,
    }),

    /*  createScholarship: builder.mutation<
      Scholarship,
      { title: string; category: ScholarshipCategory }
    >({
      query: (body) => ({
        url: "/sponsors/api/scholarship",
        method: "POST",
        body,
      }),
      invalidatesTags: (r) => (r ? [{ type: "Scholarships", id: r._id }] : []),
    }), */
    createScholarship: builder.mutation<
      Scholarship,
      FormData | { title: string; category: ScholarshipCategory }
    >({
      query: (payload) => ({
        url: "/sponsors/api/scholarship",
        method: "POST",
        // IMPORTANT: pass FormData directly; do not set Content-Type
        body: payload as any,
      }),
      invalidatesTags: (r) => (r ? [{ type: "Scholarships", id: r._id }] : []),
    }),

    getScholarship: builder.query<Scholarship, string>({
      query: (id) => `/sponsors/api/scholarship/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Scholarships", id }],
    }),

    /*  updateScholarship: builder.mutation<
      Scholarship,
      { id: string; patch: UpdatePatch }
    >({
      query: ({ id, patch }) => ({
        url: `/sponsors/api/scholarship/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Scholarships", id }],
    }), */

    updateScholarship: builder.mutation<
      Scholarship,
      { id: string; patch: UpdatePatch | FormData }
    >({
      query: ({ id, patch }) => ({
        url: `/sponsors/api/scholarship/${id}`,
        method: "PATCH",
        body: patch as any,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Scholarships", id },
        { type: "ScholarMatches", id }, // 👈 add this line
      ],
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
      { active: boolean; scholarship: Scholarship; matchSummary: boolean },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/sponsors/api/scholarship/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Scholarships", id }],
    }),

    matchScholars: builder.query<MatchResponse, MatchArgs>({
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/sponsors/api/scholarship/match/${id}`,
        params: { page, limit },
      }),

      // Make cache key stable per (id,page,limit)
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { id, page = 1, limit = 50 } = queryArgs;
        return `${endpointName}|${id}|p=${page}|l=${limit}`;
      },

      // Expose an invalidation hook by scholarship id
      providesTags: (_res, _err, { id }) => [{ type: "ScholarMatches", id }],

      // Don’t keep stale pages around
      keepUnusedDataFor: 0,
    }),

    getScholarshipApplications: builder.query({
      query: ({ id }) => `/sponsors/api/scholarship/${id}/applications`,
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
    createApplication: builder.mutation<
      { ok: true; applicationId: string; msg: string },
      FormData
    >({
      query: (body) => ({
        url: "/scholars/api/applications",
        method: "POST",
        body, // FormData
      }),
    }),
    getMyApplications: builder.query<
      Paged<any>,
      { status?: string; page: number; limit: number; q?: string }
    >({
      query: ({ status, page, limit, q }) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (q) params.set("q", q);
        return `/scholars/api/applications?${params.toString()}`;
      },
      providesTags: ["MyApplications"],
    }),

    getMyApplicationStats: builder.query<
      { [k: string]: number } & { total: number },
      void
    >({
      query: () => `/scholars/api/applications/stats`,
      providesTags: ["MyApplications"],
    }),

    getMyApplicationById: builder.query<any, string>({
      query: (id) => `/scholars/api/applications/${id}`,
      providesTags: (_r, _e, id) => [{ type: "MyApplications", id }],
    }),
    getSponsorDeactivationRequest: builder.query<
      { status: string; deactivationRequest?: any },
      void
    >({
      query: () => `/sponsors/api/account/deactivation-request`,
      transformResponse: (raw: any) => raw?.data,
      providesTags: ["SponsorDeactivationRequest"],
    }),
    requestSponsorDeactivation: builder.mutation<
      { message: string; data?: { status: string } },
      { reason: string }
    >({
      query: (body) => ({
        url: `/sponsors/api/account/deactivation-request`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SponsorDeactivationRequest"],
    }),
    getStep: builder.query<any, string>({
      query: (stepKey) => `/sponsors/api/profile/step/${stepKey}`,
      transformResponse: (r: Api<any>) => r.data,
      providesTags: (r, e, k) => [{ type: "ProfileStep", id: k }],
    }),
    saveStep: builder.mutation<any, { stepKey: string; payload: any }>({
      query: (body) => ({
        url: `/sponsors/api/profile/step`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (r, e, { stepKey }) => [
        { type: "ProfileStep", id: stepKey },
      ],
    }),
    uploadVerification: builder.mutation<any, { idType: string; file: File }>({
      query: ({ idType, file }) => {
        const fd = new FormData();
        fd.append("idType", idType);
        fd.append("file", file);
        return {
          url: `/sponsors/api/profile/upload/verification`,
          method: "POST",
          body: fd,
        };
      },
      invalidatesTags: [
        { type: "Verification", id: "doc" },
        { type: "ProfileStep", id: "verification" },
      ],
    }),
    uploadSponsorProfilePicture: builder.mutation<
      {
        message: string;
        data: {
          url: string;
          public_id: string;
          width: number;
          height: number;
          bytes: number;
          format: string;
          uploadedAt: string;
        };
      },
      { file: File }
    >({
      query: ({ file }) => {
        const fd = new FormData();
        fd.append("file", file);
        return {
          url: "/sponsors/api/profile/upload-picture",
          method: "POST",
          body: fd,
        };
      },
    }),
    getCountries: builder.query<
      Array<{ code: string; name: string }>,
      string | void
    >({
      query: (q) => `/utils/countries${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      transformResponse: (r: Api<Array<{ code: string; name: string }>>) =>
        r.data,
      providesTags: ["Countries"],
    }),
  }),
});

/* =========================
 * Hooks
 * ========================= */

export const {
  // scholar auth/account
  useSignupMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAccountSetupMutation,
  useGetAccountQuery,
  useGetDeactivationRequestQuery,
  useRequestDeactivationMutation,
  useGetScholarStepQuery,
  useSaveScholarStepMutation,
  useUploadScholarVerificationMutation,
  useUploadScholarProfilePictureMutation,

  // NEW scholar-facing scholarships
  useGetActiveScholarshipsQuery,
  useLazyGetActiveScholarshipsQuery,
  useGetRecommendedScholarshipsQuery,
  useLazyGetRecommendedScholarshipsQuery,
  useGetActiveScholarshipDetailQuery,

  //utilities

  useGetFieldParentsQuery,
  useGetFieldsQuery,
  useLazyGetFieldsQuery,
  useCreateFieldMutation, // optional

  // sponsor endpoints
  useSponsorSignupMutation,
  useResendSponsorCodeMutation,
  useForgotSponsorPasswordMutation,
  useResetSposorPasswordMutation,
  useVerifySponsorEmailMutation,
  useSponsorsLoginMutation,
  useInitScholarshipFundingMutation,
  useLazyVerifyScholarshipFundingQuery,
  useGetScholarshipByIdQuery,
  useCreateScholarshipMutation,
  useGetScholarshipQuery,
  useUpdateScholarshipMutation,
  useInitFundingMutation,
  useSubmitScholarshipMutation,
  useMatchScholarsQuery,
  useGetScholarshipApplicationsQuery,
  useLazyVerifyFundingQuery,
  useGetMyScholarshipsQuery,
  useGetTransactionsQuery,
  useGetScholarshipStatsQuery,
  useLazyGetScholarshipStatsQuery,
  useCreateApplicationMutation,
  useGetMyApplicationsQuery,
  useGetMyApplicationStatsQuery,
  useGetMyApplicationByIdQuery,
  useGetSponsorDeactivationRequestQuery,
  useRequestSponsorDeactivationMutation,
  useGetStepQuery,
  useSaveStepMutation,
  useUploadVerificationMutation,
  useUploadSponsorProfilePictureMutation,
  useGetCountriesQuery,
} = scholarApi;

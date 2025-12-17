import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useMatchScholarsQuery } from "../../redux/services/scholar/api";
import { ArrowLeft, RefreshCw } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-36 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-9 w-28 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

function AvatarInitials({
  firstName,
  lastName,
}: {
  firstName?: string;
  lastName?: string;
}) {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim().toUpperCase() || "S";
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
      {initials}
    </div>
  );
}

/** Renders a circular photo if src is present; falls back to initials.
 *  Also falls back if the image fails to load. */
function ScholarAvatar({
  firstName,
  lastName,
  src,
}: {
  firstName?: string;
  lastName?: string;
  src?: string | null;
}) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) {
    return <AvatarInitials firstName={firstName} lastName={lastName} />;
  }
  return (
    <img
      src={src}
      alt={`${firstName ?? ""} ${lastName ?? ""}`.trim() || "Scholar photo"}
      onError={() => setErrored(true)}
      className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-200"
    />
  );
}

export default function MatchedScholars() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sp, setSp] = useSearchParams();

  // URL-backed state
  const pageFromUrl = Number(sp.get("page") || 1);
  const limitFromUrl = Number(sp.get("limit") || 12);
  const [page, setPage] = React.useState<number>(
    Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1
  );
  const [limit] = React.useState<number>(
    Number.isFinite(limitFromUrl) && limitFromUrl > 0 ? limitFromUrl : 12
  );

  // Keep URL in sync when local state changes
  React.useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set("page", String(page));
    next.set("limit", String(limit));
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useMatchScholarsQuery(
      { id: id as string, page, limit },
      {
        skip: !id,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
      }
    );

  const scholars = data?.data ?? [];
  const total = data?.totalMatches ?? 0;

  const canPrev = page > 1;
  const canNext = page * limit < total;

  const onPrevPage = () => {
    if (canPrev) setPage((p) => Math.max(1, p - 1));
  };
  const onNextPage = () => {
    if (canNext) setPage((p) => p + 1);
  };

  //const limitOptions = [6, 9, 12, 18, 24, 36, 48];

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <button
        onClick={() => navigate("/sponsor/dashboard")}
        className="group inline-flex items-center gap-x-1 rounded-md px-1 py-0.5 mb-6
             text-sm text-gray-700 transition-all duration-200 ease-out
             hover:text-indigo-600 hover:-translate-x-0.5"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Matched Scholars</h1>
          <span className="text-sm text-gray-600">
            Total Matches: <span className="font-semibold">{total}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {(isLoading || isFetching) && scholars.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit >= 6 ? Math.min(limit, 9) : 6 }).map(
            (_, i) => (
              <SkeletonCard key={i} />
            )
          )}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Failed to load matched scholars
          {(error as any)?.data?.message
            ? `: ${(error as any).data.message}`
            : "."}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && scholars.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600">
          No matched scholars found for this scholarship.
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && scholars.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {scholars.map((s: any) => {
              const created = s.createdAt ? new Date(s.createdAt) : null;
              const createdStr = created ? created.toLocaleDateString() : "—";

              const degree =
                s.currentDegree ||
                s.profile?.education?.tertiary?.minQualification ||
                "—";
              const field =
                s.profile?.education?.tertiary?.fieldOfStudyLabel ||
                s.profile?.education?.tertiary?.fieldOfStudy ||
                "—";

              // Prefer server-computed photoUrl (if you added it), else check both avatar locations.
              const photoUrl =
                s.photoUrl ||
                s?.profile?.personal?.avatar?.url ||
                s?.avatar?.url ||
                null;

              return (
                <div
                  key={s._id}
                  className="rounded-xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <ScholarAvatar
                      firstName={s.firstName}
                      lastName={s.lastName}
                      src={photoUrl}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="truncate text-xs text-gray-600">
                        {s.email}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{s.phone || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-medium">{s.gender || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Degree</span>
                      <span className="font-medium">{degree}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Field</span>
                      <span className="font-medium">{field}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Matched On</span>
                      <span className="font-medium">{createdStr}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                      onClick={() => {
                        if (!id) return;
                        navigate(
                          `/sponsor/dashboard/matched-scholars/${id}/scholar/${s._id}`
                        );
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Page {data?.page ?? page} • Limit {data?.limit ?? limit} • Showing{" "}
              {scholars.length} of {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
                disabled={!canPrev}
                onClick={onPrevPage}
              >
                Prev
              </button>
              <button
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
                disabled={!canNext}
                onClick={onNextPage}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

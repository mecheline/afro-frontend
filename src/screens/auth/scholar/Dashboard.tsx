import React, { useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/services/scholar/store";

// ------------------------------------------------------------------
// Types & Mock Data (replace with your API results)
// ------------------------------------------------------------------
export type Scholarship = {
  id: string;
  title: string;
  organization: string; // e.g., Mae Foundation
  level: string; // e.g., Masters Degrees Program
  logo: string; // url
  durationLabel: string; // e.g., "2 years duration"
  amountLabel: string; // e.g., "$10,000 Stipends /monthly"
  tags?: string[]; // e.g., ["Full Time", "Remote"]
  category:
    | "All"
    | "WASSCE"
    | "Undergraduate"
    | "Masters"
    | "PhD"
    | "Essay"
    | "Secondary";
  recommended?: boolean;
  matched?: boolean;
};

const MOCK: Scholarship[] = [
  {
    id: "1",
    title: "Mae Foundation",
    organization: "Mae Foundation",
    level: "Masters Degrees Program",
    logo: "https://images.unsplash.com/photo-1600962815726-457c5ac3ff51?w=120&h=120&fit=crop&auto=format",
    durationLabel: "2 years duration",
    amountLabel: "$10,000 Stipends /monthly",
    tags: ["4.2/5.0 Undergrad GPAA"],
    category: "Masters",
    recommended: true,
  },
  {
    id: "2",
    title: "Marian’s For Girls",
    organization: "Marian’s Foundation",
    level: "Masters Degrees Program",
    logo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format",
    durationLabel: "2 years duration",
    amountLabel: "$10,000 Stipends /monthly",
    tags: ["4.2/5.0 Undergrad GPAA"],
    category: "Masters",
    matched: true,
  },
  {
    id: "3",
    title: "Common Wealth",
    organization: "Common Wealth",
    level: "PHD",
    logo: "https://images.unsplash.com/photo-1603415526960-f7e0328d13fd?w=120&h=120&fit=crop&auto=format",
    durationLabel: "4 years duration",
    amountLabel: "$20,000 /month",
    tags: ["Full Time", "Remote"],
    category: "PhD",
  },
  {
    id: "4",
    title: "Agbani Scholarship",
    organization: "Agbani Foundation",
    level: "Junior & Senior Secondary",
    logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format",
    durationLabel: "Jss1 - Ss3",
    amountLabel: "N25,000 - 50,000 /Term",
    tags: ["JSSCE result req", "WASSCE result req"],
    category: "Secondary",
  },
  {
    id: "5",
    title: "OPM Scholarship",
    organization: "OPM",
    level: "Senior Secondary Essay",
    logo: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=120&h=120&fit=crop&auto=format",
    durationLabel: "Ss2 - Ss3 Students",
    amountLabel: "N120,000",
    tags: ["Essay", "Spelling Bee"],
    category: "Essay",
  },
];

const CATEGORIES: Scholarship["category"][] = [
  "All",
  "WASSCE",
  "Undergraduate",
  "Masters",
  "PhD",
  "Secondary",
  "Essay",
];

// ------------------------------------------------------------------
// Small UI helpers
// ------------------------------------------------------------------
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string; href?: string }> = ({
  title,
  href = "#",
}) => (
  <div className="mb-3 flex items-center justify-between gap-4">
    <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
    <Link
      to={href}
      className="text-sm font-semibold text-indigo-600 hover:underline"
    >
      See All
    </Link>
  </div>
);

const Chip: React.FC<{
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition [text-wrap:nowrap] ${
      active
        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
    }`}
  >
    {label}
  </button>
);

const Tag: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
    {children}
  </span>
);

// ------------------------------------------------------------------
// Scholarship Card
// ------------------------------------------------------------------
const ScholarshipCard: React.FC<{
  item: Scholarship;
  onBookmark?: (id: string, v: boolean) => void;
  isBookmarked?: boolean;
}> = ({ item, onBookmark, isBookmarked }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white ring-1 ring-slate-200">
            <img
              src={item.logo}
              alt={`${item.organization} logo`}
              className="h-10 w-10 rounded-lg object-cover"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="text-sm text-slate-500">{item.level}</p>
          </div>
        </div>

        <button
          aria-label="Toggle bookmark"
          onClick={() => onBookmark?.(item.id, !isBookmarked)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-indigo-600" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="my-4 h-px w-full bg-slate-200/70" />

      <div className="space-y-2">
        <p className="text-sm text-slate-500">{item.durationLabel}</p>
        <p className="text-base font-semibold text-indigo-600">
          {item.amountLabel}
        </p>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.tags.map((t, i) => (
              <Tag key={i}>{t}</Tag>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

// ------------------------------------------------------------------
// Banner
// ------------------------------------------------------------------
const LearnBanner: React.FC = () => (
  <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#c7d2fe_0%,#93c5fd_40%,#60a5fa_100%)] p-5 text-white shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-full md:w-2/3">
        <h3 className="text-xl font-bold leading-snug sm:text-2xl">
          See how you can
          <br /> find a scholarship
        </h3>
        <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white">
          Read more
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="hidden w-1/3 justify-end md:flex">
        <img
          src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop&auto=format"
          alt="student"
          className="h-28 w-28 rounded-xl object-cover shadow-md lg:h-36 lg:w-36"
        />
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------------
const ScholarDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth);
  const [activeCategory, setActiveCategory] =
    useState<Scholarship["category"]>("All");
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  const recommended = useMemo(() => MOCK.filter((m) => m.recommended), []);
  const matched = useMemo(() => MOCK.filter((m) => m.matched), []);

  const externals = useMemo(() => {
    const list = MOCK.filter((m) => !m.recommended && !m.matched);
    if (activeCategory === "All") return list;
    return list.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const toggleBookmark = (id: string, v: boolean) => {
    setBookmarks((prev) => ({ ...prev, [id]: v }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden pt-16 md:pt-20">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <Container className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar ?? undefined}
                className="h-9 w-9 rounded-full object-cover"
                alt="avatar"
              />
              <div>
                <p className="text-xs text-slate-500">Good Morning 👋</p>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.lastName} {user?.firstName}
                </p>
              </div>
            </div>
            <Link to={"/scholar/profile"}>Profile</Link>
            <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>
          </div>
        </Container>
      </header>

      {/* Search */}
      <Container className="mt-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              placeholder="Search for a Scholarship"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </Container>

      {/* Banner */}
      <Container className="mt-4">
        <LearnBanner />
      </Container>

      {/* Recommended */}
      {recommended.length > 0 && (
        <Container className="mt-6">
          <SectionHeader title="Recommended scholarships" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommended.map((item) => (
              <ScholarshipCard
                key={item.id}
                item={item}
                isBookmarked={!!bookmarks[item.id]}
                onBookmark={toggleBookmark}
              />
            ))}
          </div>
        </Container>
      )}

      {/* Matched */}
      {matched.length > 0 && (
        <Container className="mt-6">
          <SectionHeader title="Matched Scholarships" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {matched.map((item) => (
              <ScholarshipCard
                key={item.id}
                item={item}
                isBookmarked={!!bookmarks[item.id]}
                onBookmark={toggleBookmark}
              />
            ))}
          </div>
        </Container>
      )}

      {/* External */}
      <Container className="mt-6">
        <SectionHeader title="External Scholarships" />
        <div className="no-scrollbar -mx-2 mb-4 flex gap-2 overflow-x-auto px-2 pb-1">
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              active={activeCategory === c}
              onClick={() => setActiveCategory(c)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {externals.map((item) => (
            <ScholarshipCard
              key={item.id}
              item={item}
              isBookmarked={!!bookmarks[item.id]}
              onBookmark={toggleBookmark}
            />
          ))}
        </div>
      </Container>

      {/* Mobile Tabbar */}
      <nav className="sticky bottom-0 z-20 mt-8 block border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <Container className="px-2">
          <ul className="grid grid-cols-5 py-2 text-xs text-slate-500">
            <li className="text-center">
              <Link
                to="#"
                className="flex flex-col items-center gap-1 text-indigo-600"
              >
                <span className="inline-block h-1.5 w-10 rounded-full bg-indigo-600/20" />
                Home
              </Link>
            </li>
            <li className="text-center">
              <Link to="#" className="flex flex-col items-center gap-1">
                <span className="inline-block h-1.5 w-10 rounded-full bg-slate-200" />
                Dashboard
              </Link>
            </li>
            <li className="text-center">
              <Link to="#" className="flex flex-col items-center gap-1">
                <span className="inline-block h-1.5 w-10 rounded-full bg-slate-200" />
                Applicatio...
              </Link>
            </li>
            <li className="text-center">
              <Link to="#" className="flex flex-col items-center gap-1">
                <span className="inline-block h-1.5 w-10 rounded-full bg-slate-200" />
                Message
              </Link>
            </li>
            <li className="text-center">
              <Link to="#" className="flex flex-col items-center gap-1">
                <span className="inline-block h-1.5 w-10 rounded-full bg-slate-200" />
                Profile
              </Link>
            </li>
          </ul>
        </Container>
      </nav>
    </div>
  );
};

export default ScholarDashboard;

import React, { useState } from "react";
import {
  Download,
  ArrowRight,
  LogIn,
  Users,
  CloudDownload,
  ThumbsUp,
  Star,
  UploadCloud,
  X,
  GraduationCapIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import hero1 from "../../assets/hero1.png";
import hero2 from "../../assets/hero2.png";
import hero3 from "../../assets/hero3.png";
import hero4 from "../../assets/hero4.png";
import hero5 from "../../assets/hero5.png";
import flexible from "../../assets/flexible.png";
import download from "../../assets/download.png";
import education from "../../assets/education.png";
import mdownload from "../../assets/mdownload.png";
import video from "../../assets/video.png";
import team1 from "../../assets/team1.png";
import team2 from "../../assets/team2.png";
import team3 from "../../assets/team3.png";
import Footer from "../../components/Footer";

// ---------- helpers ----------
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md bg-[#EEEEEE] text-[#101457] px-4 py-2 text-sm font-semibold transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md bg-[#EBC31E] text-[#101457] shadow-sm transition  ${className}`}
    {...props}
  >
    {children}
  </button>
);

const TeamCard: React.FC<{
  name: string;
  role: string;
  img: string;
}> = ({ name, role, img }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
    <img
      src={img}
      alt={name}
      className="h-[249px] w-[277.15px] object-center"
    />
    <div className="px-5 pb-5 pt-4">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-xs text-slate-500">{role}</p>
    </div>
  </div>
);

const StatPill: React.FC<{ value: string; label: string; icon: any }> = ({
  value,
  label,
  icon,
}) => (
  <div className="flex items-center justify-center gap-3 rounded-2xl px-4 py-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
      <span className="text-sm font-bold text-[#EDAA03]">{icon}</span>
    </div>
    <div>
      <p className="text-lg font-extrabold text-white md:text-xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-white">
        {label}
      </p>
    </div>
  </div>
);

// ---------- page ----------
const heroGallery = [hero1, hero2, hero3, hero4, hero5];

const team = [
  {
    name: "Dr. Taiwo Adegboyega-Conde",
    role: "Co‑Founder",
    img: team1,
  },
  {
    name: "Adedapo Adegboyega-Conde",
    role: "Co‑Founder",
    img: team2,
  },
  {
    name: "Michael Ososanya",
    role: "Co‑Founder",
    img: team3,
  },
];

export default function AfroScholarsLanding() {
  const navigate = useNavigate();
  const [showOption, setShowOption] = useState(false);
  const [selectedType, setSelectedType] = useState<"scholar" | "sponsor">(
    "scholar"
  );

  const handleStartOptionContinue = () => {
    if (selectedType === "scholar") {
      setShowOption(false);
      navigate("/auth/scholar/Login");
    } else {
      setShowOption(false);
      navigate("/auth/sponsor");
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-800 overflow-x-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-40 top-32 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-[38rem] h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} />
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-700 md:flex">
            <a href="#" className="hover:text-slate-900">
              Home
            </a>
            <a href="#" className="hover:text-slate-900">
              Join us
            </a>
            <a href="#" className="hover:text-slate-900">
              About
            </a>
            <a href="#" className="hover:text-slate-900">
              Team
            </a>
            <a href="#" className="hover:text-slate-900">
              Gallery
            </a>
            <a href="#" className="hover:text-slate-900">
              FAQ
            </a>
            <a href="#" className="hover:text-slate-900">
              Blog
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <GhostButton
              className="px-3 py-1.5"
              onClick={() => setShowOption(true)}
            >
              <LogIn className="mr-1.5 h-4 w-4" /> Login
            </GhostButton>
          </div>

          {/* mobile */}
          <details className="group relative md:hidden">
            <summary className="list-none rounded-lg border border-slate-300 p-1.5">
              <div className="space-y-1">
                <span className="block h-0.5 w-6 bg-slate-800" />
                <span className="block h-0.5 w-6 bg-slate-800" />
                <span className="block h-0.5 w-6 bg-slate-800" />
              </div>
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <nav className="grid gap-2 text-sm">
                {[
                  "Home",
                  "Join us",
                  "About",
                  "Team",
                  "Gallery",
                  "FAQ",
                  "Blog",
                ].map((item) => (
                  <a
                    key={item}
                    className="rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    href="#"
                  >
                    {item}
                  </a>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <GhostButton onClick={() => setShowOption(true)}>
                    Login
                  </GhostButton>
                </div>
              </nav>
            </div>
          </details>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold leading-snug text-slate-900 sm:text-4xl md:text-5xl">
              Fully Paid Scholarship for
              <br /> African Students
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
              MyAfroscholars uses technology to enable sponsors to conveniently
              create, fund and manage scholarships that can be easily accessed
              by profiled Africans.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton>
                Fund a Scholarship <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
              <GhostButton>
                <Link to="/auth/scholar/login">Get a Scholarship</Link>
              </GhostButton>
            </div>
          </div>

          {/* gallery strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {heroGallery.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`hero ${i + 1}`}
                className="h-28 w-full rounded-xl object-cover object-center sm:h-36 md:h-[284.43px]"
              />
            ))}
          </div>
        </Container>
      </section>

      {/* About / Features */}
      <section className="max-w-screen-xl mx-auto">
        <Container className="flex flex-col-reverse mt-16 md:mt-0 md:flex-row gap-16 py-20">
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <div className="flex flex-col space-y-8">
              <div className="bg-white flex flex-col items-center justify-center shadow px-4 py-8 rounded-lg">
                <img src={flexible} />
                <div className="mt-4 mb-2 font-bold text-[#101457] text-lg">
                  Flexible Classes
                </div>
                <div className="w-[90%] mx-auto text-center text-sm font-normal text-[#475467] tracking-[0.2px] leading-[140%]">
                  With lots of unique blocks you can easily create a page
                  without coding with Appmax
                </div>
              </div>
              <div className="bg-white flex flex-col items-center justify-center shadow p-4 rounded-lg">
                <img src={download} />
                <div className="mt-4 mb-2 font-bold text-[#101457] text-lg">
                  Download Classes
                </div>
                <div className="w-[90%] mx-auto text-center text-sm font-normal text-[#475467] tracking-[0.2px] leading-[140%]">
                  With lots of unique blocks you can easily create a page
                  without coding with Appmax
                </div>
              </div>
            </div>
            <div className="bg-white flex flex-col items-center justify-center shadow p-4 rounded-lg mt-8 md:mt-0">
              <img src={education} />
              <div className="mt-4 mb-2 font-bold text-[#101457] text-lg">
                Education Support
              </div>
              <div className="w-[90%] mx-auto text-center text-sm font-normal text-[#475467] tracking-[0.2px] leading-[140%]">
                With lots of unique blocks you can easily create a page without
                coding with Appmax
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="font-normal text-lg leading-[140%] tracking-[0.2px] text-[#EDAA03] text-center md:text-left">
              About Afroscholar
            </div>
            <div className="font-bold text-[34px] md:text-[44px] leading-[42px] md:leading-[52px] text-[#101457] mt-4 mb-2 text-center md:text-left">
              Our goal is to make online education work for everyone
            </div>
            <div className="font-normal text-base leading-[140%] tracking-[0.2px] text-[#475467] text-center md:text-left">
              Aenean tempor sapien gravida donec enim porta justo integer at
              odio velna vitae auctor integer congue magna at pretium purus
              pretium ligula rutrum luctus risus.
            </div>
            <div className="mt-8 text-center md:text-left">
              <button className="font-medium text-lg leading-[140%] text-[#000B33] bg-[#EBC31E] p-4 shadow rounded-md">
                Fund a Scholarship
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* App / Services */}
      <section className="relative overflow-hidden bg-[#101457]">
        <Container className="max-w-screen-lg mx-auto grid grid-cols-1 items-center py-14 md:grid-cols-2 lg:py-20">
          <div className="order-1 md:order-2">
            <div className="font-bold w-[90%] text-[34px] md:text-[44px] leading-[42px] md:leading-[52px] tracking-normal text-white">
              We develop digital strategies products and services.
            </div>
            <div className="font-normal w-[90%] text-base leading-[140%] tracking-[0.2px] text-white mt-4">
              Vero honoro perfecto mel te, sonet aperiam an nec. Ni nec dicti
              alterra legimus. Mea vide elige nosea expet ian id eis. Eti mea an
              duo, habe tlu que com titure wisi cu.
            </div>
          </div>

          <div className="order-2 md:order-1">
            <div className="relative mx-auto w-full max-w-sm">
              <img src={mdownload} alt="App" />
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="max-w-screen-lg mx-auto">
        <Container className="flex flex-col md:flex-row items-center justify-center md:justify-start py-36">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <div>
              <div className="w-full md:w-[90%] font-bold text-[34px] md:text-[44px] leading-[42px] md:leading-[52px] tracking-normal text-[#101457]">
                See How You Can Find a Scholar Easily
              </div>
              <div className="w-full md:w-[75%] font-normal text-base leading-[140%] tracking-[0.2px] text-[#475467] mt-2">
                Vero honoro perfecto mel te, sonet aperiam an nec. Ni nec dicti
                alterra legimus. Mea vide elige nosea expet ian id eis. E mel
                omita usu in modo, habe tlu que com titure wisi cu.
              </div>
            </div>
            <button className="bg-[#EBC31E] flex items-center justify-center gap-x-2 font-medium text-base leading-[140%] tracking-[0.2px] text-[#101457] p-4 mt-12">
              <Download />
              Download Now
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <div className="group relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={video}
                alt="tutorial"
                className="h-[396px] w-[572.4px]"
              />
              <button
                className="absolute inset-0 m-auto flex h-12 w-46 px-2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition group-hover:bg-white"
                aria-label="Watch a Quick Tutorial"
              >
                Watch a Quick Tutorial
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="bg-white">
        <Container className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="font-bold text-[34px] md:text-[44px] leading-[42px] md:leading-[52px] tracking-normal text-[#101457]">
              Our qualified team
            </div>
            <div className="w-full md:w-[30%] mx-auto mb-4 text-center font-normal text-base leading-[140%] tracking-[0.2px] text-[#475467] mt-2">
              Fully layered dolor sit amet, consectetur Facere, nobis, id
              expedita dolores officiis laboriosam.
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center md:space-x-6 space-y-6 md:space-y-0">
            {team.map((t) => (
              <TeamCard key={t.name} {...t} />
            ))}
          </div>
        </Container>
      </section>

      {/* Stats band */}
      <section className="relative overflow-hidden bg-indigo-900 py-10 text-white">
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatPill value="28K" label="Total Users" icon={<Users />} />
            <StatPill
              value="13K"
              label="Lifetime Downloads"
              icon={<CloudDownload />}
            />
            <StatPill value="68K" label="Social Likes" icon={<ThumbsUp />} />
            <StatPill value="10K" label="5 Star Ratings" icon={<Star />} />
          </div>
        </Container>
        <div className="pointer-events-none absolute -left-24 bottom-0 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-24 -top-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Footer */}
      <Footer />
      {showOption && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-lg font-semibold">Select a portal</h3>
              <button
                onClick={() => setShowOption(false)}
                className="cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="font-medium text-[20px] text-[#212121] mb-6 text-center">
                We are the best African scholarship portal
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single application tile */}
                <button
                  type="button"
                  onClick={() => setSelectedType("scholar")}
                  className={
                    "w-full border border-[#e3e4e6] rounded-xl p-6 hover:bg-muted transition flex flex-col items-center justify-center" +
                    (selectedType === "scholar" ? " ring-2 ring-[#3062C8]" : "")
                  }
                >
                  <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                    <GraduationCapIcon className="w-6 h-6 text-[#EBC31E]" />
                  </div>
                  <div className="font-semibold">Get a Scholarship</div>
                  <div className="text-sm text-muted-foreground">
                    Register to receive support and funding for your educational
                    aspirations
                  </div>
                </button>

                {/* Bulk application tile */}
                <button
                  type="button"
                  onClick={() => setSelectedType("sponsor")}
                  className={
                    "w-full border border-[#e3e4e6] rounded-xl p-6 hover:bg-muted transition flex flex-col items-center justify-center" +
                    (selectedType === "sponsor" ? " ring-2 ring-[#3062C8]" : "")
                  }
                >
                  <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-[#EBC31E]" />
                  </div>
                  <div className="font-semibold">Fund a Scholarship</div>
                  <div className="text-sm text-muted-foreground">
                    Create, fund and manage scholarships that can be easily
                    accessed by profiled Africans
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow"
                onClick={() => setShowOption(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleStartOptionContinue}
                className="bg-[#3062C8] text-white py-2 px-4 rounded-lg shadow"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

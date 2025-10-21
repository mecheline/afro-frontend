// src/modules/sponsor/profile/useProfileStepNav.ts
import { useLocation, useNavigate } from "react-router";

export const STEP_KEYS = [
  "personal",
  "residence",
  "employment",
  "social",
  "hobbies",
  "anniversaries",
  "verification",
] as const;

export default function useProfileStepNav(base = "/sponsor/dashboard/profile") {
  const location = useLocation();
  const navigate = useNavigate();

  const idx = Math.max(
    0,
    STEP_KEYS.findIndex((k) => location.pathname.startsWith(`${base}/${k}`))
  );

  const goTo = (key: (typeof STEP_KEYS)[number]) => navigate(`${base}/${key}`);

  const goNext = () => {
    const nextIdx = Math.min(STEP_KEYS.length - 1, idx + 1);
    if (nextIdx !== idx) navigate(`${base}/${STEP_KEYS[nextIdx]}`);
  };

  const goPrev = () => {
    const prevIdx = Math.max(0, idx - 1);
    if (prevIdx !== idx) navigate(`${base}/${STEP_KEYS[prevIdx]}`);
  };

  return {
    currentIndex: idx,
    currentKey: STEP_KEYS[idx],
    isFirst: idx === 0,
    isLast: idx === STEP_KEYS.length - 1,
    goNext,
    goPrev,
    goTo,
  };
}

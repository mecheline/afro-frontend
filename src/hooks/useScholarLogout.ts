// src/hooks/useScholarLogout.ts
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { persistor } from "../redux/services/scholar/store";




export default function useScholarLogout() {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
   

    // 2) purge redux-persist
    try {
      await persistor.purge();
    } catch {}

    // 3) clear any ad-hoc storage (scoped to your app)
    try {
      // If you use specific keys, prefer removing them explicitly:
      // localStorage.removeItem("token"); localStorage.removeItem("scholarState");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } catch {}

    // 4) (optional) clear cookie tokens if you set any (simple client-side unset)
    try {
      document.cookie = "access_token=; Max-Age=0; path=/";
      document.cookie = "refresh_token=; Max-Age=0; path=/";
    } catch {}

    // 5) navigate home
    navigate("/", { replace: true });
  }, [navigate]);

  return logout;
}

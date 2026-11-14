import { useEffect, useState } from "preact/hooks";
import { getUser, onAuthStateChange } from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";

export interface AuthUserInfo {
  email?: string | null;
  name?: string | null;
}

export function useAuthSession() {
  const [authUser, setAuthUser] = useState<AuthUserInfo | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void getUser().then((u) =>
      setAuthUser(
        u
          ? {
              email: u.email,
              name: (u.user_metadata as any)?.full_name || (u.user_metadata as any)?.name || null,
            }
          : null,
      ),
    );
    return onAuthStateChange((u) =>
      setAuthUser(
        u
          ? {
              email: u.email,
              name: (u.user_metadata as any)?.full_name || (u.user_metadata as any)?.name || null,
            }
          : null,
      ),
    );
  }, []);

  return authUser;
}

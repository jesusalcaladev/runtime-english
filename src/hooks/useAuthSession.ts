import { useEffect, useState } from "preact/hooks";
import { getUser, onAuthStateChange } from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";

export interface AuthUserInfo {
  email?: string | null;
  name?: string | null;
}

export function useAuthSession() {
  const [authUser, setAuthUser] = useState<AuthUserInfo | null>(null);

  const toAuthUserInfo = (user: { email?: string | null; user_metadata?: unknown } | null): AuthUserInfo | null => {
    if (!user) return null;
    const metadata =
      user.user_metadata && typeof user.user_metadata === "object"
        ? (user.user_metadata as Record<string, unknown>)
        : {};
    const fullName = typeof metadata.full_name === "string" ? metadata.full_name : null;
    const name = typeof metadata.name === "string" ? metadata.name : null;
    return {
      email: user.email ?? null,
      name: fullName || name || null,
    };
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void getUser().then((user) => setAuthUser(toAuthUserInfo(user)));
    return onAuthStateChange((user) => setAuthUser(toAuthUserInfo(user)));
  }, []);

  return authUser;
}

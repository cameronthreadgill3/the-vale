import { useCallback, useEffect, useState } from "react";
import { entitled, type Access } from "@/canon/catalog";
import { getMembership, type Membership } from "@/lib/membership";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const NONE: Membership = {
  member: false,
  voices: false,
  anime: false,
  status: "none",
  innkeeper: false,
  houseClaimed: false,
  periodEnd: null,
  voicesEnd: null,
  animeEnd: null,
};

export function useMembership() {
  const { user, isPending } = useCurrentUserState();
  const [mem, setMem] = useState<Membership>(NONE);

  const reload = useCallback(() => {
    if (!user) {
      setMem(NONE);
      return Promise.resolve();
    }
    return getMembership()
      .then(setMem)
      .catch(() => setMem(NONE));
  }, [user]);

  useEffect(() => {
    if (isPending) return;
    void reload();
  }, [isPending, reload]);

  return {
    member: mem.member,
    voices: mem.voices,
    anime: mem.anime,
    status: mem.status,
    innkeeper: mem.innkeeper,
    houseClaimed: mem.houseClaimed,
    periodEnd: mem.periodEnd,
    voicesEnd: mem.voicesEnd,
    animeEnd: mem.animeEnd,
    authPending: isPending,
    signedIn: Boolean(user),
    open: (access: Access) => entitled(access, mem),
    reload,
  };
}

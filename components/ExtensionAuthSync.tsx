"use client";

import { createClient } from "@/lib/supabase/client";
import { syncExtensionAuth } from "@/lib/extension-auth-sync";
import { useEffect } from "react";

interface ExtensionAuthSyncProps {
  subscriptionTier?: string | null;
}

export default function ExtensionAuthSync({
  subscriptionTier,
}: ExtensionAuthSyncProps) {
  useEffect(() => {
    const supabase = createClient();

    void syncExtensionAuth(supabase, subscriptionTier);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncExtensionAuth(supabase);
    });

    return () => subscription.unsubscribe();
  }, [subscriptionTier]);

  return null;
}

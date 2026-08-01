"use client";

import {
  LocaleProvider,
  LocaleRemountBoundary,
} from "@/context/LocaleContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <LocaleRemountBoundary>{children}</LocaleRemountBoundary>
    </LocaleProvider>
  );
}

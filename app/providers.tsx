"use client";

import { LocaleProvider } from "@/context/LocaleContext";

/** Root client providers — LocaleProvider wraps entire app tree */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

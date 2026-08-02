"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function getEmailInitial(email: string | undefined): string {
  if (!email) return "?";
  return email.charAt(0).toUpperCase();
}

function getAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as { avatar_url?: string; picture?: string };
  return meta.avatar_url ?? meta.picture ?? null;
}

export default function UserAvatarMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/auth";
  }

  if (loading) {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <Link href="/auth" className="btn-secondary !py-2 !text-xs sm:!text-sm">
        <UserIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const email = user.email ?? "Member";
  const avatarUrl = getAvatarUrl(user);
  const initial = getEmailInitial(user.email);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white p-0.5 pr-2 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-nectar-400 to-nectar-600 text-sm font-semibold text-white">
            {initial}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-500 transition ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {email}
            </p>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import MemberHeaderBrand from "@/components/MemberHeaderBrand";
import MemberNav from "@/components/MemberNav";
import UpgradeToProButton from "@/components/UpgradeToProButton";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?redirect=/dashboard");
  }

  const { checkout } = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const tier = profile?.subscription_tier ?? "free";
  const isPro = tier === "pro";

  return (
    <main className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <MemberHeaderBrand
            title="Dashboard"
            subtitle="Nectar AI Member Area"
          />
          <div className="flex flex-wrap items-center gap-2">
            <MemberNav current="dashboard" />
            <UserAvatarMenu />
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Plan</dt>
              <dd className="font-medium capitalize text-gray-900 dark:text-white">
                {tier}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
              <dd className="break-all font-mono text-xs text-gray-900 dark:text-white">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Session Status</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">Authenticated</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Last Sign In</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
          </dl>

          {checkout === "success" && (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
              Payment received. Your Pro subscription will activate shortly.
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/workspace" className="btn-primary">
              Open AI Workspace
            </Link>
            {!isPro && <UpgradeToProButton />}
            <Link href="/" className="btn-secondary">
              Public Extractor
            </Link>
            <Link href="/test-supabase" className="btn-secondary">
              Supabase Test
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

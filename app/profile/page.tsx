import ProfileForm from "@/app/profile/ProfileForm";
import MemberNav from "@/components/MemberNav";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?redirect=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gradient-to-b from-nectar-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nectar-400 to-nectar-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.full_name ?? user.email ?? "Member"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MemberNav current="profile" />
            <UserAvatarMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ProfileForm
          userId={user.id}
          email={user.email}
          initialFullName={profile?.full_name ?? ""}
          initialUpdatedAt={profile?.updated_at ?? null}
          profileExists={!!profile}
        />
      </section>
    </main>
  );
}

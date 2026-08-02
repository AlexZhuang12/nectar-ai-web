import ProfileForm from "@/app/profile/ProfileForm";
import MemberHeaderBrand from "@/components/MemberHeaderBrand";
import MemberNav from "@/components/MemberNav";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { createClient } from "@/lib/supabase/server";
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
          <MemberHeaderBrand
            title="Profile"
            subtitle={profile?.full_name ?? user.email ?? "Member"}
          />
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

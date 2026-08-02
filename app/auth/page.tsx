import { Suspense } from "react";
import AuthForm from "./AuthForm";

function AuthFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-nectar-50/50 to-white px-4 py-10 dark:from-gray-950 dark:to-gray-900">
      <div className="card w-full max-w-md animate-pulse p-8 text-center text-sm text-gray-500">
        Loading…
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm />
    </Suspense>
  );
}

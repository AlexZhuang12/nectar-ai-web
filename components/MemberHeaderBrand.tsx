import { Sparkles } from "lucide-react";
import Link from "next/link";

interface MemberHeaderBrandProps {
  title: string;
  subtitle: string;
}

export default function MemberHeaderBrand({
  title,
  subtitle,
}: MemberHeaderBrandProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 rounded-lg transition hover:opacity-80"
      aria-label="Back to Nectar AI home"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nectar-400 to-nectar-600 text-white shadow-md">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </Link>
  );
}

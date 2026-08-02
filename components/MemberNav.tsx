import Link from "next/link";

type MemberNavProps = {
  current: "dashboard" | "workspace" | "profile";
};

const links = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" as const },
  { href: "/workspace", label: "Workspace", key: "workspace" as const },
  { href: "/profile", label: "Profile", key: "profile" as const },
];

export default function MemberNav({ current }: MemberNavProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map(({ href, label, key }) => (
        <Link
          key={key}
          href={href}
          className={
            current === key
              ? "rounded-lg bg-nectar-100 px-3 py-2 text-xs font-medium text-nectar-800 dark:bg-nectar-950 dark:text-nectar-200 sm:text-sm"
              : "btn-secondary !py-2 !text-xs sm:!text-sm"
          }
          aria-current={current === key ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

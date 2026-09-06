import type { ReactNode } from "react";

interface AdminContentShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export default function AdminContentShell({
  title,
  description,
  children,
}: AdminContentShellProps) {
  return (
    <section>
      {title ? (
        <header className="mb-6 min-w-0">
          <h1 className="title text-xl font-bold sm:text-2xl">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

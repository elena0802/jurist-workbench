import Link from "next/link";

interface HeaderProps {
  variant?: "landing" | "workbench";
}

export default function Header({ variant = "landing" }: HeaderProps) {
  return (
    <header className="border-b border-border bg-paper/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-border-dark bg-highlight">
            <span className="font-serif text-sm font-semibold text-accent">JW</span>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold tracking-tight text-ink">
              Jurist Workbench
            </p>
            <p className="text-xs text-ink-faint">형사법 출제 워크벤치</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {variant === "landing" ? (
            <Link
              href="/workbench"
              className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
            >
              워크벤치 시작
            </Link>
          ) : (
            <Link
              href="/"
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              소개
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

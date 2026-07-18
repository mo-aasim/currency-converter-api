import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/currencies?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-surface-dark/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold text-ink-900 dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          FX<span className="text-brand-600">Convert</span>
        </Link>

        <form onSubmit={submit} className="hidden flex-1 sm:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a currency (e.g. EUR)…"
            className="input mx-auto max-w-xs"
          />
        </form>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 hover:text-brand-600 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-brand-400"
          >
            Convert
          </Link>
          <Link
            to="/currencies"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 hover:text-brand-600 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-brand-400"
          >
            Currencies
          </Link>
          <Link
            to="/trends"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 hover:text-brand-600 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-brand-400 sm:block"
          >
            Trends
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

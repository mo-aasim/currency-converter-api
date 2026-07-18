import { Send, MessageCircle, Globe, ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "Convert", to: "/" },
  { label: "Currencies", to: "/currencies" },
  { label: "Trends", to: "/trends" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-white/60 dark:border-white/10 dark:bg-surface-dark-raised/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-xl font-extrabold text-ink-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ArrowLeftRight className="h-5 w-5" />
            </span>
            FX<span className="text-brand-600">Convert</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Live exchange rates with a multi-currency view, trends, and rate
            alerts. Powered by a caching proxy API.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink-900 dark:text-white">
            Explore
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink-900 dark:text-white">
            Follow
          </h4>
          <div className="mt-3 flex gap-3">
            {[Send, MessageCircle, Globe].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-ink-300 dark:hover:text-brand-400"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5 text-center text-xs text-muted dark:border-white/10">
        © {new Date().getFullYear()} FXConvert · Rates via public provider,
        cached & rate-limited
      </div>
    </footer>
  );
}

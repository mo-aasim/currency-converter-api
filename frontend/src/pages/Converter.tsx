import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Star,
  Trash2,
  Bell,
  TrendingUp,
} from "lucide-react";
import { api } from "../api/client";
import { CountryList, RatePoint, ConvertResult } from "../types";
import { formatMoney, formatNumber } from "../utils/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PageTransition } from "../components/motion";
import { useTheme } from "../context/ThemeContext";

const POPULAR = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD"];

interface HistoryEntry {
  from: string;
  to: string;
  amount: number;
  result: number;
  at: number;
}

interface Alert {
  id: string;
  from: string;
  to: string;
  target: number;
  direction: "above" | "below";
  triggered?: boolean;
}

export default function Converter() {
  const { theme } = useTheme();
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [countryList, setCountryList] = useState<CountryList>({});
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [multiRates, setMultiRates] = useState<{ code: string; rate: number }[]>(
    []
  );
  const [trend, setTrend] = useState<RatePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [spin, setSpin] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // favorites + alerts (localStorage)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertTarget, setAlertTarget] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("below");

  useEffect(() => {
    api
      .currencies()
      .then((d) => {
        setCurrencies(d.currencies);
        setCountryList(d.countryList);
      })
      .catch((e) => setError(e.message));

    const saved = localStorage.getItem("fx_history");
    if (saved) setHistory(JSON.parse(saved));
    const fav = localStorage.getItem("fx_favorites");
    if (fav) setFavorites(JSON.parse(fav));
    const al = localStorage.getItem("fx_alerts");
    if (al) setAlerts(JSON.parse(al));
  }, []);

  const value = Number(amount);

  useEffect(() => {
    if (!amount || isNaN(value) || value <= 0) {
      setResult(null);
      setMultiRates([]);
      return;
    }
    setLoading(true);
    setError("");
    const delay = setTimeout(async () => {
      try {
        const r = await api.convert(from, to, value);
        setResult(r);
        const others = POPULAR.filter((c) => c !== to).slice(0, 6);
        const rates = await Promise.all(
          others.map(async (c) => {
            const rr = await api.convert(from, c, value);
            return { code: c, rate: rr.converted };
          })
        );
        setMultiRates(rates);

        const h = api.history(from, to);
        const t = await h;
        setTrend(t.points.slice(-20));

        // evaluate alerts for this pair
        setAlerts((prev) => {
          let changed = false;
          const next = prev.map((a) => {
            if (a.from === from && a.to === to) {
              const hit =
                a.direction === "above" ? r.rate >= a.target : r.rate <= a.target;
              if (hit && !("triggered" in a)) {
                changed = true;
                return { ...a, triggered: true };
              }
            }
            return a;
          });
          if (changed) {
            localStorage.setItem("fx_alerts", JSON.stringify(next));
          }
          return changed ? next : prev;
        });

        const entry: HistoryEntry = {
          from,
          to,
          amount: value,
          result: r.converted,
          at: Date.now(),
        };
        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, 8);
          localStorage.setItem("fx_history", JSON.stringify(next));
          return next;
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(delay);
  }, [from, to, amount, value]);

  const flag = (code: string) =>
    countryList[code]
      ? `https://flagsapi.com/${countryList[code]}/flat/64.png`
      : "";

  const pairKey = `${from}-${to}`;
  const isFav = favorites.includes(pairKey);
  const toggleFav = () => {
    setFavorites((prev) => {
      const next = prev.includes(pairKey)
        ? prev.filter((x) => x !== pairKey)
        : [...prev, pairKey];
      localStorage.setItem("fx_favorites", JSON.stringify(next));
      return next;
    });
  };

  const swap = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 400);
    setFrom(to);
    setTo(from);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard?.writeText(`${formatNumber(result.converted)} ${result.to}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("fx_history");
  };

  const addAlert = () => {
    const t = Number(alertTarget);
    if (!t || t <= 0) return;
    const next: Alert[] = [
      ...alerts.filter((a) => !(a.from === from && a.to === to)),
      {
        id: `${pairKey}-${Date.now()}`,
        from,
        to,
        target: t,
        direction: alertDir,
      },
    ];
    setAlerts(next);
    localStorage.setItem("fx_alerts", JSON.stringify(next));
    setAlertTarget("");
  };

  const removeAlert = (id: string) => {
    const next = alerts.filter((a) => a.id !== id);
    setAlerts(next);
    localStorage.setItem("fx_alerts", JSON.stringify(next));
  };

  const activeAlert = alerts.find((a) => a.from === from && a.to === to);

  const axis = theme === "dark" ? "#94a3b8" : "#64748b";
  const tipBg = theme === "dark" ? "#131a2e" : "#ffffff";
  const tipBorder = theme === "dark" ? "#333" : "#e2e8f0";

  const CurrencySelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
      {flag(value) && (
        <img src={flag(value)} alt={value} className="h-5 w-7 rounded-sm" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold text-ink-900 outline-none dark:text-ink-100"
      >
        {currencies.map((c) => (
          <option key={c} value={c} className="text-ink-900">
            {c}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-ink-900 dark:text-white">
            Currency Converter
          </h1>
          <p className="mt-1 text-sm text-muted">
            Live rates, multi-currency view, trends, and rate alerts.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-8 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Amount
            </label>
            <button
              onClick={toggleFav}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                isFav
                  ? "bg-brand-600 text-white"
                  : "border border-ink-200 text-ink-600 hover:bg-ink-100 dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/10"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
              {isFav ? "Saved" : "Save pair"}
            </button>
          </div>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input mt-2 text-lg font-semibold"
          />

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <CurrencySelect value={from} onChange={setFrom} />
            </div>
            <button
              onClick={swap}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white transition hover:bg-brand-700 ${
                spin ? "animate-spin-slow" : ""
              }`}
              aria-label="Swap currencies"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <CurrencySelect value={to} onChange={setTo} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-brand-600/10 p-4 text-center dark:bg-brand-500/10">
            {loading && <p className="text-sm text-muted">Converting…</p>}
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            {result && !loading && (
              <div>
                <div className="text-2xl font-extrabold text-ink-900 dark:text-white">
                  {formatMoney(result.converted, result.to)}
                </div>
                <div className="mt-1 text-xs text-muted">
                  1 {result.from} = {formatNumber(result.rate)} {result.to}
                  {result.cached ? " • cached" : ""}
                </div>
                <button
                  onClick={copy}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy result
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Rate alert */}
        <div className="card mt-6 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
              Rate alert · {from}→{to}
            </h2>
          </div>
          {activeAlert ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-sm dark:bg-brand-500/10">
              <span className="text-ink-700 dark:text-ink-200">
                Notify when 1 {from} goes {activeAlert.direction}{" "}
                <b>{formatNumber(activeAlert.target)}</b> {to}
              </span>
              <button
                onClick={() => removeAlert(activeAlert.id)}
                className="text-ink-400 hover:text-red-500"
                aria-label="Remove alert"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <select
                value={alertDir}
                onChange={(e) => setAlertDir(e.target.value as "above" | "below")}
                className="input sm:w-32"
              >
                <option value="below">drops below</option>
                <option value="above">rises above</option>
              </select>
              <input
                type="number"
                value={alertTarget}
                onChange={(e) => setAlertTarget(e.target.value)}
                placeholder={`Target rate (${to})`}
                className="input"
              />
              <button onClick={addAlert} className="btn-primary whitespace-nowrap">
                Set alert
              </button>
            </div>
          )}
        </div>

        {/* Multi-currency panel */}
        {multiRates.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-200">
              {formatNumber(value)} {from} also equals
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {multiRates.map((m) => (
                <div key={m.code} className="card rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {flag(m.code) && (
                      <img src={flag(m.code)} alt={m.code} className="h-4 w-5 rounded-sm" />
                    )}
                    {m.code}
                  </div>
                  <div className="mt-1 font-bold text-ink-900 dark:text-white">
                    {formatNumber(m.rate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend chart */}
        {trend.length > 1 && (
          <div className="card mt-6 rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                Rate trend ({from}→{to})
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: axis, fontSize: 10 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: tipBg,
                    border: `1px solid ${tipBorder}`,
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelFormatter={(l) => new Date(l as string).toLocaleTimeString()}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#818cf8"
                  fill="url(#g)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="card mt-6 rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                Recent conversions
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-ink-400 hover:text-red-400"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-ink-100 px-3 py-2 text-sm dark:bg-white/5"
                >
                  <span className="text-muted">
                    {formatNumber(h.amount)} {h.from} → {h.to}
                  </span>
                  <span className="font-semibold text-ink-900 dark:text-white">
                    {formatNumber(h.result)} {h.to}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

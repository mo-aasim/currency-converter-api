import { useEffect, useState } from "react";
import { api } from "./api/client";
import { CountryList, RatePoint, ConvertResult } from "./types";
import { formatMoney, formatNumber } from "./utils/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const POPULAR = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD"];

interface HistoryEntry {
  from: string;
  to: string;
  amount: number;
  result: number;
  at: number;
}

export default function Converter() {
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
        // multi-rate panel: show this amount in several popular currencies
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

  const swap = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 400);
    setFrom(to);
    setTo(from);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard?.writeText(
      `${formatNumber(result.converted)} ${result.to}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("fx_history");
  };

  const CurrencySelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      {flag(value) && (
        <img src={flag(value)} alt={value} className="h-5 w-7 rounded-sm" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold text-white outline-none"
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
    <div className="mx-auto max-w-3xl px-4 py-10 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Currency Converter</h1>
        <p className="mt-1 text-sm text-white/60">
          Live rates, multi-currency view, and conversion history.
        </p>
      </div>

      <div className="card mt-8 rounded-3xl bg-ink-800/80 p-6 shadow-card backdrop-blur">
        <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
          Amount
        </label>
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
            ⇄
          </button>
          <div className="flex-1">
            <CurrencySelect value={to} onChange={setTo} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-brand-600/15 p-4 text-center">
          {loading && (
            <p className="text-sm text-white/60">Converting…</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {result && !loading && (
            <div>
              <div className="text-2xl font-extrabold">
                {formatMoney(result.converted, result.to)}
              </div>
              <div className="mt-1 text-xs text-white/60">
                1 {result.from} = {formatNumber(result.rate)} {result.to}
                {result.cached ? " • cached" : ""}
              </div>
              <button
                onClick={copy}
                className="mt-2 text-xs font-semibold text-brand-400 hover:underline"
              >
                {copied ? "Copied!" : "Copy result"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-currency panel */}
      {multiRates.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-white/70">
            {formatNumber(value)} {from} also equals
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {multiRates.map((m) => (
              <div key={m.code} className="card rounded-xl bg-ink-800/60 p-3">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  {flag(m.code) && (
                    <img src={flag(m.code)} alt={m.code} className="h-4 w-5 rounded-sm" />
                  )}
                  {m.code}
                </div>
                <div className="mt-1 font-bold">
                  {formatNumber(m.rate)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend chart */}
      {trend.length > 1 && (
        <div className="card mt-6 rounded-2xl bg-ink-800/60 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/70">
            Rate trend ({from}→{to})
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#888", fontSize: 10 }} width={40} />
              <Tooltip
                contentStyle={{
                  background: "#131a2e",
                  border: "1px solid #333",
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
        <div className="card mt-6 rounded-2xl bg-ink-800/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70">
              Recent conversions
            </h2>
            <button
              onClick={clearHistory}
              className="text-xs text-white/40 hover:text-red-400"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
              >
                <span className="text-white/70">
                  {formatNumber(h.amount)} {h.from} → {h.to}
                </span>
                <span className="font-semibold">
                  {formatNumber(h.result)} {h.to}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

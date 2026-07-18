import { useEffect, useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "../api/client";
import { RatePoint, CountryList } from "../types";
import { formatNumber } from "../utils/format";
import { PageTransition } from "../components/motion";
import { SectionHeading, EmptyState } from "../components/feedback";
import { useTheme } from "../context/ThemeContext";
import { Skeleton } from "../components/ui";

const POPULAR = ["USD", "EUR", "GBP", "INR", "JPY", "AUD"];

export default function Trends() {
  const { theme } = useTheme();
  const [countryList, setCountryList] = useState<CountryList>({});
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [points, setPoints] = useState<RatePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .currencies()
      .then((d) => setCountryList(d.countryList))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .history(from, to)
      .then((d) => setPoints(d.points.slice(-40)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  const grid = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const axis = theme === "dark" ? "#94a3b8" : "#64748b";
  const tipBg = theme === "dark" ? "#131a2e" : "#ffffff";
  const tipBorder = theme === "dark" ? "#333" : "#e2e8f0";

  const flag = (code: string) =>
    countryList[code]
      ? `https://flagsapi.com/${countryList[code]}/flat/64.png`
      : "";

  void flag;

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <SectionHeading
          eyebrow="Analytics"
          title="Rate trends"
          subtitle="Track how a currency pair has moved using stored rate points."
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input sm:w-36"
          >
            {POPULAR.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ArrowRight className="h-5 w-5 text-ink-400" />
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input sm:w-36"
          >
            {POPULAR.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="card mt-6 p-4">
          {loading ? (
            <Skeleton className="h-[280px] w-full rounded-xl" />
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : points.length < 2 ? (
            <EmptyState
              title="Not enough data yet"
              description="Convert this pair a few times on the home page to build a trend."
            />
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                  {from} → {to} · last {points.length} points
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={points}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: axis, fontSize: 10 }}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tipBg,
                      border: `1px solid ${tipBorder}`,
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelFormatter={(l) =>
                      new Date(l as string).toLocaleString()
                    }
                    formatter={(v: number) => [formatNumber(v), to]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#818cf8"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

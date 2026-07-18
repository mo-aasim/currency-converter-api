import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import { CountryList } from "../types";
import { PageTransition, Stagger, staggerItem } from "../components/motion";
import { SectionHeading, EmptyState } from "../components/feedback";
import { Skeleton } from "../components/ui";

export default function Currencies() {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [countryList, setCountryList] = useState<CountryList>({});
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .currencies()
      .then((d) => {
        setCurrencies(d.currencies);
        setCountryList(d.countryList);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setParams(params.get("q") ? { q: params.get("q")! } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const q = query.trim().toUpperCase();
  const filtered = q
    ? currencies.filter((c) => c.toUpperCase().includes(q))
    : currencies;

  const flag = (code: string) =>
    countryList[code]
      ? `https://flagsapi.com/${countryList[code]}/flat/64.png`
      : "";

  const goConvert = (code: string) => navigate(`/?from=${code}`);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <SectionHeading
          eyebrow="Reference"
          title="All currencies"
          subtitle={`Browse ${currencies.length} supported currencies and jump straight to a conversion.`}
        />

        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Search currency code…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              const v = e.target.value.trim();
              setParams(v ? { q: v } : {}, { replace: true });
            }}
          />
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No currencies found"
            description={`No match for “${query}”.`}
          />
        ) : (
          <Stagger className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((c) => (
              <motion.button
                key={c}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                onClick={() => goConvert(c)}
                className="card flex items-center gap-3 p-3 text-left transition hover:border-brand-400"
              >
                {flag(c) ? (
                  <img src={flag(c)} alt={c} className="h-6 w-9 rounded-sm" />
                ) : (
                  <span className="flex h-6 w-9 items-center justify-center rounded-sm bg-ink-100 text-[10px] font-bold text-ink-400 dark:bg-white/5">
                    {c.slice(0, 2)}
                  </span>
                )}
                <span className="flex-1 font-semibold text-ink-900 dark:text-white">
                  {c}
                </span>
                <ArrowRight className="h-4 w-4 text-ink-400" />
              </motion.button>
            ))}
          </Stagger>
        )}
      </div>
    </PageTransition>
  );
}

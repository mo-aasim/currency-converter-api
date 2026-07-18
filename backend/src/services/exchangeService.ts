import fetch from "node-fetch";
import { config } from "../utils/config";
import { TTLCache } from "../lib/cache";
import { AppError } from "../utils/errors";
import { prisma } from "../lib/prisma";

const cache = new TTLCache<Record<string, number>>();

interface RatesResponse {
  rates: Record<string, number>;
  fetchedAt: string;
  cached: boolean;
}

export async function getRates(base: string): Promise<RatesResponse> {
  const key = base.toLowerCase();
  const cached = cache.get(key);
  if (cached) {
    return {
      rates: cached,
      fetchedAt: new Date().toISOString(),
      cached: true,
    };
  }

  const url = `${config.currencyApiBase}/${key}`;
  let res: any;
  try {
    res = await fetch(url);
  } catch {
    throw new AppError("Failed to reach upstream currency provider", 502);
  }

  if (!res.ok) {
    throw new AppError("Currency not supported or upstream error", 400);
  }

  const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
  const rates = data.rates;
  if (!rates || (data.result && data.result !== "success")) {
    throw new AppError("Invalid response from currency provider", 502);
  }

  cache.set(key, rates, config.cacheTtl);
  return { rates, fetchedAt: new Date().toISOString(), cached: false };
}

export async function convert(
  from: string,
  to: string,
  amount: number
): Promise<{ rate: number; converted: number; cached: boolean }> {
  const { rates, cached } = await getRates(from);
  const rate = rates[to.toUpperCase()];
  if (rate === undefined) {
    throw new AppError(`Unsupported target currency: ${to}`, 400);
  }

  // Persist a rate point so we can render a real trend over time.
  try {
    await prisma.ratePoint.create({
      data: { base: from.toUpperCase(), target: to.toUpperCase(), rate },
    });
  } catch {
    /* non-critical */
  }

  return { rate, converted: amount * rate, cached };
}

export async function getHistory(base: string, target: string, limit = 30) {
  const points = await prisma.ratePoint.findMany({
    where: { base: base.toUpperCase(), target: target.toUpperCase() },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return points.map((p) => ({
    time: p.createdAt.toISOString(),
    rate: p.rate,
  }));
}

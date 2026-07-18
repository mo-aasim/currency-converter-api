import { ConvertResult, RatePoint } from "../types";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  currencies: () =>
    request<{ currencies: string[]; countryList: Record<string, string> }>(
      "/currencies"
    ),
  convert: (from: string, to: string, amount: number) =>
    request<ConvertResult>(
      `/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
        to
      )}&amount=${amount}`
    ),
  history: (base: string, target: string) =>
    request<{ base: string; target: string; points: RatePoint[] }>(
      `/history?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}`
    ),
};

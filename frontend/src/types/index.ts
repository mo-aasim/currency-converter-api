export interface ConvertResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted: number;
  cached: boolean;
}

export interface RatePoint {
  time: string;
  rate: number;
}

export interface RatesResponse {
  rates: Record<string, number>;
  fetchedAt: string;
  cached: boolean;
}

export type CountryList = Record<string, string>;

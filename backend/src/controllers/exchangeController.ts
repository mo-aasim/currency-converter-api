import { Request, Response } from "express";
import { z } from "zod";
import * as exchangeService from "../services/exchangeService";
import { asyncHandler, AppError } from "../utils/errors";
import { countryList } from "../../data/countryList";

export const listCurrencies = asyncHandler(
  async (_req: Request, res: Response) => {
    const currencies = Object.keys(countryList).sort();
    res.json({ currencies, countryList });
  }
);

export const getRates = asyncHandler(async (req: Request, res: Response) => {
  const base = req.params.base.toUpperCase();
  if (!countryList[base]) throw new AppError("Unsupported base currency", 400);
  const data = await exchangeService.getRates(base);
  res.json({ base, ...data });
});

export const convert = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    from: z.string().length(3),
    to: z.string().length(3),
    amount: z.coerce.number().positive(),
  });
  const { from, to, amount } = schema.parse(req.query);
  if (!countryList[from.toUpperCase()] || !countryList[to.toUpperCase()]) {
    throw new AppError("Unsupported currency code", 400);
  }
  const result = await exchangeService.convert(from, to, amount);
  res.json({
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    amount,
    rate: result.rate,
    converted: result.converted,
    cached: result.cached,
  });
});

export const history = asyncHandler(async (req: Request, res: Response) => {
  const { base, target } = z
    .object({
      base: z.string().length(3),
      target: z.string().length(3),
    })
    .parse(req.query);
  const points = await exchangeService.getHistory(base, target);
  res.json({ base: base.toUpperCase(), target: target.toUpperCase(), points });
});

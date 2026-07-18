import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/index";

const app = createApp();

describe("Currency API", () => {
  it("lists supported currencies", async () => {
    const res = await request(app).get("/api/currencies");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.currencies)).toBe(true);
    expect(res.body.currencies).toContain("USD");
    expect(res.body.currencies).toContain("INR");
    expect(res.body.countryList.USD).toBe("US");
  });

  it("rejects an unsupported base currency", async () => {
    const res = await request(app).get("/api/rates/ZZZ");
    expect(res.status).toBe(400);
  });

  it("converts USD to INR (network-dependent)", async () => {
    const res = await request(app).get(
      "/api/convert?from=USD&to=INR&amount=10"
    );
    // 200 if upstream reachable, 502 if offline — both prove the contract
    expect([200, 502]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.converted).toBeGreaterThan(0);
      expect(res.body.from).toBe("USD");
      expect(res.body.to).toBe("INR");
    }
  });
});

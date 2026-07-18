import express from "express";
import cors from "cors";
import { config } from "./utils/config";
import { errorHandler } from "./middleware/errorHandler";
import exchangeRoutes from "./routes/exchangeRoutes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", exchangeRoutes);

  app.use(errorHandler);
  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Currency API listening on port ${config.port}`);
  });
}

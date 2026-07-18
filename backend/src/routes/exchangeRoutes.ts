import { Router } from "express";
import * as exchangeController from "../controllers/exchangeController";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/currencies", exchangeController.listCurrencies);
router.get("/rates/:base", rateLimiter, exchangeController.getRates);
router.get("/convert", rateLimiter, exchangeController.convert);
router.get("/history", exchangeController.history);

export default router;

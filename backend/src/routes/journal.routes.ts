import { Router } from "express";
import {
  createTrade,
  listTrades,
  getTradeStats,
  updateTrade,
  deleteTrade,
} from "../controllers/journal.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/journal/trades?pair=EURUSD&result=WIN&from=2026-01-01&to=2026-01-31
router.get("/trades", authenticate, listTrades);

// GET /api/journal/trades/stats
router.get("/trades/stats", authenticate, getTradeStats);

// POST /api/journal/trades
router.post("/trades", authenticate, createTrade);

// PATCH /api/journal/trades/:id
router.patch("/trades/:id", authenticate, updateTrade);

// DELETE /api/journal/trades/:id
router.delete("/trades/:id", authenticate, deleteTrade);

export default router;

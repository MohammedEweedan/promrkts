// src/routes/tokens.routes.ts
import { Router } from "express";
import * as Tokens from "../controllers/tokens.controller";
import { authenticate, authorize } from "../middleware/auth";

const r = Router();

/**
 * PUBLIC / USER
 */
r.get("/market", Tokens.getMarket); // can be public; if you want auth, add authenticate

r.get("/info", authenticate, Tokens.getInfo);
r.get("/purchase/mine", authenticate, Tokens.getMine);

r.post("/purchase/create", authenticate, Tokens.createPurchase);
r.post("/purchase/proof", authenticate, Tokens.submitProof);

r.get("/wallet/me", authenticate, Tokens.getMyWallet);
r.post("/wallet/link-usdt", authenticate, Tokens.linkUsdtWallet);

r.post("/unstake", authenticate, Tokens.unstakeTokens);

r.post("/market/buy", authenticate, Tokens.marketBuy);
r.post("/market/sell", authenticate, Tokens.marketSell);

/**
 * ADMIN (analytics + moderation)
 */
r.get("/admin/metrics", authenticate, authorize("admin"), Tokens.adminTokenMetrics);

r.get("/purchase/admin/pending", authenticate, authorize("admin"), Tokens.adminListPending);
r.post("/purchase/admin/confirm", authenticate, authorize("admin"), Tokens.adminConfirm);
r.post("/purchase/admin/status", authenticate, authorize("admin"), Tokens.adminSetStatus);
r.patch("/purchase/admin/status", authenticate, authorize("admin"), Tokens.adminSetStatus);

// OPTIONAL aliases (only keep if FE uses these):
r.get("/purchase/pending", authenticate, authorize("admin"), Tokens.adminListPending);
r.post("/purchase/confirm", authenticate, authorize("admin"), Tokens.adminConfirm);
r.post("/purchase/status", authenticate, authorize("admin"), Tokens.adminSetStatus);
r.patch("/purchase/status", authenticate, authorize("admin"), Tokens.adminSetStatus);
r.get("/candles", Tokens.getCandles);

export default r;

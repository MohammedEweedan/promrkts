import { Router } from 'express';
import * as Market from '../controllers/market.controller';

const r = Router();

// Public market data (proxied from Yahoo Finance)
r.get('/candles', Market.getCandles);
r.get('/quote', Market.getQuote);

export default r;

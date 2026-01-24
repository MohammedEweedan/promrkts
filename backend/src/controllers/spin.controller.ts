import { Request, Response } from 'express';
import prisma from '../config/prisma';

// In-memory counter for unique spins (resets on server restart)
let spinCounter = 0;

// Weighted probability: 90% for 5% and 10%, 10% for others
function getWeightedOutcome(): number | 'VIP' {
  spinCounter++;
  
  // Every 10th unique spin gets a rare reward (15%, 20%, 25%, or VIP)
  if (spinCounter % 10 === 0) {
    const rare = [15, 20, 25, 'VIP' as const];
    return rare[Math.floor(Math.random() * rare.length)];
  }
  
  // 90% of the time: 5% or 10%
  const rand = Math.random();
  if (rand < 0.5) return 5;  // 50% chance for 5%
  if (rand < 0.9) return 10; // 40% chance for 10%
  
  // 10% fallback to mid-tier
  return 15;
}

// Public: POST /spin
// Returns either a promo code prize (5-25% off) or a VIP month indicator
export async function spinWheel(_req: Request, res: Response) {
  try {
    const outcome = getWeightedOutcome();

    if (outcome === 'VIP') {
      return res.json({ 
        type: 'VIP_MONTH', 
        message: 'Congrats! You won 1 month VIP access. Create an account to claim.' 
      });
    }

    // Create promo code
    const pct = outcome;
    const code = `WHEEL${pct}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const now = new Date();
    const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountType: 'PERCENT' as any,
        value: pct,
        startsAt: now,
        endsAt: ends,
        maxGlobalRedemptions: 1,
        maxPerUser: 1,
        active: true,
      },
    });

    return res.json({ 
      type: 'PROMO', 
      code: promo.code, 
      value: pct, 
      discountType: 'PERCENT' 
    });
  } catch (e) {
    return res.status(500).json({ message: 'Spin failed' });
  }
}

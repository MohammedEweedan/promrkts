import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/prisma';
import { handlePurchaseConfirmed } from './purchase.controller';

const STRIPE_API_VERSION = '2024-06-20' as any;

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export const stripeWebhook = async (req: Request & { rawBody?: Buffer }, res: Response) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) return res.status(500).send('Stripe is not configured');
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!sig || !secret) return res.status(400).send('Missing signature or webhook secret');

    const raw = (req as any).rawBody as Buffer | undefined;
    if (!raw) return res.status(400).send('Missing raw body');

    const event = stripe.webhooks.constructEvent(raw, String(sig), secret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const purchaseId =
        (session.metadata && (session.metadata as any).purchaseId) || session.client_reference_id;

      if (purchaseId) {
        const purchase = await prisma.purchase.findUnique({ where: { id: String(purchaseId) } });
        if (purchase && String(purchase.status || '').toUpperCase() !== 'CONFIRMED') {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'CONFIRMED' as any,
              stripeId: session.payment_intent ? String(session.payment_intent) : purchase.stripeId,
            },
          });
          await handlePurchaseConfirmed(purchase.id);
        }
      }
    }

    return res.json({ received: true });
  } catch (e: any) {
    return res.status(400).send(`Webhook Error: ${e?.message || 'unknown'}`);
  }
};

// Backwards-compatible stubs
export const createPaymentIntent = async (_req: Request, res: Response) => {
  return res.status(410).json({ error: 'Use /purchase/create with method=card or method=usdt.' });
};

export const createVipSubscription = async (_req: Request, res: Response) => {
  return res.status(410).json({ error: 'Use /purchase/create.' });
};

export const confirmPayment = async (_req: Request, res: Response) => {
  return res.status(410).json({ error: 'Use Stripe webhook for card payments, or /purchase/confirm for USDT proof.' });
};

export const confirmProof = async (_req: Request, res: Response) => {
  return res.status(410).json({ error: 'Use /purchase/confirm.' });
};

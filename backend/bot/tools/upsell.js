async function upsell_offer({ context }) {
  return {
    title: 'Level Up Your Trading',
    message: 'You are ready for the Advanced Price Action tier and access to VIP Telegram signals and reviews.',
    ctaText: 'Upgrade Now',
    url: process.env.UPSELL_URL || 'https://promrkts.com/products'
  };
}

module.exports = { upsell_offer };

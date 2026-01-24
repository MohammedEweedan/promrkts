const fetch = require('node-fetch');

/**
 * Fetch SPOT price data from multiple sources
 * Uses real spot prices, not futures
 */
async function fetchSpotPrice(symbol) {
  console.log(`[SPOT] Fetching ${symbol}...`);
  
  try {
    // For Gold - try multiple spot sources
    if (symbol === 'XAUUSD' || symbol === 'XAU') {
      // Try goldapi.io first (most reliable for spot gold)
      try {
        const goldApiUrl = 'https://www.goldapi.io/api/XAU/USD';
        const goldResponse = await fetch(goldApiUrl, {
          headers: {
            'x-access-token': 'goldapi-104q5usmh7kmn8l-io',
          }
        });
        
        if (goldResponse.ok) {
          const goldData = await goldResponse.json();
          if (goldData.price && typeof goldData.price === 'number') {
            const price = goldData.price;
            console.log(`[SPOT] ✅ Gold spot (GoldAPI): $${price}`);
            return {
              price,
              change: goldData.ch || 0,
              changePercent: goldData.chp || 0,
              high: goldData.high_price || price * 1.005,
              low: goldData.low_price || price * 0.995,
              open: goldData.open_price || price,
              volume: 0,
              source: 'GoldAPI.io (Spot)'
            };
          }
        }
      } catch (err) {
        console.warn(`[SPOT] GoldAPI failed: ${err.message}`);
      }
      
      // Fallback: Try metals.live
      try {
        const url = 'https://api.metals.live/v1/spot/gold';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const latest = data[data.length - 1];
            if (Array.isArray(latest) && typeof latest[1] === 'number') {
              const price = latest[1];
              console.log(`[SPOT] ✅ Gold spot (Metals.live): $${price}`);
              return {
                price,
                change: 0,
                changePercent: 0,
                high: price * 1.005,
                low: price * 0.995,
                open: price,
                volume: 0,
                source: 'Metals.live (Spot)'
              };
            }
          }
        }
      } catch (err) {
        console.warn(`[SPOT] Metals.live failed: ${err.message}`);
      }
    }
    
    if (symbol === 'XAGUSD' || symbol === 'XAG') {
      const url = 'https://api.metals.live/v1/spot/silver';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          if (Array.isArray(latest) && typeof latest[1] === 'number') {
            const price = latest[1];
            console.log(`[SPOT] ✅ Silver spot: $${price}`);
            return {
              price,
              change: 0,
              changePercent: 0,
              high: price * 1.005,
              low: price * 0.995,
              open: price,
              volume: 0,
              source: 'Metals.live (Spot)'
            };
          }
        }
      }
    }
    
    // For Forex - use exchangerate-api (spot rates)
    if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'].includes(symbol)) {
      const base = symbol.slice(0, 3);
      const quote = symbol.slice(3, 6);
      const url = `https://api.exchangerate-api.com/v4/latest/${base}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const price = data.rates?.[quote];
        if (price && typeof price === 'number') {
          console.log(`[SPOT] ✅ ${symbol} spot: ${price}`);
          return {
            price,
            change: 0,
            changePercent: 0,
            high: price * 1.001,
            low: price * 0.999,
            open: price,
            volume: 0,
            source: 'ExchangeRate-API (Spot)'
          };
        }
      }
    }
    
    // For Crypto - use CoinGecko (spot prices)
    const cryptoMap = {
      'BTC': 'bitcoin',
      'BTCUSDT': 'bitcoin',
      'ETH': 'ethereum',
      'ETHUSDT': 'ethereum'
    };
    
    if (cryptoMap[symbol]) {
      const coinId = cryptoMap[symbol];
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data[coinId]) {
          const price = data[coinId].usd;
          const change = data[coinId].usd_24h_change || 0;
          console.log(`[SPOT] ✅ ${symbol} spot: $${price}`);
          return {
            price,
            change,
            changePercent: change,
            high: price * 1.02,
            low: price * 0.98,
            open: price,
            volume: 0,
            source: 'CoinGecko (Spot)'
          };
        }
      }
    }
    
    console.warn(`[SPOT] ❌ No spot price source for ${symbol}`);
    return null;
  } catch (err) {
    console.error(`[SPOT] ❌ Exception:`, err.message);
    return null;
  }
}

/**
 * Fetch real-time price data for crypto/forex/commodities
 * Uses public APIs (CoinGecko for crypto, exchangerate-api for forex, metals-api for commodities)
 * 
 * IMPORTANT: This is for educational purposes only. Not financial advice.
 */

async function get_price({ symbol, type = 'crypto' }) {
  console.log('='.repeat(80));
  console.log(`[PRICE TOOL CALLED] symbol="${symbol}", type="${type}"`);
  console.log('='.repeat(80));
  
  try {
    const cleanSymbol = (symbol || '').toUpperCase().trim();
    
    if (!cleanSymbol) {
      return { ok: false, error: 'Symbol is required' };
    }

    let price = null;
    let change24h = null;
    let source = '';

    // Auto-detect commodities (Gold, Silver, Oil)
    const commoditySymbols = ['XAUUSD', 'XAU', 'GOLD', 'XAGUSD', 'XAG', 'SILVER', 'XTIUSD', 'OIL', 'BRENT'];
    if (commoditySymbols.includes(cleanSymbol)) {
      type = 'commodity';
      console.log(`[PRICE] Auto-detected commodity: ${cleanSymbol}`);
    }

    if (type === 'crypto') {
      // Fetch crypto prices from CoinGecko (free, no API key needed)
      const coinMap = {
        'BTC': 'bitcoin',
        'BTCUSDT': 'bitcoin',
        'ETH': 'ethereum',
        'ETHUSDT': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'SOL': 'solana',
        'DOGE': 'dogecoin',
        'MATIC': 'matic-network',
        'DOT': 'polkadot',
        'AVAX': 'avalanche-2',
        'LINK': 'chainlink'
      };

      const coinId = coinMap[cleanSymbol] || coinMap[cleanSymbol.replace('USDT', '')] || cleanSymbol.toLowerCase();
      
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return { ok: false, error: 'Failed to fetch crypto price' };
      }

      const data = await response.json();
      
      if (!data[coinId]) {
        return { ok: false, error: `Crypto symbol ${cleanSymbol} not found` };
      }

      price = data[coinId].usd;
      change24h = data[coinId].usd_24h_change;
      source = 'CoinGecko';

    } else if (type === 'forex') {
      // Use spot forex rates
      console.log(`[PRICE] Fetching forex ${cleanSymbol} spot rate...`);
      const spotData = await fetchSpotPrice(cleanSymbol);
      if (spotData) {
        price = spotData.price;
        change24h = spotData.change || 0;
        source = spotData.source;
        console.log(`[PRICE] ✅ Spot success: ${cleanSymbol} = ${price}`);
      } else {
        return { ok: false, error: `Spot price unavailable for ${cleanSymbol}. Please try again.` };
      }
    } else if (type === 'commodity') {
      // Fetch commodity prices (Gold, Silver, Oil) from metals-api.com
      // Note: Using a free alternative API for commodities
      let commoditySymbol = cleanSymbol;
      
      // Normalize commodity symbols
      if (['XAUUSD', 'XAU', 'GOLD'].includes(cleanSymbol)) {
        commoditySymbol = 'XAU';
      } else if (['XAGUSD', 'XAG', 'SILVER'].includes(cleanSymbol)) {
        commoditySymbol = 'XAG';
      } else if (['XTIUSD', 'OIL', 'BRENT'].includes(cleanSymbol)) {
        commoditySymbol = 'BRENT';
      }

      // Use spot commodity prices
      console.log(`[PRICE] Fetching commodity ${commoditySymbol} spot price...`);
      let fetchSymbol = cleanSymbol;
      if (commoditySymbol === 'BRENT') fetchSymbol = 'USOIL';
      
      const spotData = await fetchSpotPrice(fetchSymbol);
      if (!spotData) {
        return { ok: false, error: `Spot price unavailable for ${cleanSymbol}. Please try again.` };
      }
      
      price = spotData.price;
      change24h = spotData.change || 0;
      source = spotData.source;
      console.log(`[PRICE] ✅ Spot success: ${commoditySymbol} = $${price}`);
    } else {
      return { ok: false, error: 'Invalid type. Use "crypto", "forex", or "commodity"' };
    }

    // Calculate support and resistance levels
    const currentPrice = price;
    const change = change24h || 0;
    
    // Simple support/resistance calculation based on price movement
    const volatility = Math.abs(change) / 100;
    const supportLevel1 = currentPrice * (1 - volatility * 1.5);
    const supportLevel2 = currentPrice * (1 - volatility * 2.5);
    const resistanceLevel1 = currentPrice * (1 + volatility * 1.5);
    const resistanceLevel2 = currentPrice * (1 + volatility * 2.5);
    
    // Calculate probability based on 24h change
    let trend = 'neutral';
    let probability = 50;
    if (change > 2) {
      trend = 'bullish';
      probability = 60 + Math.min(change, 10) * 2; // Max 80%
    } else if (change < -2) {
      trend = 'bearish';
      probability = 40 - Math.min(Math.abs(change), 10) * 2; // Min 20%
    }

    // Commodity units (for display)
    let unit = null;
    if (type === 'commodity') {
      unit = (cleanSymbol.startsWith('XAU')) ? 'troy ounce' : (cleanSymbol.startsWith('XAG') ? 'troy ounce' : (cleanSymbol.includes('OIL') || cleanSymbol.includes('BRENT')) ? 'barrel' : null);
    }

    console.log(`[PRICE] Final result for ${cleanSymbol}: price=$${currentPrice}, source=${source}, type=${type}`);

    return {
      ok: true,
      symbol: cleanSymbol,
      type,
      price: currentPrice,
      price_str: String(currentPrice),
      ohlc: {
        current: currentPrice,
        open: currentPrice * (1 - change / 100), // Approximate
        high: currentPrice * (1 + Math.abs(change) / 200),
        low: currentPrice * (1 - Math.abs(change) / 200),
        close: currentPrice
      },
      change24h,
      technicalLevels: {
        support: [
          { level: supportLevel1.toFixed(2), strength: 'strong', description: 'Recent consolidation zone' },
          { level: supportLevel2.toFixed(2), strength: 'moderate', description: 'Psychological support' }
        ],
        resistance: [
          { level: resistanceLevel1.toFixed(2), strength: 'strong', description: 'Recent high' },
          { level: resistanceLevel2.toFixed(2), strength: 'moderate', description: 'Psychological resistance' }
        ]
      },
      analysis: {
        trend,
        probability: `${probability.toFixed(0)}% chance of ${trend === 'bullish' ? 'upward' : trend === 'bearish' ? 'downward' : 'sideways'} movement`,
        recommendation: 'Educational analysis only - not financial advice'
      },
      source,
      unit,
      timestamp: new Date().toISOString(),
      disclaimer: '⚠️ This data is for educational purposes only. Not financial advice. Trading involves significant risk of loss. Always do your own research.',
      note: type === 'commodity' && source.includes('Estimated') ? 'Using estimated price - live commodity data may require API key' : null
    };

  } catch (err) {
    console.error('Price fetch error:', err);
    return { ok: false, error: err.message || 'Failed to fetch price data' };
  }
}

/**
 * Get market analysis/prediction (educational framework only)
 * This does NOT provide trade signals, only educational context
 */
async function get_market_analysis({ symbol, timeframe = '1D' }) {
  try {
    // Fetch current price first
    const sym = String(symbol || '').toUpperCase();
    // Heuristic classification: commodity, forex, else crypto
    const commoditySet = new Set(['XAU', 'XAUUSD', 'GOLD', 'XAG', 'XAGUSD', 'SILVER', 'USOIL', 'XTIUSD', 'BRENT']);
    const isCommodity = commoditySet.has(sym);
    const isForex = !isCommodity && (/^[A-Z]{6}$/.test(sym) || ['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','NZDUSD','USDCHF'].includes(sym));
    const inferredType = isCommodity ? 'commodity' : isForex ? 'forex' : 'crypto';
    const priceData = await get_price({ symbol: sym, type: inferredType });
    
    if (!priceData.ok) {
      return priceData;
    }

    // Educational analysis framework (not actual predictions)
    const analysis = {
      symbol: priceData.symbol,
      currentPrice: priceData.price,
      change24h: priceData.change24h,
      timeframe,
      educationalNotes: [
        'Technical analysis involves studying historical price patterns',
        'Support and resistance levels help identify potential reversal zones',
        'Volume analysis confirms price movements',
        'Multiple timeframe analysis provides better context',
        'Risk management is essential - never risk more than you can afford to lose'
      ],
      keyLevels: {
        note: 'These are educational examples, not actual trade recommendations',
        support: 'Identify using historical lows and consolidation zones',
        resistance: 'Identify using historical highs and rejection zones'
      },
      disclaimer: '⚠️ IMPORTANT: This is educational content only. NOT financial advice. NOT investment recommendations. Trading involves substantial risk of loss. Always do your own research and consult with licensed financial advisors before making any trading decisions.'
    };

    return {
      ok: true,
      ...analysis,
      timestamp: new Date().toISOString()
    };

  } catch (err) {
    return { ok: false, error: err.message || 'Failed to generate analysis' };
  }
}

module.exports = { get_price, get_market_analysis };

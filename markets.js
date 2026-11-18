/* ============================================================
   BUSINESS EMPIRE — markets.js
   A simulated stock exchange and crypto market.

   Every asset has a hidden "fair value" that wanders slowly (and
   is gently pulled back toward the asset's base price so nothing
   drifts off to zero or infinity over a long game). The traded
   price jitters around that fair value with random noise every
   tick, plus the occasional news shock that moves both.

   Trades move the price too: buying pushes it up and selling pushes
   it down along an exponential curve. A buy and an immediate sell of
   the same size cancel out exactly, so spamming buy/sell can't print
   money, and a huge order pays for the price it moves.
   ============================================================ */

const MARKETS = {
  stocks: {
    label: 'Stocks',
    tickSeconds: 5,
    unit: 'share',
    unitPlural: 'shares',
    decimals: 0, // whole shares only
    impact: 1, // buying 1% of all shares moves the price ~1%
    eventChance: 0.003, // per asset, per tick
    eventMin: 0.05,
    eventMax: 0.16,
    goodNews: [
      '{name} crushes quarterly earnings',
      '{name} unveils a breakthrough product',
      'Analysts upgrade {name} to "strong buy"',
      '{name} lands a massive government contract',
      '{name} announces a surprise buyback',
    ],
    badNews: [
      '{name} misses earnings expectations',
      'Regulators open a probe into {name}',
      '{name} recalls its flagship product',
      '{name} CEO resigns unexpectedly',
      'Short sellers publish a report on {name}',
    ],
  },
  crypto: {
    label: 'Crypto',
    tickSeconds: 3,
    unit: 'coin',
    unitPlural: 'coins',
    decimals: 6, // fractional coins
    impact: 1.5,
    eventChance: 0.006,
    eventMin: 0.1,
    eventMax: 0.35,
    goodNews: [
      '{symbol} gets listed on a major exchange',
      'Whales are quietly accumulating {symbol}',
      '{name} network upgrade goes live',
      'A celebrity starts shilling {symbol}',
      '{name} partners with a payments giant',
    ],
    badNews: [
      '{name} bridge exploited by hackers',
      'Exchange halts {symbol} withdrawals',
      'An influencer dumps their entire {symbol} bag',
      '{name} developers abandon the roadmap',
      'Rumours of a {symbol} rug pull spread',
    ],
  },
};

// basePrice: where the price starts and where fair value is anchored.
// supply: shares outstanding / coins in circulation (market cap = price × supply).
// volatility: standard deviation of the per-tick log-price move.
const MARKET_ASSETS = [
  // ---- Stocks: the founder's own ventures (listed first, tagged "Your project") ----
  { symbol: 'OZEN', market: 'stocks', founder: true, name: 'Ozen Hebrew', sector: 'Language learning', icon: '👂', color: '#4f9dde', basePrice: 48.2, supply: 3.0e8, volatility: 0.012 },
  { symbol: 'ORBI', market: 'stocks', founder: true, name: 'Orbital Idle', sector: 'Gaming', icon: '🪐', color: '#9d7bea', basePrice: 61.9, supply: 2.0e8, volatility: 0.014 },
  { symbol: 'SCRL', market: 'stocks', founder: true, name: 'Script Learner', sector: 'Education', icon: '✍️', color: '#e0a458', basePrice: 33.75, supply: 2.8e8, volatility: 0.011 },
  { symbol: 'MEBA', market: 'stocks', founder: true, name: 'Mebae Japanese', sector: 'Language learning', icon: 'あ', color: '#7cc576', basePrice: 27.4, supply: 2.5e8, volatility: 0.013 },
  { symbol: 'SUBT', market: 'stocks', founder: true, name: 'SubTwine', sector: 'Language learning', icon: '💬', color: '#e46f9a', basePrice: 19.6, supply: 3.2e8, volatility: 0.013 },

  // ---- Stocks ----
  { symbol: 'NVBT', market: 'stocks', name: 'Novabyte Systems', sector: 'Technology', icon: '💻', color: '#5b8def', basePrice: 412.5, supply: 2.1e9, volatility: 0.007 },
  { symbol: 'STRX', market: 'stocks', name: 'Stratos Aerospace', sector: 'Aerospace', icon: '🛰️', color: '#8f7cf0', basePrice: 186.2, supply: 1.4e9, volatility: 0.009 },
  { symbol: 'MDCL', market: 'stocks', name: 'Medicore Labs', sector: 'Biotech', icon: '🧬', color: '#e06aa0', basePrice: 74.1, supply: 3.2e9, volatility: 0.011 },
  { symbol: 'CBLT', market: 'stocks', name: 'Cobalt Bank Holdings', sector: 'Finance', icon: '🏦', color: '#3fa7a0', basePrice: 58.75, supply: 4.0e9, volatility: 0.004 },
  { symbol: 'IRCM', market: 'stocks', name: 'Ironclad Motors', sector: 'Automotive', icon: '🚗', color: '#d0563b', basePrice: 129.4, supply: 1.6e9, volatility: 0.008 },
  { symbol: 'SNVT', market: 'stocks', name: 'Sunvault Energy', sector: 'Energy', icon: '☀️', color: '#e8b23a', basePrice: 42.3, supply: 3.5e9, volatility: 0.008 },
  { symbol: 'PXFG', market: 'stocks', name: 'Pixelforge Games', sector: 'Entertainment', icon: '🎮', color: '#a35bd6', basePrice: 96.8, supply: 9.0e8, volatility: 0.01 },
  { symbol: 'GLFG', market: 'stocks', name: 'Greenleaf Grocers', sector: 'Consumer', icon: '🥬', color: '#5fae5a', basePrice: 31.15, supply: 2.4e9, volatility: 0.003 },
  { symbol: 'BWAV', market: 'stocks', name: 'Bluewave Airlines', sector: 'Travel', icon: '✈️', color: '#3a8fd9', basePrice: 22.6, supply: 1.1e9, volatility: 0.009 },
  { symbol: 'QSMN', market: 'stocks', name: 'Quarrystone Mining', sector: 'Materials', icon: '⛏️', color: '#a0805a', basePrice: 11.4, supply: 1.3e9, volatility: 0.01 },
  { symbol: 'TDPL', market: 'stocks', name: 'Tidepool Shipping', sector: 'Logistics', icon: '🚢', color: '#2f7fb5', basePrice: 17.85, supply: 8.0e8, volatility: 0.007 },
  { symbol: 'CRMB', market: 'stocks', name: 'Crumb & Co. Bakeries', sector: 'Food & Dining', icon: '🥐', color: '#d9a066', basePrice: 8.95, supply: 6.0e8, volatility: 0.006 },

  // ---- Crypto ----
  { symbol: 'BNV', market: 'crypto', name: 'Bitnova', sector: 'Store of value', icon: '🪙', color: '#f2a541', basePrice: 38250, supply: 1.94e7, volatility: 0.012 },
  { symbol: 'ETR', market: 'crypto', name: 'Ethera', sector: 'Smart contracts', icon: '💎', color: '#7d8cf5', basePrice: 2410, supply: 1.2e8, volatility: 0.015 },
  { symbol: 'GLCR', market: 'crypto', name: 'Glacier', sector: 'Layer 1', icon: '🧊', color: '#6fd0e8', basePrice: 118.4, supply: 4.1e8, volatility: 0.018 },
  { symbol: 'EMBR', market: 'crypto', name: 'Emberchain', sector: 'DeFi', icon: '🔥', color: '#e8613a', basePrice: 47.9, supply: 5.2e8, volatility: 0.022 },
  { symbol: 'QTX', market: 'crypto', name: 'Quantix', sector: 'AI tokens', icon: '⚛️', color: '#4fd1a5', basePrice: 13.75, supply: 1.1e9, volatility: 0.024 },
  { symbol: 'AUR', market: 'crypto', name: 'Aurorium', sector: 'Gaming', icon: '🌌', color: '#9b6fe0', basePrice: 3.21, supply: 2.8e9, volatility: 0.025 },
  { symbol: 'VOLT', market: 'crypto', name: 'Voltcoin', sector: 'Payments', icon: '⚡', color: '#f5d742', basePrice: 0.842, supply: 9.5e9, volatility: 0.028 },
  { symbol: 'NEKO', market: 'crypto', name: 'Nekocoin', sector: 'Meme', icon: '🐱', color: '#f08cb8', basePrice: 0.1194, supply: 4.2e10, volatility: 0.035 },
  { symbol: 'MPAW', market: 'crypto', name: 'Moonpaw', sector: 'Meme', icon: '🐾', color: '#c9a4ff', basePrice: 0.004213, supply: 6.0e11, volatility: 0.045 },
  { symbol: 'FROG', market: 'crypto', name: 'Frogcoin', sector: 'Meme', icon: '🐸', color: '#6cc24a', basePrice: 0.0003127, supply: 4.2e12, volatility: 0.05 },
];

const ASSETS_BY_SYMBOL = Object.fromEntries(MARKET_ASSETS.map(a => [a.symbol, a]));

const PRICE_REVERSION = 0.04; // how hard price is pulled toward fair value each tick
const FAIR_REVERSION = 0.0004; // how hard fair value is pulled toward the base price each tick
const FAIR_NOISE_SHARE = 0.5; // fair value wanders at half the asset's volatility
const HISTORY_LENGTH = 60; // ticks kept for the charts
const MAX_CATCHUP_TICKS = 720; // ticks simulated on load for time spent away
const MIN_TRADE_VALUE = 0.01;
const SVG_NS = 'http://www.w3.org/2000/svg';

let marketState = null; // { assets: {SYM: {price, fair, history}}, holdings: {SYM: {units, cost}}, lastTick: {market: ms}, news: {market: {...}} }
let activeMarket = 'stocks';
const marketRowRefs = {};
const trade = { symbol: null, mode: 'buy', useMax: false };

/* ---------------- math helpers ---------------- */

// Standard normal sample (Box–Muller).
function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clampPrice(price) {
  return Math.min(Math.max(price, 1e-9), 1e12);
}

function floorUnits(units, decimals) {
  const m = Math.pow(10, decimals);
  return Math.floor(units * m + 1e-7) / m;
}

function roundUnits(units, decimals) {
  const m = Math.pow(10, decimals);
  return Math.round(units * m) / m;
}

/* ---------------- formatting ---------------- */

// Share prices read better in full ("$38,250.00"), and sub-dollar coins
// need significant digits rather than cents ("$0.0003127").
function formatPrice(value) {
  if (value >= 1) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString(undefined, { minimumSignificantDigits: 4, maximumSignificantDigits: 4 })}`;
}

function formatCompact(value) {
  const units = [
    { at: 1e12, suffix: 'T' },
    { at: 1e9, suffix: 'B' },
    { at: 1e6, suffix: 'M' },
  ];
  for (const u of units) {
    if (value >= u.at) {
      return `${(value / u.at).toLocaleString(undefined, { maximumFractionDigits: 2 })}${u.suffix}`;
    }
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatUnits(units, decimals) {
  if (units >= 1e6) return formatCompact(units);
  const maxDigits = units >= 1 ? Math.min(decimals, 4) : decimals;
  return units.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
}

function formatPercent(fraction) {
  const pct = fraction * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

function formatSignedMoney(value) {
  if (Math.abs(value) < 0.005) return formatMoney(0);
  return `${value >= 0 ? '+' : ''}${formatMoney(value)}`;
}

/* ---------------- simulation ---------------- */

function seedAssetState(asset) {
  const state = { price: asset.basePrice, fair: asset.basePrice, history: [] };
  // Pre-roll a chart's worth of ticks so a new game doesn't open on flat lines.
  for (let i = 0; i < HISTORY_LENGTH; i++) stepAsset(asset, state, null);
  return state;
}

function isValidAssetState(state) {
  return (
    state &&
    isFinite(state.price) && state.price > 0 &&
    isFinite(state.fair) && state.fair > 0 &&
    Array.isArray(state.history) && state.history.length > 1
  );
}

// Advances one asset by a single tick. Pass `market` to allow news
// events; pass null for quiet ticks (used when seeding history).
function stepAsset(asset, state, market) {
  const vol = asset.volatility;
  const logBase = Math.log(asset.basePrice);
  let logFair = Math.log(state.fair);
  let logPrice = Math.log(state.price);

  logFair += FAIR_REVERSION * (logBase - logFair) + vol * FAIR_NOISE_SHARE * gaussian();
  logPrice += PRICE_REVERSION * (logFair - logPrice) + vol * gaussian();

  let event = null;
  if (market && Math.random() < market.eventChance) {
    const good = Math.random() < 0.5;
    const size = market.eventMin + Math.random() * (market.eventMax - market.eventMin);
    const shift = Math.log(good ? 1 + size : 1 - size);
    logFair += shift;
    logPrice += shift;
    const pool = good ? market.goodNews : market.badNews;
    const template = pool[Math.floor(Math.random() * pool.length)];
    event = {
      good,
      size,
      symbol: asset.symbol,
      headline: template.replace('{name}', asset.name).replace('{symbol}', asset.symbol),
    };
  }

  state.fair = clampPrice(Math.exp(logFair));
  state.price = clampPrice(Math.exp(logPrice));
  state.history.push(Number(state.price.toPrecision(6)));
  if (state.history.length > HISTORY_LENGTH) state.history.splice(0, state.history.length - HISTORY_LENGTH);
  return event;
}

function stepMarket(key, silent) {
  const market = MARKETS[key];
  MARKET_ASSETS.forEach(asset => {
    if (asset.market !== key) return;
    const event = stepAsset(asset, marketState.assets[asset.symbol], market);
    if (!event) return;
    marketState.news[key] = event;
    if (!silent && holdingUnits(asset.symbol) > 0) {
      const sign = event.good ? '+' : '-';
      toast(`${event.good ? '📈' : '📉'} ${event.headline} (${asset.symbol} ${sign}${(event.size * 100).toFixed(0)}%)`, event.good ? 'success' : 'error');
    }
  });
}

// Called once a second by the main game loop.
function tickMarkets() {
  if (!marketState) return;
  const now = Date.now();
  let changed = false;
  Object.entries(MARKETS).forEach(([key, market]) => {
    // 250ms of slack so a 1s interval's jitter doesn't skip a tick.
    if (now - (marketState.lastTick[key] || 0) >= market.tickSeconds * 1000 - 250) {
      stepMarket(key, false);
      marketState.lastTick[key] = now;
      changed = true;
    }
  });
  if (changed) {
    saveMarkets();
    updateMarketRows();
  }
  updatePortfolioSummary();
  refreshTradePopup();
}

/* ---------------- persistence ---------------- */

function loadMarkets() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('markets'));
  } catch (e) {
    saved = null;
  }

  marketState = {
    assets: {},
    holdings: (saved && saved.holdings) || {},
    lastTick: (saved && saved.lastTick) || {},
    news: (saved && saved.news) || {},
  };

  MARKET_ASSETS.forEach(asset => {
    const s = saved && saved.assets && saved.assets[asset.symbol];
    marketState.assets[asset.symbol] = isValidAssetState(s) ? s : seedAssetState(asset);
  });

  Object.keys(marketState.holdings).forEach(symbol => {
    const h = marketState.holdings[symbol];
    if (!ASSETS_BY_SYMBOL[symbol] || !h || !(h.units > 0)) delete marketState.holdings[symbol];
  });

  // Catch up on ticks that were missed while the tab was closed.
  const now = Date.now();
  Object.entries(MARKETS).forEach(([key, market]) => {
    const last = marketState.lastTick[key];
    const missed = last ? Math.floor((now - last) / (market.tickSeconds * 1000)) : 0;
    const steps = Math.min(Math.max(missed, 0), MAX_CATCHUP_TICKS);
    for (let i = 0; i < steps; i++) stepMarket(key, true);
    marketState.lastTick[key] = now;
  });

  saveMarkets();
  buildMarketRows();
  updateMarketRows();
  updatePortfolioSummary();
  openMarket(activeMarket);
}

function saveMarkets() {
  if (marketState && !isResetting) localStorage.setItem('markets', JSON.stringify(marketState));
}

/* ---------------- holdings & trading ---------------- */

function holdingUnits(symbol) {
  const h = marketState && marketState.holdings[symbol];
  return h ? h.units : 0;
}

function getPortfolioValue() {
  if (!marketState) return 0;
  return Object.entries(marketState.holdings).reduce(
    (sum, [symbol, h]) => sum + h.units * marketState.assets[symbol].price,
    0
  );
}

function getPortfolioCost() {
  if (!marketState) return 0;
  return Object.values(marketState.holdings).reduce((sum, h) => sum + h.cost, 0);
}

// Cost to buy `units` starting from the current price, walking the
// price up as the order fills: integral of price·e^(k·x/supply).
function quoteBuy(asset, units) {
  const k = MARKETS[asset.market].impact;
  const price = marketState.assets[asset.symbol].price;
  return (price * asset.supply * Math.expm1((k * units) / asset.supply)) / k;
}

function quoteSell(asset, units) {
  const k = MARKETS[asset.market].impact;
  const price = marketState.assets[asset.symbol].price;
  return (price * asset.supply * -Math.expm1((-k * units) / asset.supply)) / k;
}

// Largest order whose quoteBuy fits in `budget` (inverse of quoteBuy),
// capped so you can never own more than exists.
function maxBuyUnits(asset, budget) {
  const market = MARKETS[asset.market];
  const k = market.impact;
  const price = marketState.assets[asset.symbol].price;
  const spendable = Math.max(0, budget - 0.01); // headroom for rounding the charge up to the cent
  let units = (Math.log1p((spendable * k) / (price * asset.supply)) / k) * asset.supply;
  units = Math.min(units, asset.supply - holdingUnits(asset.symbol));
  return Math.max(0, floorUnits(units, market.decimals));
}

function applyPriceImpact(asset, units, direction) {
  const k = MARKETS[asset.market].impact;
  const state = marketState.assets[asset.symbol];
  state.price = clampPrice(state.price * Math.exp((direction * k * units) / asset.supply));
  state.history[state.history.length - 1] = Number(state.price.toPrecision(6));
}

function buyAsset(symbol, units) {
  const asset = ASSETS_BY_SYMBOL[symbol];
  const market = MARKETS[asset.market];
  units = floorUnits(units, market.decimals);

  if (!(units > 0)) {
    toast(`Enter how many ${market.unitPlural} to buy.`, 'error');
    return false;
  }
  if (holdingUnits(symbol) + units > asset.supply) {
    toast(`There aren't that many ${symbol} ${market.unitPlural} in circulation.`, 'error');
    return false;
  }
  // Round the charge UP to the cent so tiny orders can't round down to free.
  const cost = Math.ceil(quoteBuy(asset, units) * 100 - 1e-6) / 100;
  if (cost < MIN_TRADE_VALUE) {
    toast('That order is too small. The minimum trade is $0.01.', 'error');
    return false;
  }
  if (cost > cash) {
    toast('Not enough cash for that.', 'error');
    return false;
  }

  cash = roundToHundredths(cash - cost);
  const holding = marketState.holdings[symbol] || { units: 0, cost: 0 };
  holding.units = roundUnits(holding.units + units, market.decimals);
  holding.cost = roundToHundredths(holding.cost + cost);
  marketState.holdings[symbol] = holding;
  applyPriceImpact(asset, units, 1);

  afterTrade();
  toast(`Bought ${formatUnits(units, market.decimals)} ${symbol} for ${formatMoney(cost)}.`, 'success');
  return true;
}

function sellAsset(symbol, units) {
  const asset = ASSETS_BY_SYMBOL[symbol];
  const market = MARKETS[asset.market];
  const holding = marketState.holdings[symbol];
  const owned = holding ? holding.units : 0;
  units = Math.min(floorUnits(units, market.decimals), owned);

  if (!(units > 0)) {
    toast(owned > 0 ? `Enter how many ${market.unitPlural} to sell.` : `You don't own any ${symbol}.`, 'error');
    return false;
  }
  // Round the payout DOWN to the cent.
  const proceeds = Math.floor(quoteSell(asset, units) * 100 + 1e-6) / 100;
  if (proceeds < MIN_TRADE_VALUE) {
    toast('That order is too small. The minimum trade is $0.01.', 'error');
    return false;
  }

  cash = roundToHundredths(cash + proceeds);
  const remaining = roundUnits(owned - units, market.decimals);
  if (remaining <= 0) {
    delete marketState.holdings[symbol];
  } else {
    holding.cost = roundToHundredths(holding.cost * (remaining / owned));
    holding.units = remaining;
  }
  applyPriceImpact(asset, units, -1);

  afterTrade();
  toast(`Sold ${formatUnits(units, market.decimals)} ${symbol} for ${formatMoney(proceeds)}.`, 'success');
  return true;
}

function afterTrade() {
  saveMarkets();
  saveProgress();
  updateStats();
  updateMarketRows();
  updatePortfolioSummary();
}

/* ---------------- market list rendering ---------------- */

function createAssetIcon(asset, extraClass) {
  const el = document.createElement('div');
  el.className = `asset-icon asset-icon--${asset.market}${extraClass ? ' ' + extraClass : ''}`;
  el.style.setProperty('--asset-color', asset.color);
  el.setAttribute('aria-hidden', 'true');
  el.textContent = asset.icon;
  return el;
}

function chartPoints(history, width, height, pad) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min;
  return history.map((p, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = range > 0 ? pad + (height - 2 * pad) * (1 - (p - min) / range) : height / 2;
    return [x, y];
  });
}

function priceChange(symbol) {
  const state = marketState.assets[symbol];
  const open = state.history[0];
  return open > 0 ? state.price / open - 1 : 0;
}

// Rows are built once and then updated in place every tick, so hover
// states and the page layout don't flicker as prices move.
function buildMarketRows() {
  Object.keys(MARKETS).forEach(key => {
    const list = document.getElementById(`${key}-list`);
    if (!list) return;
    list.innerHTML = '';

    MARKET_ASSETS.filter(a => a.market === key).forEach(asset => {
      const card = document.createElement('div');
      card.className = 'card market-row';
      card.onclick = () => openTradePopup(asset.symbol);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `
        <div class="card-title-row">
          <span class="card-title">${asset.name}</span>
          <span class="asset-symbol">${asset.symbol}</span>
          ${asset.founder ? '<span class="founder-tag">★ Your project</span>' : ''}
          <span class="card-badge" hidden></span>
        </div>
        <div class="asset-meta"><span class="asset-cap"></span><span class="asset-stake"></span></div>
      `;

      const spark = document.createElementNS(SVG_NS, 'svg');
      spark.setAttribute('class', 'sparkline');
      spark.setAttribute('viewBox', '0 0 72 28');
      spark.setAttribute('preserveAspectRatio', 'none');
      spark.setAttribute('aria-hidden', 'true');
      const line = document.createElementNS(SVG_NS, 'polyline');
      spark.appendChild(line);

      const quote = document.createElement('div');
      quote.className = 'asset-quote';
      quote.innerHTML = '<div class="asset-price"></div><div class="asset-change"></div>';

      card.appendChild(createAssetIcon(asset));
      card.appendChild(body);
      card.appendChild(spark);
      card.appendChild(quote);
      list.appendChild(card);

      marketRowRefs[asset.symbol] = {
        badge: body.querySelector('.card-badge'),
        cap: body.querySelector('.asset-cap'),
        stake: body.querySelector('.asset-stake'),
        spark,
        line,
        price: quote.querySelector('.asset-price'),
        change: quote.querySelector('.asset-change'),
        lastPrice: null,
      };
    });
  });
}

function updateMarketRows() {
  if (!marketState) return;
  MARKET_ASSETS.forEach(asset => {
    const refs = marketRowRefs[asset.symbol];
    if (!refs) return;
    const state = marketState.assets[asset.symbol];
    const market = MARKETS[asset.market];
    const change = priceChange(asset.symbol);
    const dir = change >= 0 ? 'up' : 'down';

    const priceText = formatPrice(state.price);
    if (refs.price.textContent !== priceText) {
      refs.price.textContent = priceText;
      if (refs.lastPrice !== null) {
        const flash = state.price >= refs.lastPrice ? 'flash-up' : 'flash-down';
        refs.price.classList.remove('flash-up', 'flash-down');
        void refs.price.offsetWidth; // restart animation
        refs.price.classList.add(flash);
      }
      refs.lastPrice = state.price;
    }

    refs.change.textContent = `${change >= 0 ? '▲' : '▼'} ${Math.abs(change * 100).toFixed(2)}%`;
    refs.change.className = `asset-change ${dir}`;
    refs.cap.textContent = `Mkt cap ${formatMoney(state.price * asset.supply)}`;

    refs.line.setAttribute('points', chartPoints(state.history, 72, 28, 3).map(p => p.join(',')).join(' '));
    refs.spark.setAttribute('class', `sparkline ${dir}`);

    const units = holdingUnits(asset.symbol);
    if (units > 0) {
      refs.badge.hidden = false;
      refs.badge.textContent = `${formatUnits(units, market.decimals)} owned`;
      refs.stake.textContent = ` · You: ${formatMoney(units * state.price)}`;
    } else {
      refs.badge.hidden = true;
      refs.stake.textContent = '';
    }
  });

  Object.keys(MARKETS).forEach(key => {
    const el = document.getElementById(`news-${key}`);
    if (!el) return;
    const news = marketState.news[key];
    if (news) {
      el.textContent = `📰 ${news.headline} (${news.symbol} ${news.good ? '+' : '-'}${(news.size * 100).toFixed(0)}%)`;
      el.className = `market-news ${news.good ? 'up' : 'down'}`;
    } else {
      el.textContent = '📰 No headlines yet. The floor is quiet.';
      el.className = 'market-news';
    }
  });
}

function updatePortfolioSummary() {
  const valueEl = document.getElementById('portfolio-value');
  const plEl = document.getElementById('portfolio-pl');
  if (!valueEl || !plEl) return;
  const value = getPortfolioValue();
  const pl = value - getPortfolioCost();
  valueEl.textContent = formatMoney(value);
  plEl.textContent = formatSignedMoney(pl);
  plEl.classList.toggle('up', pl > 0.005);
  plEl.classList.toggle('down', pl < -0.005);
}

function openMarket(key) {
  activeMarket = key;
  document.querySelectorAll('.segment').forEach(btn => btn.classList.toggle('active', btn.dataset.market === key));
  document.querySelectorAll('.market-panel').forEach(panel => panel.classList.toggle('active', panel.id === `market-${key}`));
}

/* ---------------- trade popup ---------------- */

function openTradePopup(symbol) {
  const asset = ASSETS_BY_SYMBOL[symbol];
  const market = MARKETS[asset.market];
  trade.symbol = symbol;
  trade.useMax = false;

  const iconSlot = document.getElementById('trade-icon');
  iconSlot.innerHTML = '';
  iconSlot.appendChild(createAssetIcon(asset, 'asset-icon--lg'));
  document.getElementById('trade-name').textContent = asset.name;
  document.getElementById('trade-sub').textContent = `${asset.symbol} · ${asset.sector}${asset.founder ? ' · ★ Your project' : ''}`;
  document.getElementById('trade-supply-label').textContent = asset.market === 'crypto' ? 'Circulating supply' : 'Shares outstanding';
  document.getElementById('trade-unit-label').textContent = market.unitPlural;

  const input = document.getElementById('trade-qty');
  input.value = '';
  input.step = market.decimals > 0 ? 'any' : '1';

  showPopup('trade-popup');
  setTradeMode('buy'); // also renders the popup's live figures
}

function closeTradePopup() {
  hidePopup('trade-popup');
  trade.symbol = null;
}

function setTradeMode(mode) {
  trade.mode = mode;
  trade.useMax = false;
  document.getElementById('trade-qty').value = '';
  document.querySelectorAll('.trade-mode button').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  document.querySelectorAll('.trade-chips button').forEach(btn => {
    btn.textContent = btn.dataset.pct === '1' ? (mode === 'buy' ? 'Max' : 'All') : `${Number(btn.dataset.pct) * 100}%`;
  });
  refreshTradePopup();
}

// Quick-fill chips: a share of your cash when buying, of your position when selling.
function setTradeFraction(pct) {
  if (!trade.symbol) return;
  const asset = ASSETS_BY_SYMBOL[trade.symbol];
  const market = MARKETS[asset.market];
  const units = trade.mode === 'buy'
    ? maxBuyUnits(asset, cash * pct)
    : pct >= 1 ? holdingUnits(trade.symbol) : floorUnits(holdingUnits(trade.symbol) * pct, market.decimals);
  trade.useMax = pct >= 1;
  document.getElementById('trade-qty').value = units > 0 ? String(Number(units.toFixed(market.decimals))) : '';
  refreshTradePopup();
}

function onTradeQtyInput() {
  trade.useMax = false;
  refreshTradePopup();
}

function onTradeQtyKey(event) {
  if (event.key === 'Enter') confirmTrade();
}

// Units the confirm button would trade right now. "Max"/"All" are
// re-evaluated live so a price tick can't make the order fail.
function pendingTradeUnits() {
  const asset = ASSETS_BY_SYMBOL[trade.symbol];
  const market = MARKETS[asset.market];
  if (trade.useMax) {
    return trade.mode === 'buy' ? maxBuyUnits(asset, cash) : holdingUnits(trade.symbol);
  }
  const raw = parseFloat(document.getElementById('trade-qty').value);
  return isFinite(raw) && raw > 0 ? floorUnits(raw, market.decimals) : 0;
}

function refreshTradePopup() {
  const popup = document.getElementById('trade-popup');
  if (!trade.symbol || !marketState || !popup || popup.style.display !== 'block') return;

  const asset = ASSETS_BY_SYMBOL[trade.symbol];
  const market = MARKETS[asset.market];
  const state = marketState.assets[trade.symbol];
  const holding = marketState.holdings[trade.symbol];
  const owned = holding ? holding.units : 0;
  const change = priceChange(trade.symbol);
  const dir = change >= 0 ? 'up' : 'down';

  document.getElementById('trade-price').textContent = formatPrice(state.price);
  const changeEl = document.getElementById('trade-change');
  changeEl.textContent = `${change >= 0 ? '▲' : '▼'} ${Math.abs(change * 100).toFixed(2)}%`;
  changeEl.className = `asset-change ${dir}`;

  drawTradeChart(state.history, dir);

  document.getElementById('trade-mcap').textContent = formatMoney(state.price * asset.supply);
  document.getElementById('trade-supply').textContent = formatCompact(asset.supply);
  document.getElementById('trade-owned').textContent = owned > 0 ? `${formatUnits(owned, market.decimals)} ${owned === 1 ? market.unit : market.unitPlural}` : 'None';

  const value = owned * state.price;
  const pl = holding ? value - holding.cost : 0;
  document.getElementById('trade-value').textContent = formatMoney(value);
  const plEl = document.getElementById('trade-pl');
  plEl.textContent = holding ? `${formatSignedMoney(pl)} (${formatPercent(holding.cost > 0 ? pl / holding.cost : 0)})` : '—';
  plEl.className = holding && Math.abs(pl) >= 0.005 ? (pl > 0 ? 'up' : 'down') : '';

  const units = pendingTradeUnits();
  const input = document.getElementById('trade-qty');
  if (trade.useMax && document.activeElement !== input) {
    input.value = units > 0 ? String(Number(units.toFixed(market.decimals))) : '';
  }

  const buying = trade.mode === 'buy';
  const total = units > 0 ? (buying ? quoteBuy(asset, units) : quoteSell(asset, Math.min(units, owned))) : 0;
  const impact = units > 0 ? Math.expm1(((buying ? 1 : -1) * market.impact * units) / asset.supply) : 0;

  document.getElementById('trade-total').textContent = units > 0 ? formatMoney(total) : '—';
  document.getElementById('trade-impact').textContent =
    units <= 0 ? '—' : Math.abs(impact) < 0.0001 ? '< 0.01%' : formatPercent(impact);

  const confirmBtn = document.getElementById('trade-confirm');
  confirmBtn.textContent = `${buying ? 'Buy' : 'Sell'} ${asset.symbol}`;
  confirmBtn.classList.toggle('button-gold', buying);
  confirmBtn.classList.toggle('button-sell', !buying);
  confirmBtn.disabled =
    units <= 0 ||
    total < MIN_TRADE_VALUE ||
    (buying ? total > cash || owned + units > asset.supply : units > owned);
}

function drawTradeChart(history, dir) {
  const svg = document.getElementById('trade-chart');
  if (!svg) return;
  const w = 300;
  const h = 110;
  const pts = chartPoints(history, w, h, 8);
  const line = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `M0,${h} L${pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L')} L${w},${h} Z`;
  svg.setAttribute('class', `trade-chart ${dir}`);
  svg.innerHTML = `
    <path class="trade-chart-area" d="${area}"></path>
    <polyline class="trade-chart-line" points="${line}"></polyline>
  `;
}

function confirmTrade() {
  if (!trade.symbol) return;
  const units = pendingTradeUnits();
  const ok = trade.mode === 'buy' ? buyAsset(trade.symbol, units) : sellAsset(trade.symbol, units);
  if (ok) {
    trade.useMax = false;
    document.getElementById('trade-qty').value = '';
    refreshTradePopup();
  }
}

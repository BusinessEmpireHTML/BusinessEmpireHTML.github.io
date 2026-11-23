/* ============================================================
   BUSINESS EMPIRE — main.js
   Core state, persistence, formatting helpers, tab/popup
   plumbing, and the single game loop that drives income.
   ============================================================ */

let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];

const MAX_OFFLINE_HOURS = 24; // cap offline earnings so a wrong system clock can't break the economy

// Every localStorage key that makes up a save. Reset, Export and Import all
// use this list. Settings are deliberately left out so they survive a reset.
const SAVE_KEYS = [
  'cash', 'hourlyIncome', 'clickValue', 'clicks', 'lastUpdate', 'businesses',
  'markets', 'properties', 'trophies', 'mars', 'planet',
  'research', 'achievements', 'stats',
];

document.addEventListener('DOMContentLoaded', function () {
  loadProgress();
  openTab('clicker');
  startGameLoop();
});

/* ---------------- number helpers ---------------- */

function roundToHundredths(value) {
  return parseFloat(value.toFixed(2));
}

// Compact "$1.23M / hr" style formatting so big numbers stay readable.
// Mars incomes reach far past trillions, hence the long suffix list.
// `symbol` is "$" for Earth dollars and "₥" for Martian Credits.
function formatMoney(value, symbol = '$') {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (typeof settings !== 'undefined' && settings.notation === 'scientific' && abs >= 1e6) {
    return `${sign}${symbol}${abs.toExponential(2).replace('e+', 'e')}`;
  }
  const units = [
    { at: 1e33, suffix: 'Dc' },
    { at: 1e30, suffix: 'No' },
    { at: 1e27, suffix: 'Oc' },
    { at: 1e24, suffix: 'Sp' },
    { at: 1e21, suffix: 'Sx' },
    { at: 1e18, suffix: 'Qi' },
    { at: 1e15, suffix: 'Qa' },
    { at: 1e12, suffix: 'T' },
    { at: 1e9, suffix: 'B' },
    { at: 1e6, suffix: 'M' },
    { at: 1e3, suffix: 'K' },
  ];
  for (const u of units) {
    if (abs >= u.at) {
      return `${sign}${symbol}${(abs / u.at).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${u.suffix}`;
    }
  }
  return `${sign}${symbol}${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatInt(value) {
  return Math.floor(value).toLocaleString();
}

/* ---------------- single source of truth for income ---------------- */

// Every business/investment reports its own current income; this just
// sums them so cash, upgrades, merges, and bank-vault growth can never
// desync from what's actually displayed.
function recalcHourlyIncome() {
  let total = 0;
  businesses.forEach(business => {
    if (business.type === 'bank') {
      business.income = Math.floor(business.currentMoneyInVault / 100);
    }
    total += business.income || 0;
  });
  total += getRentIncome();
  hourlyIncome = roundToHundredths(total);
  calcMarsIncome();
}

/* ---------------- persistence ---------------- */

let isResetting = false; // stops the game loop re-saving between resetGame() and the reload

function saveProgress() {
  if (isResetting) return;
  localStorage.setItem('cash', cash);
  localStorage.setItem('hourlyIncome', hourlyIncome);
  localStorage.setItem('clickValue', clickValue);
  localStorage.setItem('clicks', clicks);
  localStorage.setItem('lastUpdate', new Date().toISOString());
  localStorage.setItem('businesses', JSON.stringify(businesses));
  localStorage.setItem('properties', JSON.stringify(ownedProperties));
  localStorage.setItem('trophies', JSON.stringify(ownedTrophies));
  savePlanets();
}

// Reads a saved array of ids, dropping any that no longer exist in `catalog`.
function loadIdList(key, catalog) {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    saved = null;
  }
  if (!Array.isArray(saved)) return [];
  return [...new Set(saved)].filter(id => catalog[id]);
}

function loadProgress() {
  cash = parseFloat(localStorage.getItem('cash')) || 0;
  clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
  clicks = parseInt(localStorage.getItem('clicks')) || 0;
  lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
  businesses = JSON.parse(localStorage.getItem('businesses')) || [];
  loadProperties();
  loadTrophies();
  const legacyRefund = migrateLegacyInvestments();
  if (legacyRefund > 0) {
    cash = roundToHundredths(cash + legacyRefund);
    toast(`Investing got an overhaul! Everything you spent on the old Stock Portfolio and Real Estate was refunded: ${formatMoney(legacyRefund)}.`, 'success');
  }

  businesses.forEach(business => {
    if (!business.merged) business.merged = false;
    // Migrate saves from before businesses had an explicit `type` field.
    if (!business.type) {
      if (business.name === 'Bank') {
        business.type = 'bank';
      } else if (!business.merged) {
        const match = Object.entries(BUSINESS_TYPES).find(([, cfg]) => cfg.name === business.name);
        if (match) business.type = match[0];
      }
    }
  });

  loadPlanets();
  migrateMergedIncomes();
  calculateOfflineIncome();
  recalcHourlyIncome();
  loadMarkets();
  saveProgress();
  renderProperties();
  renderItems();
  applyPlanet(false); // renders the current planet's businesses and stats
  renderSettings();
  renderInstallOptions();
}

// Fast-forwards the bank vault and pays out the income that would have
// accrued while the tab was closed, capped at MAX_OFFLINE_HOURS.
function calculateOfflineIncome() {
  const now = new Date();
  let diffInHours = (now - lastUpdate) / 3600000;
  if (!isFinite(diffInHours) || diffInHours <= 0) {
    lastUpdate = now;
    return;
  }
  diffInHours = Math.min(diffInHours, MAX_OFFLINE_HOURS);

  const incomeBefore = hourlyIncome;
  advanceBankVaults(diffInHours);
  recalcHourlyIncome();
  const incomeAfter = hourlyIncome;

  const averageIncome = (incomeBefore + incomeAfter) / 2;
  const earned = roundToHundredths(averageIncome * diffInHours);
  const earnedOnMars = mars.unlocked ? roundToHundredths(marsHourlyIncome * diffInHours) : 0;

  if (earned > 0.01) cash = roundToHundredths(cash + earned);
  if (earnedOnMars > 0.01) mars.credits = roundToHundredths(mars.credits + earnedOnMars);
  if (earned > 0.01 || earnedOnMars > 0.01) {
    const parts = [];
    if (earned > 0.01) parts.push(formatMoney(earned));
    if (earnedOnMars > 0.01) parts.push(`${formatCredits(earnedOnMars)} on Mars`);
    toast(`Welcome back! You earned ${parts.join(' and ')} while away.`, 'success');
  }

  lastUpdate = now;
}

/* ---------------- clicker ---------------- */

// Taps pay into whichever planet you're on (see planets.js).
function earnMoney(event) {
  const earned = planet().click();
  playSound('coin');
  vibrate(8);
  saveProgress();
  updateStats();
  spawnFloatText(`+${formatFunds(earned)}`);
}

function spawnFloatText(text) {
  const stage = document.getElementById('click-stage');
  if (!stage) return;
  const el = document.createElement('span');
  el.className = 'float-text';
  el.textContent = text;
  el.style.marginLeft = `${(Math.random() - 0.5) * 40}px`;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ---------------- stats display ---------------- */

function updateStats() {
  const p = planet();
  const onMars = currentPlanet === 'mars';

  // Masthead ticker: the planet you're on, plus the other planet's wallet once Mars is unlocked.
  setTextIfChanged('cash-ticker', p.format(p.getFunds()), true);
  setTextIfChanged('income-ticker', p.format(p.getIncome()), true);
  setText('other-label', onMars ? 'Earth' : 'Mars');
  setText('other-ticker', onMars ? formatMoney(cash) : formatCredits(mars.credits));
  setText('clickValue', p.format(p.getClickValue()));

  const earthCashText = formatMoney(cash);
  setText('cash-profile', earthCashText);
  setText('hourlyIncome-profile', formatMoney(hourlyIncome));
  setText('mars-credits-profile', formatCredits(mars.credits));
  setText('mars-income-profile', formatCredits(marsHourlyIncome));
  setText('business-count-profile', formatInt(businesses.length + mars.businesses.length));
  setText('clicks-profile', formatInt(clicks + mars.clicks));

  // Stocks, properties and trophies are always paid in Earth dollars.
  document.querySelectorAll('.earth-balance').forEach(el => {
    el.textContent = earthCashText;
  });

  const portfolio = getPortfolioValue();
  const marsInDollars = mars.credits * CREDIT_RATE;
  setText('portfolio-profile', formatMoney(portfolio));
  setText('networth-profile', formatMoney(cash + portfolio + getPropertyValue() + getTrophyValue() + marsInDollars));

  updateCollectionStats();
  refreshAffordability();
}

/* ---------------- shop cards (properties & trophies) ---------------- */

// One card shape for anything you buy once and can sell back: icon,
// name, a sub-line, and the price (or the resale offer once owned).
function buildCollectibleCard({ icon, name, sub, subClass, price, owned, sellLabel, onClick }) {
  const card = document.createElement('div');
  card.className = 'card collectible' + (owned ? ' is-owned' : '');
  card.dataset.price = price;
  card.onclick = onClick;

  const media = document.createElement('div');
  media.className = 'card-monogram';
  media.textContent = icon;

  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = `
    <div class="card-title-row">
      <span class="card-title"></span>
      ${owned ? '<span class="card-badge max">Owned</span>' : ''}
    </div>
    <div class="card-sub${subClass ? ' ' + subClass : ''}"></div>
  `;
  body.querySelector('.card-title').textContent = name;
  body.querySelector('.card-sub').textContent = sub;

  const priceEl = document.createElement('div');
  priceEl.className = 'card-price';
  priceEl.textContent = owned ? sellLabel : formatMoney(price);

  card.appendChild(media);
  card.appendChild(body);
  card.appendChild(priceEl);
  return card;
}

// Dims shop cards you can't afford yet. Runs every second as cash grows.
function refreshAffordability() {
  document.querySelectorAll('.card.collectible:not(.is-owned)').forEach(card => {
    card.classList.toggle('locked', cash < Number(card.dataset.price));
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && el.textContent !== text) el.textContent = text;
}

function setTextIfChanged(id, text, pulseOnChange) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.textContent !== text) {
    el.textContent = text;
    if (pulseOnChange) {
      el.classList.remove('pulse');
      // eslint-disable-next-line no-unused-expressions
      void el.offsetWidth; // restart animation
      el.classList.add('pulse');
    }
  }
}

/* ---------------- game loop ---------------- */

let gameLoopStarted = false;
function startGameLoop() {
  if (gameLoopStarted) return;
  gameLoopStarted = true;
  setInterval(() => {
    tickBankVaults(1 / 3600); // one second's worth of an hourly fill rate
    recalcHourlyIncome();
    cash = roundToHundredths(cash + hourlyIncome / 3600);
    if (mars.unlocked) mars.credits = roundToHundredths(mars.credits + marsHourlyIncome / 3600);
    tickMarkets();
    refreshOpenPopups();
    updateStats();
    saveProgress();
  }, 1000);
}

/* ---------------- tabs ---------------- */

function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  const btn = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
  if (btn) btn.classList.add('active');
}

/* ---------------- popups ---------------- */

function showPopup(id) {
  document.getElementById('popup-backdrop').classList.add('visible');
  document.getElementById(id).style.display = 'block';
}

function hidePopup(id) {
  document.getElementById(id).style.display = 'none';
  const anyOpen = Array.from(document.querySelectorAll('.popup')).some(p => p.style.display === 'block');
  if (!anyOpen) document.getElementById('popup-backdrop').classList.remove('visible');
}

function closeAllPopups() {
  document.querySelectorAll('.popup').forEach(p => (p.style.display = 'none'));
  openUpgradeIndex = null;
  openBankIndex = null;
  trade.symbol = null;
  document.getElementById('popup-backdrop').classList.remove('visible');
}

function openBuyBusinessPopup() {
  renderBuyBusinessPopup();
  showPopup('buy-business-popup');
}
function closeBuyBusinessPopup() { hidePopup('buy-business-popup'); }
function closeBankPopup() { hidePopup('bank-popup'); openBankIndex = null; }
function closeUpgradeBusinessPopup() { hidePopup('upgrade-business-popup'); openUpgradeIndex = null; }

/* ---------------- toasts ---------------- */

// `sound` defaults to the toast's kind (success chime, error buzz); pass
// null for quiet toasts such as market headlines.
function toast(message, kind, sound = kind) {
  if (sound === 'success') playSound('buy');
  else if (sound) playSound(sound);
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ` toast-${kind}` : '');
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ---------------- reset ---------------- */

function resetGame() {
  if (!confirm('This will permanently erase your empire and start over. Are you sure?')) return;
  isResetting = true;
  [...SAVE_KEYS, 'investments'].forEach(key => localStorage.removeItem(key));
  location.reload();
}

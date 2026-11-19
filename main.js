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
function formatMoney(value) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const units = [
    { at: 1e12, suffix: 'T' },
    { at: 1e9, suffix: 'B' },
    { at: 1e6, suffix: 'M' },
    { at: 1e3, suffix: 'K' },
  ];
  for (const u of units) {
    if (abs >= u.at) {
      return `${sign}$${(abs / u.at).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${u.suffix}`;
    }
  }
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  migrateMergedIncomes();
  calculateOfflineIncome();
  recalcHourlyIncome();
  loadMarkets();
  saveProgress();
  updateStats();
  renderBusinesses();
  renderProperties();
  renderItems();
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

  if (earned > 0.01) {
    cash = roundToHundredths(cash + earned);
    toast(`Welcome back! You earned ${formatMoney(earned)} while away.`, 'success');
  }

  lastUpdate = now;
}

/* ---------------- clicker ---------------- */

function earnMoney(event) {
  const earned = clickValue;
  cash = roundToHundredths(cash + earned);
  clicks++;
  clickValue = roundToHundredths(Math.min(1 + Math.sqrt(clicks) / 10, 100));
  saveProgress();
  updateStats();
  spawnFloatText(`+${formatMoney(earned)}`);
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
  const cashText = formatMoney(cash);
  const incomeText = formatMoney(hourlyIncome);

  setTextIfChanged('cash-ticker', cashText, true);
  setTextIfChanged('income-ticker', incomeText, true);
  document.getElementById('cash-profile').textContent = cashText;
  document.getElementById('hourlyIncome-profile').textContent = incomeText;
  document.getElementById('clickValue').textContent = roundToHundredths(clickValue).toLocaleString(undefined, { minimumFractionDigits: 2 });
  document.getElementById('business-count-profile').textContent = formatInt(businesses.length);
  document.getElementById('clicks-profile').textContent = formatInt(clicks);

  const portfolio = getPortfolioValue();
  document.getElementById('portfolio-profile').textContent = formatMoney(portfolio);
  document.getElementById('networth-profile').textContent = formatMoney(cash + portfolio + getPropertyValue() + getTrophyValue());

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

function toast(message, kind) {
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
  ['cash', 'hourlyIncome', 'clickValue', 'clicks', 'lastUpdate', 'businesses', 'investments', 'markets', 'properties', 'trophies'].forEach(key =>
    localStorage.removeItem(key)
  );
  location.reload();
}

/* ============================================================
   BUSINESS EMPIRE — planets.js
   Earth and Mars. Each planet has its own wallet, clicker,
   businesses and merge recipes; stocks, crypto, properties and
   trophies are shared and always paid in Earth dollars.

   Both planets earn every second no matter which one you're on.
   Money moves between them through the Interplanetary Exchange.
   ============================================================ */

/* ---------------- Mars economy ----------------
   1 Martian Credit (₥) is worth $1B. When Mars unlocks, a full set of
   Earth capstones earns ~$174B/hr (~174 ₥/hr), and the colony grant
   covers the first couple of Mars businesses. Mars returns start at
   20%/hr and slide to 4%/hr, mirroring Earth, so Mars becomes the new
   long game: its top businesses earn far more than all of Earth. */

const CREDIT_RATE = 1e9; // dollars per Martian Credit
const EXCHANGE_FEE = 0.02; // charged on every transfer, either direction (Martian Science can lower it)

function exchangeFee() {
  return researchValue('exchangeFee', EXCHANGE_FEE, (a, b) => a < b);
}
const MARS_COLONY_GRANT = 1000; // credits handed to every new colony

const MARS_BUSINESS_TYPES = {
  oxygenFarm: { name: 'Oxygen Farm', cost: 100, income: 20, upgradeMultiplier: 1.5, maxLevel: 10, icon: '🫧' },
  iceMine: { name: 'Ice Mine', cost: 750, income: 120, upgradeMultiplier: 1.4, maxLevel: 12, icon: '🧊' },
  brickworks: { name: 'Regolith Brickworks', cost: 3000, income: 400, upgradeMultiplier: 1.35, maxLevel: 15, icon: '🧱' },
  greenhouse: { name: 'Greenhouse Dome', cost: 12000, income: 1500, upgradeMultiplier: 1.3, maxLevel: 20, icon: '🌱' },
  solarArray: { name: 'Solar Array', cost: 50000, income: 5500, upgradeMultiplier: 1.3, maxLevel: 20, icon: '☀️' },
  roverRentals: { name: 'Rover Rentals', cost: 200000, income: 20000, upgradeMultiplier: 1.3, maxLevel: 25, icon: '🚙' },
  domeHotel: { name: 'Dome Hotel', cost: 900000, income: 80000, upgradeMultiplier: 1.3, maxLevel: 25, icon: '🛖' },
  spaceport: { name: 'Spaceport', cost: 4e6, income: 3e5, upgradeMultiplier: 1.3, maxLevel: 30, icon: '🚀' },
  terraformingLab: { name: 'Terraforming Lab', cost: 2e7, income: 1.2e6, upgradeMultiplier: 1.3, maxLevel: 30, icon: '🧪' },
  fusionReactor: { name: 'Fusion Reactor', cost: 1e8, income: 5e6, upgradeMultiplier: 1.3, maxLevel: 35, icon: '⚛️' },
  orbitalShipyard: { name: 'Orbital Shipyard', cost: 5e8, income: 2e7, upgradeMultiplier: 1.3, maxLevel: 35, icon: '🛰️' },
};

// Same rules as Earth: both ingredients at max level (or an intermediate
// merged business), two different types per recipe.
const MARS_MERGE_RECIPES = [
  { inputs: ['Oxygen Farm', 'Greenhouse Dome'], output: 'Biosphere Complex' },
  { inputs: ['Ice Mine', 'Solar Array'], output: 'Hydro Plant' },
  { inputs: ['Regolith Brickworks', 'Rover Rentals'], output: 'Construction Guild' },
  { inputs: ['Dome Hotel', 'Spaceport'], output: 'Red Planet Resorts' },
  { inputs: ['Terraforming Lab', 'Fusion Reactor'], output: 'Climate Engine' },
  { inputs: ['Orbital Shipyard', 'Spaceport'], output: 'Interplanetary Fleet' },
  // Capstones built from intermediates
  { inputs: ['Biosphere Complex', 'Hydro Plant'], output: 'New Eden' },
  { inputs: ['Climate Engine', 'Orbital Shipyard'], output: 'Terraformer Consortium' },
];

// Incomes in credits, ~1.5–2× what the ingredients earn at max level.
const MARS_MERGED_BUSINESSES = [
  { name: 'Biosphere Complex', income: 400000, icon: '🌿' }, // ~769 + ~219K
  { name: 'Hydro Plant', income: 1.5e6, icon: '💧' }, // ~4.9K + ~804K
  { name: 'Construction Guild', income: 2e7, icon: '🏗️' }, // ~27K + ~10.9M
  { name: 'Red Planet Resorts', income: 1.2e9, icon: '🌄' }, // ~43M + ~605M
  { name: 'Climate Engine', income: 7e10, icon: '🌪️' }, // ~2.4B + ~37B
  { name: 'Interplanetary Fleet', income: 2.8e11, icon: '🛸' }, // ~150B + ~605M
  { name: 'New Eden', income: 4e6, icon: '🌳' }, // 400K + 1.5M
  { name: 'Terraformer Consortium', income: 4e11, icon: '🌎' }, // 70B + ~150B
];

const MARS_INTERMEDIATE_NAMES = ['Biosphere Complex', 'Hydro Plant', 'Climate Engine'];

/* ---------------- planet definitions ---------------- */

const PLANETS = {
  earth: {
    id: 'earth',
    name: 'Earth',
    icon: '🌍',
    walletLabel: 'Cash',
    format: value => formatMoney(value),
    getFunds: () => cash,
    setFunds: value => { cash = value; },
    getIncome: () => hourlyIncome,
    getBusinesses: () => businesses,
    getClickValue: () => roundToHundredths(clickValue * clickMultiplier()),
    click() {
      const earned = roundToHundredths(clickValue * clickMultiplier());
      cash = roundToHundredths(cash + earned);
      clicks++;
      clickValue = clickValueFor(clicks);
      return earned;
    },
    businessTypes: BUSINESS_TYPES,
    recipes: mergeRecipes,
    mergedTemplates: mergedBusinesses,
    intermediates: INTERMEDIATE_MERGE_NAMES,
    hasBank: true,
    text: {
      clickerEyebrow: 'Hustle',
      clickerTitle: 'Every dollar starts here',
      clickerHint: 'Click value grows the more you hustle. Once you can afford it, put your cash to work in a business instead of clicking forever.',
      businessesEyebrow: 'Holdings',
      businessesTitle: 'Your empire',
      emptyState: 'You don\'t own any businesses yet. Buy your first one to start earning while you\'re away.',
      capstoneNote: 'A final-tier business. Collect one of every capstone to launch a colony on Mars.',
    },
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    icon: '🔴',
    walletLabel: 'Credits',
    format: value => formatCredits(value),
    getFunds: () => mars.credits,
    setFunds: value => { mars.credits = value; },
    getIncome: () => marsHourlyIncome,
    getBusinesses: () => mars.businesses,
    getClickValue: () => roundToHundredths(mars.clickValue * clickMultiplier()),
    click() {
      const earned = roundToHundredths(mars.clickValue * clickMultiplier());
      mars.credits = roundToHundredths(mars.credits + earned);
      mars.clicks++;
      mars.clickValue = clickValueFor(mars.clicks);
      return earned;
    },
    businessTypes: MARS_BUSINESS_TYPES,
    recipes: MARS_MERGE_RECIPES,
    mergedTemplates: MARS_MERGED_BUSINESSES,
    intermediates: MARS_INTERMEDIATE_NAMES,
    hasBank: false,
    text: {
      clickerEyebrow: 'Frontier',
      clickerTitle: 'Every credit starts here',
      clickerHint: 'Mars has its own currency: Martian Credits (₥). Tap for credits, build a colony economy, and swap money with Earth in the Exchange.',
      businessesEyebrow: 'Colony',
      businessesTitle: 'Your Martian empire',
      emptyState: 'No Martian businesses yet. Start with an Oxygen Farm. Everyone needs to breathe.',
      capstoneNote: 'A final-tier Martian business.',
    },
  },
};

/* ---------------- state ---------------- */

let currentPlanet = 'earth';
let mars = defaultMarsState();
let marsHourlyIncome = 0;

function defaultMarsState() {
  return { unlocked: false, credits: 0, clicks: 0, clickValue: 1, businesses: [] };
}

function planet() {
  return PLANETS[currentPlanet];
}

function planetBusinesses() {
  return planet().getBusinesses();
}

function planetFunds() {
  return planet().getFunds();
}

// Spends from the current planet's wallet. Returns false (and spends
// nothing) if there isn't enough.
function spendFunds(amount) {
  const p = planet();
  if (p.getFunds() < amount) return false;
  p.setFunds(roundToHundredths(p.getFunds() - amount));
  return true;
}

function formatFunds(value) {
  return planet().format(value);
}

function formatCredits(value) {
  return formatMoney(value, '₥');
}

function clickValueFor(clickCount) {
  return roundToHundredths(Math.min(1 + Math.sqrt(clickCount) / 10, 100));
}

function calcMarsIncome() {
  const base = mars.businesses.reduce((sum, b) => sum + (b.income || 0), 0);
  marsHourlyIncome = roundToHundredths(base * marsIncomeMultiplier());
}

/* ---------------- persistence ---------------- */

function loadPlanets() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('mars'));
  } catch (e) {
    saved = null;
  }
  mars = { ...defaultMarsState(), ...(saved && typeof saved === 'object' ? saved : {}) };
  if (!Array.isArray(mars.businesses)) mars.businesses = [];
  ['credits', 'clicks', 'clickValue'].forEach(key => {
    if (!isFinite(mars[key])) mars[key] = defaultMarsState()[key];
  });

  // Saves from before Mars was a planet colonized by merging the whole
  // empire into a "Mars Colony" business. They keep that business and
  // get the real planet (and its grant) unlocked.
  if (!mars.unlocked && businesses.some(b => b.type === 'marsColony')) {
    mars.unlocked = true;
    mars.credits = roundToHundredths(mars.credits + MARS_COLONY_GRANT);
    toast(`Mars is now a whole planet! Your colony received a ${formatCredits(MARS_COLONY_GRANT)} grant. Use the planet switcher to visit.`, 'success');
  }

  const savedPlanet = localStorage.getItem('planet');
  currentPlanet = savedPlanet === 'mars' && mars.unlocked ? 'mars' : 'earth';
  calcMarsIncome();
}

function savePlanets() {
  localStorage.setItem('mars', JSON.stringify(mars));
  localStorage.setItem('planet', currentPlanet);
}

/* ---------------- travel & theme ---------------- */

function travelTo(planetId) {
  if (!PLANETS[planetId] || planetId === currentPlanet) return;
  if (planetId === 'mars' && !mars.unlocked) {
    toast('Mars is still locked. Own one of every Earth capstone to launch a colony.', 'error');
    return;
  }
  closeAllPopups();
  currentPlanet = planetId;
  applyPlanet(true);
  saveProgress();
  toast(planetId === 'mars' ? '🚀 Touchdown on Mars. Your Earth empire keeps earning back home.' : '🌍 Welcome back to Earth.', 'success');
}

// Repaints everything that depends on which planet you're on.
function applyPlanet(animate) {
  const p = planet();
  const onMars = currentPlanet === 'mars';
  document.body.classList.toggle('planet-mars', onMars);
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', onMars ? '#1e0d08' : '#0e1c13');
  if (animate) {
    document.body.classList.remove('planet-warp');
    void document.body.offsetWidth; // restart animation
    document.body.classList.add('planet-warp');
  }

  setText('clicker-eyebrow', p.text.clickerEyebrow);
  setText('clicker-title', p.text.clickerTitle);
  setText('clicker-hint', p.text.clickerHint);
  setText('businesses-eyebrow', p.text.businessesEyebrow);
  setText('businesses-title', p.text.businessesTitle);
  setText('business-empty-state', p.text.emptyState);
  setText('cash-label', p.walletLabel);

  const marsButton = document.getElementById('mars-button');
  if (marsButton) {
    marsButton.textContent = onMars ? '🌍 Return to Earth' : mars.unlocked ? '🔴 Travel to Mars' : 'Go To Mars';
    marsButton.onclick = onMars ? () => travelTo('earth') : openMarsPopup;
  }

  document.querySelectorAll('.planet-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.planet === currentPlanet);
  });
  document.querySelectorAll('.mars-unlocked-only').forEach(el => {
    el.hidden = !mars.unlocked;
  });

  renderBusinesses();
  updateStats();
}

/* ---------------- Interplanetary Exchange ---------------- */

const exchange = { dir: 'toMars', useMax: false };

function exchangeSource(dir) {
  return dir === 'toMars'
    ? { have: () => cash, format: formatMoney, unit: 'dollars' }
    : { have: () => mars.credits, format: formatCredits, unit: 'credits' };
}

// What `amount` (in the source currency) turns into after the fee.
function quoteExchange(dir, amount) {
  const fee = amount * exchangeFee();
  const net = amount - fee;
  const receive = dir === 'toMars' ? net / CREDIT_RATE : net * CREDIT_RATE;
  return { fee, receive: Math.floor(receive * 100 + 1e-6) / 100 };
}

function openExchangePopup() {
  if (!mars.unlocked) return;
  setExchangeDirection('toMars');
  showPopup('exchange-popup');
  refreshExchangePopup();
}

function closeExchangePopup() {
  hidePopup('exchange-popup');
}

function setExchangeDirection(dir) {
  exchange.dir = dir;
  exchange.useMax = false;
  document.getElementById('exchange-amount').value = '';
  document.querySelectorAll('.exchange-mode button').forEach(btn => btn.classList.toggle('active', btn.dataset.dir === dir));
  refreshExchangePopup();
}

function setExchangeFraction(pct) {
  const amount = exchangeSource(exchange.dir).have() * pct;
  exchange.useMax = pct >= 1;
  document.getElementById('exchange-amount').value = amount > 0 ? String(Math.floor(amount * 100) / 100) : '';
  refreshExchangePopup();
}

function onExchangeInput() {
  exchange.useMax = false;
  refreshExchangePopup();
}

function onExchangeKey(event) {
  if (event.key === 'Enter') confirmExchange();
}

function pendingExchangeAmount() {
  const source = exchangeSource(exchange.dir);
  if (exchange.useMax) return source.have();
  const raw = parseFloat(document.getElementById('exchange-amount').value);
  return isFinite(raw) && raw > 0 ? Math.floor(raw * 100) / 100 : 0;
}

function refreshExchangePopup() {
  if (!isPopupOpen('exchange-popup')) return;
  const source = exchangeSource(exchange.dir);
  const target = exchangeSource(exchange.dir === 'toMars' ? 'toEarth' : 'toMars');
  const amount = pendingExchangeAmount();
  const quote = quoteExchange(exchange.dir, amount);

  const input = document.getElementById('exchange-amount');
  if (exchange.useMax && document.activeElement !== input) {
    input.value = amount > 0 ? String(Math.floor(amount * 100) / 100) : '';
  }

  const feePct = `${+(exchangeFee() * 100).toFixed(2)}%`;
  document.getElementById('exchange-fee-rate').textContent = feePct;
  document.getElementById('exchange-fee-label').textContent = feePct;
  document.getElementById('exchange-unit').textContent = source.unit;
  document.getElementById('exchange-have').textContent = source.format(source.have());
  document.getElementById('exchange-send').textContent = amount > 0 ? source.format(amount) : '—';
  document.getElementById('exchange-fee').textContent = amount > 0 ? source.format(quote.fee) : '—';
  document.getElementById('exchange-receive').textContent = amount > 0 ? target.format(quote.receive) : '—';

  const confirmBtn = document.getElementById('exchange-confirm');
  confirmBtn.textContent = exchange.dir === 'toMars' ? 'Send to Mars' : 'Send to Earth';
  confirmBtn.disabled = amount <= 0 || amount > source.have() + 0.005 || quote.receive < 0.01;
}

function confirmExchange() {
  const source = exchangeSource(exchange.dir);
  const amount = Math.min(pendingExchangeAmount(), source.have());
  const quote = quoteExchange(exchange.dir, amount);
  if (amount <= 0) {
    toast(`Enter how many ${source.unit} to send.`, 'error');
    return;
  }
  if (quote.receive < 0.01) {
    toast('That transfer is too small to arrive after the fee.', 'error');
    return;
  }

  if (exchange.dir === 'toMars') {
    cash = roundToHundredths(cash - amount);
    mars.credits = roundToHundredths(mars.credits + quote.receive);
    toast(`Sent ${formatMoney(amount)} to Mars. ${formatCredits(quote.receive)} arrived.`, 'success');
  } else {
    mars.credits = roundToHundredths(mars.credits - amount);
    cash = roundToHundredths(cash + quote.receive);
    toast(`Sent ${formatCredits(amount)} to Earth. ${formatMoney(quote.receive)} arrived.`, 'success');
  }

  exchange.useMax = false;
  document.getElementById('exchange-amount').value = '';
  saveProgress();
  updateStats();
  refreshExchangePopup();
}

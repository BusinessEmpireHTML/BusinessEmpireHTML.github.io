/* ============================================================
   BUSINESS EMPIRE — golden.js
   Golden coins: every few minutes (only while the game is on screen)
   a golden coin drifts across. Tap it before it's gone for a bonus:
     ⚡ Frenzy      all income ×2 for 60s
     💰 Lucky       an instant 15 minutes of income
     👆 Tap Frenzy  taps ×7 for 30s
   The Golden Coins research branch makes them more frequent, longer
   lasting and more rewarding. Boosts are temporary and not saved.
   ============================================================ */

const GOLDEN_MIN_DELAY_S = 120;
const GOLDEN_MAX_DELAY_S = 300;
const GOLDEN_LIFETIME_S = 13;
const FRENZY_SECONDS = 60;
const TAP_FRENZY_SECONDS = 30;
const LUCKY_MINUTES = 15;

const GOLDEN_REWARDS = [
  { id: 'frenzy', weight: 45 },
  { id: 'lucky', weight: 40 },
  { id: 'tapFrenzy', weight: 15 },
];

let nextGoldenAt = Date.now() + goldenDelayMs();
let goldenCoinEl = null;
let goldenCoinTimer = null;
const activeBoosts = {}; // boost id -> expiry timestamp (ms)

function goldenDelayMs() {
  const seconds = GOLDEN_MIN_DELAY_S + Math.random() * (GOLDEN_MAX_DELAY_S - GOLDEN_MIN_DELAY_S);
  return seconds * 1000 * researchMultiplier('goldenFrequency');
}

function goldenRewardScale() {
  return researchMultiplier('goldenReward'); // 1, or 2 with Alchemy
}

function isBoostActive(id) {
  return (activeBoosts[id] || 0) > Date.now();
}

// Used by the multiplier functions in main.js.
function goldenIncomeMultiplier() {
  return isBoostActive('frenzy') ? 1 + goldenRewardScale() : 1; // ×2, or ×3 with Alchemy
}

function goldenClickMultiplier() {
  return isBoostActive('tapFrenzy') ? 1 + 6 * goldenRewardScale() : 1; // ×7, or ×13 with Alchemy
}

/* ---------------- spawning ---------------- */

// Called once a second by the game loop.
function tickGolden() {
  const now = Date.now();
  let expired = false;
  Object.keys(activeBoosts).forEach(id => {
    if (activeBoosts[id] <= now) {
      delete activeBoosts[id];
      expired = true;
    }
  });
  if (expired) recalcHourlyIncome();

  if (!goldenCoinEl && now >= nextGoldenAt) {
    if (document.visibilityState === 'visible') spawnGoldenCoin();
    else nextGoldenAt = now + 5000; // wait until the player is looking
  }
  renderBoostPill();
}

function spawnGoldenCoin() {
  if (goldenCoinEl) return;
  const el = document.createElement('button');
  el.className = `golden-coin ${Math.random() < 0.5 ? 'from-left' : 'from-right'}`;
  el.setAttribute('aria-label', 'Golden coin: tap for a bonus');
  el.innerHTML = '<span class="golden-coin-face">✦</span>';
  el.style.top = `${18 + Math.random() * 55}vh`;
  el.style.animationDuration = `${GOLDEN_LIFETIME_S}s`;
  el.addEventListener('click', collectGoldenCoin);
  document.body.appendChild(el);
  goldenCoinEl = el;
  // A timer, not animationend: with "reduce motion" on the coin sits still.
  goldenCoinTimer = setTimeout(removeGoldenCoin, GOLDEN_LIFETIME_S * 1000);
}

function removeGoldenCoin() {
  clearTimeout(goldenCoinTimer);
  if (goldenCoinEl) goldenCoinEl.remove();
  goldenCoinEl = null;
  nextGoldenAt = Date.now() + goldenDelayMs();
}

/* ---------------- rewards ---------------- */

function pickGoldenReward() {
  const total = GOLDEN_REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const reward of GOLDEN_REWARDS) {
    roll -= reward.weight;
    if (roll < 0) return reward.id;
  }
  return GOLDEN_REWARDS[0].id;
}

function collectGoldenCoin(event) {
  if (event) event.stopPropagation();
  removeGoldenCoin();
  applyGoldenReward(pickGoldenReward());
}

function applyGoldenReward(id) {
  const scale = goldenRewardScale();
  const duration = researchMultiplier('goldenDuration');
  const now = Date.now();
  playSound('golden');
  vibrate(30);
  recordStat('goldenCoins');

  if (id === 'frenzy') {
    activeBoosts.frenzy = now + FRENZY_SECONDS * duration * 1000;
    recalcHourlyIncome();
    toast(`⚡ Frenzy! All income ×${1 + scale} for ${Math.round(FRENZY_SECONDS * duration)} seconds.`, 'golden', null);
  } else if (id === 'tapFrenzy') {
    activeBoosts.tapFrenzy = now + TAP_FRENZY_SECONDS * duration * 1000;
    toast(`👆 Tap Frenzy! Taps are worth ×${1 + 6 * scale} for ${Math.round(TAP_FRENZY_SECONDS * duration)} seconds.`, 'golden', null);
  } else {
    // Lucky: 15 minutes of the current planet's income (or 50 taps, early on).
    const p = planet();
    const amount = roundToHundredths(Math.max(p.getIncome() * (LUCKY_MINUTES / 60), p.getClickValue() * 50) * scale);
    p.setFunds(roundToHundredths(p.getFunds() + amount));
    toast(`💰 Lucky! +${p.format(amount)}`, 'golden', null);
  }
  updateStats();
  renderBoostPill();
}

/* ---------------- boost badge ---------------- */

function renderBoostPill() {
  const pill = document.getElementById('boost-pill');
  if (!pill) return;
  const now = Date.now();
  const parts = [];
  const countdown = id => {
    const s = Math.max(0, Math.ceil((activeBoosts[id] - now) / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  if (isBoostActive('frenzy')) parts.push(`⚡ ×${goldenIncomeMultiplier()} income ${countdown('frenzy')}`);
  if (isBoostActive('tapFrenzy')) parts.push(`👆 ×${goldenClickMultiplier()} taps ${countdown('tapFrenzy')}`);
  pill.hidden = parts.length === 0;
  pill.textContent = parts.join(' · ');
}

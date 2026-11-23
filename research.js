/* ============================================================
   BUSINESS EMPIRE — research.js
   The Research Lab: permanent upgrades bought once, in order,
   along six branches. Earth branches cost dollars; Martian Science
   costs credits and needs Mars unlocked.

   Effects are read through researchMultiplier() / researchValue(),
   and combined with every other boost in main.js (see "multipliers").
   ============================================================ */

const RESEARCH_BRANCHES = [
  { id: 'hustle', name: 'Hustle', icon: '👆', blurb: 'Bigger taps on both planets.' },
  { id: 'operations', name: 'Operations', icon: '🏭', blurb: 'Earth businesses earn more.' },
  { id: 'realty', name: 'Real Estate', icon: '🏘️', blurb: 'Properties pay more rent.' },
  { id: 'golden', name: 'Golden Coins', icon: '✨', blurb: 'Better golden coin bonuses.' },
  { id: 'away', name: 'While Away', icon: '🌙', blurb: 'Earn for longer while the game is closed.' },
  { id: 'mars', name: 'Martian Science', icon: '🔴', blurb: 'Paid in credits. Needs Mars.' },
];

// Within a branch, each upgrade requires the one before it.
const RESEARCH = [
  // Hustle: tap value multipliers (×60 in total)
  { id: 'grip', branch: 'hustle', name: 'Better Grip', icon: '✊', desc: 'Taps earn 2×.', cost: 5000, currency: 'earth', effect: { type: 'click', mult: 2 } },
  { id: 'polish', branch: 'hustle', name: 'Polished Coin', icon: '🪙', desc: 'Taps earn another 2×.', cost: 5e6, currency: 'earth', effect: { type: 'click', mult: 2 } },
  { id: 'reflexes', branch: 'hustle', name: 'Lightning Reflexes', icon: '⚡', desc: 'Taps earn 3× more.', cost: 5e9, currency: 'earth', effect: { type: 'click', mult: 3 } },
  { id: 'midas', branch: 'hustle', name: 'Midas Touch', icon: '👑', desc: 'Taps earn 5× more.', cost: 5e12, currency: 'earth', effect: { type: 'click', mult: 5 } },

  // Operations: Earth business income (×7.03 in total)
  { id: 'spreadsheets', branch: 'operations', name: 'Spreadsheets', icon: '📊', desc: 'Earth businesses earn +25%.', cost: 50000, currency: 'earth', effect: { type: 'earthIncome', mult: 1.25 } },
  { id: 'supplyChain', branch: 'operations', name: 'Supply Chain', icon: '🚚', desc: 'Earth businesses earn another +25%.', cost: 5e6, currency: 'earth', effect: { type: 'earthIncome', mult: 1.25 } },
  { id: 'automation', branch: 'operations', name: 'Automation', icon: '🤖', desc: 'Earth businesses earn +50%.', cost: 5e8, currency: 'earth', effect: { type: 'earthIncome', mult: 1.5 } },
  { id: 'forecasting', branch: 'operations', name: 'AI Forecasting', icon: '🧠', desc: 'Earth businesses earn 2×.', cost: 5e10, currency: 'earth', effect: { type: 'earthIncome', mult: 2 } },
  { id: 'logistics', branch: 'operations', name: 'Global Logistics', icon: '🌐', desc: 'Earth businesses earn another 2×.', cost: 5e12, currency: 'earth', effect: { type: 'earthIncome', mult: 2 } },

  // Real Estate: rent (×3.75 in total)
  { id: 'propertyManagers', branch: 'realty', name: 'Property Managers', icon: '🔑', desc: 'Properties pay +25% rent.', cost: 100000, currency: 'earth', effect: { type: 'rent', mult: 1.25 } },
  { id: 'renovations', branch: 'realty', name: 'Luxury Renovations', icon: '🛁', desc: 'Properties pay +50% rent.', cost: 1e8, currency: 'earth', effect: { type: 'rent', mult: 1.5 } },
  { id: 'rentAlgorithms', branch: 'realty', name: 'Rent Algorithms', icon: '📈', desc: 'Properties pay 2× rent.', cost: 1e11, currency: 'earth', effect: { type: 'rent', mult: 2 } },

  // Golden coins
  { id: 'luckyCharm', branch: 'golden', name: 'Lucky Charm', icon: '🍀', desc: 'Golden coins show up 25% more often.', cost: 1e6, currency: 'earth', effect: { type: 'goldenFrequency', mult: 0.8 } },
  { id: 'goldenHour', branch: 'golden', name: 'Golden Hour', icon: '⏳', desc: 'Golden coin boosts last 50% longer.', cost: 1e9, currency: 'earth', effect: { type: 'goldenDuration', mult: 1.5 } },
  { id: 'alchemy', branch: 'golden', name: 'Alchemy', icon: '⚗️', desc: 'Golden coin rewards are doubled.', cost: 1e12, currency: 'earth', effect: { type: 'goldenReward', mult: 2 } },

  // While away: offline earnings cap (24h by default)
  { id: 'nightShift', branch: 'away', name: 'Night Shift', icon: '🌙', desc: 'Earn for up to 48 hours while away.', cost: 1e7, currency: 'earth', effect: { type: 'offlineHours', value: 48 } },
  { id: 'remoteEmpire', branch: 'away', name: 'Remote Empire', icon: '🛰️', desc: 'Earn for up to 72 hours while away.', cost: 1e10, currency: 'earth', effect: { type: 'offlineHours', value: 72 } },

  // Martian Science (credits)
  { id: 'pressureDomes', branch: 'mars', name: 'Pressure Domes', icon: '🏠', desc: 'Mars businesses earn +25%.', cost: 10000, currency: 'mars', effect: { type: 'marsIncome', mult: 1.25 } },
  { id: 'quantumRelay', branch: 'mars', name: 'Quantum Relay', icon: '📡', desc: 'Exchange fee drops from 2% to 1%.', cost: 1e6, currency: 'mars', effect: { type: 'exchangeFee', value: 0.01 } },
  { id: 'lowGravity', branch: 'mars', name: 'Low-G Logistics', icon: '🚀', desc: 'Mars businesses earn +50%.', cost: 1e7, currency: 'mars', effect: { type: 'marsIncome', mult: 1.5 } },
  { id: 'wormholeBank', branch: 'mars', name: 'Wormhole Bank', icon: '🌀', desc: 'Exchange fee drops to 0%.', cost: 1e9, currency: 'mars', effect: { type: 'exchangeFee', value: 0 } },
  { id: 'martianAI', branch: 'mars', name: 'Martian AI', icon: '🧬', desc: 'Mars businesses earn 2×.', cost: 1e10, currency: 'mars', effect: { type: 'marsIncome', mult: 2 } },
];

const RESEARCH_BY_ID = Object.fromEntries(RESEARCH.map(r => [r.id, r]));

let ownedResearch = []; // research ids

function loadResearch() {
  ownedResearch = loadIdList('research', RESEARCH_BY_ID);
}

function saveResearch() {
  localStorage.setItem('research', JSON.stringify(ownedResearch));
}

function hasResearch(id) {
  return ownedResearch.includes(id);
}

/* ---------------- effects ---------------- */

// Product of every owned multiplier of this type (1 if none).
function researchMultiplier(type) {
  return ownedResearch.reduce((m, id) => {
    const effect = RESEARCH_BY_ID[id].effect;
    return effect.type === type && effect.mult ? m * effect.mult : m;
  }, 1);
}

// For "value" effects: the best owned value, judged by `better`.
function researchValue(type, fallback, better) {
  return ownedResearch.reduce((best, id) => {
    const effect = RESEARCH_BY_ID[id].effect;
    return effect.type === type && 'value' in effect && better(effect.value, best) ? effect.value : best;
  }, fallback);
}

/* ---------------- buying ---------------- */

function researchPrerequisite(item) {
  const branch = RESEARCH.filter(r => r.branch === item.branch);
  const index = branch.indexOf(item);
  return index > 0 ? branch[index - 1] : null;
}

function researchStatus(item) {
  if (hasResearch(item.id)) return 'owned';
  if (item.currency === 'mars' && !mars.unlocked) return 'needs-mars';
  const prereq = researchPrerequisite(item);
  if (prereq && !hasResearch(prereq.id)) return 'needs-prereq';
  return 'available';
}

function buyResearch(id) {
  const item = RESEARCH_BY_ID[id];
  if (!item) return;
  const status = researchStatus(item);
  if (status === 'owned') return;
  if (status === 'needs-mars') {
    toast('Martian Science needs a colony on Mars first.', 'error');
    return;
  }
  if (status === 'needs-prereq') {
    toast(`Research ${researchPrerequisite(item).name} first.`, 'error');
    return;
  }
  const wallet = PLANETS[item.currency];
  if (wallet.getFunds() < item.cost) {
    toast(`Not enough ${wallet.walletLabel.toLowerCase()} for that research.`, 'error');
    return;
  }
  if (!confirmSpend(item.cost, wallet.getFunds(), `${wallet.format(item.cost)} on ${item.name}`)) return;

  wallet.setFunds(roundToHundredths(wallet.getFunds() - item.cost));
  ownedResearch.push(id);
  toast(`🔬 ${item.name} researched: ${item.desc}`, 'success');
  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderResearch();
}

/* ---------------- Research Lab popup ---------------- */

function openResearchPopup() {
  renderResearch();
  showPopup('research-popup');
}

function closeResearchPopup() {
  hidePopup('research-popup');
}

function renderResearch() {
  const list = document.getElementById('research-list');
  if (!list) return;
  list.innerHTML = '';

  document.getElementById('research-summary').textContent =
    `Taps ×${formatMultiplier(researchMultiplier('click'))} · Earth businesses ×${formatMultiplier(researchMultiplier('earthIncome'))} · ` +
    `Rent ×${formatMultiplier(researchMultiplier('rent'))} · Mars ×${formatMultiplier(researchMultiplier('marsIncome'))} · ` +
    `${ownedResearch.length}/${RESEARCH.length} researched`;

  RESEARCH_BRANCHES.forEach(branch => {
    const heading = document.createElement('p');
    heading.className = 'list-heading';
    heading.textContent = `${branch.icon} ${branch.name} · ${branch.blurb}`;
    list.appendChild(heading);

    RESEARCH.filter(r => r.branch === branch.id).forEach(item => {
      const status = researchStatus(item);
      const wallet = PLANETS[item.currency];
      const card = document.createElement('div');
      card.className = `card research-card research-${status}`;
      card.dataset.currency = item.currency;
      card.dataset.price = item.cost;
      if (status === 'available') card.onclick = () => buyResearch(item.id);

      const media = document.createElement('div');
      media.className = 'card-monogram';
      media.textContent = item.icon;

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = '<div class="card-title-row"><span class="card-title"></span></div><div class="card-sub card-sub--blurb"></div>';
      body.querySelector('.card-title').textContent = item.name;
      let sub = item.desc;
      if (status === 'needs-prereq') sub += ` Needs ${researchPrerequisite(item).name}.`;
      if (status === 'needs-mars') sub += ' Needs Mars.';
      body.querySelector('.card-sub').textContent = sub;

      const price = document.createElement('div');
      price.className = 'card-price';
      price.textContent = status === 'owned' ? '✓ Done' : wallet.format(item.cost);

      card.appendChild(media);
      card.appendChild(body);
      card.appendChild(price);
      list.appendChild(card);
    });
  });
  refreshResearchAffordability();
}

// Dims available research you can't afford yet. Runs every second.
function refreshResearchAffordability() {
  if (!isPopupOpen('research-popup')) return;
  document.querySelectorAll('.research-card.research-available').forEach(card => {
    card.classList.toggle('locked', PLANETS[card.dataset.currency].getFunds() < Number(card.dataset.price));
  });
}

function formatMultiplier(value) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

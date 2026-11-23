/* ============================================================
   BUSINESS EMPIRE — business.js
   Config-driven business types. Buying, upgrading, closing,
   and rendering all read from BUSINESS_TYPES so there's one
   place to add a new business and one code path to buy any of them.
   ============================================================ */

const BUSINESS_TYPES = {
  lemonadeStand: {
    name: 'Lemonade Stand',
    cost: 500,
    income: 100,
    upgradeMultiplier: 1.5,
    maxLevel: 10,
    imageSrc: 'images/LemonadeStand.jpg',
  },
  carWash: {
    name: 'Car Wash',
    cost: 12500,
    income: 4000,
    upgradeMultiplier: 1.25,
    maxLevel: 10,
    imageSrc: 'images/CarWash.jpg',
  },
  localShop: {
    name: 'Local Shop',
    cost: 45000,
    income: 6000,
    upgradeMultiplier: 1.25,
    maxLevel: 15,
    imageSrc: 'images/LocalShop.jpg',
  },
  factory: {
    name: 'Factory',
    cost: 150000,
    income: 15000,
    upgradeMultiplier: 1.2,
    maxLevel: 20,
    imageSrc: 'images/Factory.jpg',
  },
  legalClinic: {
    name: 'Legal Clinic',
    cost: 200000,
    income: 12000,
    upgradeMultiplier: 1.15,
    maxLevel: 10,
    imageSrc: 'images/LegalClinic.jpg',
  },
  gym: {
    name: 'Gym',
    cost: 250000,
    income: 20000,
    upgradeMultiplier: 1.3,
    maxLevel: 20,
    icon: '🏋️',
  },
  hotel: {
    name: 'Hotel',
    cost: 300000,
    income: 25000,
    upgradeMultiplier: 1.35,
    maxLevel: 30,
    icon: '🏨',
  },
  pharmacy: {
    name: 'Pharmacy',
    cost: 400000,
    income: 30000,
    upgradeMultiplier: 1.25,
    maxLevel: 25,
    icon: '💊',
  },
  movieTheater: {
    name: 'Movie Theater',
    cost: 600000,
    income: 40000,
    upgradeMultiplier: 1.4,
    maxLevel: 35,
    icon: '🎬',
  },
  supermarket: {
    name: 'Supermarket',
    cost: 800000,
    income: 60000,
    upgradeMultiplier: 1.35,
    maxLevel: 40,
    icon: '🛒',
  },
  techStartup: {
    name: 'Tech Startup',
    cost: 1000000,
    income: 50000,
    upgradeMultiplier: 1.4,
    maxLevel: 40,
    icon: '💻',
  },
  realEstate: {
    name: 'Real Estate Agency',
    cost: 5000000,
    income: 200000,
    upgradeMultiplier: 1.35,
    maxLevel: 35,
    icon: '🏙️',
  },
};

// Everything below works on the planet you're currently on (see planets.js):
// its own business list, its own wallet, and its own currency.
function ownsBusinessType(type) {
  return planetBusinesses().some(b => b.type === type);
}

// Renders either a photo (imageSrc) or a lettered/emoji monogram, for
// business types and merge tiers that don't have on-disk artwork yet.
// Used by business.js, merger.js, and the Mars popup so every list of
// business "cards" looks consistent no matter what it's showing.
function createCardMedia(source) {
  if (source.imageSrc) {
    const img = document.createElement('img');
    img.src = source.imageSrc;
    img.alt = `${source.name} image`;
    img.className = 'card-image';
    return img;
  }
  const el = document.createElement('div');
  el.className = 'card-monogram';
  el.textContent = source.icon || '★';
  return el;
}

function buyBusiness(type) {
  if (type === 'bank') {
    if (planet().hasBank) buyBank();
    return;
  }

  const config = planet().businessTypes[type];
  if (!config) return;

  if (ownsBusinessType(type)) {
    toast(`You already own a ${config.name}.`, 'error');
    return;
  }
  if (!confirmSpend(config.cost, planetFunds(), `${formatFunds(config.cost)} on a ${config.name}`)) return;
  if (!spendFunds(config.cost)) {
    toast(`Not enough ${planet().walletLabel.toLowerCase()} for that.`, 'error');
    return;
  }

  planetBusinesses().push({
    type,
    name: config.name,
    level: 1,
    income: config.income,
    baseCost: config.cost,
    upgradeCost: roundToHundredths(config.cost * 0.5),
    upgradeMultiplier: config.upgradeMultiplier,
    maxLevel: config.maxLevel,
    imageSrc: config.imageSrc,
    icon: config.icon,
    merged: false,
  });

  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderBusinesses();
  renderBuyBusinessPopup();
  toast(`${config.name} acquired.`, 'success');
}

function renderBuyBusinessPopup() {
  const list = document.getElementById('buy-business-list');
  if (!list) return;
  list.innerHTML = '';

  Object.entries(planet().businessTypes).forEach(([type, config]) => {
    list.appendChild(buildShopCard(type, config, config.cost, `${formatFunds(config.income)} / hr`, ownsBusinessType(type)));
  });

  if (planet().hasBank) {
    list.appendChild(buildShopCard('bank', bank, bank.baseCost, 'Income scales with vault', ownsBusinessType('bank')));
  }
}

function buildShopCard(type, source, cost, subLabel, owned) {
  const card = document.createElement('div');
  card.className = 'card' + (owned ? ' owned' : '');
  if (!owned) card.onclick = () => buyBusiness(type);

  card.appendChild(createCardMedia(source));

  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = `
    <div class="card-title-row">
      <span class="card-title">${source.name}</span>
      ${owned ? '<span class="card-badge max">Owned</span>' : ''}
    </div>
    <div class="card-sub">${subLabel}</div>
  `;

  const price = document.createElement('div');
  price.className = 'card-price';
  price.textContent = owned ? '' : formatFunds(cost);

  card.appendChild(body);
  card.appendChild(price);
  return card;
}

function renderBusinesses() {
  const businessList = document.getElementById('business-list');
  const emptyState = document.getElementById('business-empty-state');
  const list = planetBusinesses();
  businessList.innerHTML = '';

  emptyState.classList.toggle('visible', list.length === 0);

  list.forEach((business, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.appendChild(createCardMedia(business));

    const body = document.createElement('div');
    body.className = 'card-body';

    if (business.type === 'bank') {
      const pct = business.maxVaultStorage > 0 ? Math.min(100, (business.currentMoneyInVault / business.maxVaultStorage) * 100) : 0;
      body.innerHTML = `
        <div class="card-title-row"><span class="card-title">${business.name}</span></div>
        <div class="card-sub">${formatFunds(business.income)} / hr</div>
        <div class="card-progress"><div class="card-progress-fill" style="width:${pct}%"></div></div>
      `;
    } else if (business.merged) {
      body.innerHTML = `
        <div class="card-title-row"><span class="card-title">${business.name}</span><span class="card-badge max">Merged</span></div>
        <div class="card-sub">${formatFunds(business.income)} / hr</div>
      `;
    } else {
      const isMax = business.level >= business.maxLevel;
      const pct = Math.min(100, (business.level / business.maxLevel) * 100);
      body.innerHTML = `
        <div class="card-title-row">
          <span class="card-title">${business.name}</span>
          <span class="card-badge${isMax ? ' max' : ''}">Lv ${business.level}/${business.maxLevel}</span>
          ${business.manager ? '<span class="card-badge manager-badge" title="Managed">👔</span>' : ''}
        </div>
        <div class="card-sub">${formatFunds(business.income)} / hr</div>
        <div class="card-progress"><div class="card-progress-fill" style="width:${pct}%"></div></div>
      `;
    }

    card.appendChild(body);

    if (business.type === 'bank') {
      card.onclick = () => openBankPopup(index);
    } else if (business.merged) {
      card.onclick = () => openMergedBusinessPopup(index);
    } else {
      card.onclick = () => openUpgradeBusinessPopup(index);
    }

    businessList.appendChild(card);
  });
}

/* ---------------- upgrades (×1, ×10, Max) ---------------- */

const UPGRADE_COST_GROWTH = 1.15; // each level costs 15% more than the last

function applyLevelUp(business) {
  business.level += 1;
  business.income = roundToHundredths(business.income * business.upgradeMultiplier);
  business.upgradeCost = roundToHundredths(business.upgradeCost * UPGRADE_COST_GROWTH);
}

// What the next `levels` upgrades cost in total, and how many of the
// requested levels can be bought with `funds` (never past max level).
function planUpgrade(business, requested, funds) {
  const remaining = business.maxLevel - business.level;
  let levels = 0;
  let total = 0;
  let cost = business.upgradeCost;
  while (levels < Math.min(requested, remaining) && total + cost <= funds) {
    total += cost;
    cost *= UPGRADE_COST_GROWTH;
    levels++;
  }
  return { levels, total: roundToHundredths(total) };
}

function upgradeBusinessBy(index, requested) {
  const business = planetBusinesses()[index];
  if (!business || business.level >= business.maxLevel) return;
  const plan = planUpgrade(business, requested, planetFunds());
  if (plan.levels === 0 || !spendFunds(plan.total)) {
    toast(`Not enough ${planet().walletLabel.toLowerCase()} for that upgrade.`, 'error');
    return;
  }
  for (let i = 0; i < plan.levels; i++) applyLevelUp(business);
  playSound('buy');
  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderBusinesses();
  openUpgradeBusinessPopup(index);
}

function upgradeBusiness(index) {
  upgradeBusinessBy(index, 1);
}

/* ---------------- managers ----------------
   A manager auto-upgrades its business whenever the next level costs
   at most MANAGER_SPEND_SHARE of that planet's balance, so they never
   drain the money you're saving up. They keep working on whichever
   planet you're not looking at. */

const MANAGER_COST_MULTIPLE = 10; // a manager costs 10× the business's purchase price
const MANAGER_SPEND_SHARE = 0.1;
const MANAGER_LEVELS_PER_TICK = 3;

function managerCost(business) {
  return roundToHundredths((business.baseCost || 0) * MANAGER_COST_MULTIPLE);
}

function canHaveManager(business) {
  return !!business && !business.merged && business.type !== 'bank' && business.baseCost > 0;
}

function hireManager(index) {
  const business = planetBusinesses()[index];
  if (!canHaveManager(business) || business.manager) return;
  const cost = managerCost(business);
  if (planetFunds() < cost) {
    toast(`Not enough ${planet().walletLabel.toLowerCase()} to hire a manager.`, 'error');
    return;
  }
  if (!confirmSpend(cost, planetFunds(), `${formatFunds(cost)} on a manager for your ${business.name}`)) return;
  spendFunds(cost);
  business.manager = true;
  if (typeof recordStat === 'function') recordStat('managers');
  toast(`👔 Manager hired for your ${business.name}.`, 'success');
  saveProgress();
  updateStats();
  renderBusinesses();
  renderUpgradePopup(index);
}

// Called once a second by the game loop.
function tickManagers() {
  const planetIds = mars.unlocked ? ['earth', 'mars'] : ['earth'];
  let changed = false;
  planetIds.forEach(id => {
    const p = PLANETS[id];
    p.getBusinesses().forEach(business => {
      if (!business.manager) return;
      for (let i = 0; i < MANAGER_LEVELS_PER_TICK && business.level < business.maxLevel; i++) {
        if (business.upgradeCost > p.getFunds() * MANAGER_SPEND_SHARE) break;
        p.setFunds(roundToHundredths(p.getFunds() - business.upgradeCost));
        applyLevelUp(business);
        changed = true;
      }
    });
  });
  if (changed) {
    recalcHourlyIncome();
    renderBusinesses();
  }
}

let openUpgradeIndex = null;

function openUpgradeBusinessPopup(index) {
  openUpgradeIndex = index;
  renderUpgradePopup(index);
  showPopup('upgrade-business-popup');
}

// Fills in the upgrade popup. Also called every second by the game loop
// while it's open, so the Upgrade button enables the moment you can afford it.
function renderUpgradePopup(index) {
  const business = planetBusinesses()[index];
  if (!business) return;
  document.getElementById('business-name').textContent = business.name;
  document.getElementById('business-level').textContent = `${business.level} / ${business.maxLevel}`;
  document.getElementById('business-level-gauge').style.width = `${Math.min(100, (business.level / business.maxLevel) * 100)}%`;
  document.getElementById('business-income').textContent = `${formatFunds(business.income)} / hr`;

  const funds = planetFunds();
  const atMax = business.level >= business.maxLevel;
  const upgradeButton = document.getElementById('upgrade-button');
  const tenButton = document.getElementById('upgrade-10-button');
  const maxButton = document.getElementById('upgrade-max-button');

  document.getElementById('business-upgrade-cost').textContent = atMax ? 'MAX LEVEL' : formatFunds(business.upgradeCost);
  upgradeButton.disabled = atMax || funds < business.upgradeCost;

  // ×10 shows the price of the next 10 levels (or however many are left).
  const tenLevels = Math.min(10, business.maxLevel - business.level);
  const tenPlan = planUpgrade(business, tenLevels, Infinity);
  tenButton.textContent = atMax ? '×10' : `×${tenLevels} · ${formatFunds(tenPlan.total)}`;
  tenButton.disabled = atMax || funds < tenPlan.total;

  // Max buys as many levels as you can afford right now.
  const maxPlan = planUpgrade(business, Infinity, funds);
  maxButton.textContent = maxPlan.levels > 0 ? `Max ×${maxPlan.levels} · ${formatFunds(maxPlan.total)}` : 'Max';
  maxButton.disabled = maxPlan.levels === 0;

  upgradeButton.onclick = () => upgradeBusinessBy(index, 1);
  tenButton.onclick = () => upgradeBusinessBy(index, tenLevels);
  maxButton.onclick = () => upgradeBusinessBy(index, Infinity);

  const managerBox = document.getElementById('manager-box');
  const managerButton = document.getElementById('manager-button');
  const managerText = document.getElementById('manager-text');
  managerBox.hidden = !canHaveManager(business);
  if (business.manager) {
    managerText.textContent = atMax
      ? '👔 Your manager got this business to max level.'
      : '👔 Manager hired. Upgrades this business whenever a level costs 10% or less of your balance.';
    managerButton.hidden = true;
  } else {
    const cost = managerCost(business);
    managerText.textContent = '👔 Hire a manager to upgrade this business for you, even while you\'re on the other planet.';
    managerButton.hidden = false;
    managerButton.textContent = `Hire · ${formatFunds(cost)}`;
    managerButton.disabled = funds < cost;
    managerButton.onclick = () => hireManager(index);
  }
  document.getElementById('close-button').onclick = () => closeBusiness(index);
}

function isPopupOpen(id) {
  const el = document.getElementById(id);
  return !!el && el.style.display === 'block';
}

// Keeps any open business/bank popup in step with your cash and the
// bank vault, which both change every second.
function refreshOpenPopups() {
  if (openUpgradeIndex !== null && isPopupOpen('upgrade-business-popup')) renderUpgradePopup(openUpgradeIndex);
  if (openBankIndex !== null && isPopupOpen('bank-popup')) renderBankPopup(openBankIndex);
  refreshExchangePopup();
}

function closeBusiness(index) {
  const business = planetBusinesses()[index];
  if (!business) return;
  if (confirm(`Are you sure you want to close the ${business.name}? This cannot be undone.`)) {
    planetBusinesses().splice(index, 1);
    recalcHourlyIncome();
    saveProgress();
    updateStats();
    renderBusinesses();
    closeUpgradeBusinessPopup();
    toast(`${business.name} closed.`, 'error');
  }
}

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

function ownsBusinessType(type) {
  return businesses.some(b => b.type === type);
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
    buyBank();
    return;
  }

  const config = BUSINESS_TYPES[type];
  if (!config) return;

  if (ownsBusinessType(type)) {
    toast(`You already own a ${config.name}.`, 'error');
    return;
  }
  if (cash < config.cost) {
    toast('Not enough cash for that.', 'error');
    return;
  }

  cash = roundToHundredths(cash - config.cost);
  businesses.push({
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

  Object.entries(BUSINESS_TYPES).forEach(([type, config]) => {
    list.appendChild(buildShopCard(type, config, config.cost, `${formatMoney(config.income)} / hr`, ownsBusinessType(type)));
  });

  list.appendChild(buildShopCard('bank', bank, bank.baseCost, 'Income scales with vault', ownsBusinessType('bank')));
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
  price.textContent = owned ? '' : formatMoney(cost);

  card.appendChild(body);
  card.appendChild(price);
  return card;
}

function renderBusinesses() {
  const businessList = document.getElementById('business-list');
  const emptyState = document.getElementById('business-empty-state');
  businessList.innerHTML = '';

  emptyState.classList.toggle('visible', businesses.length === 0);

  businesses.forEach((business, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.appendChild(createCardMedia(business));

    const body = document.createElement('div');
    body.className = 'card-body';

    if (business.type === 'bank') {
      const pct = business.maxVaultStorage > 0 ? Math.min(100, (business.currentMoneyInVault / business.maxVaultStorage) * 100) : 0;
      body.innerHTML = `
        <div class="card-title-row"><span class="card-title">${business.name}</span></div>
        <div class="card-sub">${formatMoney(business.income)} / hr</div>
        <div class="card-progress"><div class="card-progress-fill" style="width:${pct}%"></div></div>
      `;
    } else if (business.merged) {
      body.innerHTML = `
        <div class="card-title-row"><span class="card-title">${business.name}</span><span class="card-badge max">Merged</span></div>
        <div class="card-sub">${formatMoney(business.income)} / hr</div>
      `;
    } else {
      const isMax = business.level >= business.maxLevel;
      const pct = Math.min(100, (business.level / business.maxLevel) * 100);
      body.innerHTML = `
        <div class="card-title-row">
          <span class="card-title">${business.name}</span>
          <span class="card-badge${isMax ? ' max' : ''}">Lv ${business.level}/${business.maxLevel}</span>
        </div>
        <div class="card-sub">${formatMoney(business.income)} / hr</div>
        <div class="card-progress"><div class="card-progress-fill" style="width:${pct}%"></div></div>
      `;
    }

    card.appendChild(body);

    if (business.type === 'bank') {
      card.onclick = () => openBankPopup(index);
    } else if (business.merged) {
      card.onclick = () => closeMergedBusiness(index);
    } else {
      card.onclick = () => openUpgradeBusinessPopup(index);
    }

    businessList.appendChild(card);
  });
}

function upgradeBusiness(index) {
  const business = businesses[index];
  if (cash >= business.upgradeCost && business.level < business.maxLevel) {
    cash = roundToHundredths(cash - business.upgradeCost);
    business.level += 1;
    business.income = roundToHundredths(business.income * business.upgradeMultiplier);
    business.upgradeCost = roundToHundredths(business.upgradeCost * 1.15);

    recalcHourlyIncome();
    saveProgress();
    updateStats();
    renderBusinesses();
    openUpgradeBusinessPopup(index);
  } else {
    toast('Not enough cash or already at max level.', 'error');
  }
}

function openUpgradeBusinessPopup(index) {
  const business = businesses[index];
  document.getElementById('business-name').textContent = business.name;
  document.getElementById('business-level').textContent = `${business.level} / ${business.maxLevel}`;
  document.getElementById('business-level-gauge').style.width = `${Math.min(100, (business.level / business.maxLevel) * 100)}%`;
  document.getElementById('business-income').textContent = formatMoney(business.income);

  const upgradeButton = document.getElementById('upgrade-button');
  if (business.level >= business.maxLevel) {
    document.getElementById('business-upgrade-cost').textContent = 'MAX LEVEL';
    upgradeButton.disabled = true;
  } else {
    document.getElementById('business-upgrade-cost').textContent = formatMoney(business.upgradeCost);
    upgradeButton.disabled = cash < business.upgradeCost;
  }

  upgradeButton.onclick = () => upgradeBusiness(index);
  document.getElementById('close-button').onclick = () => closeBusiness(index);
  showPopup('upgrade-business-popup');
}

function closeBusiness(index) {
  const business = businesses[index];
  if (confirm(`Are you sure you want to close the ${business.name}? This cannot be undone.`)) {
    businesses.splice(index, 1);
    recalcHourlyIncome();
    saveProgress();
    updateStats();
    renderBusinesses();
    closeUpgradeBusinessPopup();
    toast(`${business.name} closed.`, 'error');
  }
}

let selectedBusinesses = [];

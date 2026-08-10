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
};

function ownsBusinessType(type) {
  return businesses.some(b => b.type === type);
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
    list.appendChild(buildShopCard(type, config.name, config.imageSrc, config.cost, `${formatMoney(config.income)} / hr`, ownsBusinessType(type)));
  });

  list.appendChild(buildShopCard('bank', bank.name, bank.imageSrc, bank.baseCost, 'Income scales with vault', ownsBusinessType('bank')));
}

function buildShopCard(type, name, imageSrc, cost, subLabel, owned) {
  const card = document.createElement('div');
  card.className = 'card' + (owned ? ' owned' : '');
  if (!owned) card.onclick = () => buyBusiness(type);

  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = `${name} image`;
  img.className = 'card-image';

  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = `
    <div class="card-title-row">
      <span class="card-title">${name}</span>
      ${owned ? '<span class="card-badge max">Owned</span>' : ''}
    </div>
    <div class="card-sub">${subLabel}</div>
  `;

  const price = document.createElement('div');
  price.className = 'card-price';
  price.textContent = owned ? '' : formatMoney(cost);

  card.appendChild(img);
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

    const img = document.createElement('img');
    img.src = business.imageSrc;
    img.alt = `${business.name} image`;
    img.className = 'card-image';

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

    card.appendChild(img);
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

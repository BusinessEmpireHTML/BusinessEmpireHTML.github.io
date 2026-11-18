/* ============================================================
   BUSINESS EMPIRE — investments.js
   Property: repeatable passive-income buys. Each purchase raises
   the price for the next one, same shape as business upgrades.
   (Stocks and crypto are tradable markets now — see markets.js.)
   ============================================================ */

const INVESTMENT_TYPES = {
  realEstate: {
    name: 'Real Estate',
    icon: '🏘️',
    baseCost: 8000,
    income: 2400,
    costMultiplier: 1.15,
  },
};

// The old passive "Stock Portfolio" item, kept only so saves that
// bought it can be refunded now that stocks are a real market.
const RETIRED_STOCK_PORTFOLIO = { baseCost: 2000, costMultiplier: 1.15 };

function getDefaultInvestments() {
  const state = {};
  Object.entries(INVESTMENT_TYPES).forEach(([type, config]) => {
    state[type] = { owned: 0, cost: config.baseCost, income: config.income };
  });
  return state;
}

// Fills in any investment types missing from an older save, and
// refunds everything ever spent on the retired Stock Portfolio.
// Returns { state, refund }.
function normalizeInvestments(saved) {
  const state = getDefaultInvestments();
  let refund = 0;
  if (saved && typeof saved === 'object') {
    Object.keys(INVESTMENT_TYPES).forEach(type => {
      if (saved[type]) state[type] = { ...state[type], ...saved[type] };
    });
    const oldStock = saved.stock;
    if (oldStock && oldStock.owned > 0) {
      const { baseCost, costMultiplier } = RETIRED_STOCK_PORTFOLIO;
      // sum of baseCost * multiplier^i for i in [0, owned)
      refund = roundToHundredths((baseCost * (Math.pow(costMultiplier, oldStock.owned) - 1)) / (costMultiplier - 1));
    }
  }
  return { state, refund };
}

function invest(type) {
  const config = INVESTMENT_TYPES[type];
  if (!config) return;
  if (!investments) investments = getDefaultInvestments();
  const holding = investments[type];

  if (cash < holding.cost) {
    toast('Not enough cash for that.', 'error');
    return;
  }

  cash = roundToHundredths(cash - holding.cost);
  holding.owned += 1;
  holding.cost = roundToHundredths(holding.cost * config.costMultiplier);

  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderInvestments();
  toast(`Added to your ${config.name.toLowerCase()}.`, 'success');
}

function renderInvestments() {
  const list = document.getElementById('property-list');
  if (!list) return;
  if (!investments) investments = getDefaultInvestments();
  list.innerHTML = '';

  Object.entries(INVESTMENT_TYPES).forEach(([type, config]) => {
    const holding = investments[type];

    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => invest(type);

    const monogram = document.createElement('div');
    monogram.className = 'card-monogram';
    monogram.textContent = config.icon;

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <div class="card-title-row">
        <span class="card-title">${config.name}</span>
        ${holding.owned > 0 ? `<span class="card-badge">${holding.owned} owned</span>` : ''}
      </div>
      <div class="card-sub">${formatMoney(holding.owned * holding.income)} / hr total</div>
    `;

    const price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = formatMoney(holding.cost);

    card.appendChild(monogram);
    card.appendChild(body);
    card.appendChild(price);
    list.appendChild(card);
  });
}

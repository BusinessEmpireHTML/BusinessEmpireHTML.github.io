/* ============================================================
   BUSINESS EMPIRE — investments.js
   Stocks and Real Estate: repeatable passive-income buys. Each
   purchase raises the price for the next one, same shape as
   business upgrades, so the Investing tab stays useful long-term.
   ============================================================ */

const INVESTMENT_TYPES = {
  stock: {
    name: 'Stock Portfolio',
    monogram: 'S',
    baseCost: 2000,
    income: 500,
    costMultiplier: 1.15,
  },
  realEstate: {
    name: 'Real Estate',
    monogram: 'R',
    baseCost: 8000,
    income: 2400,
    costMultiplier: 1.15,
  },
};

function getDefaultInvestments() {
  const state = {};
  Object.entries(INVESTMENT_TYPES).forEach(([type, config]) => {
    state[type] = { owned: 0, cost: config.baseCost, income: config.income };
  });
  return state;
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
  const list = document.getElementById('investment-list');
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
    monogram.textContent = config.monogram;

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

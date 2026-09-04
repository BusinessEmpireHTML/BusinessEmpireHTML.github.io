/* ============================================================
   BUSINESS EMPIRE — bank.js
   The Bank is a singleton "business" whose income depends on how
   full its vault is. The vault fills at a fixed rate per HOUR;
   tickBankVaults() is called once a second by the main game loop
   with a fraction-of-an-hour delta so the fill rate is correct
   regardless of tick frequency.
   ============================================================ */

const VAULT_FILL_RATE_PER_HOUR = 1e9; // $1B/hr flows into the vault until it's full

let bank = {
  name: 'Bank',
  type: 'bank',
  level: 1,
  baseCost: 10000000,
  currentMoneyInVault: 10000000,
  maxVaultStorage: 10000000,
  upgradeCost: 5000000,
  upgradeMultiplier: 1.5,
  maxLevel: 10,
  income: 100000,
  imageSrc: 'images/Bank.jpg',
};

function buyBank() {
  if (cash < bank.baseCost) {
    toast('Not enough cash for that.', 'error');
    return;
  }

  cash = roundToHundredths(cash - bank.baseCost);
  businesses.push({ ...bank }); // clone — never share the template object

  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderBusinesses();
  renderBuyBusinessPopup();
  toast('Bank acquired.', 'success');
}

// Advances every owned bank's vault by `hours` worth of fill rate. Used
// both by the per-second game loop (hours = 1/3600) and by offline-income
// catch-up (hours = however long the tab was closed).
function tickBankVaults(hours) {
  advanceBankVaults(hours);
}

function advanceBankVaults(hours) {
  businesses.forEach(business => {
    if (business.type === 'bank' && business.currentMoneyInVault < business.maxVaultStorage) {
      business.currentMoneyInVault = Math.min(
        business.maxVaultStorage,
        business.currentMoneyInVault + VAULT_FILL_RATE_PER_HOUR * hours
      );
    }
  });
}

function openBankPopup(index) {
  const b = businesses[index];
  document.getElementById('bank-hourly-income').textContent = formatMoney(b.income);
  document.getElementById('bank-vault-storage').textContent = `${formatMoney(b.currentMoneyInVault)} / ${formatMoney(b.maxVaultStorage)}`;
  document.getElementById('bank-vault-gauge').style.width = `${Math.min(100, (b.currentMoneyInVault / b.maxVaultStorage) * 100)}%`;

  const atMaxLevel = b.maxVaultStorage >= 1e12;
  document.getElementById('bank-upgrade-cost').textContent = atMaxLevel ? 'MAX LEVEL' : formatMoney(b.upgradeCost);
  const upgradeButton = document.getElementById('bank-upgrade-button');
  upgradeButton.disabled = atMaxLevel || cash < b.upgradeCost;
  upgradeButton.onclick = () => upgradeBankVault(index);

  showPopup('bank-popup');
}

function upgradeBankVault(index) {
  const b = businesses[index];
  if (cash >= b.upgradeCost && b.maxVaultStorage < 1e12) {
    cash = roundToHundredths(cash - b.upgradeCost);
    b.maxVaultStorage = roundToHundredths(b.maxVaultStorage * b.upgradeMultiplier);
    b.upgradeCost = roundToHundredths(b.upgradeCost * 1.15);

    recalcHourlyIncome();
    saveProgress();
    updateStats();
    renderBusinesses();
    openBankPopup(index);
  } else {
    toast('Not enough cash or vault is already at max capacity.', 'error');
  }
}

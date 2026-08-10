/* ============================================================
   BUSINESS EMPIRE — merger.js
   Combine two max-level businesses into a bigger merged business.
   Merge rules and payouts are unchanged from the original design;
   this file only fixes how income gets recalculated afterward.
   ============================================================ */

const mergedBusinesses = [
  { name: 'Lemonade Factory', income: 600000, imageSrc: 'images/LemonadeFactory.jpg' },
  { name: 'Restaurant', income: 800000, imageSrc: 'images/Restaurant.jpg' },
  { name: 'Chain of Restaurants', income: 2400000, imageSrc: 'images/ChainOfRestaurants.jpg' },
  { name: 'Car Dealership', income: 500000, imageSrc: 'images/CarDealership.jpg' },
  { name: 'Law Firm', income: 25000000000, imageSrc: 'images/LawFirm.jpg' },
];

const mergedCombinations = {
  'Lemonade Stand+Factory': 'Lemonade Factory',
  'Local Shop+Factory': 'Restaurant',
  'Restaurant+Factory': 'Chain of Restaurants',
  'Car Wash+Factory': 'Car Dealership',
  'Legal Clinic+Bank': 'Law Firm',
};

function closeMergerPopup() {
  hidePopup('business-merger-popup');
  selectedBusinesses = [];
  document.getElementById('merge-button').disabled = true;
}

function openMergerPopup() {
  const list = document.getElementById('merger-business-list');
  const emptyState = document.getElementById('merger-empty-state');
  list.innerHTML = '';
  selectedBusinesses = [];
  document.getElementById('merge-button').disabled = true;

  let eligibleCount = 0;

  businesses.forEach((business, index) => {
    const isEligible =
      (business.level === business.maxLevel && !business.merged) ||
      (business.merged && canMergeAgain(business)) ||
      (business.type === 'bank' && business.currentMoneyInVault === business.maxVaultStorage);

    if (!isEligible) return;
    eligibleCount++;

    const card = document.createElement('div');
    card.className = 'card merger-card';

    const img = document.createElement('img');
    img.src = business.imageSrc;
    img.alt = `${business.name} image`;
    img.className = 'card-image';

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `<div class="card-title-row"><span class="card-title">${business.name}</span></div>`;

    card.appendChild(img);
    card.appendChild(body);
    card.onclick = () => toggleBusinessSelection(index, card);

    list.appendChild(card);
  });

  emptyState.classList.toggle('visible', eligibleCount === 0);
  showPopup('business-merger-popup');
}

function toggleBusinessSelection(index, cardEl) {
  const pos = selectedBusinesses.indexOf(index);
  if (pos === -1) {
    if (selectedBusinesses.length < 2) {
      selectedBusinesses.push(index);
      cardEl.classList.add('selected');
    }
  } else {
    selectedBusinesses.splice(pos, 1);
    cardEl.classList.remove('selected');
  }
  document.getElementById('merge-button').disabled = selectedBusinesses.length !== 2;
}

function canMergeAgain(business) {
  return business.name === 'Restaurant';
}

function isMergeCompatible(business1, business2) {
  const combination1 = `${business1.name}+${business2.name}`;
  const combination2 = `${business2.name}+${business1.name}`;
  return mergedCombinations[combination1] || mergedCombinations[combination2];
}

function mergeSelectedBusinesses() {
  const [business1, business2] = selectedBusinesses.map(index => businesses[index]);
  const mergedName = business1 && business2 ? isMergeCompatible(business1, business2) : null;

  if (mergedName) {
    performMerge(business1, business2, mergedName);
    toast(`Merged into a ${mergedName}!`, 'success');
  } else {
    toast('Those two businesses cannot be merged together.', 'error');
  }

  closeMergerPopup();
}

function performMerge(business1, business2, mergedName) {
  const template = mergedBusinesses.find(b => b.name === mergedName);
  if (!template) return;

  const index1 = businesses.indexOf(business1);
  businesses.splice(index1, 1);
  const index2 = businesses.indexOf(business2);
  businesses.splice(index2, 1);

  businesses.push({
    name: template.name,
    level: 1,
    income: template.income,
    baseCost: 0,
    upgradeCost: 0,
    upgradeMultiplier: 1,
    maxLevel: 1,
    imageSrc: template.imageSrc,
    merged: true,
  });

  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderBusinesses();
}

function closeMergedBusiness(index) {
  const business = businesses[index];
  if (confirm(`Are you sure you want to close the ${business.name}? This cannot be undone.`)) {
    businesses.splice(index, 1);
    recalcHourlyIncome();
    saveProgress();
    updateStats();
    renderBusinesses();
    toast(`${business.name} closed.`, 'error');
  }
}

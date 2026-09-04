/* ============================================================
   BUSINESS EMPIRE — merger.js
   Combine two max-level businesses into a bigger merged business.
   Merge rules and payouts are unchanged from the original design;
   this file only fixes how income gets recalculated afterward.
   ============================================================ */

const mergeRecipes = [
  // Tier 1 -> Tier 2
  // Note: every recipe pairs two DIFFERENT business types. Buying a business
  // blocks owning a second of that same type at once (see ownsBusinessType
  // in business.js), so a "Gym + Gym" style recipe would be impossible to
  // ever complete. Factory (and a few cross-business pairings) fill the
  // "second ingredient" role instead.
  { inputs: ['Lemonade Stand', 'Factory'], output: 'Lemonade Factory' },
  { inputs: ['Local Shop', 'Factory'], output: 'Restaurant' },
  { inputs: ['Car Wash', 'Factory'], output: 'Car Dealership' },
  { inputs: ['Legal Clinic', 'Bank'], output: 'Law Firm' },
  { inputs: ['Bank', 'Real Estate Agency'], output: 'Investment Bank' },
  { inputs: ['Gym', 'Factory'], output: 'Fitness Empire' },
  { inputs: ['Pharmacy', 'Factory'], output: 'Pharmacy Chain' },
  { inputs: ['Hotel', 'Factory'], output: 'Hotel Chain' },
  { inputs: ['Movie Theater', 'Factory'], output: 'Entertainment Group' },
  { inputs: ['Supermarket', 'Factory'], output: 'Retail Empire' },
  { inputs: ['Tech Startup', 'Factory'], output: 'Tech Corporation' },
  { inputs: ['Real Estate Agency', 'Factory'], output: 'Real Estate Empire' },
  { inputs: ['Pharmacy', 'Legal Clinic'], output: 'Healthcare Corporation' },
  { inputs: ['Hotel', 'Restaurant'], output: 'Hospitality Group' },

  // Tier 2 -> Tier 3 (capstones — see canMergeAgain below)
  { inputs: ['Restaurant', 'Factory'], output: 'Chain of Restaurants' },
  { inputs: ['Tech Corporation', 'Tech Startup'], output: 'Tech Conglomerate' },
  { inputs: ['Real Estate Empire', 'Real Estate Agency'], output: 'Global Real Estate' },
];

const mergedBusinesses = [
  // Tier 2 — first merges, carried over from the original game (real artwork)
  { name: 'Lemonade Factory', income: 600000, imageSrc: 'images/LemonadeFactory.jpg' },
  { name: 'Restaurant', income: 800000, imageSrc: 'images/Restaurant.jpg' },
  { name: 'Car Dealership', income: 500000, imageSrc: 'images/CarDealership.jpg' },
  { name: 'Law Firm', income: 25000000000, imageSrc: 'images/LawFirm.jpg' },

  // Tier 2 — new lines. No on-disk artwork for these yet, so they get a
  // monogram icon (see createCardMedia in business.js) instead of a photo.
  { name: 'Investment Bank', income: 50000000000, icon: '🏦' },
  { name: 'Fitness Empire', income: 120000000, icon: '💪' },
  { name: 'Pharmacy Chain', income: 180000000, icon: '⚕️' },
  { name: 'Hotel Chain', income: 200000000, icon: '🏩' },
  { name: 'Entertainment Group', income: 250000000, icon: '🎭' },
  { name: 'Retail Empire', income: 400000000, icon: '🛍️' },
  { name: 'Tech Corporation', income: 100000000, icon: '🖥️' },
  { name: 'Real Estate Empire', income: 500000000, icon: '🏙️' },
  { name: 'Healthcare Corporation', income: 350000000, icon: '🏥' },
  { name: 'Hospitality Group', income: 280000000, icon: '🛎️' },

  // Tier 3 — merge an eligible tier-2 business again for the capstone version
  { name: 'Chain of Restaurants', income: 2400000, imageSrc: 'images/ChainOfRestaurants.jpg' },
  { name: 'Tech Conglomerate', income: 300000000, icon: '🌐' },
  { name: 'Global Real Estate', income: 1000000000, icon: '🌍' },
];

// Businesses that are an intermediate rung rather than a final capstone —
// they're eligible to merge a second time, and they're excluded from the
// Mars Colonization requirements below since a further merge supersedes them.
const INTERMEDIATE_MERGE_NAMES = ['Restaurant', 'Tech Corporation', 'Real Estate Empire'];

// Looks up the display template (imageSrc/icon) for any business NAME,
// whether it's a base type (from BUSINESS_TYPES), the Bank, or a merged
// tier-2/tier-3 output (from mergedBusinesses). Used to render recipe icons.
function findBusinessTemplateByName(name) {
  if (name === 'Bank') return bank;
  const baseMatch = Object.values(BUSINESS_TYPES).find(cfg => cfg.name === name);
  if (baseMatch) return baseMatch;
  return mergedBusinesses.find(b => b.name === name);
}

function isEligibleForMerge(business) {
  return (
    (business.level === business.maxLevel && !business.merged) ||
    (business.merged && canMergeAgain(business)) ||
    (business.type === 'bank' && business.currentMoneyInVault === business.maxVaultStorage)
  );
}

function findEligibleBusinessIndex(name) {
  return businesses.findIndex(b => b.name === name && isEligibleForMerge(b));
}

function closeMergerPopup() {
  hidePopup('business-merger-popup');
}

function openMergerPopup() {
  renderMergerRecipes();
  showPopup('business-merger-popup');
}

function renderMergerRecipes() {
  const list = document.getElementById('merger-business-list');
  list.innerHTML = '';

  mergeRecipes.forEach(recipe => {
    const [name1, name2] = recipe.inputs;
    const index1 = findEligibleBusinessIndex(name1);
    const index2 = findEligibleBusinessIndex(name2);
    const ready1 = index1 !== -1;
    const ready2 = index2 !== -1;
    const bothReady = ready1 && ready2;

    const card = document.createElement('div');
    card.className = 'recipe-card';

    const header = document.createElement('div');
    header.className = 'recipe-header';
    header.innerHTML = `
      <span class="recipe-title">${name1} + ${name2}</span>
      <span class="recipe-arrow">&rarr;</span>
      <span class="recipe-output">${recipe.output}</span>
    `;

    const reqRow = document.createElement('div');
    reqRow.className = 'recipe-requirements';
    reqRow.innerHTML = `
      <span class="recipe-chip${ready1 ? ' ready' : ''}">${name1}</span>
      <span class="recipe-chip${ready2 ? ' ready' : ''}">${name2}</span>
    `;

    const mergeButton = document.createElement('button');
    mergeButton.className = 'button-rounded button-gold recipe-merge-button';
    mergeButton.textContent = 'Merge';
    mergeButton.disabled = !bothReady;
    if (bothReady) {
      mergeButton.onclick = () => {
        performMerge(businesses[index1], businesses[index2], recipe.output);
        toast(`Merged into a ${recipe.output}!`, 'success');
        renderMergerRecipes();
      };
    }

    card.appendChild(header);
    card.appendChild(reqRow);
    card.appendChild(mergeButton);
    list.appendChild(card);
  });
}

function canMergeAgain(business) {
  return INTERMEDIATE_MERGE_NAMES.includes(business.name);
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
    icon: template.icon,
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

/* ============================================================
   MARS COLONIZATION
   The ultimate prestige move: own one of every capstone business
   at once (every merge line's final tier, i.e. every entry in
   mergedBusinesses that isn't itself eligible to merge again) and
   you can fold your entire empire into a single Mars Colony.
   ============================================================ */

function getMarsRequirements() {
  return mergedBusinesses.filter(b => !canMergeAgain(b));
}

function isMarsColonized() {
  return businesses.some(b => b.type === 'marsColony');
}

function openMarsPopup() {
  const list = document.getElementById('mars-business-list');
  const progressLabel = document.getElementById('mars-progress-label');
  const progressFill = document.getElementById('mars-progress-fill');
  const colonizeButton = document.getElementById('mars-colonize-button');
  list.innerHTML = '';

  if (isMarsColonized()) {
    list.innerHTML = '<p class="empty-state visible">Mars has already been colonized. Your empire now runs entirely off-world.</p>';
    progressLabel.textContent = 'Complete';
    progressFill.style.width = '100%';
    colonizeButton.disabled = true;
    showPopup('mars-popup');
    return;
  }

  const requirements = getMarsRequirements();
  const ownedNames = businesses.map(b => b.name);
  let readyCount = 0;

  requirements.forEach(req => {
    const owned = ownedNames.includes(req.name);
    if (owned) readyCount++;

    const card = document.createElement('div');
    card.className = 'card' + (owned ? '' : ' missing');
    card.appendChild(createCardMedia(req));

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <div class="card-title-row">
        <span class="card-title">${req.name}</span>
        <span class="card-badge${owned ? ' max' : ''}">${owned ? 'Ready' : 'Missing'}</span>
      </div>
    `;
    card.appendChild(body);
    list.appendChild(card);
  });

  progressLabel.textContent = `${readyCount} / ${requirements.length} acquired`;
  progressFill.style.width = `${(readyCount / requirements.length) * 100}%`;
  colonizeButton.disabled = readyCount < requirements.length;

  showPopup('mars-popup');
}

function closeMarsPopup() {
  hidePopup('mars-popup');
}

function colonizeMars() {
  const requirements = getMarsRequirements();
  const ownedNames = businesses.map(b => b.name);
  const ready = requirements.every(req => ownedNames.includes(req.name));

  if (!ready) {
    toast('You need one of every capstone business before you can colonize Mars.', 'error');
    return;
  }
  if (!confirm('Colonizing Mars merges your ENTIRE empire into a single Mars Colony. This cannot be undone. Continue?')) return;

  businesses = [{
    type: 'marsColony',
    name: 'Mars Colony',
    level: 1,
    income: 1000000000000,
    baseCost: 0,
    upgradeCost: 0,
    upgradeMultiplier: 1,
    maxLevel: 1,
    icon: '🚀',
    merged: true,
  }];

  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderBusinesses();
  closeMarsPopup();
  toast('Humanity has reached Mars. Your empire now runs entirely off-world.', 'success');
}

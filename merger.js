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

// Incomes are balanced against what the two ingredients earn at max level
// (noted after each line), at roughly 1.5–2× their combined income, so a
// merge is always an upgrade and no single line dwarfs the rest. On top
// of this, performMerge() guarantees at least MERGE_INCOME_FLOOR × the
// ingredients' actual income (this matters for the Bank, whose income
// depends on how far its vault has been upgraded).
const mergedBusinesses = [
  // Tier 2 — first merges, carried over from the original game (real artwork)
  { name: 'Lemonade Factory', income: 750000, imageSrc: 'images/LemonadeFactory.jpg' }, // ~3.8K + ~479K
  { name: 'Restaurant', income: 1000000, imageSrc: 'images/Restaurant.jpg' }, // ~136K + ~479K
  { name: 'Car Dealership', income: 800000, imageSrc: 'images/CarDealership.jpg' }, // ~30K + ~479K
  { name: 'Law Firm', income: 500000, imageSrc: 'images/LawFirm.jpg' }, // ~42K + Bank (100K base, scales with vault)

  // Tier 2 — new lines. No on-disk artwork for these yet, so they get a
  // monogram icon (see createCardMedia in business.js) instead of a photo.
  { name: 'Investment Bank', income: 10000000000, icon: '🏦' }, // Bank + ~5.4B
  { name: 'Fitness Empire', income: 6000000, icon: '💪' }, // ~2.9M + ~479K
  { name: 'Pharmacy Chain', income: 12000000, icon: '⚕️' }, // ~6.4M + ~479K
  { name: 'Hotel Chain', income: 250000000, icon: '🏩' }, // ~150M + ~479K
  { name: 'Entertainment Group', income: 6000000000, icon: '🎭' }, // ~3.7B + ~479K
  { name: 'Retail Empire', income: 12000000000, icon: '🛍️' }, // ~7.3B + ~479K
  { name: 'Tech Corporation', income: 40000000000, icon: '🖥️' }, // ~25B + ~479K
  { name: 'Real Estate Empire', income: 9000000000, icon: '🏙️' }, // ~5.4B + ~479K
  { name: 'Healthcare Corporation', income: 11000000, icon: '🏥' }, // ~6.4M + ~42K
  { name: 'Hospitality Group', income: 300000000, icon: '🛎️' }, // ~150M + 1M (Restaurant)

  // Tier 3 — merge an eligible tier-2 business again for the capstone version
  { name: 'Chain of Restaurants', income: 3000000, imageSrc: 'images/ChainOfRestaurants.jpg' }, // 1M + ~479K
  { name: 'Tech Conglomerate', income: 120000000000, icon: '🌐' }, // 40B + ~25B
  { name: 'Global Real Estate', income: 25000000000, icon: '🌍' }, // 9B + ~5.4B
];

// A merge always pays at least this multiple of what its ingredients earned.
const MERGE_INCOME_FLOOR = 1.5;

function getMergeIncome(template, business1, business2) {
  const inputs = (business1.income || 0) + (business2.income || 0);
  return roundToHundredths(Math.max(template.income, inputs * MERGE_INCOME_FLOOR));
}

// Older saves stored merged incomes from before the rebalance. Raise any
// that are now below their template; never lower one, so nobody's
// existing empire gets weaker.
function migrateMergedIncomes() {
  businesses.forEach(business => {
    if (!business.merged || business.type === 'marsColony') return;
    const template = mergedBusinesses.find(b => b.name === business.name);
    if (template && business.income < template.income) business.income = template.income;
  });
}

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
  return planetBusinesses().findIndex(b => b.name === name && isEligibleForMerge(b));
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

  const p = planet();
  p.recipes.forEach(recipe => {
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
      <span class="recipe-income">${formatFunds(p.mergedTemplates.find(b => b.name === recipe.output).income)} / hr</span>
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
        performMerge(planetBusinesses()[index1], planetBusinesses()[index2], recipe.output);
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
  return planet().intermediates.includes(business.name);
}

function performMerge(business1, business2, mergedName) {
  const template = planet().mergedTemplates.find(b => b.name === mergedName);
  if (!template) return;
  const income = getMergeIncome(template, business1, business2);

  const list = planetBusinesses();
  list.splice(list.indexOf(business1), 1);
  list.splice(list.indexOf(business2), 1);

  list.push({
    name: template.name,
    level: 1,
    income,
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

// Tapping a merged business shows its details first. Closing it is a
// separate, confirmed action, so one stray tap can't destroy it.
function openMergedBusinessPopup(index) {
  const business = planetBusinesses()[index];
  if (!business) return;
  const isColony = business.type === 'marsColony';

  const media = document.getElementById('merged-media');
  media.innerHTML = '';
  media.appendChild(createCardMedia(business));
  document.getElementById('merged-name').textContent = business.name;
  document.getElementById('merged-income').textContent = `${formatFunds(business.income)} / hr`;

  let tier = 'Merged business';
  let note = planet().text.capstoneNote;
  if (isColony) {
    tier = 'First colony';
    note = 'The original Mars Colony, from before Mars was a whole planet. It keeps paying out on Earth and can\'t be closed.';
  } else if (canMergeAgain(business)) {
    tier = 'Merged business · can merge again';
    note = 'This business can be merged again into a bigger capstone. Check the Merge menu.';
  }
  document.getElementById('merged-tier').textContent = tier;
  document.getElementById('merged-note').textContent = note;

  const closeButton = document.getElementById('merged-close-button');
  closeButton.hidden = isColony;
  closeButton.onclick = () => closeMergedBusiness(index);

  showPopup('merged-business-popup');
}

function closeMergedBusinessPopup() {
  hidePopup('merged-business-popup');
}

function closeMergedBusiness(index) {
  const business = planetBusinesses()[index];
  if (!business || business.type === 'marsColony') return;
  if (confirm(`Are you sure you want to close the ${business.name}? This cannot be undone.`)) {
    planetBusinesses().splice(index, 1);
    recalcHourlyIncome();
    saveProgress();
    updateStats();
    renderBusinesses();
    closeMergedBusinessPopup();
    toast(`${business.name} closed.`, 'error');
  }
}

/* ============================================================
   MARS
   Own one of every Earth capstone (every merge line's final tier)
   at the same time and you can launch a colony. Nothing is turned
   in: your Earth empire keeps running, and Mars opens up as a second
   planet with its own currency and businesses (see planets.js).
   ============================================================ */

// Always Earth's capstones, whichever planet you're looking from.
function getMarsRequirements() {
  return mergedBusinesses.filter(b => !INTERMEDIATE_MERGE_NAMES.includes(b.name));
}

function isMarsColonized() {
  return mars.unlocked;
}

function openMarsPopup() {
  const list = document.getElementById('mars-business-list');
  const progressLabel = document.getElementById('mars-progress-label');
  const progressFill = document.getElementById('mars-progress-fill');
  const colonizeButton = document.getElementById('mars-colonize-button');
  list.innerHTML = '';

  if (isMarsColonized()) {
    list.innerHTML = '<p class="empty-state visible">Your colony is up and running. Travel there any time. Your Earth empire keeps earning while you\'re away.</p>';
    progressLabel.textContent = 'Colony established';
    progressFill.style.width = '100%';
    colonizeButton.textContent = '🔴 Travel to Mars';
    colonizeButton.disabled = false;
    colonizeButton.onclick = () => travelTo('mars');
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
  colonizeButton.textContent = '🚀 Launch to Mars';
  colonizeButton.disabled = readyCount < requirements.length;
  colonizeButton.onclick = colonizeMars;

  showPopup('mars-popup');
}

function closeMarsPopup() {
  hidePopup('mars-popup');
}

function colonizeMars() {
  if (isMarsColonized()) {
    travelTo('mars');
    return;
  }
  const ownedNames = businesses.map(b => b.name);
  const ready = getMarsRequirements().every(req => ownedNames.includes(req.name));
  if (!ready) {
    toast('You need one of every capstone business before you can launch to Mars.', 'error');
    return;
  }
  if (!confirm(`Launch a colony to Mars? You keep your entire Earth empire, and the colony starts with a ${formatCredits(MARS_COLONY_GRANT)} grant.`)) return;

  mars.unlocked = true;
  mars.credits = roundToHundredths(mars.credits + MARS_COLONY_GRANT);
  saveProgress();
  travelTo('mars');
  toast(`Humanity has reached Mars! Your colony grant of ${formatCredits(MARS_COLONY_GRANT)} is waiting.`, 'success');
}

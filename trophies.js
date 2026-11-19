/* ============================================================
   BUSINESS EMPIRE — trophies.js
   Pure vanity: cars, watches, yachts, aircraft, islands, art and
   space toys. They earn nothing. They're there to be owned.
   Sold back for TROPHY_RESALE of their price.
   ============================================================ */

const TROPHY_RESALE = 0.5;

const TROPHY_CATEGORIES = [
  { id: 'cars', name: 'Cars', icon: '🚗' },
  { id: 'watches', name: 'Jewelry', icon: '⌚' },
  { id: 'yachts', name: 'Yachts', icon: '🛥️' },
  { id: 'aircraft', name: 'Aircraft', icon: '✈️' },
  { id: 'islands', name: 'Islands', icon: '🏝️' },
  { id: 'art', name: 'Art', icon: '🖼️' },
  { id: 'space', name: 'Space', icon: '🚀' },
];

const TROPHIES = [
  // Cars
  { id: 'hatchback', category: 'cars', name: 'Used Hatchback', icon: '🚗', price: 8000, blurb: 'Reliable. Mostly.' },
  { id: 'pickup', category: 'cars', name: 'Lifted Pickup Truck', icon: '🛻', price: 45000, blurb: 'Has never once hauled anything.' },
  { id: 'muscleCar', category: 'cars', name: 'Vintage Muscle Car', icon: '🚘', price: 120000, blurb: 'Loud enough to set off car alarms.' },
  { id: 'luxurySedan', category: 'cars', name: 'Chauffeured Luxury Sedan', icon: '🚙', price: 250000, blurb: 'You sit in the back now.' },
  { id: 'hypercar', category: 'cars', name: 'Electric Hypercar', icon: '⚡', price: 2.4e6, blurb: '0 to 60 before you finish blinking.' },
  { id: 'armoredLimo', category: 'cars', name: 'Armored Limousine', icon: '🚐', price: 5e6, blurb: 'Bulletproof, minibar included.' },
  { id: 'goldSupercar', category: 'cars', name: 'Gold-Plated Supercar', icon: '🏎️', price: 1.2e7, blurb: 'Subtlety was never the goal.' },
  { id: 'conceptCar', category: 'cars', name: 'One-of-One Concept Car', icon: '🏁', price: 4e7, blurb: 'The only one ever built. It\'s yours.' },

  // Watches & jewelry
  { id: 'diveWatch', category: 'watches', name: 'Steel Dive Watch', icon: '⌚', price: 3500, blurb: 'Water resistant to 300m. You won\'t go past 2.' },
  { id: 'cufflinks', category: 'watches', name: 'Diamond Cufflinks', icon: '💎', price: 40000, blurb: 'Your sleeves have never looked richer.' },
  { id: 'chronograph', category: 'watches', name: 'Platinum Chronograph', icon: '⏱️', price: 250000, blurb: 'Tells time. Also tells everyone else.' },
  { id: 'crown', category: 'watches', name: 'Jewel-Encrusted Crown', icon: '👑', price: 2e6, blurb: 'For no occasion in particular.' },
  { id: 'pinkDiamond', category: 'watches', name: 'Flawless Pink Diamond', icon: '💍', price: 2.5e7, blurb: 'One of a handful on Earth.' },
  { id: 'jeweledEgg', category: 'watches', name: 'Imperial Jeweled Egg', icon: '🥚', price: 6e7, blurb: 'Do not attempt to scramble.' },

  // Yachts & boats
  { id: 'dinghy', category: 'yachts', name: 'Inflatable Dinghy', icon: '🛟', price: 1200, blurb: 'Technically a boat.' },
  { id: 'speedboat', category: 'yachts', name: 'Speedboat', icon: '🚤', price: 90000, blurb: 'Wake up the whole lake.' },
  { id: 'sailingYacht', category: 'yachts', name: 'Sailing Yacht', icon: '⛵', price: 1.5e6, blurb: 'Wind-powered and smug about it.' },
  { id: 'superyacht', category: 'yachts', name: 'Superyacht', icon: '🛥️', price: 4e7, blurb: 'Comes with a crew of twenty.' },
  { id: 'gigayacht', category: 'yachts', name: 'Gigayacht with Helipad', icon: '🛳️', price: 6e8, blurb: 'Has a smaller yacht inside it.' },
  { id: 'submarine', category: 'yachts', name: 'Luxury Submarine', icon: '🐋', price: 1.2e9, blurb: 'For when the ocean surface is too crowded.' },

  // Aircraft
  { id: 'balloon', category: 'aircraft', name: 'Hot Air Balloon', icon: '🎈', price: 25000, blurb: 'Destination: wherever the wind says.' },
  { id: 'seaplane', category: 'aircraft', name: 'Seaplane', icon: '🛩️', price: 8e5, blurb: 'Lands on your lake. Or anyone\'s.' },
  { id: 'helicopter', category: 'aircraft', name: 'Private Helicopter', icon: '🚁', price: 3e6, blurb: 'Traffic is for other people.' },
  { id: 'businessJet', category: 'aircraft', name: 'Business Jet', icon: '✈️', price: 6.5e7, blurb: 'Leather seats, no boarding groups.' },
  { id: 'jumboJet', category: 'aircraft', name: 'Converted Jumbo Jet', icon: '🛫', price: 4e8, blurb: 'Has a bedroom, a gym and a ballroom.' },
  { id: 'supersonicJet', category: 'aircraft', name: 'Supersonic Private Jet', icon: '💨', price: 2.5e9, blurb: 'Lunch in Paris, dinner in Tokyo.' },

  // Islands
  { id: 'sandbar', category: 'islands', name: 'Sandbar with One Palm', icon: '🌴', price: 50000, blurb: 'Disappears at high tide.' },
  { id: 'lakeIsland', category: 'islands', name: 'Lake Island Cabin', icon: '🏞️', price: 2e6, blurb: 'Accessible only by canoe.' },
  { id: 'tropicalIsland', category: 'islands', name: 'Tropical Private Island', icon: '🏝️', price: 4.5e7, blurb: 'White sand, no neighbours.' },
  { id: 'volcanicIsland', category: 'islands', name: 'Volcanic Island', icon: '🌋', price: 8e8, blurb: 'Perfect for a secret lair.' },
  { id: 'archipelago', category: 'islands', name: 'Entire Archipelago', icon: '🗺️', price: 2e10, blurb: 'Two hundred islands, all named after you.' },
  { id: 'artificialIsland', category: 'islands', name: 'Artificial Island City', icon: '🏗️', price: 3e11, blurb: 'Shaped like your face, from orbit.' },

  // Art & collectibles
  { id: 'signedBall', category: 'art', name: 'Signed Baseball', icon: '⚾', price: 10000, blurb: 'The signature is probably real.' },
  { id: 'comicFirstEdition', category: 'art', name: 'Rare Comic First Edition', icon: '📚', price: 150000, blurb: 'Still in the plastic sleeve.' },
  { id: 'dinosaur', category: 'art', name: 'Dinosaur Skeleton', icon: '🦖', price: 1.2e7, blurb: 'Lobby decor that roars.' },
  { id: 'renaissancePainting', category: 'art', name: 'Lost Renaissance Painting', icon: '🖼️', price: 4.5e8, blurb: 'Found in an attic. Now in your hallway.' },
  { id: 'ancientStatue', category: 'art', name: 'Ancient Statue', icon: '🗿', price: 1.5e9, blurb: 'Has watched empires rise. Now watches yours.' },
  { id: 'moonRocks', category: 'art', name: 'Moon Rock Collection', icon: '🌑', price: 5e9, blurb: 'Every one hand-picked from the lunar surface.' },

  // Space
  { id: 'starName', category: 'space', name: 'Star Naming Certificate', icon: '⭐', price: 50, blurb: 'Legally meaningless. Emotionally priceless.' },
  { id: 'suborbitalFlight', category: 'space', name: 'Suborbital Joyride', icon: '🚀', price: 5e5, blurb: 'Eleven minutes of weightlessness.' },
  { id: 'spaceCapsule', category: 'space', name: 'Private Space Capsule', icon: '🛸', price: 5e8, blurb: 'Seats four. Parks in orbit.' },
  { id: 'spaceStation', category: 'space', name: 'Personal Space Station', icon: '🛰️', price: 2.5e11, blurb: 'The ultimate vacation home.' },
  { id: 'ownMoon', category: 'space', name: 'Your Own Moon', icon: '🌙', price: 2e13, blurb: 'Every tide on Earth now answers to you.' },
];

const TROPHIES_BY_ID = Object.fromEntries(TROPHIES.map(t => [t.id, t]));

let ownedTrophies = []; // trophy ids
let activeTrophyCategory = TROPHY_CATEGORIES[0].id;

function loadTrophies() {
  ownedTrophies = loadIdList('trophies', TROPHIES_BY_ID);
}

function ownsTrophy(id) {
  return ownedTrophies.includes(id);
}

function getTrophyValue() {
  return ownedTrophies.reduce((sum, id) => sum + TROPHIES_BY_ID[id].price, 0);
}

function buyTrophy(id) {
  const trophy = TROPHIES_BY_ID[id];
  if (!trophy || ownsTrophy(id)) return;
  if (cash < trophy.price) {
    toast('Not enough cash for that.', 'error');
    return;
  }
  cash = roundToHundredths(cash - trophy.price);
  ownedTrophies.push(id);
  afterTrophyChange();
  toast(`${trophy.icon} ${trophy.name} is yours.`, 'success');
}

function sellTrophy(id) {
  const trophy = TROPHIES_BY_ID[id];
  if (!trophy || !ownsTrophy(id)) return;
  const payout = roundToHundredths(trophy.price * TROPHY_RESALE);
  if (!confirm(`Sell your ${trophy.name} for ${formatMoney(payout)}? Vanity items resell for half what you paid.`)) return;
  cash = roundToHundredths(cash + payout);
  ownedTrophies = ownedTrophies.filter(t => t !== id);
  afterTrophyChange();
  toast(`${trophy.name} sold for ${formatMoney(payout)}.`, 'error');
}

function afterTrophyChange() {
  saveProgress();
  updateStats();
  renderItems();
}

function openTrophyCategory(id) {
  activeTrophyCategory = id;
  renderItems();
}

function goToProperties() {
  openTab('investments');
  openMarket('property');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Items tab: collection counters, category chips, and the shop list.
function renderItems() {
  const chips = document.getElementById('trophy-categories');
  const list = document.getElementById('trophy-list');
  if (!chips || !list) return;

  chips.innerHTML = '';
  TROPHY_CATEGORIES.forEach(category => {
    const inCategory = TROPHIES.filter(t => t.category === category.id);
    const ownedCount = inCategory.filter(t => ownsTrophy(t.id)).length;
    const chip = document.createElement('button');
    chip.className = 'category-chip' + (category.id === activeTrophyCategory ? ' active' : '');
    chip.onclick = () => openTrophyCategory(category.id);
    chip.innerHTML = `
      <span class="category-chip-icon" aria-hidden="true">${category.icon}</span>
      <span class="category-chip-name">${category.name}</span>
      <span class="category-chip-count">${ownedCount}/${inCategory.length}</span>
    `;
    chips.appendChild(chip);
  });

  list.innerHTML = '';
  TROPHIES.filter(t => t.category === activeTrophyCategory).forEach(trophy => {
    const owned = ownsTrophy(trophy.id);
    list.appendChild(buildCollectibleCard({
      icon: trophy.icon,
      name: trophy.name,
      sub: trophy.blurb,
      subClass: 'card-sub--blurb',
      price: trophy.price,
      owned,
      sellLabel: `Sell ${formatMoney(trophy.price * TROPHY_RESALE)}`,
      onClick: () => (owned ? sellTrophy(trophy.id) : buyTrophy(trophy.id)),
    }));
  });

  updateCollectionStats();
  refreshAffordability();
}

// Counters shown on the Items tab, the Property panel and the Profile.
// Cheap enough to run every second from updateStats().
function updateCollectionStats() {
  const propertyCount = ownedProperties.length;
  const trophyCount = ownedTrophies.length;
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const setWidth = (id, fraction) => {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, fraction * 100)}%`;
  };

  setText('items-property-count', propertyCount);
  setText('items-property-total', ` / ${PROPERTIES.length}`);
  setWidth('items-property-bar', propertyCount / PROPERTIES.length);
  setText('items-property-rent', `${formatMoney(getRentIncome())} / hr rent`);

  setText('items-trophy-count', trophyCount);
  setText('items-trophy-total', ` / ${TROPHIES.length}`);
  setWidth('items-trophy-bar', trophyCount / TROPHIES.length);
  setText('items-trophy-value', `Worth ${formatMoney(getTrophyValue())}`);

  setText('property-summary-count', `${propertyCount} / ${PROPERTIES.length} owned`);
  setText('property-summary-rent', `${formatMoney(getRentIncome())} / hr rent`);

  setText('properties-profile', `${propertyCount} / ${PROPERTIES.length}`);
  setText('trophies-profile', `${trophyCount} / ${TROPHIES.length}`);
}

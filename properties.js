/* ============================================================
   BUSINESS EMPIRE — properties.js
   41 one-of-a-kind properties that pay rent every hour. Pricier
   properties pay more rent, but take longer to pay themselves back
   (yield slides from 20%/hr down to ~2%/hr), so cheap properties are
   a quick early boost and the big ones are long-term plays.
   Owned properties can be sold back for PROPERTY_RESALE of their price.
   ============================================================ */

const PROPERTY_RESALE = 0.8;

const PROPERTY_TIERS = [
  { id: 'starter', name: 'Starter' },
  { id: 'neighborhood', name: 'Neighborhood' },
  { id: 'prime', name: 'Prime' },
  { id: 'landmark', name: 'Landmark' },
  { id: 'legendary', name: 'Legendary' },
];

const PROPERTIES = [
  // Starter
  { id: 'parkingSpace', tier: 'starter', name: 'Parking Space', icon: '🅿️', price: 2500, rent: 500 },
  { id: 'storageUnit', tier: 'starter', name: 'Storage Unit', icon: '📦', price: 4300, rent: 810 },
  { id: 'studioApartment', tier: 'starter', name: 'Studio Apartment', icon: '🛋️', price: 7300, rent: 1300 },
  { id: 'mobileHome', tier: 'starter', name: 'Mobile Home', icon: '🚐', price: 13000, rent: 2200 },
  { id: 'cabin', tier: 'starter', name: 'Cabin in the Woods', icon: '🛖', price: 21000, rent: 3300 },
  { id: 'suburbanHouse', tier: 'starter', name: 'Suburban House', icon: '🏡', price: 37000, rent: 5500 },
  { id: 'duplex', tier: 'starter', name: 'Duplex', icon: '🏘️', price: 63000, rent: 8900 },

  // Neighborhood
  { id: 'cornerStore', tier: 'neighborhood', name: 'Corner Store Building', icon: '🏪', price: 110000, rent: 15000 },
  { id: 'townhouse', tier: 'neighborhood', name: 'Townhouse', icon: '🏠', price: 180000, rent: 23000 },
  { id: 'laundromat', tier: 'neighborhood', name: 'Laundromat', icon: '🧺', price: 310000, rent: 37000 },
  { id: 'beachBungalow', tier: 'neighborhood', name: 'Beach Bungalow', icon: '🏖️', price: 530000, rent: 60000 },
  { id: 'apartmentBuilding', tier: 'neighborhood', name: 'Apartment Building', icon: '🏢', price: 910000, rent: 97000 },
  { id: 'stripMall', tier: 'neighborhood', name: 'Strip Mall', icon: '🛍️', price: 1.6e6, rent: 160000 },
  { id: 'farmland', tier: 'neighborhood', name: 'Farmland', icon: '🌾', price: 2.7e6, rent: 260000 },

  // Prime
  { id: 'vineyard', tier: 'prime', name: 'Vineyard', icon: '🍇', price: 4.6e6, rent: 410000 },
  { id: 'skiChalet', tier: 'prime', name: 'Ski Chalet', icon: '🏔️', price: 7.8e6, rent: 660000 },
  { id: 'officeBlock', tier: 'prime', name: 'Office Block', icon: '🏬', price: 1.3e7, rent: 1e6 },
  { id: 'penthouse', tier: 'prime', name: 'Penthouse', icon: '🌃', price: 2.3e7, rent: 1.7e6 },
  { id: 'boutiqueHotel', tier: 'prime', name: 'Boutique Hotel', icon: '🏨', price: 3.9e7, rent: 2.8e6 },
  { id: 'warehouseComplex', tier: 'prime', name: 'Warehouse Complex', icon: '🏭', price: 6.7e7, rent: 4.5e6 },
  { id: 'mansion', tier: 'prime', name: 'Mansion', icon: '🏛️', price: 1.1e8, rent: 7e6 },
  { id: 'shoppingMall', tier: 'prime', name: 'Shopping Mall', icon: '🛒', price: 2e8, rent: 1.2e7 },

  // Landmark
  { id: 'marina', tier: 'landmark', name: 'Marina', icon: '⚓', price: 3.3e8, rent: 1.9e7 },
  { id: 'golfResort', tier: 'landmark', name: 'Golf Resort', icon: '⛳', price: 5.7e8, rent: 3e7 },
  { id: 'skyscraper', tier: 'landmark', name: 'Skyscraper', icon: '🏙️', price: 9.8e8, rent: 4.9e7 },
  { id: 'casino', tier: 'landmark', name: 'Casino', icon: '🎰', price: 1.7e9, rent: 8.1e7 },
  { id: 'stadium', tier: 'landmark', name: 'Sports Stadium', icon: '🏟️', price: 2.9e9, rent: 1.3e8 },
  { id: 'themePark', tier: 'landmark', name: 'Theme Park', icon: '🎢', price: 4.9e9, rent: 2.1e8 },
  { id: 'castle', tier: 'landmark', name: 'Medieval Castle', icon: '🏰', price: 8.4e9, rent: 3.4e8 },
  { id: 'privateAirport', tier: 'landmark', name: 'Private Airport', icon: '🛫', price: 1.4e10, rent: 5.3e8 },
  { id: 'cruisePort', tier: 'landmark', name: 'Cruise Port', icon: '🚢', price: 2.4e10, rent: 8.5e8 },

  // Legendary
  { id: 'downtownDistrict', tier: 'legendary', name: 'Downtown District', icon: '🌆', price: 4.2e10, rent: 1.4e9 },
  { id: 'skiMountain', tier: 'legendary', name: 'Ski Mountain', icon: '🎿', price: 7.1e10, rent: 2.3e9 },
  { id: 'rainforestReserve', tier: 'legendary', name: 'Rainforest Reserve', icon: '🌳', price: 1.2e11, rent: 3.6e9 },
  { id: 'resortTown', tier: 'legendary', name: 'Coastal Resort Town', icon: '🌅', price: 2.1e11, rent: 5.9e9 },
  { id: 'megaCityBlock', tier: 'legendary', name: 'Mega City Block', icon: '🌇', price: 3.6e11, rent: 9.6e9 },
  { id: 'underwaterHotel', tier: 'legendary', name: 'Underwater Hotel', icon: '🐠', price: 6.1e11, rent: 1.5e10 },
  { id: 'spaceHotel', tier: 'legendary', name: 'Orbital Space Hotel', icon: '🛰️', price: 1e12, rent: 2.4e10 },
  { id: 'lunarBase', tier: 'legendary', name: 'Lunar Base', icon: '🌕', price: 1.8e12, rent: 4e10 },
  { id: 'marsDome', tier: 'legendary', name: 'Mars Dome City', icon: '🔴', price: 3.1e12, rent: 6.6e10 },
  { id: 'asteroidClaim', tier: 'legendary', name: 'Asteroid Belt Claim', icon: '☄️', price: 5.2e12, rent: 1e11 },
];

const PROPERTIES_BY_ID = Object.fromEntries(PROPERTIES.map(p => [p.id, p]));

let ownedProperties = []; // property ids

function loadProperties() {
  ownedProperties = loadIdList('properties', PROPERTIES_BY_ID);
}

function ownsProperty(id) {
  return ownedProperties.includes(id);
}

function getRentIncome() {
  return ownedProperties.reduce((sum, id) => sum + PROPERTIES_BY_ID[id].rent, 0);
}

function getPropertyValue() {
  return ownedProperties.reduce((sum, id) => sum + PROPERTIES_BY_ID[id].price, 0);
}

function buyProperty(id) {
  const property = PROPERTIES_BY_ID[id];
  if (!property || ownsProperty(id)) return;
  if (cash < property.price) {
    toast('Not enough cash for that.', 'error');
    return;
  }
  if (!confirmSpend(property.price, cash, `${formatMoney(property.price)} on the ${property.name}`)) return;
  cash = roundToHundredths(cash - property.price);
  ownedProperties.push(id);
  afterPropertyChange();
  toast(`${property.icon} ${property.name} acquired. +${formatMoney(property.rent)} / hr rent.`, 'success');
}

function sellProperty(id) {
  const property = PROPERTIES_BY_ID[id];
  if (!property || !ownsProperty(id)) return;
  const payout = roundToHundredths(property.price * PROPERTY_RESALE);
  if (!confirm(`Sell your ${property.name} for ${formatMoney(payout)}? You'll lose its ${formatMoney(property.rent)} / hr rent.`)) return;
  cash = roundToHundredths(cash + payout);
  ownedProperties = ownedProperties.filter(p => p !== id);
  afterPropertyChange();
  toast(`${property.name} sold for ${formatMoney(payout)}.`, 'error');
}

function afterPropertyChange() {
  recalcHourlyIncome();
  saveProgress();
  updateStats();
  renderProperties();
  renderItems();
}

function renderProperties() {
  const list = document.getElementById('property-list');
  if (!list) return;
  list.innerHTML = '';

  PROPERTY_TIERS.forEach(tier => {
    const heading = document.createElement('p');
    heading.className = 'list-heading';
    heading.textContent = tier.name;
    list.appendChild(heading);

    PROPERTIES.filter(p => p.tier === tier.id).forEach(property => {
      const owned = ownsProperty(property.id);
      list.appendChild(buildCollectibleCard({
        icon: property.icon,
        name: property.name,
        sub: `${formatMoney(property.rent)} / hr rent`,
        price: property.price,
        owned,
        sellLabel: `Sell ${formatMoney(property.price * PROPERTY_RESALE)}`,
        onClick: () => (owned ? sellProperty(property.id) : buyProperty(property.id)),
      }));
    });
  });
  refreshAffordability();
}

/* ---------------- legacy save migration ---------------- */

// Before properties, the Investing tab had two repeatable passive items:
// "Stock Portfolio" ($2,000 base) and "Real Estate" ($8,000 base), each
// costing 1.15× more per purchase. Refund everything ever spent on them.
const LEGACY_INVESTMENTS = {
  stock: { baseCost: 2000, costMultiplier: 1.15 },
  realEstate: { baseCost: 8000, costMultiplier: 1.15 },
};

function migrateLegacyInvestments() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('investments'));
  } catch (e) {
    saved = null;
  }
  localStorage.removeItem('investments');
  if (!saved || typeof saved !== 'object') return 0;

  let refund = 0;
  Object.entries(LEGACY_INVESTMENTS).forEach(([type, { baseCost, costMultiplier }]) => {
    const owned = saved[type] && saved[type].owned;
    if (owned > 0) refund += (baseCost * (Math.pow(costMultiplier, owned) - 1)) / (costMultiplier - 1);
  });
  return roundToHundredths(refund);
}

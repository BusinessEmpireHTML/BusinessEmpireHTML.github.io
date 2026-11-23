/* ============================================================
   BUSINESS EMPIRE — achievements.js
   Lifetime stats (counters the rest of the game reports into) and
   the achievements built on top of them.
   ============================================================ */

/* ---------------- lifetime stats ---------------- */

const DEFAULT_STATS = {
  merges: 0,
  trades: 0,
  exchanges: 0,
  goldenCoins: 0,
  managers: 0,
  diamondHands: 0, // crypto held through a bad headline
};

let stats = { ...DEFAULT_STATS };

function loadStats() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('stats'));
  } catch (e) {
    saved = null;
  }
  stats = { ...DEFAULT_STATS };
  if (saved && typeof saved === 'object') {
    Object.keys(DEFAULT_STATS).forEach(key => {
      if (isFinite(saved[key])) stats[key] = saved[key];
    });
  }
}

function saveStats() {
  localStorage.setItem('stats', JSON.stringify(stats));
}

function recordStat(key, amount = 1) {
  if (!(key in stats)) return;
  stats[key] += amount;
}

/* ---------------- achievements ----------------
   Listed in rough progression order: the first one you haven't earned
   is shown as the "next goal" on the Clicker tab. Each is worth a
   permanent +2% on all income (Earth, rent and Mars). */

const ACHIEVEMENT_BONUS = 0.02;

const totalTaps = () => clicks + mars.clicks;
const allBusinesses = () => businesses.concat(mars.businesses);

const ACHIEVEMENTS = [
  { id: 'firstTap', icon: '👆', name: 'First Hustle', desc: 'Tap the coin.', check: () => totalTaps() >= 1 },
  { id: 'firstBusiness', icon: '🍋', name: 'Open for Business', desc: 'Buy your first business.', check: () => allBusinesses().length >= 1 },
  { id: 'netWorth10K', icon: '💵', name: 'Pocket Money', desc: 'Reach a net worth of $10K.', check: () => getNetWorth() >= 1e4 },
  { id: 'taps500', icon: '🖐️', name: 'Tireless', desc: 'Tap 500 times.', check: () => totalTaps() >= 500 },
  { id: 'firstResearch', icon: '🔬', name: 'Eureka', desc: 'Buy your first research.', check: () => ownedResearch.length >= 1 },
  { id: 'firstProperty', icon: '🏠', name: 'Landlord', desc: 'Buy your first property.', check: () => ownedProperties.length >= 1 },
  { id: 'firstTrade', icon: '📈', name: 'Day Trader', desc: 'Make a stock or crypto trade.', check: () => stats.trades >= 1 },
  { id: 'maxLevel', icon: '⭐', name: 'Maxed Out', desc: 'Get a business to max level.', check: () => allBusinesses().some(b => !b.merged && b.maxLevel > 1 && b.level >= b.maxLevel) },
  { id: 'goldenCoin', icon: '✨', name: 'Struck Gold', desc: 'Catch a golden coin.', check: () => stats.goldenCoins >= 1 },
  { id: 'netWorth1M', icon: '💰', name: 'Millionaire', desc: 'Reach a net worth of $1M.', check: () => getNetWorth() >= 1e6 },
  { id: 'firstTrophy', icon: '🏆', name: 'Treat Yourself', desc: 'Buy your first trophy.', check: () => ownedTrophies.length >= 1 },
  { id: 'firstManager', icon: '👔', name: 'Delegator', desc: 'Hire a manager.', check: () => stats.managers >= 1 || allBusinesses().some(b => b.manager) },
  { id: 'firstMerge', icon: '🔗', name: 'Merger Mania', desc: 'Merge two businesses.', check: () => stats.merges >= 1 || allBusinesses().some(b => b.merged) },
  { id: 'bankOwner', icon: '🏦', name: 'Too Big to Fail', desc: 'Own the Bank.', check: () => businesses.some(b => b.type === 'bank') },
  { id: 'income1M', icon: '⏱️', name: 'Money Machine', desc: 'Earn $1M per hour on Earth.', check: () => hourlyIncome >= 1e6 },
  { id: 'diamondHands', icon: '💎', name: 'Diamond Hands', desc: 'Hold a coin through a crypto crash headline.', check: () => stats.diamondHands >= 1 },
  { id: 'properties10', icon: '🏘️', name: 'Property Baron', desc: 'Own 10 properties.', check: () => ownedProperties.length >= 10 },
  { id: 'netWorth1B', icon: '🤑', name: 'Billionaire', desc: 'Reach a net worth of $1B.', check: () => getNetWorth() >= 1e9 },
  { id: 'taps5000', icon: '💪', name: 'Iron Finger', desc: 'Tap 5,000 times.', check: () => totalTaps() >= 5000 },
  { id: 'trophies10', icon: '🖼️', name: 'Collector', desc: 'Own 10 trophies.', check: () => ownedTrophies.length >= 10 },
  { id: 'goldenCoins25', icon: '🌟', name: 'Golden Touch', desc: 'Catch 25 golden coins.', check: () => stats.goldenCoins >= 25 },
  { id: 'merges10', icon: '🧩', name: 'Conglomerate', desc: 'Complete 10 merges.', check: () => stats.merges >= 10 },
  { id: 'research10', icon: '🧠', name: 'Think Tank', desc: 'Own 10 research upgrades.', check: () => ownedResearch.length >= 10 },
  { id: 'income1B', icon: '⚙️', name: 'Unstoppable', desc: 'Earn $1B per hour on Earth.', check: () => hourlyIncome >= 1e9 },
  { id: 'netWorth1T', icon: '👑', name: 'Trillionaire', desc: 'Reach a net worth of $1T.', check: () => getNetWorth() >= 1e12 },
  { id: 'marsLanding', icon: '🔴', name: 'One Small Step', desc: 'Launch a colony on Mars.', check: () => mars.unlocked },
  { id: 'firstExchange', icon: '💱', name: 'Interplanetary Banker', desc: 'Move money between planets.', check: () => stats.exchanges >= 1 },
  { id: 'marsBusiness', icon: '🫧', name: 'Colonist', desc: 'Buy a business on Mars.', check: () => mars.businesses.length >= 1 },
  { id: 'terraform1', icon: '🌫️', name: 'Terraformer', desc: 'Complete a terraforming stage.', check: () => terraformStage() >= 1 },
  { id: 'allProperties', icon: '🌆', name: 'Own the World', desc: 'Own all 41 properties.', check: () => ownedProperties.length >= PROPERTIES.length },
  { id: 'ownMoon', icon: '🌙', name: 'Moon Shot', desc: 'Buy Your Own Moon.', check: () => ownsTrophy('ownMoon') },
  { id: 'allResearch', icon: '🎓', name: 'Omniscient', desc: 'Complete every research upgrade.', check: () => ownedResearch.length >= RESEARCH.length },
  { id: 'terraformDone', icon: '🌍', name: 'Second Earth', desc: 'Fully terraform Mars.', check: () => terraformStage() >= TERRAFORM_STAGES.length },
  { id: 'netWorth1Qa', icon: '🌌', name: 'Quadrillionaire', desc: 'Reach a net worth of $1Qa.', check: () => getNetWorth() >= 1e15 },
  { id: 'allTrophies', icon: '🏛️', name: 'The Collection', desc: 'Own every trophy.', check: () => ownedTrophies.length >= TROPHIES.length },
];

const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

let ownedAchievements = [];

function loadAchievements() {
  ownedAchievements = loadIdList('achievements', ACHIEVEMENTS_BY_ID);
}

function saveAchievements() {
  localStorage.setItem('achievements', JSON.stringify(ownedAchievements));
}

function hasAchievement(id) {
  return ownedAchievements.includes(id);
}

function achievementMultiplier() {
  return 1 + ACHIEVEMENT_BONUS * ownedAchievements.length;
}

// Runs every second. With `silent`, anything already earned (old saves,
// imports) is unlocked quietly and summed up in one message instead of
// a fanfare per achievement.
function checkAchievements(silent) {
  const newlyEarned = ACHIEVEMENTS.filter(a => !hasAchievement(a.id) && a.check());
  if (newlyEarned.length > 0) {
    newlyEarned.forEach(a => ownedAchievements.push(a.id));
    saveAchievements();
    recalcHourlyIncome();
    if (silent) {
      toast(`🏆 You've already earned ${newlyEarned.length} achievement${newlyEarned.length === 1 ? '' : 's'}: +${Math.round(newlyEarned.length * ACHIEVEMENT_BONUS * 100)}% income. See them in Profile.`, 'achievement', null);
    } else {
      newlyEarned.forEach(a => toast(`🏆 ${a.name}: ${a.desc} (+${ACHIEVEMENT_BONUS * 100}% income)`, 'achievement'));
    }
    renderAchievements();
  }
  renderNextGoal();
}

function renderNextGoal() {
  const el = document.getElementById('next-goal');
  if (!el) return;
  const next = ACHIEVEMENTS.find(a => !hasAchievement(a.id));
  setText('next-goal', next
    ? `🎯 Next goal: ${next.name}. ${next.desc} (+${ACHIEVEMENT_BONUS * 100}% income)`
    : '🏆 Every achievement earned. Legendary.');
}

function renderAchievements() {
  const grid = document.getElementById('achievement-grid');
  if (!grid) return;
  setText('achievement-meta', `${ownedAchievements.length} / ${ACHIEVEMENTS.length} earned · all income +${Math.round((achievementMultiplier() - 1) * 100)}%`);
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const earned = hasAchievement(a.id);
    const tile = document.createElement('div');
    tile.className = 'achievement' + (earned ? ' earned' : '');
    tile.innerHTML = '<span class="achievement-icon" aria-hidden="true"></span><span class="achievement-text"><strong></strong><small></small></span>';
    tile.querySelector('.achievement-icon').textContent = earned ? a.icon : '🔒';
    tile.querySelector('strong').textContent = a.name;
    tile.querySelector('small').textContent = a.desc;
    tile.title = earned ? `Earned: ${a.name}` : `Locked: ${a.desc}`;
    grid.appendChild(tile);
  });
}

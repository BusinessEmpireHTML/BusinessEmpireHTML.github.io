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

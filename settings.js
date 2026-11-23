/* ============================================================
   BUSINESS EMPIRE — settings.js
   Player preferences (kept across Reset Game), synthesized sound
   effects, haptics, number notation and the optional "confirm big
   purchases" guard.
   ============================================================ */

const DEFAULT_SETTINGS = {
  sound: true,
  vibration: true,
  notation: 'short', // 'short' = $1.23T, 'scientific' = $1.23e12
  confirmBig: false,
};

let settings = loadSettings();

function loadSettings() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('settings'));
  } catch (e) {
    saved = null;
  }
  return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
}

function saveSettings() {
  localStorage.setItem('settings', JSON.stringify(settings));
}

function setSetting(key, value) {
  settings[key] = value;
  saveSettings();
  renderSettings();
  if (key === 'notation') {
    // Every price on screen changes format, so redraw the lists.
    renderBusinesses();
    renderProperties();
    renderItems();
    updateMarketRows();
    updatePortfolioSummary();
  }
  updateStats();
  if (key === 'sound' && value) playSound('buy');
  if (key === 'vibration' && value) vibrate(20);
}

function renderSettings() {
  const sound = document.getElementById('setting-sound');
  if (!sound) return;
  sound.checked = settings.sound;
  document.getElementById('setting-vibration').checked = settings.vibration;
  document.getElementById('setting-confirm').checked = settings.confirmBig;
  document.getElementById('setting-notation').value = settings.notation;
}

/* ---------------- confirm big purchases ---------------- */

// When the setting is on, ask before spending at least half of a balance.
function confirmSpend(amount, funds, description) {
  if (!settings.confirmBig || funds <= 0 || amount < funds * 0.5) return true;
  const share = Math.min(100, Math.round((amount / funds) * 100));
  return confirm(`Spend ${description}? That's ${share}% of your balance.`);
}

/* ---------------- haptics ---------------- */

// Android browsers support this; iPhones ignore it.
function vibrate(ms) {
  if (settings.vibration && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      /* some browsers throw when called too often */
    }
  }
}

/* ---------------- sound effects ----------------
   Synthesized with the Web Audio API, so there are no files to load.
   Browsers only allow audio after the player has interacted with the
   page, so nothing plays (or is created) before the first tap. */

let audioCtx = null;
let userHasInteracted = false;
let lastCoinSound = 0;

['pointerdown', 'keydown'].forEach(type =>
  window.addEventListener(type, () => { userHasInteracted = true; }, { capture: true, passive: true })
);

function getAudio() {
  if (!userHasInteracted) return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Each sound is a list of notes: frequency (and optional glide target),
// waveform, start offset and length in seconds, and volume.
const SOUNDS = {
  coin: () => {
    const f = 1250 + Math.random() * 180;
    return [{ freq: f, to: f * 1.35, type: 'triangle', at: 0, len: 0.07, vol: 0.09 }];
  },
  buy: () => [
    { freq: 660, type: 'sine', at: 0, len: 0.09, vol: 0.1 },
    { freq: 990, type: 'sine', at: 0.08, len: 0.14, vol: 0.1 },
  ],
  error: () => [{ freq: 190, to: 150, type: 'square', at: 0, len: 0.14, vol: 0.05 }],
  achievement: () => [523, 659, 784, 1047].map((freq, i) => ({ freq, type: 'triangle', at: i * 0.09, len: 0.22, vol: 0.1 })),
  golden: () => [1568, 1976, 2349, 3136].map((freq, i) => ({ freq, type: 'sine', at: i * 0.05, len: 0.25, vol: 0.07 })),
  launch: () => [{ freq: 110, to: 880, type: 'sawtooth', at: 0, len: 0.6, vol: 0.05 }],
};

function playSound(name) {
  if (!settings.sound || !SOUNDS[name]) return;
  if (name === 'coin') {
    const now = performance.now();
    if (now - lastCoinSound < 35) return; // rapid tapping shouldn't turn into a buzz
    lastCoinSound = now;
  }
  const ctx = getAudio();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  SOUNDS[name]().forEach(note => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.freq, t0 + note.at);
    if (note.to) osc.frequency.exponentialRampToValueAtTime(note.to, t0 + note.at + note.len);
    gain.gain.setValueAtTime(0.0001, t0 + note.at);
    gain.gain.exponentialRampToValueAtTime(note.vol, t0 + note.at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.at + note.len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + note.at);
    osc.stop(t0 + note.at + note.len + 0.02);
  });
}

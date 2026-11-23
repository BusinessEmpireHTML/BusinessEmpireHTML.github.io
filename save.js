/* ============================================================
   BUSINESS EMPIRE — save.js
   Save backup (export / import a save code) and the installable
   app: service worker registration and the "Install app" button.
   ============================================================ */

const SAVE_CODE_PREFIX = 'BE1:';

/* ---------------- export ---------------- */

// Packs every saved key into one copy-pasteable string. Unicode-safe
// (₥ and emoji survive), and versioned so the format can change later.
function buildSaveCode() {
  saveProgress();
  saveMarkets();
  const data = {};
  SAVE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  const json = JSON.stringify({ v: 1, savedAt: new Date().toISOString(), data });
  return SAVE_CODE_PREFIX + btoa(unescape(encodeURIComponent(json)));
}

function openExportPopup() {
  const box = document.getElementById('export-code');
  box.value = buildSaveCode();
  showPopup('export-popup');
  box.focus();
  box.select();
}

function closeExportPopup() {
  hidePopup('export-popup');
}

function copySaveCode() {
  const box = document.getElementById('export-code');
  const done = () => toast('Save code copied. Paste it somewhere safe.', 'success');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(box.value).then(done).catch(() => fallbackCopy(box, done));
  } else {
    fallbackCopy(box, done);
  }
}

function fallbackCopy(box, done) {
  box.focus();
  box.select();
  try {
    if (document.execCommand('copy')) {
      done();
      return;
    }
  } catch (e) {
    /* fall through */
  }
  toast('Couldn\'t copy automatically. Select the code and copy it by hand.', 'error');
}

function downloadSaveFile() {
  const code = document.getElementById('export-code').value;
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `business-empire-save-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  toast('Save file downloaded.', 'success');
}

/* ---------------- import ---------------- */

function parseSaveCode(raw) {
  const code = (raw || '').trim().replace(/\s+/g, '');
  if (!code.startsWith(SAVE_CODE_PREFIX)) {
    throw new Error('That doesn\'t look like a Business Empire save code. It should start with "BE1:".');
  }
  let parsed;
  try {
    parsed = JSON.parse(decodeURIComponent(escape(atob(code.slice(SAVE_CODE_PREFIX.length)))));
  } catch (e) {
    throw new Error('That save code is damaged or incomplete. Make sure you copied all of it.');
  }
  if (!parsed || parsed.v !== 1 || !parsed.data || typeof parsed.data !== 'object' || !('cash' in parsed.data)) {
    throw new Error('That save code is from an unknown version or is missing data.');
  }
  // Keep only keys this game knows about, and only plain strings.
  const data = {};
  SAVE_KEYS.forEach(key => {
    if (typeof parsed.data[key] === 'string') data[key] = parsed.data[key];
  });
  return { savedAt: parsed.savedAt, data };
}

function openImportPopup() {
  document.getElementById('import-code').value = '';
  document.getElementById('import-error').textContent = '';
  showPopup('import-popup');
}

function closeImportPopup() {
  hidePopup('import-popup');
}

function loadSaveFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('import-code').value = String(reader.result || '');
    document.getElementById('import-error').textContent = '';
  };
  reader.readAsText(file);
  input.value = '';
}

function importSave() {
  const errorEl = document.getElementById('import-error');
  let save;
  try {
    save = parseSaveCode(document.getElementById('import-code').value);
  } catch (e) {
    errorEl.textContent = e.message;
    playSound('error');
    return;
  }
  const when = save.savedAt ? new Date(save.savedAt).toLocaleString() : 'an unknown date';
  if (!confirm(`Replace your current empire with the save from ${when}? Your current progress will be overwritten.`)) return;

  isResetting = true; // stop the game loop from saving over the import
  SAVE_KEYS.forEach(key => localStorage.removeItem(key));
  Object.entries(save.data).forEach(([key, value]) => localStorage.setItem(key, value));
  location.reload();
}

/* ---------------- installable app ---------------- */

let deferredInstallPrompt = null;

// Android/desktop Chrome hand us an install prompt we can trigger from a button.
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  renderInstallOptions();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  renderInstallOptions();
  toast('Business Empire installed! Open it from your home screen.', 'success');
});

function isRunningAsApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function renderInstallOptions() {
  const button = document.getElementById('install-button');
  const hint = document.getElementById('install-hint');
  if (!button || !hint) return;
  if (isRunningAsApp()) {
    button.hidden = true;
    hint.textContent = '✅ You\'re playing the installed app.';
  } else if (deferredInstallPrompt) {
    button.hidden = false;
    hint.textContent = 'Adds Business Empire to your home screen. It opens full-screen and works offline.';
  } else if (isIOS()) {
    button.hidden = true;
    hint.textContent = 'On iPhone: tap the Share button in Safari, then "Add to Home Screen". It opens full-screen and works offline.';
  } else {
    button.hidden = true;
    hint.textContent = 'Use your browser menu\'s "Install app" or "Add to Home screen" option to add it to your home screen.';
  }
}

function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => {
    deferredInstallPrompt = null;
    renderInstallOptions();
  });
}

// The service worker makes the game load offline. It needs https (or
// localhost), so it's skipped when the file is opened straight from disk.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* offline support is a bonus; the game works without it */
    });
  });
}

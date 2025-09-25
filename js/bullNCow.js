//--------------------------------DEV-MODE---------------------------
let testmode = false;
//--------------------------------DEV-MODE---------------------------

let gameIsRunning = false;
let secretCodeArray = [];
let userTries = 0;
let pastTries = [];
let highScores = [];

// ---------- DOM cache, html variables ----------

// shortcut for all the document.querySelectior() to bnc."classname" .

const bnc = {
  zone: document.querySelector('.gamezone'),
  mainText: document.querySelector('.mainText'),
  startButton: document.getElementById('startButton'),
  guessInput: document.querySelector('.submitedNumber'),
  guessBtn: document.getElementById('guessBtn'),
  surrenderBtn: document.getElementById('surrenderBtn'),
  attemptCount: document.getElementById('attemptCount'),
  pastList: document.getElementById('pastList'),
  recentGuess: document.getElementById('recentGuess'),
  bullsCount: document.getElementById('bullsCount'),
  cowsCount: document.getElementById('cowsCount'),
  highScores: document.getElementById('highScores'),
};

// ---------- SweetAlert----------
function setStatus(msg, type = "info") {
  Swal.fire({
    text: msg,
    icon: type,
    toast: true,
    position: 'top',
    timer: 2000,
    showConfirmButton: false
  });
}

// ---------- Rendering ----------
function renderAttempts() { if (bnc.attemptCount) bnc.attemptCount.textContent = String(userTries); }

function renderPast() {
  if (!bnc.pastList) return;

  bnc.pastList.innerHTML = '';

  pastTries.slice().reverse().forEach(({ guess, bulls, cows }) => {

    const li = document.createElement('li');

    li.textContent = `${guess} → Bulls ${bulls} | Cows ${cows}`;

    bnc.pastList.appendChild(li);

  });
}

function renderRecent(guess) { if (bnc.recentGuess) bnc.recentGuess.textContent = guess ?? '—'; }

function renderBC(b, c) {

  if (bnc.bullsCount) bnc.bullsCount.textContent = String(b);

  if (bnc.cowsCount) bnc.cowsCount.textContent = String(c);
}
function renderHighScores() {

  if (!bnc.highScores) return;

  bnc.highScores.innerHTML = '';

  highScores.forEach(s => {

    const li = document.createElement('li');

    li.textContent = `${s.name} — ${s.tries} tries (${s.date})`;

    bnc.highScores.appendChild(li);

  });
}

function enableInput(enabled) {

  if (bnc.guessInput) bnc.guessInput.disabled = !enabled;

  if (bnc.guessBtn) bnc.guessBtn.disabled = !enabled;

  if (enabled && bnc.guessInput) bnc.guessInput.focus();

}

// ---------- display:none hide/show zone ----------

function showZone() {

  if (bnc.zone) bnc.zone.style.display = 'block';

  if (bnc.mainText) bnc.mainText.classList.add('hidden');
}
function hideZone() {

  if (bnc.zone) bnc.zone.style.display = 'none';

  if (bnc.mainText) bnc.mainText.classList.remove('hidden');
}

// ---------- game  generate code ----------
function generateSecretCode() {

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const code = [];

  for (let i = 0; i < 4; i++) {

    const idx = Math.floor(Math.random() * digits.length);

    code.push(digits[idx]);

    digits.splice(idx, 1);
  }
  return code;
}

//--------------game Reset---------------- 
function resetHUD() {
  userTries = 0;

  pastTries = [];

  renderAttempts();

  renderPast();

  renderRecent('—');

  renderBC(0, 0);

  if (bnc.guessInput) bnc.guessInput.value = '';
}
//------------------- Start game
function startGame() {

  secretCodeArray = generateSecretCode();

  gameIsRunning = true;

  showZone();

  resetHUD();

  enableInput(true);

  if (testmode) setStatus(`(DEV) Secret: ${secretCodeArray.join('')}`, "warning");
}

function surrenderGame(silent = false) {
  if (!gameIsRunning) { hideZone(); return; }

  gameIsRunning = false;

  enableInput(false);

  if (!silent) setStatus('You surrendered.', "error");

  hideZone();
}

function validateGuess(s) {

  if (!s) return { ok: false, reason: 'empty' };

  s = s.trim();

  if (s.toLowerCase() === 'sv_cheats') {

    setStatus(`Secret: ${secretCodeArray.join('')}`, "info");

    renderRecent('sv_cheats');

    return { ok: false, reason: 'cheat' };
  }
  if (!/^\d{4}$/.test(s)) return { ok: false, reason: 'format' };

  if (new Set(s).size !== 4) return { ok: false, reason: 'unique' };

  return { ok: true, value: s };
}

function checkGuess(userString) {

  const userArray = userString.split('').map(Number);

  let bulls = 0, cows = 0;

  userArray.forEach((digit, idx) => {

    if (digit === secretCodeArray[idx]) bulls++;

    else if (secretCodeArray.includes(digit)) cows++;
  });

  return { bulls, cows, win: bulls === 4 };
}

// ---------- High scores ----------
const highScoreKey = 'bcn_highscores_v1';

async function loadHighScores() {

  try {
    const cached = JSON.parse(localStorage.getItem(highScoreKey));

    if (Array.isArray(cached)) return cached;

  } catch { }

  try {
    const res = await fetch('./json/highScores.json', { cache: 'no-store' });

    const json = await res.json();

    const scores = Array.isArray(json.scores) ? json.scores : [];

    localStorage.setItem(highScoreKey, JSON.stringify(scores));

    return scores;

  } catch {
    const empty = [];

    localStorage.setItem(highScoreKey, JSON.stringify(empty));

    return empty;
  }
}
function saveHighScores(scores) {
  localStorage.setItem(highScoreKey, JSON.stringify(scores));
}

function addHighScore(name, tries) {
  const entry = {
    name: (name && name.trim()) ? name.trim() : 'Player',
    tries,
    date: new Date().toISOString().slice(0, 10)
  };
  highScores.push(entry);

  highScores.sort((a, b) => a.tries - b.tries || (a.date < b.date ? 1 : -1));

  highScores = highScores.slice(0, 5);

  saveHighScores(highScores);

  renderHighScores();
}





// ---------- Submit button + Resolutions ----------
function submitGuess() {

  if (!gameIsRunning) { setStatus('Click Start first.', "warning"); return; }

  const raw = bnc.guessInput ? bnc.guessInput.value : '';

  const val = validateGuess(raw);

  if (!val.ok) {

    if (val.reason === 'format') setStatus('Enter exactly 4 digits.', "error");

    else if (val.reason === 'unique') setStatus('Digits must be unique.', "error");

    else if (val.reason === 'empty') setStatus('Type a guess first.', "warning");

    return;
  }

  const guess = val.value;

  const { bulls, cows, win } = checkGuess(guess);

  userTries++;

  renderAttempts();

  renderRecent(guess);

  renderBC(bulls, cows);

  pastTries.push({ guess, bulls, cows });

  renderPast();

  if (win) {
    gameIsRunning = false;
    enableInput(false);

    Swal.fire({
      icon: 'success',
      title: 'Victory!',
      html: `You guessed <b>${secretCodeArray.join('')}</b> in <b>${userTries}</b> tries.`,
      input: 'text',
      inputLabel: 'Your name for the High Score',
      inputPlaceholder: 'Player',
      inputAttributes: { maxlength: 5, autocapitalize: 'words', autocorrect: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Save & Exit',
      cancelButtonText: 'Skip & Exit',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then(({ isConfirmed, value }) => {

      const playerName = (value && value.trim()) ? value.trim() : 'Player';

      if (isConfirmed) addHighScore(playerName, userTries);

      surrenderGame(true);
    });

    return;
  } else {

    setStatus('Try again.', "info");
  }

  if (bnc.guessInput) {

    bnc.guessInput.value = '';

    bnc.guessInput.focus();
  }
}

// ---------- event listeners of buttons ----------

bnc.startButton?.addEventListener('click', startGame);

bnc.guessBtn?.addEventListener('click', submitGuess);

bnc.surrenderBtn?.addEventListener('click', surrenderGame);

bnc.guessInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitGuess(); });

// ---------- Bios ----------

(async function init() {

  highScores = await loadHighScores();

  renderHighScores();

  enableInput(false);

  hideZone();

})();

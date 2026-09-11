/* Fun Zone — shared utilities */

/* ---- Navigation ---- */
function goHome() {
  // Works from /games/*.html back to /index.html
  window.location.href = '../index.html';
}

/* ---- Confetti (lightweight, no library) ---- */
const CONFETTI_COLORS = [
  '#F43F8A', '#A855F7', '#6EE7B7', '#FDE047', '#FB923C', '#38BDF8', '#FBCFE8'
];

function fireConfetti(count = 80) {
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.background = color;
    piece.style.left = (Math.random() * w) + 'px';
    const fall = 1200 + Math.random() * 1800;
    const drift = (Math.random() - 0.5) * 240;
    const rot = (Math.random() * 720 - 360);
    piece.style.transform = 'translate(0,0) rotate(0deg)';
    piece.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${rot}deg)`, opacity: 0.9 }
      ],
      { duration: fall, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' }
    );
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), fall + 50);
  }
}

/* ---- Pass-the-phone overlay ---- */
function showPassOverlay(playerLabel, onContinue) {
  let overlay = document.querySelector('.pass-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'pass-overlay';
    overlay.innerHTML = `
      <div class="pass-emoji">📱</div>
      <h2 class="pass-text"></h2>
      <p>Hand the phone over</p>
      <div class="tap-hint">Tap anywhere when ready</div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.querySelector('.pass-text').textContent = `Pass to ${playerLabel}`;
  overlay.classList.remove('hidden');
  const handler = () => {
    overlay.classList.add('hidden');
    overlay.removeEventListener('click', handler);
    if (typeof onContinue === 'function') onContinue();
  };
  overlay.addEventListener('click', handler);
}

/* ---- Choice chip helper ----
   Wires up a .choice-row of .chip buttons so only one is .selected.
   Sets the chosen value as data-value on the row.
*/
function wireChoiceRow(rowEl, defaultValue) {
  const chips = rowEl.querySelectorAll('.chip');
  const select = (val) => {
    chips.forEach(c => c.classList.toggle('selected', c.dataset.value === val));
    rowEl.dataset.value = val;
  };
  chips.forEach(chip => {
    chip.addEventListener('click', () => select(chip.dataset.value));
  });
  if (defaultValue) select(defaultValue);
}

/* ---- Game music ---- */
const FunZoneMusic = (() => {
  const STORAGE_THEME = 'funZoneMusicTheme';
  const STORAGE_MUTED = 'funZoneMusicMuted';
  const STORAGE_VOLUME = 'funZoneMasterVolume';
  const BASE_GAIN = 0.52;
  const THEMES = [
    { id: 'fun-zone-default', group: 'Game originals', name: 'Fun Zone Default', icon: '★', tempo: 290, wave: 'triangle', groove: 'playful', notes: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 659.25, 587.33, 523.25, 659.25, 783.99, 880, 783.99, 659.25], bass: [130.81, 0, 196, 0, 146.83, 0, 220, 0, 164.81, 0, 130.81, 0, 196, 0, 164.81, 0] },
    { id: 'snakes-ladders-original', group: 'Game originals', name: 'Snakes & Ladders', icon: '🎲', tempo: 235, wave: 'triangle', notes: [523,659,784,659, 587,659,523,0, 440,523,659,523, 587,392,440,0, 523,659,784,880, 784,659,587,0, 659,523,587,494, 523,0,392,0], bass: [131,0,0,0, 147,0,0,0, 110,0,0,0, 98,0,0,0, 131,0,0,0, 147,0,0,0, 165,0,0,0, 131,0,0,0] },
    { id: 'chowka-bara-original', group: 'Game originals', name: 'Chowka Bara', icon: '🪷', tempo: 215, wave: 'triangle', groove: 'kaherwa', notes: [783.99,0,880,783.99, 698.46,659.25,698.46,783.99, 659.25,0,587.33,659.25, 523.25,0,466.16,0, 783.99,880,1046.5,880, 783.99,698.46,659.25,698.46, 659.25,587.33,523.25,587.33, 523.25,0,0,0], bass: [130.81,0,0,0, 196,0,0,0, 130.81,0,0,0, 196,0,0,0, 130.81,0,0,0, 196,0,0,0, 130.81,0,0,0, 196,0,0,0] },
    { id: 'cassette-cruise', group: 'Lo-fi beats', name: 'Cassette Cruise', icon: '▣', tempo: 330, wave: 'triangle', groove: 'lofi', notes: [329.63,392,493.88,392, 293.66,369.99,440,369.99, 261.63,329.63,392,329.63, 293.66,349.23,440,349.23], bass: [82.41,0,123.47,0, 73.42,0,110,0, 65.41,0,98,0, 73.42,0,110,0] },
    { id: 'pixel-cafe', group: 'Lo-fi beats', name: 'Pixel Café', icon: '◆', tempo: 300, wave: 'square', groove: 'lofi', notes: [392,493.88,587.33,493.88, 440,523.25,659.25,523.25, 349.23,440,523.25,440, 329.63,415.3,493.88,415.3], bass: [98,0,146.83,0, 110,0,164.81,0, 87.31,0,130.81,0, 82.41,0,123.47,0], leadVolume: 0.038 },
    { id: 'rooftop-loop', group: 'Lo-fi beats', name: 'Rooftop Loop', icon: '▥', tempo: 350, wave: 'sine', groove: 'lofi', notes: [293.66,349.23,440,523.25, 440,349.23,329.63,392, 493.88,587.33,493.88,392, 349.23,329.63,293.66,261.63], bass: [73.42,0,110,0, 82.41,0,123.47,0, 98,0,146.83,0,87.31,0,73.42,0] },
    { id: 'starlight', group: 'Mellow', name: 'Starlight', icon: '✦', tempo: 780, wave: 'sine', notes: [261.63, 329.63, 392, 493.88, 392, 329.63, 293.66, 329.63], bass: [130.81, 0, 196, 0, 146.83, 0, 196, 0] },
    { id: 'rainy-window', group: 'Mellow', name: 'Rainy Window', icon: '☂', tempo: 920, wave: 'triangle', notes: [293.66, 349.23, 440, 392, 329.63, 293.66, 261.63, 293.66], bass: [146.83, 0, 174.61, 0, 130.81, 0, 146.83, 0] },
    { id: 'quiet-garden', group: 'Mellow', name: 'Quiet Garden', icon: '❀', tempo: 840, wave: 'sine', notes: [329.63, 392, 493.88, 440, 392, 329.63, 293.66, 246.94], bass: [164.81, 0, 196, 0, 146.83, 0, 123.47, 0] },
    { id: 'moonlit-lake', group: 'Mellow', name: 'Moonlit Lake', icon: '☾', tempo: 1020, wave: 'triangle', notes: [220, 261.63, 329.63, 392, 329.63, 293.66, 261.63, 220], bass: [110, 0, 130.81, 0, 98, 0, 110, 0] },
    { id: 'soft-clouds', group: 'Mellow', name: 'Soft Clouds', icon: '☁', tempo: 880, wave: 'sine', notes: [349.23, 440, 523.25, 493.88, 440, 392, 349.23, 293.66], bass: [174.61, 0, 220, 0, 196, 0, 146.83, 0] },
    { id: 'sunset-lounge', group: 'Mellow', name: 'Sunset Lounge', icon: '◒', tempo: 740, wave: 'triangle', notes: [246.94, 311.13, 369.99, 415.3, 369.99, 311.13, 277.18, 311.13], bass: [123.47, 0, 155.56, 0, 138.59, 0, 155.56, 0] }
  ];

  let context = null;
  let output = null;
  let timer = null;
  let step = 0;
  let selectedTheme = localStorage.getItem(STORAGE_THEME) || 'fun-zone-default';
  let muted = localStorage.getItem(STORAGE_MUTED) === 'true';
  let picker = null;
  let trigger = null;
  let noiseBuffer = null;
  const volumeListeners = [];

  const storedVolume = parseFloat(localStorage.getItem(STORAGE_VOLUME));
  let volume = Number.isFinite(storedVolume) ? Math.min(1, Math.max(0, storedVolume)) : 0.75;

  function targetGain() { return muted ? 0 : volume * BASE_GAIN; }

  function notifyVolume() {
    volumeListeners.forEach(listener => listener(muted ? 0 : volume));
  }

  /* Games register their sound-effect bus here so one slider controls everything. */
  function onVolume(listener) {
    volumeListeners.push(listener);
    listener(muted ? 0 : volume);
  }

  function setVolume(next) {
    volume = Math.min(1, Math.max(0, next));
    localStorage.setItem(STORAGE_VOLUME, String(volume));
    if (volume > 0 && muted) {
      muted = false;
      localStorage.setItem(STORAGE_MUTED, 'false');
      start();
    }
    if (output && context) output.gain.setTargetAtTime(targetGain(), context.currentTime, 0.04);
    notifyVolume();
    updateUi();
  }

  function ensureAudio() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      output = context.createGain();
      output.gain.value = targetGain();
      output.connect(context.destination);
      noiseBuffer = context.createBuffer(1, context.sampleRate * 0.25, context.sampleRate);
      const noise = noiseBuffer.getChannelData(0);
      for (let index = 0; index < noise.length; index++) noise[index] = Math.random() * 2 - 1;
    }
    if (context.state === 'suspended') context.resume();
    return true;
  }

  function playTone(frequency, duration, wave, volume) {
    if (!context || !frequency || muted) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  function playNoise(duration, volume, frequency) {
    if (!context || !noiseBuffer || muted) return;
    const now = context.currentTime;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 1.4;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    source.start(now);
    source.stop(now + duration);
  }

  function playKick(volume = 0.1) {
    if (!context || muted) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(115, now);
    oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.16);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  }

  function playGroove(theme, index) {
    const beat = index % 8;
    if (theme.groove === 'lofi') {
      if (beat === 0 || beat === 4) playKick(0.085);
      if (beat === 2 || beat === 6) playNoise(0.12, 0.045, 1450);
      if (beat % 2 === 1) playNoise(0.035, 0.012, 5200);
    } else if (theme.groove === 'playful') {
      if (beat === 0 || beat === 4) playKick(0.09);
      if (beat === 2 || beat === 6) playNoise(0.07, 0.035, 2300);
    } else if (theme.groove === 'kaherwa') {
      if (beat === 0 || beat === 6) playKick(beat === 0 ? 0.12 : 0.095);
      if (beat === 2 || beat === 4) playNoise(0.06, 0.05, 2100);
      if (beat === 2 || beat === 6) playNoise(0.1, 0.025, 6200);
    }
  }

  function playStep() {
    const theme = THEMES.find(item => item.id === selectedTheme) || THEMES[0];
    const index = step % theme.notes.length;
    const leadDuration = theme.groove ? Math.min(theme.tempo / 1000 * 1.5, 0.48) : Math.min(theme.tempo / 1000 * 1.35, 1.15);
    playTone(theme.notes[index], leadDuration, theme.wave, theme.leadVolume || (theme.groove ? 0.06 : 0.075));
    if (theme.bass[index]) playTone(theme.bass[index], Math.min(theme.tempo / 1000 * 1.8, 0.7), 'sine', theme.groove ? 0.055 : 0.035);
    playGroove(theme, index);
    step++;
  }

  function start() {
    if (muted || !ensureAudio()) return;
    clearInterval(timer);
    step = 0;
    playStep();
    const theme = THEMES.find(item => item.id === selectedTheme) || THEMES[0];
    timer = setInterval(playStep, theme.tempo);
    updateUi();
  }

  function selectTheme(themeId) {
    selectedTheme = THEMES.some(item => item.id === themeId) ? themeId : THEMES[0].id;
    muted = false;
    localStorage.setItem(STORAGE_THEME, selectedTheme);
    localStorage.setItem(STORAGE_MUTED, 'false');
    start();
    updateUi();
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem(STORAGE_MUTED, String(muted));
    if (output && context) output.gain.setTargetAtTime(targetGain(), context.currentTime, 0.04);
    if (muted) {
      clearInterval(timer);
      timer = null;
    } else {
      start();
    }
    notifyVolume();
    updateUi();
    return muted;
  }

  function updateUi() {
    if (trigger) {
      trigger.textContent = muted ? '♪̸' : '♫';
      trigger.setAttribute('aria-label', muted ? 'Choose music (currently off)' : 'Choose music');
      trigger.title = muted ? 'Music is off' : 'Choose music';
    }
    if (!picker) return;
    picker.querySelectorAll('[data-music-theme]').forEach(button => {
      const active = !muted && button.dataset.musicTheme === selectedTheme;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const muteButton = picker.querySelector('[data-music-mute]');
    muteButton.textContent = muted ? 'Turn music on' : 'Turn music off';
    const slider = picker.querySelector('[data-music-volume]');
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(volume * 100));
    const readout = picker.querySelector('[data-music-volume-value]');
    if (readout) readout.textContent = muted ? 'Muted' : Math.round(volume * 100) + '%';
  }

  function closePicker() {
    if (!picker) return;
    picker.classList.add('hidden');
    trigger?.focus();
  }

  function openPicker() {
    if (!picker) buildPicker();
    picker.classList.remove('hidden');
    picker.querySelector('[data-music-theme]')?.focus();
  }

  function buildPicker() {
    const groups = [...new Set(THEMES.map(theme => theme.group))];
    picker = document.createElement('div');
    picker.className = 'music-picker-backdrop hidden';
    picker.innerHTML = `
      <section class="music-picker" role="dialog" aria-modal="true" aria-labelledby="musicPickerTitle">
        <div class="music-picker-head">
          <div>
            <h2 id="musicPickerTitle">Music themes</h2>
            <p>Pick a soundtrack for your game</p>
          </div>
          <button class="music-picker-close" type="button" aria-label="Close music picker">×</button>
        </div>
        ${groups.map(group => `
          <div class="music-theme-group">
            <h3>${group}</h3>
            <div class="music-theme-grid">
              ${THEMES.filter(theme => theme.group === group).map(theme => `<button type="button" class="music-theme" data-music-theme="${theme.id}"><span aria-hidden="true">${theme.icon}</span><b>${theme.name}</b></button>`).join('')}
            </div>
          </div>`).join('')}
        <div class="music-volume">
          <label for="fzMasterVolume">Volume <span data-music-volume-value></span></label>
          <input id="fzMasterVolume" type="range" min="0" max="100" step="1" data-music-volume aria-label="Master volume" />
        </div>
        <button class="music-mute" type="button" data-music-mute></button>
      </section>`;
    document.body.appendChild(picker);
    picker.querySelectorAll('[data-music-theme]').forEach(button => {
      button.addEventListener('click', () => selectTheme(button.dataset.musicTheme));
    });
    picker.querySelector('[data-music-volume]').addEventListener('input', event => {
      setVolume(Number(event.target.value) / 100);
    });
    picker.querySelector('[data-music-mute]').addEventListener('click', toggleMute);
    picker.querySelector('.music-picker-close').addEventListener('click', closePicker);
    picker.addEventListener('click', event => { if (event.target === picker) closePicker(); });
    picker.addEventListener('keydown', event => { if (event.key === 'Escape') closePicker(); });
    updateUi();
  }

  function init() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    trigger = topbar.querySelector('#soundBtn');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'music-trigger';
      topbar.appendChild(trigger);
    }
    trigger.addEventListener('click', openPicker);
    buildPicker();
    updateUi();
    document.addEventListener('pointerdown', () => { if (!muted) start(); }, { once: true });
  }

  return { init, openPicker, toggleMute, selectTheme, setVolume, onVolume, getVolume: () => (muted ? 0 : volume) };
})();

window.FunZoneMusic = FunZoneMusic;

/* ---- Game rules popover (the ⓘ button next to the music button) ---- */
const FunZoneInfo = (() => {
  let modal = null;
  let trigger = null;

  function close() {
    if (modal) modal.classList.add('hidden');
    trigger?.focus();
  }

  function open() {
    if (modal) modal.classList.remove('hidden');
  }

  function init() {
    const source = document.querySelector('#gameInfo');
    const topbar = document.querySelector('.topbar');
    if (!source || !topbar) return;

    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'info-btn';
    trigger.id = 'infoBtn';
    trigger.textContent = 'ⓘ';
    trigger.setAttribute('aria-label', 'How to play');
    trigger.title = 'How to play';
    topbar.insertBefore(trigger, topbar.querySelector('#soundBtn, .music-trigger'));

    modal = document.createElement('div');
    modal.className = 'fz-info-backdrop hidden';
    modal.innerHTML = `
      <section class="fz-info-panel" role="dialog" aria-modal="true" aria-labelledby="fzInfoTitle">
        <div class="fz-info-head">
          <h2 id="fzInfoTitle">${source.dataset.title || 'How to play'}</h2>
          <button class="fz-info-close" type="button" aria-label="Close">×</button>
        </div>
        <div class="fz-info-body">${source.innerHTML}</div>
      </section>`;
    document.body.appendChild(modal);

    trigger.addEventListener('click', open);
    modal.querySelector('.fz-info-close').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) close();
    });
  }

  return { init, open, close, isOpen: () => !!modal && !modal.classList.contains('hidden') };
})();

window.FunZoneInfo = FunZoneInfo;

function initFunZoneChrome() {
  FunZoneMusic.init();
  FunZoneInfo.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFunZoneChrome);
} else {
  initFunZoneChrome();
}

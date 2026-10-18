const $ = (id) => document.getElementById(id);
const C = 2 * Math.PI * 54,
  fg = $("fg");
fg.style.strokeDasharray = C;
let cfg = { f: 20, b: 5 },
  mode = "focus",
  total = 1200,
  left = 1200,
  running = false,
  endTs = 0,
  cycles = 0,
  timer = null,
  AC = null,
  cur = null;
try {
  const s = JSON.parse(localStorage.getItem("pomo-cfg") || "null");
  if (s) cfg = s;
} catch (e) {}
$("iF").value = cfg.f;
$("iB").value = cfg.b;

/* IndexedDB para os sons */
let db = null;
const idb = () =>
  new Promise((r) => {
    try {
      const q = indexedDB.open("pomo", 1);
      q.onupgradeneeded = () => q.result.createObjectStore("s");
      q.onsuccess = () => r(q.result);
      q.onerror = () => r(null);
    } catch (e) {
      r(null);
    }
  });
const dbGet = (k) =>
  new Promise((r) => {
    if (!db) return r(null);
    try {
      const q = db.transaction("s").objectStore("s").get(k);
      q.onsuccess = () => r(q.result || null);
      q.onerror = () => r(null);
    } catch (e) {
      r(null);
    }
  });
const dbSet = (k, v) =>
  new Promise((r) => {
    if (!db) return r();
    try {
      const t = db.transaction("s", "readwrite");
      v ? t.objectStore("s").put(v, k) : t.objectStore("s").delete(k);
      t.oncomplete = r;
      t.onerror = r;
    } catch (e) {
      r();
    }
  });
const sounds = { break: null, focus: null };
async function loadSounds() {
  db = await idb();
  for (const k of ["break", "focus"]) {
    sounds[k] = await dbGet(k);
    name(k);
  }
}
function name(k) {
  (k === "break" ? $("nB") : $("nF")).textContent = sounds[k]
    ? sounds[k].name
    : "Som padrão";
}

/* Áudio */
function ctx() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
  } catch (e) {}
  return AC;
}
function beep(freqs, gap) {
  const a = ctx();
  if (!a) return;
  freqs.forEach((f, i) => {
    const o = a.createOscillator(),
      g = a.createGain(),
      t = a.currentTime + i * gap;
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.4, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + gap * 0.9);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + gap);
  });
}
function play(k) {
  stopSound();
  const s = sounds[k];
  if (s) {
    try {
      cur = new Audio(URL.createObjectURL(s));
      cur.play().catch(() => {});
      return;
    } catch (e) {}
  }
  k === "break"
    ? beep([523, 659, 784, 1047], 0.28)
    : beep([880, 880, 880, 1175, 1175], 0.18);
}
function stopSound() {
  if (cur) {
    cur.pause();
    cur = null;
  }
}

/* Timer */
const fmt = (s) =>
  String(Math.floor(s / 60)).padStart(2, "0") +
  ":" +
  String(s % 60).padStart(2, "0");
function render() {
  $("clock").textContent = fmt(Math.max(0, Math.ceil(left)));
  fg.style.strokeDashoffset = C * (1 - left / total);
  $("label").textContent =
    mode === "focus" ? "Hora de focar" : "Hora do descanso";
  $("tF").classList.toggle("on", mode === "focus");
  $("tB").classList.toggle("on", mode === "break");
  document.body.classList.toggle("break", mode === "break");
  $("go").textContent = running ? "Pausar" : "Iniciar";
  $("cycles").textContent = cycles + (cycles === 1 ? " ciclo" : " ciclos");
  document.title =
    (running ? fmt(Math.ceil(left)) + " · " : "") +
    (mode === "focus" ? "Foco" : "Descanso");
}
function setMode(m) {
  mode = m;
  total = left = (m === "focus" ? cfg.f : cfg.b) * 60;
  if (running) endTs = Date.now() + left * 1000;
  render();
}
function tick() {
  left = (endTs - Date.now()) / 1000;
  if (left <= 0) {
    if (mode === "focus") {
      cycles++;
      play("break");
      setMode("break");
    } else {
      play("focus");
      setMode("focus");
    }
    return;
  }
  render();
}
function start() {
  ctx();
  running = true;
  endTs = Date.now() + left * 1000;
  clearInterval(timer);
  timer = setInterval(tick, 250);
  render();
}
function pause() {
  running = false;
  clearInterval(timer);
  render();
}
$("go").onclick = () => {
  stopSound();
  running ? pause() : start();
};
$("reset").onclick = () => {
  stopSound();
  pause();
  setMode(mode);
};
$("skip").onclick = () => {
  stopSound();
  setMode(mode === "focus" ? "break" : "focus");
};
$("tF").onclick = () => {
  if (mode !== "focus") setMode("focus");
};
$("tB").onclick = () => {
  if (mode !== "break") setMode("break");
};

/* Configurações */
function saveCfg() {
  cfg.f = Math.min(120, Math.max(1, +$("iF").value || 20));
  cfg.b = Math.min(60, Math.max(1, +$("iB").value || 5));
  try {
    localStorage.setItem("pomo-cfg", JSON.stringify(cfg));
  } catch (e) {}
  if (!running) setMode(mode);
}
$("iF").onchange = $("iB").onchange = saveCfg;
document.querySelectorAll("input[type=file]").forEach(
  (i) =>
    (i.onchange = async () => {
      const f = i.files[0];
      if (!f) return;
      const k = i.dataset.k;
      sounds[k] = new File([f], f.name, { type: f.type });
      await dbSet(k, sounds[k]);
      name(k);
      play(k);
      i.value = "";
    }),
);
document.querySelectorAll("[data-p]").forEach(
  (b) =>
    (b.onclick = () => {
      ctx();
      play(b.dataset.p);
    }),
);
document.querySelectorAll("[data-r]").forEach(
  (b) =>
    (b.onclick = async () => {
      const k = b.dataset.r;
      sounds[k] = null;
      await dbSet(k, null);
      name(k);
      stopSound();
    }),
);

setMode("focus");
loadSounds();

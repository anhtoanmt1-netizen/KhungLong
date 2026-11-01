/* ===== Âm thanh WebAudio: nhạc nền tổng hợp, hiệu ứng, tiếng bắn; AU.* và sfx(). ===== */
let AC, NB;
const AU = (() => {
  let M, SB, MU, FB, MB = null, MS = null, DB = null, UB = null, PA = null, gen = 0, vo = 0, cd = {}, kc = 0, kt = -9, nx = 0, st = 0, md = "";
  const on = () => S.set.snd, mo = () => S.set.mus !== 0 && S.set.mus !== false, p = (f, s2 = 0.05) => f * (1 + (Math.random() - 0.5) * s2 * 2);
  function init() {
    if (AC) {
      if (AC.state === "suspended") AC.resume();
      return 1;
    }
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const c = AC.createDynamicsCompressor();
      c.threshold.value = -14;
      c.ratio.value = 6;
      M = AC.createGain();
      M.gain.value = 0.9;
      SB = AC.createGain();
      SB.gain.value = S.set.sv;
      MU = AC.createGain();
      MU.gain.value = 0;
      SB.connect(M);
      MU.connect(M);
      M.connect(c);
      c.connect(AC.destination);
      const n = AC.sampleRate, b = AC.createBuffer(1, n, n), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      NB = b;
      try {
        fetch("assets1/audio/fire_breath.mp3").then((r) => r.arrayBuffer()).then((d2) => AC.decodeAudioData(d2, (q) => {
          FB = q;
        }, () => {
        })).catch(() => {
        });
      } catch (e) {
      }
      apT();
      try {
        fetch("assets1/audio/bgm.mp3").then((r) => r.ok ? r.arrayBuffer() : Promise.reject()).then((d2) => AC.decodeAudioData(d2, (q) => {
          DB = q;
          useMB();
        }, () => {
        })).catch(() => {
        });
      } catch (e) {
      }
      return 1;
    } catch (e) {
      return 0;
    }
  }
  function useMB() {
    MB = UB || DB;
    if (MS) {
      try {
        MS.stop();
      } catch (e) {
      }
      MS = null;
    }
  }
  function apT() {
    const g = ++gen;
    if (!PA) {
      UB = null;
      useMB();
      return;
    }
    AC.decodeAudioData(PA.slice(0), (q) => {
      if (g === gen) {
        UB = q;
        useMB();
      }
    }, () => {
      if (g === gen) {
        UB = null;
        useMB();
      }
    });
  }
  function setTrack(ab) {
    PA = ab;
    if (AC) apT();
  }
  function T(f, d, ty, v, o = {}) {
    if (!AC || vo > 28 && o.bus !== MU) return;
    const t = AC.currentTime + (o.at || 0), s2 = AC.createOscillator(), g = AC.createGain();
    s2.type = ty || "square";
    s2.frequency.setValueAtTime(f, t);
    if (o.to) s2.frequency.exponentialRampToValueAtTime(o.to, t + d);
    if (o.vib) {
      const l = AC.createOscillator(), q = AC.createGain();
      l.frequency.value = o.vib;
      q.gain.value = f * 0.05;
      l.connect(q);
      q.connect(s2.frequency);
      l.start(t);
      l.stop(t + d + 0.02);
    }
    g.gain.setValueAtTime(1e-4, t);
    g.gain.linearRampToValueAtTime(v, t + 6e-3);
    g.gain.exponentialRampToValueAtTime(1e-4, t + d);
    s2.connect(g);
    g.connect(o.bus || SB);
    vo++;
    s2.onended = () => vo--;
    s2.start(t);
    s2.stop(t + d + 0.03);
  }
  function N(d, ft, f0, f1, v, o = {}) {
    if (!AC || vo > 28 && o.bus !== MU) return;
    const t = AC.currentTime + (o.at || 0), s2 = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain();
    s2.buffer = NB;
    fl.type = ft;
    fl.frequency.setValueAtTime(f0, t);
    fl.frequency.exponentialRampToValueAtTime(f1, t + d);
    fl.Q.value = o.q || 1;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(1e-4, t + d);
    s2.connect(fl);
    fl.connect(g);
    g.connect(o.bus || SB);
    vo++;
    s2.onended = () => vo--;
    s2.start(t, Math.random() * 0.4);
    s2.stop(t + d + 0.03);
  }
  const arp = (a, ty, v, g = 0.07, d = 0.14) => a.forEach((f, i) => T(f, d, ty, v, { at: i * g })), CD = { boomf: 0.1, shoot: 0.05, hit: 0.035, kill: 0.04, flyer: 0.45, hurt: 0.1, ui: 0.05, dive: 0.2 };
  const PE = [0, 2, 4, 7, 9], R_ = {
    shoot(a) {
      const iv = a && a.iv || 1, pc = a && a.pc;
      if (!FB) {
        N(0.16, "bandpass", 500, 2600, 0.07, { q: 1.2 });
        N(0.09, "highpass", 3500, 7e3, 0.03);
        T(p(180), 0.14, "sawtooth", 0.025, { to: 420 });
        return;
      }
      const rt = pc ? 1.3 : 1, d = Math.min(FB.duration / rt, Math.max(0.2, iv * 1.05)), s2 = AC.createBufferSource(), g = AC.createGain(), t = AC.currentTime;
      s2.buffer = FB;
      s2.playbackRate.value = rt;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.linearRampToValueAtTime(0.5, t + 8e-3);
      g.gain.setValueAtTime(0.5, t + d * 0.7);
      g.gain.linearRampToValueAtTime(1e-4, t + d);
      s2.connect(g);
      g.connect(SB);
      s2.start(t, 0);
      s2.stop(t + d + 0.02);
    },
    hit() {
      N(0.14, "lowpass", 2600, 300, 0.11);
      N(0.05, "highpass", 4e3, 8e3, 0.04);
      T(p(140), 0.1, "sine", 0.1, { to: 60 });
      for (let i = 0; i < 2; i++) N(0.02, "highpass", 5e3, 9e3, 0.03, { at: 0.03 + i * 0.03 });
    },
    crit() {
      R_.hit();
      N(0.35, "bandpass", 900, 200, 0.12, { q: 0.8 });
      T(90, 0.3, "sine", 0.14, { to: 40 });
      T(1500, 0.1, "triangle", 0.03);
    },
    kill(m) {
      const now = AC.currentTime;
      kc = now - kt < 0.7 ? Math.min(kc + 1, 14) : 0;
      kt = now;
      const f = 2 ** ((PE[kc % 5] + 12 * Math.floor(kc / 5)) / 12), big = m.ti === 7 || m.ti === 15;
      if (big) {
        N(0.7, "lowpass", 1600, 60, 0.28);
        T(70, 0.7, "sine", 0.28, { to: 28 });
        arp([262, 330, 392, 523, 659], "triangle", 0.06, 0.09, 0.3);
        return;
      }
      if (m.z0) {
        T(1200 * f, 0.09, "square", 0.04, { to: 500 });
        T(1800 * f, 0.07, "triangle", 0.03, { at: 0.05 });
        N(0.05, "highpass", 5e3, 8e3, 0.03);
      } else if (m.k) {
        N(0.14, "bandpass", 500, 150, 0.1, { q: 1.5 });
        T(110, 0.16, "sine", 0.13, { to: 50 });
        T(500 * f, 0.06, "square", 0.025, { at: 0.02 });
      } else {
        T(p(300) * f, 0.13, "sine", 0.09, { to: 130 * f, vib: 30 });
        N(0.06, "lowpass", 900, 300, 0.05);
        T(880 * f, 0.07, "square", 0.02, { at: 0.03 });
      }
    },
    hurt() {
      T(150, 0.18, "sawtooth", 0.1, { to: 60 });
      N(0.15, "lowpass", 2500, 200, 0.12);
    },
    die() {
      T(330, 0.9, "sawtooth", 0.08, { to: 60, vib: 6 });
      T(110, 1, "sine", 0.18, { to: 35 });
      N(0.5, "lowpass", 800, 60, 0.15);
      arp([262, 196, 147], "triangle", 0.06, 0.25, 0.5);
    },
    revive() {
      N(0.5, "bandpass", 600, 3500, 0.09, { q: 1 });
      arp([392, 523, 659, 784, 1047], "triangle", 0.07, 0.07, 0.25);
      T(1568, 0.3, "sine", 0.04, { at: 0.3, vib: 12 });
    },
    wave() {
      T(110, 0.5, "sawtooth", 0.05, { to: 100 });
      arp([330, 440, 660], "square", 0.04, 0.1, 0.16);
    },
    boss(ti) {
      T(98, 1, "sawtooth", 0.1, { to: 90, vib: 5 });
      T(147, 1, "sawtooth", 0.06, { vib: 5 });
      N(0.8, "lowpass", 200, 900, 0.1);
      if (ti === 15) N(0.9, "bandpass", 900, 180, 0.14, { q: 3 });
      if (ti >= 16) {
        // Boss mới: tiếng gầm trầm + quét âm đi lên
        N(1, "bandpass", 700, 160, 0.12, { q: 3 });
        T(60, 0.9, "sine", 0.14, { to: 38 });
        T(220, 0.6, "square", 0.04, { to: 440, at: 0.15 });
      }
    },
    flyer(ti) {
      N(0.12, "bandpass", 900, 500, 0.04, { q: 3 });
      if (ti === 9) T(220, 0.2, "sawtooth", 0.02, { vib: 60 });
    },
    dive() {
      N(0.2, "highpass", 1500, 5e3, 0.06);
      T(900, 0.18, "sine", 0.04, { to: 300 });
    },
    storm() {
      N(0.7, "bandpass", 300, 2800, 0.12, { q: 1.5 });
      N(0.6, "lowpass", 2e3, 200, 0.1);
      T(120, 0.6, "sawtooth", 0.05, { to: 420 });
    },
    ancient() {
      N(0.8, "lowpass", 900, 120, 0.18);
      arp([98, 123, 147, 196], "sawtooth", 0.05, 0.07, 0.35);
      T(70, 0.7, "sine", 0.14, { to: 140 });
    },
    wall() {
      N(0.6, "bandpass", 500, 1800, 0.1, { q: 1 });
      N(0.5, "highpass", 2500, 6e3, 0.04);
      T(200, 0.5, "sawtooth", 0.03, { to: 320, vib: 20 });
    },
    boomf() {
      N(0.5, "lowpass", 1800, 80, 0.2);
      T(60, 0.5, "sine", 0.2, { to: 28 });
      N(0.2, "highpass", 3e3, 9e3, 0.05, { at: 0.05 });
    },
    chest() {
      T(1568, 0.1, "sine", 0.04);
      T(2093, 0.12, "sine", 0.03, { at: 0.08 });
    },
    tap() {
      T(520, 0.06, "square", 0.05, { to: 900 });
    },
    open() {
      arp([523, 659, 784, 1047], "triangle", 0.07, 0.06, 0.2);
      T(1568, 0.3, "sine", 0.05, { at: 0.25 });
      for (let i = 0; i < 4; i++) T(2e3 + Math.random() * 800, 0.04, "square", 0.02, { at: 0.2 + i * 0.05 });
    },
    miss() {
      T(300, 0.25, "triangle", 0.05, { to: 150 });
    },
    buy() {
      T(660, 0.08, "square", 0.04);
      T(990, 0.12, "square", 0.04, { at: 0.07 });
    },
    evo() {
      arp([262, 330, 392, 523, 659, 784, 1047], "triangle", 0.07, 0.08, 0.25);
      N(0.7, "highpass", 1e3, 8e3, 0.05);
    },
    skill() {
      arp([392, 523, 784], "triangle", 0.07, 0.08, 0.22);
      N(0.4, "highpass", 3e3, 9e3, 0.04);
    },
    ui() {
      T(900, 0.025, "square", 0.02);
    }
  };
  function s(n, a) {
    if (!on() || !init()) return;
    const now = AC.currentTime;
    if (cd[n] && now - cd[n] < (CD[n] || 0)) return;
    cd[n] = now;
    R_[n] && R_[n](a);
    if (n === "die") kt = -9;
  }
  function tick() {
    if (!AC || AC.state !== "running") return;
    const run = R && R.al, over = R && !R.al, want = !on() || !mo() || over ? "off" : run ? scr !== null ? "duck" : "run" : "menu";
    if (want !== md) {
      MU.gain.setTargetAtTime(want === "off" ? 0 : want === "duck" ? 0.1 : want === "run" ? 0.5 : 0.4, AC.currentTime, 0.25);
      if (md === "off" || md === "") nx = AC.currentTime + 0.05;
      md = want;
    }
    if (want === "off") return;
    if (MB) {
      if (!MS) {
        MS = AC.createBufferSource();
        MS.buffer = MB;
        MS.loop = true;
        MS.connect(MU);
        MS.start();
      }
      return;
    }
    const w = run ? R.wave : 1, boss = run && R.mon.some((m) => m.ti === 7 || m.ti === 15 || m.k === "boss"), low = run && R.hp < 0.3 * sv().maxHp, bpm = run ? 104 + Math.min(w, 12) * 3 + (boss ? 14 : 0) : 84, lv = run ? 1 + (w >= 3) + (w >= 7) + (boss ? 1 : 0) : 0, sp = 60 / bpm / 4;
    if (nx < AC.currentTime - 0.5) nx = AC.currentTime;
    while (nx < AC.currentTime + 0.25) {
      const b = st >> 4 & 3, q = st & 15, r = 110 * 2 ** (([0, -4, 3, -2][b] - (boss ? 1 : 0)) / 12), ch = [0, b === 0 ? 3 : 4, 7].map((i) => r * 2 ** (i / 12)), base = nx - AC.currentTime, m = (f, d, ty, v, x = {}) => T(f, d, ty, v, { bus: MU, ...x, at: base + (x.at || 0) }), n = (d, ft, a, c, v, x = {}) => N(d, ft, a, c, v, { bus: MU, ...x, at: base + (x.at || 0) });
      if (q === 0) ch.forEach((f) => m(f * 2, sp * 15, "triangle", 0.035));
      if (!run) {
        if (q === 0 || q === 6 || q === 10) m(p(r * 2 ** (PE[Math.floor(Math.random() * 5)] / 12) * 4, 0), sp * 5, "sine", 0.05);
      } else {
        if ([0, 3, 6, 8, 11, 14].includes(q)) m(q === 8 ? r * 1.5 : r, sp * 2, boss ? "sawtooth" : "triangle", 0.09);
        if (lv >= 2) m(ch[[0, 1, 2, 1][q & 3]] * (q & 8 ? 4 : 2), sp * 1.6, "square", 0.018);
        if (q % 4 === 0 && (lv >= 2 || q % 8 === 0)) m(140, 0.12, "sine", 0.2, { to: 40 });
        if (lv >= 3 && (q === 4 || q === 12)) {
          n(0.12, "highpass", 1500, 3e3, 0.06);
          m(190, 0.08, "triangle", 0.04, { to: 120 });
        }
        if (lv >= 1 && q % 2 === 1) n(0.03, "highpass", 7e3, 9e3, 0.022);
        if (boss && q % 4 === 2) m(120, 0.1, "sine", 0.14, { to: 40 });
        if (low && q % 8 === 0) {
          m(55, 0.12, "sine", 0.25, { to: 36, bus: SB });
          m(55, 0.1, "sine", 0.18, { to: 36, bus: SB, at: 0.14 });
        }
      }
      nx += sp;
      st++;
    }
  }
  setInterval(tick, 60);
  return { init, s, track: setTrack, dec: (ab) => new Promise((y, n) => {
    if (!init()) return n();
    AC.decodeAudioData(ab.slice(0), y, n);
  }), vol: () => {
    if (SB) SB.gain.value = S.set.sv;
  }, t: (f, d, ty, v) => {
    if (on() && init()) T(f, d, ty, v);
  } };
})();
const sfx = (n, a) => AU.s(n, a);
addEventListener("pointerdown", () => {
  if (S.set.snd) AU.init();
}, { passive: true });
addEventListener("keydown", () => {
  if (S.set.snd) AU.init();
});
document.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest("button")) sfx("ui");
});
document.addEventListener("visibilitychange", () => {
  if (AC) document.hidden ? AC.suspend() : S.set.snd && AC.resume();
});

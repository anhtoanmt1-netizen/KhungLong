/* ===== Logic ván chơi: startRun, sinh quái, sát thương, giết quái, bắn, cập nhật mỗi khung hình upd(). ===== */
function startRun() {
  const s = sv();
  R = { t: (S.rw - 1) * 20, hp: s.maxHp, kills: 0, gold: 0, dmgT: 0, tier: 0, mon: [], lv: [], fx: [], tx: [], cd: 0.3, sp: 1.2, inv: 0, al: 1, dT: 0, pz: 0, wave: S.rw, bn: 2, hitT: 0, atk: 0, king: 100 + 45 * Math.max(0, Math.ceil(((S.rw - 1) * 20 - 100) / 45)), dust: 0, ov: 0, cs: 8, ca: 10, cw: 12, cr: 0, buf: 0, sh: 0 };
  R.ch = [];
  R.cq = [];
  R.ex = [];
  R.kick = 0;
  R.th = R.dr = R.ph = R.hp;
  R.tl = 0;
  chestRoll();
  show(null);
}
function tx(X, Y, s, c) {
  if (S.set.dn && R.tx.length < 24) R.tx.push({ x: X, y: Y, s, c, l: 0.8 });
}
function spawn(king) {
  const r = R;
  let ti = 7;
  if (king) ti = Math.round((r.king - 100) / 45) % 2 ? 15 : 7;
  else {
    const lo = r.wave < 8 ? Math.max(0, r.wave - 2) : 1, hi = r.wave < 8 ? r.wave - 1 : 6;
    ti = lo + Math.floor(rnd() * (hi - lo + 1));
    const u = NU.filter((q) => r.wave >= q[1]);
    if (u.length && rnd() < 0.5) ti = u[Math.floor(rnd() * u.length)][0];
  }
  const d = SL[ti], hm = 1 + r.t * 0.012;
  if (king) sfx("boss", ti);
  else if (d[8]) sfx("flyer", ti);
  if (d[2] > SL[r.tier][2]) r.tier = ti;
  r.mon.push({ ti, k: d[7] || "", z: d[8] || 0, z0: d[8] || 0, dv: 0, ai: { bee: 0.7, bird: 0.8, dragon: 0.8 }[d[7]] || 1, x: W + 12, hp: d[2] * hm, mx: d[2] * hm, dm: d[3] * (1 + r.t * 4e-3), sp: d[5] * 2 * (1 + Math.min(0.5, r.t / 400)), gd: d[4] * (1 + r.t / 240), w: d[6], h: Math.round(d[6] * 0.7), cd: 0, fl: 0, ph: rnd() * 6, of: rnd() * 10 });
}
const front = () => DX + (IM[0].width || 80) * 0.3;
function hurt(m, s) {
  if (R.sh > 0) return;
  const r = R, d = Math.max(1, Math.round(m.dm * (1 - s.def)));
  r.hp -= d;
  r.inv = CFG.iframe;
  r.hitT = 0.25;
  tx(DX, GY - 50, "-" + d, "#ff6a6a");
  sfx("hurt");
  if (r.hp <= 0) {
    if (S.sk.revive && r.cr <= 0) {
      r.hp = 1;
      r.cr = 60;
      r.inv = 1.5;
      tx(DX, GY - 60, "HỒI SINH", "#ffd23a");
      R.ex.push({ x: DX, y: GY - 30, t: 0, sc: 2.2, col: "g", ring: "#ffd23a", rr: 60 });
      for (let i = 0; i < 26; i++) R.fx.push({ x: DX + (rnd() - 0.5) * 40, y: GY - rnd() * 40, vx: (rnd() - 0.5) * 40, vy: -50 - rnd() * 90, g: -30, l: 0.8, c: i % 2 ? "#ffd23a" : "#fff6b0", s: 2 });
      sfx("revive");
    } else {
      r.hp = 0;
      r.al = 0;
      r.dT = 0;
      sfx("die");
    }
  }
}
function kill(m, s) {
  m.dead = 1;
  const g = Math.max(1, Math.round(m.gd * s.gm));
  S.gold += g;
  R.gold += g;
  R.kills++;
  S.st.kills++;
  dirty = 1;
  tx(m.x, GY - (m.z || 0) - m.h - 14, "+" + g, "#ffd23a");
  const n = S.set.rm ? 3 : 10;
  for (let i = 0; i < n; i++) R.fx.push({ x: m.x, y: GY - (m.z || 0) - m.h / 2, vx: (rnd() - 0.5) * 70, vy: -rnd() * 60 - 10, l: 0.6, c: SL[m.ti][1], s: 2 });
  R.fx.push({ x: m.x, y: GY - 6, vx: 0, vy: -30, l: 0.5, c: "#ffd23a", s: 3 });
  sfx("kill", m);
}
function hit(m, s) {
  const cr = rnd() < CFG.crit, d = Math.round(s.dmg * (cr ? 2 : 1)), a = Math.min(d, m.hp);
  m.hp -= d;
  m.fl = 0.08;
  R.dmgT += a;
  R.hp = Math.min(s.maxHp, R.hp + a * s.steal);
  tx(m.x, GY - (m.z || 0) - m.h - 6, (cr ? "CRIT -" : "-") + d, cr ? "#ffd23a" : "#fff");
  sfx(cr ? "crit" : "hit");
  if (m.hp <= 0) kill(m, s);
}
function splash(o, s) {
  const d = Math.max(1, Math.round(s.dmg * 0.5));
  o.hp -= d;
  o.fl = 0.08;
  R.dmgT += d;
  tx(o.x, GY - o.h - 6, "-" + d, "#ffb040");
  if (o.hp <= 0) kill(o, s);
}
function fire(s, tg) {
  const r = R, iw = IM[0].width || 80, ox = DX + iw * 0.35, oy = GY - (IM[0].height || 70) * 0.75, ts = r.mon.filter((m) => !m.dead && m.x > front() + 8 && m.x < W - 4).sort((p, q) => p.x - q.x);
  for (let i = 0; i < s.n; i++) {
    const t = ts[i % ts.length] || tg, a = Math.atan2(GY - (t.z || 0) - t.h / 2 - oy, t.x - ox) + (i - (s.n - 1) / 2) * 0.06;
    r.lv.push({ x: ox, y: oy, vx: Math.cos(a) * CFG.leafSpd, vy: Math.sin(a) * CFG.leafSpd, a, tg: t, p: S.sk.pierce ? 3 : 1, hs: [], ag: 0, pc: S.sk.pierce ? 1 : 0, k: r.buf > 0 ? "a" : "" });
  }
  for (let i = 0; i < 6; i++) r.fx.push({ x: ox + 2, y: oy + (rnd() - 0.5) * 6, vx: 60 + rnd() * 110, vy: (rnd() - 0.5) * 70, g: -20, l: 0.25 + rnd() * 0.15, c: i % 2 ? "#ffd23a" : "#ff8a2a", s: 2 });
  r.atk = 0.15;
  sfx("shoot", { iv: 1 / s.rate, pc: S.sk.pierce });
}
function upd(dt) {
  const r = R, s = sv();
  for (const f of r.fx) {
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.vy += (f.g == null ? 150 : f.g) * dt;
    f.l -= dt;
  }
  r.fx = r.fx.filter((f) => f.l > 0);
  for (const e of r.ex) e.t += dt;
  r.ex = r.ex.filter((e) => e.t < 0.4);
  for (const t of r.tx) {
    t.y -= 14 * dt;
    t.l -= dt;
  }
  r.tx = r.tx.filter((t) => t.l > 0);
  if (!r.al) {
    r.dT += dt;
    if (r.dT > 1.8 && !r.ov) {
      r.ov = 1;
      S.rw = Math.max(1, r.wave - 3);
      S.st.deaths++;
      S.st.best = Math.max(S.st.best, Math.floor(r.t));
      save();
      $("ovt").innerHTML = `<p>Sống sót: ${fmt(r.t)} · Quái hạ: ${r.kills}</p><p>Vàng lượt: ${r.gold} · Vàng hiện có: ${S.gold}</p><p>Tổng sát thương: ${Math.round(r.dmgT)} · Số lần chết: ${S.st.deaths}</p><p>Quái cao nhất: ${SL[r.tier][0]} · Kỷ lục: ${fmt(S.st.best)}</p><p>Lượt sau hồi lại từ đợt ${S.rw} (lùi 3 đợt)</p>`;
      show("over");
    }
    return;
  }
  r.t += dt;
  r.inv -= dt;
  r.hitT -= dt;
  r.atk -= dt;
  r.bn -= dt;
  const wv = 1 + Math.floor(r.t / 20);
  if (wv > r.wave) {
    r.wave = wv;
    r.bn = 2;
    sfx("wave");
    chestRoll();
  }
  chestUpd(dt / GS);
  r.hp = Math.min(s.maxHp, r.hp + s.regen * dt);
  r.buf -= dt;
  r.sh -= dt;
  if (r.buf > 0 && r.fx.length < 380 && (r.au = (r.au || 0) - dt) <= 0) {
    r.au = 0.04;
    r.fx.push({ x: DX - 18 + rnd() * 44, y: GY - rnd() * 30, vx: (rnd() - 0.5) * 14, vy: -30 - rnd() * 40, g: -40, l: 0.5, c: rnd() < 0.5 ? "#ff3a1a" : "#ff9a2a", s: rnd() < 0.4 ? 3 : 2 });
  }
  if (S.sk.revive) r.cr -= dt;
  if (S.sk.storm && (r.cs -= dt) <= 0) {
    r.cs = 15;
    const ox = DX + (IM[0].width || 80) * 0.35, oy = GY - (IM[0].height || 70) * 0.75;
    for (let i = 0; i < 8; i++) {
      const a = (i - 3.5) * 0.06 + 0.1;
      r.lv.push({ x: ox, y: oy, vx: Math.cos(a) * CFG.leafSpd, vy: Math.sin(a) * CFG.leafSpd, a, p: S.sk.pierce ? 3 : 1, hs: [], ag: 0, pc: S.sk.pierce ? 1 : 0, k: "s" });
    }
    r.ex.push({ x: ox + 4, y: oy, t: 0, sc: 0.9, col: "s", ring: "#ffe066", rr: 34 });
    tx(DX, GY - 60, "BÃO LỬA", "#ffb040");
    sfx("storm");
  }
  if (S.sk.ancient && (r.ca -= dt) <= 0) {
    r.ca = 20;
    r.buf = 6;
    tx(DX, GY - 60, "CỔ ĐẠI", "#ff9a3a");
    sfx("ancient");
  }
  if (S.sk.wall && (r.cw -= dt) <= 0) {
    r.cw = 20;
    r.sh = 3;
    tx(DX, GY - 60, "TƯỜNG LỬA", "#8effd0");
    sfx("wall");
  }
  r.sp -= dt;
  if (r.sp <= 0 && r.mon.length < CFG.maxMon) {
    spawn(0);
    r.sp = Math.max(0.5, 2.4 - r.t * 8e-3) * (0.8 + rnd() * 0.4);
  }
  if (r.t >= r.king && r.mon.length < CFG.maxMon) {
    spawn(1);
    r.king += 45;
  }
  r.cd -= dt;
  if (r.cd <= 0) {
    let tg = null;
    for (const m of r.mon) if (m.x > front() + 8 && m.x < W - 4 && (!tg || m.x < tg.x)) tg = m;
    if (tg) {
      fire(s, tg);
      r.cd = 1 / s.rate;
    } else r.cd = 0;
  }
  const fx = front();
  for (const m of r.mon) {
    m.fl -= dt;
    m.cd -= dt;
    if (m.z0) {
      m.dv -= dt;
      m.z = m.z0 + Math.sin(CT * (m.k === "bat" ? 7 : 3) + m.ph) * (m.k === "bat" ? 9 : 5) - (m.dv > 0 ? m.z0 * 0.5 * Math.sin(Math.PI * (1 - m.dv / 0.4)) : 0);
    }
    const lim = fx + m.w / 2 + m.of;
    if (m.x > lim) m.x = Math.max(lim, m.x - m.sp * dt);
    else if (m.cd <= 0 && r.inv <= 0 && r.al) {
      m.cd = m.ai;
      if (m.z0) {
        m.dv = 0.4;
        sfx("dive");
      }
      hurt(m, s);
    }
  }
  for (const l of r.lv) {
    if (!l.tg || l.tg.dead || l.hs.includes(l.tg)) {
      l.tg = null;
      let bd = 1e9;
      for (const m of r.mon) if (!m.dead && !l.hs.includes(m) && m.x > l.x - 4 && m.x - l.x < bd) {
        bd = m.x - l.x;
        l.tg = m;
      }
    }
    if (l.tg) {
      let df = Math.atan2(GY - (l.tg.z || 0) - l.tg.h / 2 - l.y, l.tg.x - l.x) - l.a;
      df = Math.atan2(Math.sin(df), Math.cos(df));
      const st = 9 * dt;
      l.a += Math.abs(df) < st ? df : Math.sign(df) * st;
      l.vx = Math.cos(l.a) * CFG.leafSpd;
      l.vy = Math.sin(l.a) * CFG.leafSpd;
    }
    l.x += l.vx * dt;
    l.y += l.vy * dt;
    l.rot = (l.rot || rnd() * 6.28) + dt * 6;
    l.ag = (l.ag || 0) + dt;
    if (r.fx.length < 380 && (l.tr = (l.tr || 0) - dt) <= 0) {
      l.tr = 0.03;
      const q = rnd();
      r.fx.push({ x: l.x - Math.cos(l.a) * 9, y: l.y - Math.sin(l.a) * 9 + (rnd() - 0.5) * 5, vx: -Math.cos(l.a) * 35 + (rnd() - 0.5) * 30, vy: -Math.sin(l.a) * 35 - rnd() * 28, g: -70, l: 0.28 + rnd() * 0.22, c: q < 0.35 ? "#ffe066" : q < 0.7 ? "#ff9a2a" : "#ff5a1a", s: rnd() < 0.3 ? 2 : 1 });
    }
    for (const m of r.mon) {
      if (!m.dead && !l.hs.includes(m) && Math.abs(l.x - m.x) < m.w / 2 + 3 && l.y > GY - m.z - m.h - 4 && l.y < GY - m.z + 3) {
        l.hs.push(m);
        if (--l.p <= 0) l.dead = 1;
        hit(m, s);
        explode(l, m);
        if (S.sk.boom) {
          r.fx.push({ x: m.x, y: GY - m.h / 2, vx: 0, vy: 0, l: 0.2, c: "#ffb040", s: 10 });
          for (const o of r.mon) if (o !== m && !o.dead && Math.abs(o.x - m.x) < 26) splash(o, s);
        }
        break;
      }
    }
    if (l.x > W + 10 || l.y < -10 || l.y > H) l.dead = 1;
  }
  r.lv = r.lv.filter((l) => !l.dead);
  r.mon = r.mon.filter((m) => !m.dead);
  r.dust -= dt;
  if (r.dust <= 0 && !S.set.rm) {
    r.dust = 0.25;
    r.fx.push({ x: DX - 15, y: GY, vx: -25, vy: -15, l: 0.4, c: "#d8c090", s: 2 });
  }
}

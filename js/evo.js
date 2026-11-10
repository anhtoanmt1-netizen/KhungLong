/* ===== Giữ chân lâu dài (v2.6): Tiến hóa phân nhánh · Vùng đất · Tái Sinh =====
   · HỆ NGUYÊN TỐ (S.br): khi tiến hóa tới bậc 4 (Huyền Thoại) chọn Hỏa / Băng / Lôi / Ám Long. Mỗi hệ có nội tại riêng (xem BRN trong config.js; hiệu lực nằm ở sv() trong
     state.js và hit() trong game.js), hào quang màu riêng quanh khủng long, và bậc tiến hóa 5–7 mang tên theo hệ. Tái Sinh xóa hệ để chọn lại hệ khác.
   · VÙNG ĐẤT (BIO): đổi mỗi 50 đợt (Rừng Xanh → Băng Nguyên → Dung Nham → Hư Không): nền đổi màu có hạt thời tiết, hệ số riêng cho quái/vàng/chiêu Boss.
   · TÁI SINH: khi đủ điều kiện (tiến hóa Huyền Thoại và đạt đợt 50 trong kiếp này) đặt lại vàng / nâng cấp / kỹ năng / tiến hóa / phần thưởng để nhận Linh Hồn Long,
     dùng mua THIÊN PHÚ vĩnh viễn (TAL) giúp các kiếp sau nhanh và mạnh hơn. Thành tựu, Sách Quái, nhiệm vụ, cài đặt được giữ nguyên.
   Dữ liệu: S.rb = { n: số lần tái sinh, s: Linh Hồn đang có, t: tổng đã nhận, tl: { thiên phú: cấp }, lb: đợt cao nhất kiếp này, k0: số quái đã hạ lúc bắt đầu kiếp }. ===== */

/* ---------- Tiến hóa: số quái cần hạ tính theo từng kiếp ---------- */
const lifeKills = () => Math.max(0, S.st.kills - S.rb.k0);
const evoNeed = (n) => Math.ceil(n[2] * DF().ek * (1 - 0.05 * TL("tevo")));

/* ---------- Hệ nguyên tố ---------- */
let brFrom = "up";
const hexA = (h, a) => "rgba(" + parseInt(h.slice(1, 3), 16) + "," + parseInt(h.slice(3, 5), 16) + "," + parseInt(h.slice(5, 7), 16) + "," + a + ")";
function branchOpen(from) {
  if (S.br || S.evo < 4) return;
  brFrom = from;
  if (R && R.al) R.pz = 1;
  $("brc").innerHTML = Object.keys(BRN).map((k) => `<button type="button" class="brt" data-a="brpick" data-k="${k}" style="--c:${BRN[k].c}"><img src="assets2/ico/${BRN[k].ic}.png" alt=""><b>${BRN[k].n}</b><small>${BRN[k].d}</small><em>Bậc 5–7: ${EVOB[k].join(" → ")}</em></button>`).join("");
  show("branch");
}
function branchPick(k) {
  if (!BRN[k] || S.br) return;
  S.br = k;
  S.pr.brm = (S.pr.brm | 0) | (1 << Object.keys(BRN).indexOf(k));
  if (trk()) achCheck();
  save();
  sfx("evo");
  toast("🐉 " + BRN[k].n, BRN[k].c, "Hệ nguyên tố của kiếp này");
  if (brFrom === "up") { renderUp(); show("up"); } else { if (R && R.al) R.pz = 0; show(null); }
}
/* Chuỗi tia sét của Lôi Long: nảy sang tối đa 2 quái gần nhất */
function chainBolt(m, d, s) {
  const r = R, cand = r.mon.filter((o) => o !== m && !o.dead && Math.abs(o.x - m.x) < 130 && o.x < W - 4).sort((a, b) => Math.abs(a.x - m.x) - Math.abs(b.x - m.x)).slice(0, 2);
  r.ch2 = r.ch2 || [];
  let px = m.x, py = GY - (m.z || 0) - m.h / 2;
  for (const o of cand) {
    const oy = GY - (o.z || 0) - o.h / 2, dd = Math.max(1, Math.round(d * mdm(o)));
    r.ch2.push({ x1: px, y1: py, x2: o.x, y2: oy, at: performance.now() });
    o.hp -= dd; o.fl = 0.08; r.dmgT += dd;
    tx(o.x, GY - (o.z || 0) - o.h - 6, "-" + fmtN(dd), "#ffe14a");
    px = o.x; py = oy;
    if (o.hp <= 0) kill(o, s);
  }
  if (cand.length) sfx("bolt");
  if (r.ch2.length > 12) r.ch2.splice(0, r.ch2.length - 12);
}
function drawBranch() {
  const r = R;
  if (!r || !r.al) return;
  if (S.br && S.evo >= 4) {
    const c = BRN[S.br].c, cx = DX, cy = GY - 30, p = 0.26 + 0.07 * Math.sin(CT * 3), g = x.createRadialGradient(cx, cy, 2, cx, cy, 46);
    g.addColorStop(0, hexA(c, p)); g.addColorStop(1, hexA(c, 0));
    x.save();
    x.globalCompositeOperation = "lighter";
    x.fillStyle = g;
    x.fillRect(cx - 50, cy - 50, 100, 100);
    x.restore();
  }
  if (r.ch2 && r.ch2.length) {
    const now = performance.now();
    r.ch2 = r.ch2.filter((b) => now - b.at < 200);
    x.save();
    x.lineCap = "round";
    for (const b of r.ch2) {
      const k = 1 - (now - b.at) / 200, mx = (b.x1 + b.x2) / 2 + (((b.at * 7) % 13) - 6), my = (b.y1 + b.y2) / 2 - 8;
      for (const [w, c] of [[4, "rgba(255,225,74," + (0.35 * k).toFixed(2) + ")"], [1.6, "rgba(255,255,230," + k.toFixed(2) + ")"]]) {
        x.strokeStyle = c; x.lineWidth = w;
        x.beginPath(); x.moveTo(b.x1, b.y1); x.lineTo(mx, my); x.lineTo(b.x2, b.y2); x.stroke();
      }
    }
    x.restore();
  }
}

/* ---------- Vùng đất ---------- */
const BIOTINT = [null,
  { mul: "#9fc2ff", ov: [235, 245, 255, 0.3] },
  { mul: "#ffa684", ov: [70, 14, 0, 0.28] },
  { mul: "#9c80e6", ov: [22, 6, 48, 0.5] }];
let bioT = 0, bioLast = performance.now();
const BP = [];
const STARS = Array.from({ length: 36 }, (_, i) => [((i * 97) % 640), 8 + ((i * 53) % 150), (i * 31) % 7]);
function bioEnter(w) {
  const i = bioOf(w), b = BIO[i];
  if (R) R.bb = { s: "VÙNG ĐẤT · " + b.n.toUpperCase(), t: 3.5, c: b.c };
  tx(W / 2, 120, b.d, b.c);
  R.tx[R.tx.length - 1].z = 9;
  try { sfx("wave") } catch (e) { }
}
function tintBio(i, a) {
  const T = BIOTINT[i];
  if (!T || a <= 0.01) return;
  x.save();
  x.globalCompositeOperation = "multiply";
  x.globalAlpha = a;
  x.fillStyle = T.mul;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = "source-over";
  x.globalAlpha = a * T.ov[3];
  x.fillStyle = "rgb(" + T.ov[0] + "," + T.ov[1] + "," + T.ov[2] + ")";
  x.fillRect(0, 0, W, GY + 6);
  x.globalAlpha = a;
  if (i === 1) {   // lớp tuyết phủ mặt đất
    x.fillStyle = "#eaf4ff";
    for (let px = 0; px < W; px += 6) { const h = 3 + ((px * 7) % 4); x.fillRect(px, GY + 3 - h, 6, h + 2); }
    x.fillStyle = "#cfe3ff";
    for (let px = 0; px < W; px += 6) x.fillRect(px, GY + 5, 6, 1);
  } else if (i === 2) {   // nền nham thạch đỏ rực
    const g = x.createLinearGradient(0, GY - 10, 0, H);
    g.addColorStop(0, "rgba(255,80,20,0)"); g.addColorStop(1, "rgba(255,70,10,0.5)");
    x.globalCompositeOperation = "lighter";
    x.fillStyle = g;
    x.fillRect(0, GY - 10, W, H - GY + 10);
  } else if (i === 3) {   // sao trời hư không
    x.globalCompositeOperation = "lighter";
    for (const [sx, sy, ph] of STARS) { x.globalAlpha = a * (0.35 + 0.35 * Math.sin(CT * 2 + ph)); x.fillStyle = ph % 2 ? "#d8c8ff" : "#fff"; x.fillRect(sx, sy, 1.5, 1.5); }
    const g = x.createLinearGradient(0, GY, 0, H);
    g.addColorStop(0, "rgba(140,70,240,0)"); g.addColorStop(1, "rgba(140,70,240,0.35)");
    x.globalAlpha = a;
    x.fillStyle = g;
    x.fillRect(0, GY, W, H - GY);
  }
  x.restore();
}
function drawBiome() {
  const target = R && R.al !== undefined ? bioOf(R.wave) : 0, now = performance.now(), dt = Math.min(0.05, (now - bioLast) / 1000);
  bioLast = now;
  bioT += Math.sign(target - bioT) * Math.min(Math.abs(target - bioT), dt / 2.5);
  if (bioT < 0.01) { BP.length = 0; return; }
  const lo = Math.floor(bioT), fr = bioT - lo;
  tintBio(lo, 1 - fr);
  if (fr > 0.001) tintBio(lo + 1, fr);
  if (S.set.rm) return;
  const k = Math.round(bioT);   // hạt thời tiết của vùng gần nhất
  if (k < 1) return;
  while (BP.length < 60) {
    BP.push(k === 1 ? { x: Math.random() * W, y: -4, vx: -8 + Math.random() * 16, vy: 18 + Math.random() * 22, s: Math.random() < 0.3 ? 2 : 1, c: "#ffffff", k }
      : k === 2 ? { x: Math.random() * W, y: H + 2, vx: (Math.random() - 0.5) * 14, vy: -(14 + Math.random() * 30), s: Math.random() < 0.3 ? 2 : 1, c: Math.random() < 0.5 ? "#ff9a3a" : "#ffd23a", k }
        : { x: Math.random() * W, y: Math.random() * GY, vx: (Math.random() - 0.5) * 6, vy: -3 - Math.random() * 6, s: 1, c: Math.random() < 0.5 ? "#c77dff" : "#9ad0ff", k });
  }
  x.save();
  for (const p of BP) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.k !== k || p.y < -6 || p.y > H + 6 || p.x < -6 || p.x > W + 6) { Object.assign(p, { y: p.k === 1 ? -4 : H + 2, x: Math.random() * W, k }); if (p.k !== k) p.vy = k === 1 ? 20 : -20; }
    x.globalAlpha = k === 3 ? 0.5 + 0.3 * Math.sin(CT * 3 + p.x) : 0.85;
    x.fillStyle = p.c;
    x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
  }
  x.restore();
}

/* ---------- Tái Sinh ---------- */
const rbOk = () => S.evo >= 4 && S.rb.lb >= 50;
const soulGain = () => Math.floor((Math.floor(Math.pow(S.rb.lb, 1.25) / 4.5) + S.evo * 5) * (1 + 0.1 * TL("tsoul")));
const talCost = (t, l) => Math.round(t.lin ? t.c * (l + 1) : t.c * (1 + 0.3 * l));
let rbConf = 0, rbConfT = 0;
function openRebirth() { renderRebirth(); show("rebirth"); }
function renderRebirth() {
  const ok = rbOk(), g = soulGain();
  $("rbsum").innerHTML = `<span>Kiếp thứ <b>${S.rb.n + 1}</b></span><span>Linh Hồn: <b>${fmtP(S.rb.s)}</b></span><span>Đợt cao nhất kiếp này: <b>${S.rb.lb}</b></span><span>Tiến hóa: <b>${evoName(S.evo)}</b>${S.br ? ` · <b style="color:${BRN[S.br].c}">${BRN[S.br].n}</b>` : ""}</span>`;
  $("tlg").innerHTML = TAL.map((t) => {
    const l = TL(t.id), max = l >= t.m, c = max ? 0 : talCost(t, l), can = !max && S.rb.s >= c;
    return `<div class="tl${max ? " mx" : ""}"><img src="assets2/ico/${t.id}.png" alt=""><div class="tm"><b>${t.n}</b><small>${t.f(Math.max(1, l))}${l ? "" : " (mỗi cấp)"}</small><span>Cấp ${l}/${t.m}</span></div>${max ? `<span class="ok">TỐI ĐA</span>` : `<button type="button" class="b${can ? " s" : ""}" data-a="tbuy" data-k="${t.id}"${can ? "" : " disabled"}>${fmtP(c)}</button>`}</div>`;
  }).join("");
  const go = $("rbgo");
  go.disabled = !ok;
  go.textContent = rbConf ? "BẤM LẦN NỮA ĐỂ XÁC NHẬN" : ok ? "TÁI SINH  ·  +" + fmtP(g) + " Linh Hồn" : "CHƯA ĐỦ ĐIỀU KIỆN";
  go.classList.toggle("conf", !!rbConf);
  $("rbnote").innerHTML = ok
    ? `Tái Sinh sẽ <b>đặt lại</b> vàng, nâng cấp, kỹ năng, tiến hóa, hệ nguyên tố và phần thưởng đã chọn. Bạn <b>giữ</b> Linh Hồn, thiên phú, thành tựu, Sách Quái, nhiệm vụ và cài đặt. Linh Hồn nhận được tăng theo đợt cao nhất và bậc tiến hóa của kiếp này.`
    : `Cần tiến hóa tới <b>${EVO[4][0]}</b> (hiện: ${evoName(S.evo)}) và đạt <b>đợt 50</b> trong kiếp này (hiện: ${S.rb.lb}) để tái sinh.`;
}
function talBuy(id) {
  const t = TAL.find((q) => q.id === id), l = TL(id);
  if (!t || l >= t.m) return;
  const c = talCost(t, l);
  if (S.rb.s < c) { sfx("miss"); return; }
  S.rb.s -= c;
  S.rb.tl[id] = l + 1;
  save();
  sfx("skill");
  renderRebirth();
}
function doRebirth() {
  if (!rbOk()) return;
  const g = soulGain(), d = defS();
  S.rb.n++; S.rb.s += g; S.rb.t += g;
  S.gold = 0; S.lv = d.lv; S.sk = d.sk; S.evo = 0; S.rw = 1; S.bf = []; S.br = ""; S.rg = "fire";
  S.rb.lb = 0; S.rb.k0 = S.st.kills;
  const ds = TL("tstart");
  if (ds) { S.lv.dmg = Math.min(UP.dmg.m, 2 * ds); S.lv.hp = Math.min(UP.hp.m, 2 * ds); }
  bfRecalc();
  R = null;
  rbConf = 0;
  achCheck();
  save();
  toast("🔥 Tái Sinh thành công", "#ffb23a", "+" + fmtP(g) + " Linh Hồn · bước vào kiếp " + (S.rb.n + 1));
  sfx("evo");
  renderRebirth();
  show("menu");
  dfLabel();
  hdots();
}

/* Điều khiển từ ui.js (act) */
function evoAct(a, k) {
  switch (a) {
    case "brpick": branchPick(k); return true;
    case "rb": sfx("ui"); openRebirth(); return true;
    case "rbclose": rbConf = 0; show("menu"); hdots(); return true;
    case "tbuy": talBuy(k); return true;
    case "rbgo":
      if (!rbOk()) return true;
      if (!rbConf) { rbConf = 1; clearTimeout(rbConfT); rbConfT = setTimeout(() => { rbConf = 0; if (scr === "rebirth") renderRebirth(); }, 4000); renderRebirth(); sfx("ui"); }
      else doRebirth();
      return true;
  }
  return false;
}

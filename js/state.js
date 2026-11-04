/* ===== Trạng thái lưu (localStorage): mặc định, nạp/lưu, giá nâng cấp cost(), chỉ số tổng hợp sv(). ===== */
const defS = () => ({ v: 1, df: 0, gold: 0, rw: 1, lv: Object.fromEntries(Object.keys(UP).map((k) => [k, 0])), st: { kills: 0, best: 0, deaths: 0 }, sk: Object.fromEntries(Object.keys(SK).map((k) => [k, 0])), evo: 0, set: { snd: 1, mus: 1, dn: 1, rm: 0, sv: 0.5 }, mod: { on: 0, pw: hpw(MODPW), dino: null, bs: {}, wj: 0 }, cu: { bg: { sel: null }, tree: { sel: null, px: null }, leaf: { sel: null, px: null }, grass: { sel: null, px: null } } });
let GS = 1, warn = 0;
function load() {
  try {
    const j = JSON.parse(localStorage.getItem(K));
    if (!j || j.v !== 1) throw 0;
    const d = defS();
    d.gold = Math.max(0, Math.floor(+j.gold) || 0);
    d.df = Math.min(DIFF.length - 1, Math.max(0, Math.floor(+j.df) || 0));
    d.rw = Math.min(9999, Math.max(1, Math.floor(+j.rw) || 1));
    for (const k in UP) d.lv[k] = Math.min(UP[k].m, Math.max(0, Math.floor(+(j.lv || {})[k]) || 0));
    d.st.kills = Math.max(0, Math.floor(+(j.st || {}).kills) || 0);
    d.st.best = Math.max(0, Math.floor(+(j.st || {}).best) || 0);
    d.st.deaths = Math.max(0, Math.floor(+(j.st || {}).deaths) || 0);
    const jc = j.cu || {};
    for (const k of CUK) {
      const o = jc[k] || {};
      d.cu[k].sel = typeof o.sel === "string" && o.sel.length < 40 ? o.sel : null;
      if ("px" in d.cu[k]) {
        const p = Math.round(+o.px);
        d.cu[k].px = p > 0 && p < 2e3 ? p : null;
      }
    }
    const jm = j.mod || {};
    d.mod.on = jm.on ? 1 : 0;
    d.mod.wj = jm.wj ? 1 : 0;
    if (typeof jm.pw === "string" && /^[0-9a-f]{1,8}$/.test(jm.pw)) d.mod.pw = jm.pw;
    const dp = Math.round(+jm.dino);
    d.mod.dino = dp >= 30 && dp <= 300 ? dp : null;
    for (let i = 0; i < 12; i++) {
      const b = Math.round(+(jm.bs || {})[i]);
      if (b >= 30 && b <= 220) d.mod.bs[i] = b;
    }
    for (const k in d.sk) d.sk[k] = Math.min(SK[k].m, Math.max(0, Math.floor(+(j.sk || {})[k]) || 0));
    d.evo = Math.min(EVO.length - 1, Math.max(0, Math.floor(+j.evo) || 0));
    for (const k in d.set) if (j.set && k in j.set) d.set[k] = k === "sv" ? Math.min(1, Math.max(0, +j.set[k] || 0)) : j.set[k] ? 1 : 0;
    return d;
  } catch (e) {
    try {
      if (localStorage.getItem(K)) warn = 1;
    } catch (_) {
    }
    return defS();
  }
}
let S = load(), R = null, dirty = 0, sT = 0, scr = "menu", prev = "menu", CT = 0, BT = 0;
const save = () => {
  try {
    localStorage.setItem(K, JSON.stringify(S));
  } catch (e) {
  }
};
/* Giá: b × g^cấp (tới cấp l1), các cấp mở rộng nhân thêm g2 mỗi cấp; dc = [từ cấp, hệ số] giảm giá (Sức mạnh/Sinh lực giảm 20% từ cấp 20) */
const curve = (o, l, base) => {
  const l1 = o.l1 == null ? Infinity : o.l1;
  let p = base * Math.pow(o.g, Math.min(l, l1));
  if (l > l1) p *= Math.pow(o.g2, l - l1);
  if (o.dc && l >= o.dc[0]) p *= o.dc[1];
  return Math.min(1e12, Math.round(p));
};
const cost = (k, l) => curve(UP[k], l, UP[k].b);
const skCost = (k, l) => curve(SK[k], l, SK[k].c);
const skl = (k) => S.sk[k] > 0 ? SKV[k](S.sk[k]) : null;
/* Chỉ số tổng hợp từ nâng cấp + tiến hóa + kỹ năng (Cổ Đại làm tăng sát thương/tốc độ bắn tạm thời) */
const sv = () => {
  const L = S.lv, e = S.evo, bm = R && R.buf > 0 ? (R.bm || 1.5) : 1, mh = UP.hp.f(L.hp) + CFG.evoHp * e;
  return {
    maxHp: mh,
    dmg: Math.round(UP.dmg.f(L.dmg) * (1 + CFG.evoDmg * e) * bm * (R && R.dim > 0 ? 0.75 : 1)),
    rate: Math.min(CFG.rateCap, UP.rate.f(L.rate) * bm) * (R && R.slw > 0 ? 0.6 : 1),
    n: UP.multi.f(L.multi),
    cr: Math.min(0.95, (UP.critR.f(L.critR) + CFG.evoCrit * e) / 100),
    cd: UP.critD.f(L.critD) / 100,
    regen: UP.regen.f(L.regen),
    steal: UP.steal.f(L.steal) / 100,
    stealCap: (0.005 + 0.004 * L.steal) * mh,
    gm: (UP.gold.f(L.gold) + CFG.evoGold * e) / 100,
    def: Math.min(CFG.defCap, UP.def.f(L.def) / 100),
    burn: L.burn ? UP.burn.f(L.burn) / 100 : 0,
    stunP: L.stun ? UP.stun.f(L.stun) / 100 : 0,
    stunT: 0.5 + 0.06 * L.stun
  };
};

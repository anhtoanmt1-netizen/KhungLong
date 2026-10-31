/* ===== Trạng thái lưu (localStorage): mặc định, nạp/lưu, giá nâng cấp cost(), chỉ số tổng hợp sv(). ===== */
const defS = () => ({ v: 1, gold: 0, rw: 1, lv: Object.fromEntries(Object.keys(UP).map((k) => [k, 0])), st: { kills: 0, best: 0, deaths: 0 }, sk: { storm: 0, pierce: 0, boom: 0, revive: 0, ancient: 0, wall: 0 }, evo: 0, set: { snd: 1, mus: 1, dn: 1, rm: 0, sv: 0.5 }, cu: { bg: { sel: null }, tree: { sel: null, px: null }, leaf: { sel: null, px: null }, grass: { sel: null, px: null } } });
let GS = 1, warn = 0;
function load() {
  try {
    const j = JSON.parse(localStorage.getItem(K));
    if (!j || j.v !== 1) throw 0;
    const d = defS();
    d.gold = Math.max(0, Math.floor(+j.gold) || 0);
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
    for (const k in d.sk) d.sk[k] = (j.sk || {})[k] ? 1 : 0;
    d.evo = Math.min(5, Math.max(0, Math.floor(+j.evo) || 0));
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
const cost = (k, l) => Math.min(1e7, Math.round(UP[k].b * Math.pow(UP[k].g, l)));
const sv = () => {
  const L = S.lv, e = S.evo, b = R && R.buf > 0 ? 1.5 : 1;
  return { maxHp: UP.hp.f(L.hp) + 20 * e, dmg: Math.round(UP.dmg.f(L.dmg) * (1 + 0.1 * e) * b), rate: Math.min(6, UP.rate.f(L.rate) * b), n: UP.multi.f(L.multi), regen: L.regen, steal: L.steal * 0.05, gm: 1 + 0.1 * L.gold, def: Math.min(0.5, 0.05 * L.def) };
};

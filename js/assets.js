/* ===== Nạp hình ảnh: khung khủng long (assets1/dino), Boss (assets1/boss), nền, cây, cỏ, lá, rương; hỗ trợ thay ảnh tùy chỉnh. ===== */
const IM = [0, 1, 2, 3, 4].map((n) => {
  const i = new Image();
  i.src = "assets1/dino/run" + n + ".png";
  return i;
});
const DEFSRC = { bg: "assets1/world/background.jpg", tr: "assets1/world/tree.png", gr: "assets1/world/grass2.jpg", lf: "assets1/world/leaf.png" }, CATK = { bg: "bg", tree: "tr", leaf: "lf", grass: "gr" }, AS = {};
const ld = (i) => i && i.complete && i.naturalWidth > 0, TO = [0, 0.3, -0.25, 0.4, -0.1, 0.2, -0.35, 0.15, 0.05], TS = [1, 0.88, 1.08, 0.94, 1.04, 0.85, 1.1, 0.92, 0.98];
const DWD = () => IM[0].naturalWidth || 89, csz = (k) => {
  const p = S.mod.on ? S.cu[k].px : null;
  return p > 0 ? p : k === "tree" ? 172 : k === "leaf" ? 28 : DWD();
};
/* Boss: ảnh + kích thước; dk() = hệ số phóng khủng long (chỉ khi bật Mod và đã nhập px) */
const BI = BOSS.map((b) => { const i = new Image(); i.src = b.src; return i; });
const dk = () => S.mod.on && S.mod.dino > 0 ? S.mod.dino / (IM[0].naturalWidth || 89) : 1;
const bossPx = (i) => S.mod.on && S.mod.bs[i] > 0 ? S.mod.bs[i] : BOSS[i].w;
let LF = [], GRC = "#6b4a2a", AV = {}, TRB = 0;
const DI = new Image();
DI.src = "assets1/dino/die.png";
const CHI = [1, 2, 3, 4, 5, 6, 7].map((n) => {
  const i = new Image();
  i.src = "assets1/fx/chest" + n + ".png";
  return i;
});
function buildLF() {
  if (!ld(AS.lf)) return;
  const w = 72, h = Math.round(72 * AS.lf.naturalHeight / AS.lf.naturalWidth) || 66;
  LF = EVO.map((e, i) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.drawImage(AS.lf, 0, 0, w, h);
    if (i) {
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = 0.45;
      g.fillStyle = e[3];
      g.fillRect(0, 0, w, h);
    }
    return c;
  });
}
function grassCol() {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.drawImage(AS.gr, 0, AS.gr.naturalHeight - 6, AS.gr.naturalWidth, 6, 0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    GRC = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
  } catch (e) {
    GRC = "#6b4a2a";
  }
}
function treePad() {
  try {
    const i = AS.tr, w = i.naturalWidth, h = i.naturalHeight, c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.drawImage(i, 0, 0);
    const d = g.getImageData(0, 0, w, h).data;
    let b = h - 1;
    for (; b > 0; b--) {
      let f = 0;
      for (let q = 0; q < w; q++) if (d[(b * w + q) * 4 + 3] > 40) {
        f = 1;
        break;
      }
      if (f) break;
    }
    TRB = (h - 1 - b) / h;
  } catch (e) {
    TRB = 0;
  }
}
function setAsset(k, src) {
  const t = AV[k] = (AV[k] || 0) + 1, i = new Image();
  i.onload = () => {
    if (AV[k] !== t) return;
    AS[k] = i;
    if (k === "lf") buildLF();
    if (k === "gr") grassCol();
    if (k === "tr") treePad();
  };
  i.onerror = () => {
    if (AV[k] === t && src !== DEFSRC[k]) setAsset(k, DEFSRC[k]);
  };
  i.src = src;
}
for (const k in DEFSRC) setAsset(k, DEFSRC[k]);

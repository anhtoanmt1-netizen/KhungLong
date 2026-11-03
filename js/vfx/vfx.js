/* ===== Cầu nối hiệu ứng điểm ảnh (v2.2) =====
   Nạp bộ lõi `core/` và 12 hiệu ứng bóng tối `effects/shadow/` (ES module; cần chạy qua http/https, mở file:// sẽ không nạp được và game tự bỏ qua hiệu ứng).
   Đưa ra `window.VFX` cho phần mã thường (js/bossskills.js, js/render.js):
     VFX.make(tên, { x, y, s, flip, seed, alpha }) -> tay cầm { update(dt), draw(ctx), stop(), done() } hoặc null nếu chưa nạp xong
       x, y  : điểm neo trên màn hình (tọa độ game 640×360); neo = `origin` của hiệu ứng (thường là mặt đất / tâm)
       s     : tỷ lệ phóng (1 = 1 điểm ảnh hiệu ứng = 1 điểm ảnh game)
       flip  : lật ngang quanh điểm neo (hiệu ứng có hướng: Hút máu, Hút linh hồn)
     VFX.ready : true khi cả 12 hiệu ứng đã nạp.
   Mỗi hiệu ứng tự cập nhật theo dt của game (đã nhân tốc độ x2/x3/x5) và chỉ vẽ lại ảnh tối đa 30 lần/giây để nhẹ máy. ===== */
import { createFx, createFrame, clearFrame, composite } from "./core/index.js";

const NAMES = ["black-hole", "curse", "dark-explosion", "eclipse", "grasping-hands", "hex-sigil", "life-steal", "necro-skulls", "shadow-flames", "shadow-tendrils", "soul-drain", "void-orb"];
const MODS = {};
const MAX_LIVE = 6, STEP = 1 / 30;
let live = 0;

function make(name, o = {}) {
  const mod = MODS[name];
  if (!mod || live >= MAX_LIVE) return null;
  const m = mod.meta, [w, h] = m.size, [ox, oy] = m.origin;
  const op = { x: 0, y: 0, seed: o.seed != null ? o.seed : (Math.random() * 1e6) | 0 };
  if (o.actor) op.actor = o.actor;   // hình người mẫu thay bằng sprite thật (Lời Nguyền, Hút Máu)
  const fx = createFx(mod, op);
  const frame = createFrame(w, h, -ox, -oy), cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c2 = cv.getContext("2d"), img = c2.createImageData(w, h);
  let acc = STEP, dead = false;
  live++;
  const h_ = {
    x: o.x || 0, y: o.y || 0, s: o.s || 1, flip: !!o.flip, alpha: o.alpha == null ? 1 : o.alpha, meta: m,
    update(dt) {
      if (dead) return;
      fx.update(dt);
      acc += dt;
      if (acc >= STEP) {
        acc = 0;
        clearFrame(frame);
        fx.draw(frame);
        composite(frame, img.data, null);
        c2.putImageData(img, 0, 0);
      }
      if (fx.done()) { dead = true; live-- }
    },
    draw(ctx) {
      if (dead) return;
      const s = h_.s;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = h_.alpha;
      ctx.translate(h_.x, h_.y);
      if (h_.flip) ctx.scale(-1, 1);
      ctx.drawImage(cv, -ox * s, -oy * s, w * s, h * s);
      ctx.restore();
    },
    stop() { fx.stop() },
    done() { return dead },
    get t() { return fx.t }
  };
  return h_;
}

/* Dựng "người mẫu" từ một ảnh sprite (chân ở gốc, w×h điểm ảnh) để hiệu ứng tô màu lên đúng hình khủng long / Boss. mirror: lật sẵn để khớp khi hiệu ứng bị lật ngang. */
const ACT = new Map();
function actorOf(img, w, h, mirror) {
  w = Math.max(4, Math.round(w));
  h = Math.max(4, Math.round(h));
  const key = (img.src || "") + "|" + w + "x" + h + "|" + (mirror ? 1 : 0);
  if (ACT.has(key)) return ACT.get(key);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d", { willReadFrequently: true });
  c.imageSmoothingEnabled = false;
  if (mirror) { c.translate(w, 0); c.scale(-1, 1); }
  c.drawImage(img, 0, 0, w, h);
  const d = c.getImageData(0, 0, w, h).data, pixels = new Uint32Array(w * h), mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (d[i * 4 + 3] > 40) { pixels[i] = (255 << 24) | (d[i * 4 + 2] << 16) | (d[i * 4 + 1] << 8) | d[i * 4]; mask[i] = 1; }
  }
  const a = { mask: { w, h, data: mask }, pixels, x: -Math.floor(w / 2), y: -h, w, h, k: 2, head: [0, -h], chest: [0, -Math.round(h * 0.5)] };
  if (ACT.size > 24) ACT.clear();
  ACT.set(key, a);
  return a;
}

window.VFX = { ready: false, make, actorOf, names: NAMES };
Promise.all(NAMES.map((n) => import("./effects/shadow/" + n + ".js").then((mod) => { MODS[n] = mod }))).then(() => { window.VFX.ready = true }).catch((e) => console.warn("VFX không nạp được:", e));

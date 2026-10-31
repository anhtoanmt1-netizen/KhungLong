/* ===== Quản lý nhạc nền do người dùng tải lên (lưu IndexedDB, tối đa 3 bản). ===== */
const MK = "pds_mus_sel";
let MT = [];
const msel = () => {
  try {
    return localStorage.getItem(MK) || "";
  } catch (e) {
    return "";
  }
};
async function loadMus() {
  MT = (await idbAll()).filter((o2) => o2.cat === "music").sort((a, b) => a.t - b.t).slice(0, 3);
  const o = MT.find((x) => x.id === msel());
  AU.track(o ? o.d : null);
}
function renderMus() {
  const sel = msel(), esc = (t) => t.replace(/[<>&"]/g, "");
  let h = `<div class="mr${sel ? "" : " on"}"><span class="mn">${ico("music")} Nhạc mặc định</span><button class="b" data-a="musel" data-k="" ${sel ? "" : "disabled"}>${sel ? "Dùng" : "Đang dùng"}</button></div>`;
  for (let i = 0; i < 3; i++) {
    const o = MT[i];
    h += o ? `<div class="mr${o.id === sel ? " on" : ""}"><span class="mn">${ico("music")} ${esc(o.name)}</span><button class="b" data-a="musel" data-k="${o.id}" ${o.id === sel ? "disabled" : ""}>${o.id === sel ? "Đang dùng" : "Dùng"}</button><button class="b r" data-a="musdel" data-k="${o.id}">Xóa</button></div>` : `<div class="mr em"><span class="mn">Ô trống ${i + 1}/3</span><button class="b a" data-a="musup">Tải lên</button></div>`;
  }
  $("ml").innerHTML = h;
}
function selMus(id) {
  try {
    localStorage.setItem(MK, id);
  } catch (e) {
  }
  const o = MT.find((x) => x.id === id);
  AU.track(o ? o.d : null);
  renderMus();
}
function delMus(id) {
  idbDel(id);
  MT = MT.filter((o) => o.id !== id);
  if (msel() === id) selMus("");
  else renderMus();
}
async function upMus(f) {
  const m = $("mm");
  if (!f) return;
  $("mf").value = "";
  if (MT.length >= 3) {
    m.textContent = "Đã đủ 3 bản, hãy xóa bớt để tải thêm.";
    return;
  }
  if (f.size > 15e6) {
    m.textContent = "File quá lớn (tối đa 15MB).";
    return;
  }
  m.textContent = "Đang xử lý…";
  try {
    const ab = await f.arrayBuffer();
    await AU.dec(ab);
    const it = { id: "m" + Date.now().toString(36), cat: "music", t: Date.now(), name: f.name.replace(/\.[^.]+$/, "").slice(0, 40), d: ab };
    if (!await idbPut(it)) {
      m.textContent = "Không lưu được file.";
      return;
    }
    MT.push(it);
    selMus(it.id);
    m.textContent = "";
  } catch (e) {
    m.textContent = "File âm thanh không hợp lệ.";
  }
}
document.addEventListener("change", (e) => {
  if (e.target.id === "mf") upMus(e.target.files[0]);
});

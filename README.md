# Pixel Dino Survivor (v2.0 - 12 Boss, Bảng Mod)
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: HTML/CSS/JS thuần, đã tách thành nhiều file.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
```
git init && git add . && git commit -m "Pixel Dino Survivor v2.0" && git branch -M main
git remote add origin https://github.com/<tên-bạn>/pixel-dino-survivor.git && git push -u origin main
```
Vào Settings > Pages, chọn nhánh main, thư mục root. Mở link HTTPS trên Android Chrome > Menu > Cài đặt ứng dụng.

## Cấu trúc thư mục
```
index.html            khung HTML (các màn hình)
sw.js                 Service Worker (network-first, danh sách cache đầy đủ)
manifest.webmanifest, icon-*.png
css/   base.css (khung, HUD, nút, bảng quái) · panels.css (bảng, Cài đặt, Mod) · cards.css (thẻ)
js/    (nạp theo đúng thứ tự trong index.html)
  config.js           VERSION, CFG, UP, SL, SK, EVO, CHR và BOSS (12 Boss), BOSSORD, hpw (băm mật khẩu)
  state.js            lưu/nạp (localStorage), cost(), sv()  — có S.mod
  assets.js           nạp ảnh khủng long, Boss (BI), nền, cây, cỏ, lá, rương; dk() bossPx()
  audio.js · fire.js · icons.js · render.js (có bossDraw) · chest.js · music.js · custom.js · settings.js
  mod.js              Bảng Mod ẩn (mật khẩu, bật/tắt, nhập vàng, cỡ khủng long, cỡ Boss)
  cards.js · game.js (có bossMove) · ui.js (điều hướng, bảng quái monPanel) · main.js
assets1/  (32 file) nhân vật, quái, môi trường, âm thanh
  dino/   run0-4.png, die.png      boss/  boss01-12.png (ảnh 12 Boss, nền trong suốt)
  world/  background.jpg, tree.png, grass2.jpg, leaf.png
  fx/     fire.png (atlas đạn), chest1-7.png      audio/  bgm.mp3, fire_breath.mp3
assets2/  (40 file) giao diện
  cards/  frame_*.png (8 khung), art_*.png (15 ảnh thẻ)      ui/  btn_*.png, coin.png
```
Mỗi thư mục assets có tối đa 100 file (gồm cả thư mục con). Hiện còn dư chỗ để thêm ảnh/âm thanh mới.

## 12 Boss (v2.0)
- Dữ liệu ở `BOSS` trong `js/config.js` (tên, màu hào quang, máu, sát thương, vàng, tốc độ, kích thước mặc định `w`, kiểu chuyển động `mv`, độ cao bay `z`). Ảnh: `assets1/boss/boss01..12.png` theo thứ tự trong `BOSS`.
- Lịch xuất hiện (mỗi 45 giây một Boss): Slime Vua → Rồng Con → 12 Boss mới từ yếu đến mạnh; sau đó ngẫu nhiên.
- Bay: Đại Bàng Tuyết, Khối Mây Điện, Hồ Ly Lửa, Ma Hỏa Lam, Tinh Vân, Hư Không (có thể lao xuống đánh). Thường: Hổ Lôi Hỏa, Khối Cầu Vồng, Sói Sét Tím, Yêu Lông Trắng, Quỷ Nham Thạch, Băng Vương.
- Chuyển động: hop (nhảy, co giãn, bụi và sóng khi chạm đất) · dash (lao nhanh, để lại bóng mờ) · sway (lắc nặng) · stomp (giậm chân, rung màn hình) · swoop (vỗ cánh) · float (lơ lửng) · phase (mờ ảo, bóng chồng) · void (vòng bóng tối quay).
- Hiệu ứng nổi bật: biểu ngữ "⚠ BOSS · tên", rung màn hình và sóng xung kích khi xuất hiện, hào quang phát sáng + hạt bay lên + tia sáng quay quanh, thanh máu có tên, hiệu ứng nổ lớn khi hạ gục.
- Kích thước mặc định 54–78 px (đều trên 45 px). Chỉnh trong Bảng Mod.

## Bảng Mod (ẩn)
- Mở: bấm/chạm **3 lần liên tiếp** vào avatar khủng long (khung DINO, góc trên trái) khi đang chơi. Nhập mật khẩu (mặc định **111291**, đổi được trong bảng).
- Công tắc **Bật Mod**: TẮT = game mặc định (các tính năng dưới đây bị ẩn và không áp dụng); BẬT = dùng được.
- Tính năng trong Mod: tốc độ **x3, x5** · **Tùy chỉnh hình ảnh** (nền, cây, lá, cỏ) · **đặt/cộng vàng** · **cỡ khủng long (px)** · **cỡ 12 Boss (px)** (bỏ trống = mặc định).
- Lưu ở `S.mod` trong localStorage (mật khẩu được băm, không lưu chữ thô; đây chỉ là khóa che chứ không phải bảo mật thực sự).

## Bảng quái trên màn hình
Góc trên phải, dưới dãy nút cài đặt: nền trong suốt, chữ màu pastel, xếp từ mạnh (máu gốc cao) xuống yếu, Boss có dấu ★. Cập nhật 10 lần/giây (`monPanel()` trong `js/ui.js`).

## Thẻ nâng cấp (v1.9)
- 5 nhóm (tab): **Công** (Sức mạnh, Tốc độ bắn, Đa mục tiêu) · **Thủ** (Sinh lực, Hồi phục, Phòng thủ) · **Phụ trợ** (Tiến hóa, Kinh tế, Hút máu) · **Kỹ năng công** (Lửa Xuyên Phá, Lửa Bùng Nổ, Bão Lửa, Hỏa Ngục Cổ Đại) · **Kỹ năng thủ** (Phượng Hoàng Lửa, Tường Lửa). Mỗi tab hiện đủ thẻ, cùng một kích thước. Chấm xanh trên tab = có thẻ đủ vàng để nâng.
- Mỗi thẻ: nhãn **Lv.**, **giá** (xám + đỏ khi thiếu vàng, MAX / ĐÃ MỞ khi xong), **tên**, **mô tả** và dòng xanh giá trị trước → sau. Thẻ kỹ năng chưa đủ bậc tiến hóa bị khóa kèm ổ khóa.
- **Bấm vào thẻ là nâng cấp.** Thành công: thẻ nảy nhẹ, chớp sáng, vệt sáng quét qua, nhãn Lv phồng lên. Không đủ điều kiện: thẻ rung nhẹ và dòng gợi ý phía dưới báo lý do. Di chuột/Tab vào thẻ: thẻ nhích lên.
- Thêm/đổi thẻ: sửa `CARDS` trong `js/cards.js` (nhóm, màu khung, tên, mô tả). Ảnh giữa thẻ là `assets2/cards/art_<khóa>.png`.
- Màu khung theo chức năng: fire (đỏ cam) · silver (bạc) · shadow (tím tối) · blood (đỏ thẫm) · lotus (sen xanh hồng) · steel (thép xanh) · jade (lục) · bronze (đồng).

## Giao diện Cài đặt (v1.9)
Dùng bộ nút trong `assets2/ui/` (từ Setting.png): loa / loa gạch cho Âm thanh, bánh răng mở Cài đặt, X đóng, mũi tên quay lại, tạm dừng, danh sách cho Đổi nhạc nền. Với chức năng chưa có ảnh riêng (Nhạc nền, Số sát thương, Giảm chuyển động, Tùy chỉnh hình ảnh) dùng `btn_blank.png` (nút đã xóa biểu tượng) + biểu tượng SVG màu nâu; tắt thì nút xám và có vạch đỏ.

## Cân bằng game
Số liệu nằm ở `js/config.js`: CFG (cấu hình), UP (nâng cấp, giá = b × g^cấp), SL (8 loại Slime), SK (kỹ năng), EVO (tiến hóa).
Dữ liệu lưu: localStorage khóa `pds_save_v1` (không đổi so với bản cũ nên không mất tiến trình).

## Cập nhật phiên bản
Service Worker dùng network-first. Mỗi lần phát hành hãy tăng `VERSION` trong `js/config.js` và `CACHE` trong `sw.js` để dọn cache cũ.

## Rương kho báu
Cấu hình trong `CFG` (chestP = 30%/đợt trong chestW = 20 đợt đầu, sau đó giảm chestDec mỗi đợt, tối thiểu chestMin) và bảng thưởng `CHR` (100, 200, 500, 1000, 2000, 5000, x2 vàng hiện có). Người chơi phải chạm vào rương để nhận thưởng; rương chạy tới khủng long mà chưa chạm sẽ bị bỏ lỡ.

## Tùy chỉnh hình ảnh
Bảng Mod > Tùy chỉnh hình ảnh (chỉ khi bật Mod): tải ảnh Nền, Cây, Lá, Nền cỏ; cắt và thu phóng; mỗi loại lưu tối đa 3 ảnh gần nhất (IndexedDB); nhập px để đổi kích thước cây, lá, ô cỏ.

## Đạn lửa
`assets1/fx/fire.png` là atlas 6×4, ô 160px, 24 khung: 0-3 khởi tạo · 4-12 bay (vòng lặp `FLY`) · 13-17 nổ · 18-23 tan biến. Màu lửa đổi theo cấp tiến hóa. Kích thước mặc định 28px.

## Âm thanh
Tiếng bắn dùng `assets1/audio/fire_breath.mp3`, nhạc nền mặc định `assets1/audio/bgm.mp3` (thiếu file thì dùng âm tổng hợp bằng WebAudio). Có thể đổi nhạc nền trong Cài đặt > Đổi nhạc nền.

## Nhật ký v2.0
- Thêm 12 Boss (ảnh riêng, bay/thường, chuyển động và hiệu ứng riêng), biểu ngữ Boss, rung màn hình, sóng xung kích.
- Thêm Bảng Mod ẩn (3 lần chạm avatar + mật khẩu); chuyển vào Mod: x3/x5, Tùy chỉnh hình ảnh, nhập vàng, cỡ khủng long, cỡ 12 Boss. Tắt Mod = game mặc định.
- Thêm bảng thống kê quái trên màn hình (góc trên phải).
- Tách `assets/` thành `assets1/` (nhân vật, quái, môi trường, âm thanh) và `assets2/` (giao diện); bỏ 2 file không dùng (`grass.png`, `rocks.png`). Cập nhật mọi đường dẫn và danh sách cache; `VERSION` = 2.0, cache `pds-v20`.

## Nhật ký v1.9
- Làm mới toàn bộ giao diện nâng cấp (thẻ bài) và Cài đặt; nút chữ cũng đổi sang kiểu đá + cam cho đồng bộ.
- Tách `index.html` (~128KB) thành HTML + 3 CSS + 14 module JS; ảnh khủng long đưa ra `assets/dino/`; JS được định dạng lại dễ đọc.
- Sửa: số phiên bản không khớp (menu/giới thiệu ghi 1.7, README ghi 1.8) nay lấy từ một hằng `VERSION`; Service Worker không còn lưu phản hồi 206 của âm thanh và cache đủ mọi file; README ghi sai tên cache.
- Dọn: bỏ `goFS()` và tùy chọn toàn màn hình đã vô hiệu, hàm `snd()` và `extra()` không dùng, bảng pixel `PX`, cây nâng cấp cũ (`TR`, `ED`), emoji `i:` trong bảng số liệu, kiểm tra `S.set.mus===undefined` thừa, hai file `grass.png` và `rocks.png` không được dùng, font VT323.

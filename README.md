# Pixel Dino Survivor (v1.5 - Đạn Lửa)
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: chỉ gồm HTML/JS thuần.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
git init && git add . && git commit -m "Pixel Dino Survivor v1" && git branch -M main
git remote add origin https://github.com/<tên-bạn>/pixel-dino-survivor.git && git push -u origin main
Sau đó vào Settings > Pages, chọn nhánh main, thư mục root. Mở link HTTPS trên Android Chrome > Menu > Cài đặt ứng dụng.

## Cập nhật phiên bản
Service Worker dùng chiến lược network-first nên sau khi đẩy bản mới, tải lại trang là có nội dung mới (vẫn nên tăng `C='pds-v9'` trong sw.js để dọn cache cũ).

## Cân bằng game
Số liệu nằm ở đầu index.html: CFG (cấu hình), UP (nâng cấp, giá = b × g^cấp), SL (8 loại Slime).
Dữ liệu lưu: localStorage khóa `pds_save_v1`.

## Hình ảnh & font
Thư mục `assets/`: background.jpg (nền), tree.png (cây), grass2.jpg (ô nền cỏ, lặp ngang, mặc định rộng bằng chiều rộng khủng long), leaf.png (đạn lá), chest1-7.png (7 rương kho báu).
Font Montserrat tải từ Google Fonts ở lần mở đầu tiên có mạng, sau đó Service Worker lưu lại để dùng offline.

## Rương kho báu
Cấu hình trong `CFG` (chestP = 30%/đợt trong chestW = 20 đợt đầu, sau đó giảm chestDec mỗi đợt, tối thiểu chestMin) và bảng thưởng `CHR` (100, 200, 500, 1000, 2000, 5000, x2 vàng hiện có). Người chơi phải chạm vào rương để nhận thưởng; rương chạy tới khủng long mà chưa chạm sẽ bị bỏ lỡ.

## Tùy chỉnh hình ảnh
Menu > Cài đặt > Tùy chỉnh hình ảnh: tải ảnh Nền, Cây, Lá, Nền cỏ; cắt và thu phóng; mỗi loại lưu tối đa 3 ảnh gần nhất (IndexedDB, phải xóa bớt mới thêm được); nhập px để đổi kích thước cây, lá, ô cỏ.

## Đạn lửa (v1.5)
Đạn của khủng long là cầu lửa, dùng `assets/fire.png` (atlas 6x4, ô 160px, 24 khung): 0-3 khởi tạo (tia lửa thành cầu lửa) · 4-12 bay (khung 7-9 bị bỏ vì lệch, vòng lặp `FLY`) · 13-17 va chạm nổ · 18-23 tan biến thành hạt sáng. Đuôi lửa và tia lửa nhỏ là hạt sinh bằng code. Âm thanh lửa tổng hợp bằng WebAudio (`R_` trong `AU`).
Hiệu ứng riêng từng kỹ năng: Bão Lửa (loạt cầu vàng + vòng lửa), Lửa Xanh Xuyên Phá (cầu xanh dài, nổ nhỏ), Lửa Bùng Nổ (nổ lớn + sóng xung kích), Phượng Hoàng Lửa (bùng lửa vàng khi hồi sinh), Hỏa Ngục Cổ Đại (cầu đỏ to + vầng lửa quanh khủng long), Tường Lửa (5 ngọn lửa chắn trước khủng long).
Màu lửa đổi theo cấp tiến hóa. Kích thước đạn mặc định 52px (Cài đặt > Tùy chỉnh hình ảnh > Đạn riêng). Nếu tải ảnh riêng, ảnh đó thay cầu lửa; bấm Dùng mặc định để quay lại lửa.
Atlas tạo từ gói `fireball_assets_pack` (chuẩn hóa hướng bay sang phải, thu còn 160px). `grass.png`, `rocks.png`, `leaf.png` vẫn nằm trong assets nhưng chưa dùng.

## Âm thanh phun lửa
Tiếng bắn dùng `assets/fire_breath.mp3` (1,045s), phát từ giây 0, độ dài đoạn phát = min(độ dài file, 1,05 × khoảng cách giữa 2 phát bắn, tối thiểu 0,2s) và mờ dần ở cuối để các phát không chồng nhau. Lửa xanh xuyên phá phát nhanh 1,3x. Nếu file lỗi/chưa tải kịp, game tự dùng âm tổng hợp cũ (0,16s).

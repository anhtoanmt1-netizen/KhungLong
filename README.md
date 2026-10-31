# Pixel Dino Survivor
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: chỉ gồm HTML/JS thuần.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
git init && git add . && git commit -m "Pixel Dino Survivor v1" && git branch -M main
git remote add origin https://github.com/<tên-bạn>/pixel-dino-survivor.git && git push -u origin main
Sau đó vào Settings > Pages, chọn nhánh main, thư mục root. Mở link HTTPS trên Android Chrome > Menu > Cài đặt ứng dụng.

## Cập nhật phiên bản
Service Worker dùng chiến lược network-first nên sau khi đẩy bản mới, tải lại trang là có nội dung mới (vẫn nên tăng `C='pds-v6'` trong sw.js để dọn cache cũ).

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

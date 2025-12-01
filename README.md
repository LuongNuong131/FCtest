# ⚽ Hệ Thống Quản Lý Đội Bóng - Ultra Premium Edition

> Ứng dụng quản lý đội bóng cao cấp với CSV làm database thực sự

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.4-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)

## 🌟 Điểm Nổi Bật

### 💎 Ultra Premium Features

- **🎨 UI/UX Cao Cấp**: Gradient animations, glassmorphism, micro-interactions
- **📊 Real-time Dashboard**: Thống kê live với charts và analytics
- **💾 CSV Database System**: Sử dụng CSV như database thực sự (players.csv + sessions.csv)
- **🔄 Auto-sync**: Tự động đồng bộ giữa UI và CSV files
- **📱 Fully Responsive**: Hoạt động mượt mà trên mọi thiết bị
- **⚡ Performance**: BMI caching, optimized renders, smooth animations
- **🎯 Smart Search & Filter**: Tìm kiếm thông minh với filters
- **📈 Advanced Analytics**: Top performers, position distribution, trends

## 📦 Cài Đặt Nhanh

### 1. Clone & Install

```bash
git clone <repository-url>
cd quan-ly-doi-bong
npm install
```

### 2. Tạo CSV Database Files

#### File 1: `public/players.csv`

```csv
id,name,phone,dob,height_cm,weight_kg,position,jerseyNumber,imageUrl,totalAttendance
p1,Trần Quang Lương,0907987126,2005-01-13,177,85,Midfielder,22,/images/players/player1.jpg,5
p2,Nguyễn Văn An,0901234567,2000-05-20,180,75,Forward,10,https://placehold.co/150,3
p3,Lê Văn Bình,0909876543,1999-12-15,175,70,Defender,5,https://placehold.co/150,7
```

#### File 2: `public/sessions.csv`

```csv
id,date,note,attendeeIds,createdAt
s1,2024-11-10,Đá tập công viên Hoàng Văn Thụ,"p1,p2,p3",2024-11-10T10:00:00.000Z
s2,2024-11-13,Tập luyện kỹ thuật cơ bản,"p1,p2",2024-11-13T14:30:00.000Z
s3,2024-11-15,Đá giao hữu với đội bạn,"p1,p2,p3",2024-11-15T16:00:00.000Z
```

### 3. Chạy Development Server

```bash
npm run dev
```

Truy cập: `http://localhost:5173` 🚀

## 🗂️ Cấu Trúc CSV Database

### 📄 players.csv - Database Cầu Thủ

| Column            | Type              | Required | Description                                        |
| ----------------- | ----------------- | -------- | -------------------------------------------------- |
| `id`              | String            | ✅       | ID unique (vd: p1, p2...)                          |
| `name`            | String            | ✅       | Tên cầu thủ                                        |
| `phone`           | String            | ❌       | Số điện thoại                                      |
| `dob`             | Date (YYYY-MM-DD) | ❌       | Ngày sinh                                          |
| `height_cm`       | Number            | ❌       | Chiều cao (cm)                                     |
| `weight_kg`       | Number            | ❌       | Cân nặng (kg)                                      |
| `position`        | String            | ❌       | Vị trí (Forward, Midfielder, Defender, Goalkeeper) |
| `jerseyNumber`    | Number            | ❌       | Số áo                                              |
| `imageUrl`        | String (URL)      | ❌       | Link ảnh đại diện                                  |
| `totalAttendance` | Number            | ✅       | Tổng số buổi tham gia (auto-update)                |

**Lưu ý quan trọng:**

- File này được **TỰ ĐỘNG CẬP NHẬT** mỗi khi điểm danh
- `totalAttendance` tăng tự động khi cầu thủ check-in
- Sau mỗi lần điểm danh, app sẽ xuất file `players.csv` mới
- **Copy file mới vào `public/` để persist data**

### 📅 sessions.csv - Database Lịch Sử Điểm Danh

| Column        | Type              | Required | Description                              |
| ------------- | ----------------- | -------- | ---------------------------------------- |
| `id`          | String            | ✅       | ID unique (vd: s1, s2...)                |
| `date`        | Date (YYYY-MM-DD) | ✅       | Ngày điểm danh                           |
| `note`        | String            | ❌       | Ghi chú buổi tập                         |
| `attendeeIds` | String (CSV)      | ✅       | Danh sách ID cầu thủ tham gia (p1,p2,p3) |
| `createdAt`   | DateTime (ISO)    | ✅       | Thời gian tạo session                    |

**Workflow:**

1. Tạo buổi điểm danh mới → Lưu vào memory
2. Nhấn nút "Lưu CSV" → Export file `sessions.csv`
3. Copy file vào `public/` để persist
4. Refresh trang → Data load từ CSV

## 🎯 Hướng Dẫn Sử Dụng

### 📊 Dashboard

- **Real-time Stats**: Số cầu thủ, buổi tập, lượt tham gia
- **Top Performers**: 5 cầu thủ chăm chỉ nhất với animations
- **Position Distribution**: Biểu đồ phân bố vị trí
- **Recent Activity**: 5 buổi tập gần nhất
- **Quick Actions**: Truy cập nhanh các chức năng

### 👥 Quản Lý Cầu Thủ

#### Thêm Cầu Thủ Mới

1. Mở file `public/players.csv`
2. Thêm dòng mới:
   ```csv
   p4,Nguyễn Văn C,0912345678,2001-03-20,178,72,Forward,9,https://placehold.co/150,0
   ```
3. Save file
4. Refresh trang web

#### Sửa Thông Tin

1. Edit trực tiếp trong `players.csv`
2. Save & Refresh

#### Xóa Cầu Thủ

1. Xóa dòng trong `players.csv`
2. Save & Refresh

**Pro Tips:**

- Dùng Excel/Google Sheets để edit CSV dễ hơn
- Luôn backup file trước khi sửa
- Đảm bảo format date: `YYYY-MM-DD`
- ID phải unique và không trùng

### 📋 Điểm Danh

#### Tạo Buổi Mới

1. Chọn **Ngày tập**
2. Nhập **Ghi chú** (optional)
3. **Check** các cầu thủ tham gia
4. Nhấn **Lưu Buổi Điểm Danh**

**Kết quả tự động:**

- ✅ `totalAttendance` tăng cho mỗi cầu thủ
- ✅ Xuất `players.csv` mới (copy vào `public/`)
- ✅ Xuất `ThamGia_YYYY-MM-DD.csv` (báo cáo)
- ✅ Lưu session vào memory

#### Persist Lịch Sử

1. Sau khi tạo nhiều sessions
2. Nhấn nút **Lưu CSV** ở phần Lịch Sử
3. Copy file `sessions.csv` vào `public/`
4. Refresh → Lịch sử được load từ CSV

### 📁 Xuất Báo Cáo

#### CSV Reports

- **Danh Sách Cầu Thủ**: UTF-8 BOM, mở đúng trong Excel
- **Lịch Sử Sessions**: Backup toàn bộ attendance
- **Báo Cáo Tham Gia**: Per session, chi tiết từng cầu thủ

#### Excel Reports

- Click **Xuất Excel** ở mỗi session
- File `.xlsx` với styling chuyên nghiệp
- Bao gồm: Header, stats, chi tiết attendance

#### Image Export

- Screenshot toàn bộ lịch sử
- High quality (3x scale)
- Perfect cho sharing

## 🔧 Workflow Hoàn Chỉnh

### Workflow 1: Setup Ban Đầu

```
1. Tạo players.csv với danh sách cầu thủ
2. Tạo sessions.csv trống hoặc với data mẫu
3. Đặt cả 2 file vào public/
4. npm run dev
5. Truy cập app → Data loaded ✅
```

### Workflow 2: Điểm Danh Hàng Ngày

```
1. Vào trang Điểm Danh
2. Chọn ngày + cầu thủ tham gia
3. Lưu → App xuất players.csv mới
4. Copy players.csv mới vào public/
5. Refresh để cập nhật UI
```

### Workflow 3: Backup & Persist Sessions

```
1. Sau X buổi điểm danh
2. Nhấn "Lưu CSV" ở Lịch Sử
3. App xuất sessions.csv
4. Copy vào public/
5. Lịch sử giờ đã persistent ✅
```

### Workflow 4: Restore From Backup

```
1. Copy players.csv cũ vào public/
2. Copy sessions.csv cũ vào public/
3. Refresh app
4. Tất cả data restored ✅
```

## 🎨 Features Cao Cấp

### 🌈 UI/UX Enhancements

- **Gradient Animations**: Blob animations, scale effects
- **Micro-interactions**: Hover effects, smooth transitions
- **Glass Morphism**: Backdrop blur, transparency
- **Loading States**: Skeleton screens, spinners
- **Success Toasts**: Animated notifications
- **Empty States**: Beautiful placeholders

### ⚡ Performance Optimizations

- **BMI Caching**: Calculate once, cache results
- **Lazy Loading**: Load images on demand
- **Debounced Search**: Smooth filtering
- **Optimized Renders**: Minimal re-renders
- **Code Splitting**: Fast initial load

### 📱 Responsive Design

- **Mobile First**: Touch-friendly UI
- **Tablet Optimized**: 2-column layouts
- **Desktop Power**: Full features, multi-column
- **Adaptive Navigation**: Hamburger on mobile

## 🐛 Troubleshooting

### ❌ File không load được

**Nguyên nhân**: File không ở đúng vị trí
**Giải pháp**:

```bash
# Kiểm tra file tồn tại
ls public/players.csv
ls public/sessions.csv

# Restart dev server
npm run dev
```

### ❌ Tiếng Việt bị lỗi trong Excel

**Nguyên nhân**: Excel không nhận UTF-8
**Giải pháp**:

- File CSV đã có UTF-8 BOM
- Mở bằng Excel sẽ hiển thị đúng
- Hoặc import thủ công: Data → From Text

### ❌ Attendance không tăng

**Nguyên nhân**: Chưa copy file mới vào public/
**Giải pháp**:

1. Sau khi điểm danh, app xuất `players.csv`
2. Copy file này vào `public/`
3. Refresh trang

### ❌ Sessions mất sau refresh

**Nguyên nhân**: Chưa persist vào CSV
**Giải pháp**:

1. Nhấn "Lưu CSV" ở Lịch Sử
2. Copy `sessions.csv` vào `public/`
3. Refresh

## 🚀 Production Deployment

### Build cho Production

```bash
npm run build
```

### Deploy lên Hosting

```bash
# Output: dist/
# Upload toàn bộ dist/ lên hosting
# Đảm bảo players.csv và sessions.csv ở root
```

### Update Data trên Production

```bash
# Option 1: Re-deploy với CSV mới
1. Update CSV locally
2. Build & deploy

# Option 2: Direct file update
1. FTP vào server
2. Replace players.csv & sessions.csv
3. Clear cache
```

## 📈 Roadmap

- [ ] Backend API integration
- [ ] Real-time collaboration
- [ ] Push notifications
- [ ] Advanced analytics charts
- [ ] PDF report generation
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📄 License

MIT License - Free to use and modify

## 💖 Credits

**Made with:**

- ❤️ Passion
- ⚽ Football spirit
- ☕ Lots of coffee
- 🎨 Design love

---

**⭐ Nếu thấy hữu ích, đừng quên star repo này!**

**📧 Support: tranquangluong06@gmail.com**
**🌐 GitHub: https://github.com/LuongNuong131**

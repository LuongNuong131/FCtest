# 🚀 Quick Start - Bắt Đầu Trong 5 Phút

## Bước 1: Install Dependencies (1 phút)

```bash
npm install
```

## Bước 2: Tạo File CSV (2 phút)

### Tạo `public/players.csv`:

```csv
id,name,phone,dob,height_cm,weight_kg,position,jerseyNumber,imageUrl,totalAttendance
p1,Trần Quang Lương,0907987126,2005-01-13,177,85,Midfielder,22,https://placehold.co/150,0
p2,Nguyễn Văn An,0901234567,2000-05-20,180,75,Forward,10,https://placehold.co/150,0
p3,Lê Văn Bình,0909876543,1999-12-15,175,70,Defender,5,https://placehold.co/150,0
```

### Tạo `public/sessions.csv`:

```csv
id,date,note,attendeeIds,createdAt
s1,2024-11-10,Đá tập công viên,"p1,p2",2024-11-10T10:00:00.000Z
```

## Bước 3: Chạy App (1 phút)

```bash
npm run dev
```

## Bước 4: Truy Cập (1 phút)

Mở browser: `http://localhost:5173`

## 🎉 Done!

### Bạn có thể:

- ✅ Xem dashboard với stats
- ✅ Xem danh sách cầu thủ
- ✅ Tạo buổi điểm danh mới
- ✅ Xuất CSV/Excel reports

### Next Steps:

1. **Thêm cầu thủ mới**: Edit `players.csv` → Refresh
2. **Điểm danh**: Vào trang Attendance → Chọn cầu thủ → Save
3. **Backup**: Sau khi điểm danh, copy file CSV mới vào `public/`

## 💡 Pro Tips

### Tip 1: Use Excel để Edit CSV

```
1. Open players.csv trong Excel
2. Edit dễ dàng hơn
3. Save As → CSV UTF-8
4. Copy vào public/
```

### Tip 2: Backup Thường Xuyên

```bash
# Tạo folder backups
mkdir backups

# Copy CSV vào backups
cp public/players.csv backups/players_$(date +%Y%m%d).csv
cp public/sessions.csv backups/sessions_$(date +%Y%m%d).csv
```

### Tip 3: Quick Data Reset

```bash
# Reset về trạng thái ban đầu
git checkout public/players.csv
git checkout public/sessions.csv
```

## 🆘 Quick Fixes

### Lỗi: Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Port already in use

```bash
# Kill process on port 5173
kill -9 $(lsof -t -i:5173)
npm run dev
```

### Lỗi: CSV không load

```bash
# Check file path
ls -la public/

# Restart server
npm run dev
```

## 📞 Cần Giúp Đỡ?

- 📖 Đọc [README.md](README.md) đầy đủ
- 🐛 Tạo issue trên GitHub
- 💬 Liên hệ: [tranquangluong06@gmail.com](https://github.com/LuongNuong131)

**Happy Coding! ⚽💻**

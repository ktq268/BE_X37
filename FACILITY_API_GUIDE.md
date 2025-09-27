# 🏢 Facility Management API Guide

## 📋 Tổng quan

API quản lý cơ sở cho phép thực hiện các thao tác CRUD (Create, Read, Update, Delete) trên dữ liệu cơ sở với các tính năng:

- Phân loại theo khu vực (Miền Bắc, Miền Trung, Miền Nam)
- Tìm kiếm full-text
- Phân trang
- Lọc theo trạng thái
- Xác thực JWT cho các thao tác chỉnh sửa

## 🚀 Cài đặt và Import dữ liệu

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment variables

Tạo file `.env` với nội dung:

```
MONGO_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 3. Import dữ liệu mẫu

```bash
node import-facilities.js
```

### 4. Chạy server

```bash
npm run dev
```

### 5. Test API (tùy chọn)

```bash
node test-facilities-api.js
```

## 📊 Dữ liệu mẫu

File `mock-facilities.json` chứa 10 cơ sở mẫu:

- **Miền Bắc**: Hà Nội, Hải Phòng
- **Miền Trung**: Đà Nẵng, Huế, Nha Trang
- **Miền Nam**: TP.HCM, Cần Thơ, Vũng Tàu, Đà Lạt, Phú Quốc

## 🔗 API Endpoints

### 1. Lấy danh sách cơ sở

```
GET /api/facilities
```

**Query Parameters:**

- `region`: Lọc theo khu vực (Miền Bắc, Miền Trung, Miền Nam)
- `status`: Lọc theo trạng thái (active, inactive, maintenance)
- `page`: Số trang (mặc định: 1)
- `limit`: Số item mỗi trang (mặc định: 10)

**Ví dụ:**

```bash
GET /api/facilities?region=Miền Bắc&status=active&page=1&limit=5
```

### 2. Tìm kiếm cơ sở

```
GET /api/facilities/search
```

**Query Parameters:**

- `q`: Từ khóa tìm kiếm
- `region`: Lọc theo khu vực
- `page`: Số trang
- `limit`: Số item mỗi trang

**Ví dụ:**

```bash
GET /api/facilities/search?q=Hà Nội&region=Miền Bắc
```

### 3. Lấy thông tin cơ sở theo ID

```
GET /api/facilities/:id
```

### 4. Tạo cơ sở mới (Yêu cầu xác thực)

```
POST /api/facilities
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Tên cơ sở",
  "region": "Miền Bắc",
  "address": "Địa chỉ",
  "phone": "Số điện thoại",
  "email": "email@example.com",
  "manager": "Tên người quản lý",
  "capacity": 100,
  "description": "Mô tả",
  "coordinates": {
    "latitude": 21.0285,
    "longitude": 105.8542
  },
  "facilities": ["WiFi", "Parking", "AC"],
  "operatingHours": {
    "open": "08:00",
    "close": "22:00"
  },
  "images": ["image1.jpg", "image2.jpg"]
}
```

### 5. Cập nhật cơ sở (Yêu cầu xác thực)

```
PUT /api/facilities/:id
Authorization: Bearer <token>
```

### 6. Xóa cơ sở (Yêu cầu xác thực)

```
DELETE /api/facilities/:id
Authorization: Bearer <token>
```

## 🔐 Xác thực

Để sử dụng các API tạo, sửa, xóa cơ sở, bạn cần:

1. **Đăng ký tài khoản:**

```bash
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

2. **Đăng nhập để lấy token:**

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

3. **Sử dụng token trong header:**

```bash
Authorization: Bearer <your_jwt_token>
```

## 📝 Response Format

Tất cả API đều trả về response theo format:

```json
{
  "success": true/false,
  "message": "Thông báo",
  "data": {}, // Dữ liệu trả về
  "pagination": { // Chỉ có khi có phân trang
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## 🗂️ Cấu trúc dữ liệu Facility

```json
{
  "_id": "ObjectId",
  "name": "Tên cơ sở",
  "region": "Miền Bắc|Miền Trung|Miền Nam",
  "address": "Địa chỉ",
  "phone": "Số điện thoại",
  "email": "Email (unique)",
  "manager": "Tên người quản lý",
  "capacity": "Sức chứa (số)",
  "description": "Mô tả",
  "status": "active|inactive|maintenance",
  "coordinates": {
    "latitude": "Vĩ độ",
    "longitude": "Kinh độ"
  },
  "facilities": ["Danh sách tiện ích"],
  "operatingHours": {
    "open": "Giờ mở cửa",
    "close": "Giờ đóng cửa"
  },
  "images": ["Danh sách hình ảnh"],
  "createdAt": "Ngày tạo",
  "updatedAt": "Ngày cập nhật"
}
```

## 🧪 Testing

Sử dụng file `test-facilities-api.js` để test các API:

```bash
node test-facilities-api.js
```

Hoặc sử dụng Postman/Insomnia với các endpoint trên.

## 📈 Tính năng nâng cao

- **Full-text search**: Tìm kiếm theo tên, địa chỉ, mô tả
- **Pagination**: Phân trang kết quả
- **Filtering**: Lọc theo khu vực, trạng thái
- **Indexing**: Tối ưu hiệu suất query
- **Validation**: Kiểm tra dữ liệu đầu vào
- **Error handling**: Xử lý lỗi chi tiết

## 🔧 Troubleshooting

1. **Lỗi kết nối MongoDB**: Kiểm tra MONGO_URI trong .env
2. **Lỗi JWT**: Kiểm tra JWT_SECRET trong .env
3. **Lỗi validation**: Kiểm tra dữ liệu đầu vào theo schema
4. **Lỗi 404**: Kiểm tra ID cơ sở có tồn tại không

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:

- Console logs của server
- Network tab trong browser
- MongoDB connection status
- JWT token validity

## Hệ thống đặt bàn nhà hàng (Express + MongoDB)

Tài liệu mô tả cấu trúc dữ liệu, các file chính, API, ví dụ payload/response và luồng người dùng.

Tất cả endpoint đều có prefix: `/api`.

### 1) Bảng dữ liệu (MongoDB) và mục đích sử dụng

- Restaurant: Thông tin nhà hàng

  - Thuộc tính chính: `name`, `region(north|central|south)`, `address`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
  - File: `src/models/RestaurantModel.js`

- Table: Danh sách bàn của từng nhà hàng

  - Thuộc tính chính: `restaurantId(ref Restaurant)`, `tableNumber`, `capacity`, `type(vip|normal)`, `createdBy`, `updatedBy`
  - Unique index: `(restaurantId, tableNumber)`
  - File: `src/models/TableModel.js`

- Booking: Đơn đặt bàn của khách

  - Thuộc tính chính: `restaurantId`, `tableId`, `date(YYYY-MM-DD)`, `time(HH:mm)`, `adults`, `children`, `note?`, `customerName`, `customerPhone`, `createdBy`, `updatedBy`
  - Unique index: `(restaurantId, tableId, date, time)` để tránh trùng giờ
  - File: `src/models/BookingModel.js`

- TableBlock: Khóa bàn tạm thời (nội bộ)
  - Thuộc tính chính: `restaurantId`, `tableId`, `date`, `time`, `reason`, `createdBy`, `updatedBy`
  - Unique index: `(restaurantId, tableId, date, time)`
  - File: `src/models/TableBlockModel.js`

### 2) Các file chính và vai trò

- Kết nối DB: `config/db.js`
- Khởi tạo server: `index.js` (mount router dưới `/api`)
- Middleware xác thực JWT: `src/middlewares/authMiddleware.js` (đọc header `x-auth-token`)
- Middleware validate với Yup: `src/middlewares/validateMiddleware.js`
- Schema Yup: `src/validators/schemas.js`
- Controllers:
  - `src/controllers/restaurantController.js` (CRUD nhà hàng, GET theo `region`)
  - `src/controllers/tableController.js` (CRUD bàn)
  - `src/controllers/bookingController.js` (tạo booking, chặn nếu đã đặt/khóa)
  - `src/controllers/tableBlockController.js` (tạo/xóa khóa bàn)
  - `src/controllers/availabilityController.js` (tìm bàn trống)
- Routers:
  - `src/routes/index.js` (tập hợp route)
  - `src/routes/restaurantRouter.js`
  - `src/routes/tableRouter.js`
  - `src/routes/bookingRouter.js`
  - `src/routes/tableBlockRouter.js`
  - `src/routes/availableRouter.js`

### 3) Môi trường & chạy dự án

- Biến môi trường: `MONGO_URI`, `JWT_SECRET`

```bash
npm install
npm run dev
# http://localhost:3000
```

### 4) API và ví dụ

1. Khách hàng

- GET `/api/restaurants?region=north`

  - Mục đích: Liệt kê nhà hàng theo vùng.
  - Response mẫu:

  ```json
  [
    {
      "_id": "<RID>",
      "name": "Nhà hàng A",
      "region": "north",
      "address": "..."
    }
  ]
  ```

- GET `/api/available-tables`

  - Query: `region`(bắt buộc), `restaurantId`(tùy chọn), `date`(YYYY-MM-DD), `time`(HH:mm), `adults`(mặc định 0), `children`(mặc định 0)
  - Mục đích: Tìm bàn còn trống (lọc theo capacity và loại bỏ bàn đã đặt/khóa cùng thời điểm).
  - Response mẫu:

  ```json
  {
    "region": "north",
    "date": "2025-09-29",
    "time": "19:00",
    "availableRestaurants": [
      {
        "restaurantId": "<RID>",
        "restaurantName": "Nhà hàng A",
        "tables": [{ "tableId": "<TID>", "tableNumber": 1, "capacity": 4 }]
      }
    ]
  }
  ```

- POST `/api/bookings`
  - Body:
  ```json
  {
    "restaurantId": "<RID>",
    "tableId": "<TID>",
    "date": "2025-09-29",
    "time": "19:00",
    "adults": 2,
    "children": 1,
    "note": "Sinh nhật",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0900000000"
  }
  ```
  - Mục đích: Tạo đặt bàn nếu chưa bị đặt/khóa cùng `date+time`.
  - Response thành công: trả về object booking vừa tạo.

2. Nội bộ (Staff) — yêu cầu header `x-auth-token: <JWT>`

- POST `/api/restaurants` (validate body, yêu cầu auth)
  - Tạo nhà hàng mới. Tự động ghi `createdBy`, `updatedBy`.
- PUT `/api/restaurants/:id` (validate body, yêu cầu auth)
  - Cập nhật thông tin nhà hàng. Tự động ghi `updatedBy`.
- DELETE `/api/restaurants/:id` (yêu cầu auth)

  - Xóa nhà hàng.

- POST `/api/tables` (validate body, yêu cầu auth)
  - Tạo bàn mới cho nhà hàng. Ghi `createdBy`, `updatedBy`.
- PUT `/api/tables/:id` (validate body, yêu cầu auth)
  - Cập nhật bàn. Ghi `updatedBy`.
- DELETE `/api/tables/:id` (yêu cầu auth)

  - Xóa bàn.

- POST `/api/table-blocks` (validate body, yêu cầu auth)
  - Khóa bàn tại thời điểm cụ thể. Ghi `createdBy`, `updatedBy`.
- DELETE `/api/table-blocks/:id` (yêu cầu auth)
  - Mở khóa (xóa block).

### 5) Luồng người dùng

- Khách hàng:

  1. Chọn vùng/nhà hàng + thời gian: gọi `GET /api/available-tables` để xem bàn trống.
  2. Chọn bàn phù hợp và gửi `POST /api/bookings` để đặt bàn.

- Nhân viên (Staff):
  1. Quản trị nhà hàng và bàn: dùng các API `POST/PUT/DELETE` cho `/restaurants` và `/tables` (có `auth`).
  2. Khóa bàn trong các trường hợp bảo trì/sự cố: `POST /api/table-blocks` và gỡ khóa với `DELETE /api/table-blocks/:id` (có `auth`).

### 6) Ghi chú thêm

- Validate: sử dụng Yup (`src/middlewares/validateMiddleware.js`, `src/validators/schemas.js`).
- Audit: các model có `createdBy`, `updatedBy` và controllers gán tự động dựa trên `req.user.id` khi tạo/cập nhật (các route staff đã được bảo vệ bằng `auth`).
- Dữ liệu mẫu: `test.restaurants.json`, `test.tables.json` để import nhanh khi thử nghiệm.

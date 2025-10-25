# Hướng dẫn FE kết nối API Invoices

Tệp này mô tả các endpoint invoice đã có trên backend và ví dụ mã để FE (web/mobile) gọi, tải file và gửi e-bill. Nội dung bằng tiếng Việt, tập trung vào cách dùng nhanh, mô tả lỗi phổ biến và các gợi ý UX.

Base path
- Giả sử router invoices được mount tại `/api` nên base endpoint: `/api/invoices`.

Endpoints chính

1) Tạo invoice từ order
- Method: POST
- Path: `/api/invoices`
- Body: `{ "orderId": "<ORDER_ID>" }`
- Success: 201 (invoice object) — nếu invoice đã tồn tại cho order trả 200 với invoice hiện có
- Lỗi: 400 (thiếu orderId), 404 (order không tồn tại), 500

2) Lấy chi tiết invoice
- Method: GET
- Path: `/api/invoices/:id`
- Success: 200 (invoice object)

3) Export hoá đơn (download HTML)
- Method: GET
- Path: `/api/invoices/:id/export`
- Response: file HTML (attachment). FE dùng để tải hoặc mở.

4) Gửi e-bill (email)
- Method: POST
- Path: `/api/invoices/:id/send`
- Body: `{ "to": "customer@example.com" }` (optional nếu invoice.emailTo đã có)
- Success: 200 { message: 'E-bill sent', invoiceId }
- Side-effect: invoice.status -> "sent", sentAt và emailTo được cập nhật

5) Danh sách invoices (staff)
- Method: GET
- Path: `/api/invoices`
- Query: `page`, `limit`, `q` (search invoiceNumber)
- Bảo vệ: route này được bảo vệ bằng middleware staffAuthMiddleware. FE cần token staff.

Authentication
- Nếu hệ thống dùng JWT, gửi header `Authorization: Bearer <token>` cho mọi request tới endpoints bảo mật (nên gửi cho tất cả request để an toàn).

Ví dụ FE (vanilla fetch)

Tạo invoice từ order
```javascript
async function createInvoice(orderId, token) {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ orderId })
  });
  if (!res.ok) throw new Error('Create invoice failed: ' + res.status);
  return res.json();
}
```

Lấy chi tiết invoice
```javascript
async function getInvoice(id, token) {
  const res = await fetch(`/api/invoices/${id}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) throw new Error('Get invoice failed: ' + res.status);
  return res.json();
}
```

Tải hoá đơn (download HTML) — dùng fetch vì header Authorization
```javascript
async function downloadInvoiceHtml(id, filename, token) {
  const res = await fetch(`/api/invoices/${id}/export`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) throw new Error('Download failed: ' + res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

Gửi e-bill
```javascript
async function sendEbill(invoiceId, toEmail, token) {
  const res = await fetch(`/api/invoices/${invoiceId}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ to: toEmail })
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message:'Send failed'}));
    throw new Error(err.message || 'Send e-bill failed');
  }
  return res.json();
}
```

Ví dụ (axios)
```javascript
import axios from 'axios';
const api = (token) => axios.create({ baseURL: '/api', headers: { Authorization: 'Bearer '+token }});

// list invoices (staff)
async function listInvoices(token, {page=1, limit=20, q=''}){
  const res = await api(token).get('/invoices', { params: { page, limit, q } });
  return res.data; // { page, limit, total, invoices }
}
```

UX và best-practices
- Trạng thái loading + disable button khi đang tạo/gửi.
- Sau gửi e-bill, cập nhật giao diện (show sentAt, emailTo) bằng cách re-fetch invoice detail.
- Hiển thị lỗi rõ ràng (400 -> show validation message; 404 -> 'Không tìm thấy hoá đơn'; 500 -> 'Lỗi server, thử lại').
- Tránh gửi e-bill liên tục: kiểm tra `invoice.status === 'sent'` và hỏi người dùng trước khi gửi lại (resend).

Gợi ý triển khai PDF
- Hiện backend trả HTML để giữ nhẹ. Nếu muốn PDF server-side, backend cần thêm lib (puppeteer / html-pdf) và cung cấp route `/api/invoices/:id/export.pdf` để FE tải PDF trực tiếp.

Nâng cao (nên làm nếu hệ thống thật)
- Queue gửi email để retry (Bull/bee) — giảm lỗi khi SMTP flaky.
- Làm audit/log gửi email (ai đã gửi/những lần gửi) — quan trọng cho hoá đơn.
- Thêm quyền kiểm soát: chỉ staff hoặc owner order mới có thể tạo invoice.

Kiểm thử nhanh cho FE
- Tạo order test, lấy orderId.
- POST /api/invoices → nhận invoiceId.
- GET /api/invoices/:id → kiểm tra invoice data.
- GET /api/invoices/:id/export → tải file, mở, kiểm tra nội dung.
- POST /api/invoices/:id/send → gửi email (kiểm tra inbox). Nếu SMTP chưa cấu hình, endpoint sẽ trả lỗi 500.

Troubleshooting
- Nếu export trả 401/403: kiểm tra header Authorization.
- Nếu send trả lỗi SMTP: kiểm tra biến môi trường `SMTP_USER`/`SMTP_PASS` trên backend và xem logs server (hay bật verifyTransporter để debug).

Liên hệ
- Nếu cần, tôi có thể mở rộng để:
  - tạo PDF server-side và trả về PDF,
  - thêm middleware auth chặt hơn,
  - viết ngay React hook/component mẫu (List / Detail / Send flow).

---
Tệp này giúp FE nhanh kết nối và test các chức năng hoá đơn. Muốn mình bổ sung ví dụ React hook hoặc hỗ trợ thêm endpoint PDF không? 

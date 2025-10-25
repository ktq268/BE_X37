import Invoice from "../models/InvoiceModel.js";
import Order from "../models/OrderModel.js";
import { sendEmail } from "../services/mailService.js";
import pdf from "html-pdf";

// tiny helper to generate a human invoice number
const genInvoiceNumber = async () => {
  // simple timestamp-based number to avoid extra packages
  return `INV-${Date.now()}`;
};

export const createInvoiceFromOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // prevent duplicate invoice for same order
    const existing = await Invoice.findOne({ orderId: order._id });
    if (existing) return res.status(200).json(existing);

    const invoiceNumber = await genInvoiceNumber();

    const items = order.items.map((i) => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      total: i.total,
    }));

    const invoice = await Invoice.create({
      orderId: order._id,
      invoiceNumber,
      items,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      status: "issued",
      issuedAt: new Date(),
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error("createInvoiceFromOrder error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate("orderId");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    console.error("getInvoice error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Export invoice as simple HTML (downloadable). This avoids adding PDF libs.
export const exportInvoiceHtml = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate("orderId");
    if (!invoice) return res.status(404).send("Invoice not found");

    const html = buildInvoiceHtml(invoice);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.html"`);
    res.send(html);
  } catch (err) {
    console.error("exportInvoiceHtml error:", err.message);
    res.status(500).send("Server error");
  }
};

export const exportInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate("orderId");
    if (!invoice) return res.status(404).send("Invoice not found");

    const html = buildInvoiceHtml(invoice);

    const options = {
      format: "A5",
      orientation: "portrait",
      border: "8mm",
    };

    pdf.create(html, options).toStream((err, stream) => {
      if (err) {
        console.error("PDF generation error:", err);
        return res.status(500).send("Error generating PDF");
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${invoice.invoiceNumber}.pdf"`
      );
      stream.pipe(res);
    });
  } catch (err) {
    console.error("exportInvoicePdf error:", err.message);
    res.status(500).send("Server error");
  }
};

const buildInvoiceHtml = (invoice) => {
  const style = `
  <style>
    body { font-family: Arial, sans-serif; color: #333; font-size: 13px; margin: 20px; }
    h1, h3 { color: #2a2a2a; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; }
    .totals { margin-top: 10px; }
    .totals p { text-align: right; margin: 2px 0; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #555; }
  </style>`;

  const rows = invoice.items.map(
    (it) =>
      `<tr>
        <td>${escapeHtml(it.name)}</td>
        <td>${it.price.toLocaleString()}đ</td>
        <td>${it.quantity}</td>
        <td>${it.total.toLocaleString()}đ</td>
      </tr>`
  );

  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title>${style}</head>
  <body>
    <h1>HÓA ĐƠN THANH TOÁN</h1>
    <h3>${invoice.invoiceNumber}</h3>
    <p><b>Ngày in:</b> ${new Date(invoice.issuedAt).toLocaleString("vi-VN")}</p>
    <p><b>Mã đơn hàng:</b> ${invoice.orderId?._id || ""}</p>
    <p><b>Khách hàng:</b> ${invoice.orderId?.customerName || "Khách lẻ"}</p>

    <table>
      <thead>
        <tr><th>Tên món</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>

    <div class="totals">
      <p><b>Tạm tính:</b> ${invoice.subtotal.toLocaleString()}đ</p>
      <p><b>Giảm giá:</b> ${invoice.discount.toLocaleString()}đ</p>
      <p><b>Thuế:</b> ${invoice.tax.toLocaleString()}đ</p>
      <p><b>Tổng cộng:</b> <b>${invoice.total.toLocaleString()}đ</b></p>
    </div>

    <div class="footer">
      <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
      <p>Maison de Flavors</p>
    </div>
  </body></html>`;
};


const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

// send e-bill via email: attach HTML invoice and mark invoice.sentAt
export const sendEbill = async (req, res) => {
  try {
    const { id } = req.params; // invoice id
    const { to } = req.body;

    const invoice = await Invoice.findById(id).populate("orderId");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const recipient = to || invoice.emailTo;
    if (!recipient) return res.status(400).json({ message: "Recipient email required" });

    const html = buildInvoiceHtml(invoice);

    await sendEmail({
      to: recipient,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: `Invoice ${invoice.invoiceNumber} attached. Total: ${invoice.total}`,
      html,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.html`,
          content: html,
          contentType: "text/html",
        },
      ],
    });

    invoice.status = "sent";
    invoice.sentAt = new Date();
    invoice.emailTo = recipient;
    await invoice.save();

    res.json({ message: "E-bill sent", invoiceId: invoice._id });
  } catch (err) {
    console.error("sendEbill error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// staff: list invoices
export const staffListInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (q) filter.invoiceNumber = { $regex: q, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ]);

    res.json({ page: Number(page), limit: Number(limit), total, invoices });
  } catch (err) {
    console.error("staffListInvoices error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  createInvoiceFromOrder,
  getInvoice,
  exportInvoiceHtml,
  sendEbill,
  staffListInvoices,
};

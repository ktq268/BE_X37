import nodemailer from "nodemailer";

// Khởi tạo transporter linh hoạt theo biến môi trường
let cachedTransporter = null;

const buildTransporter = () => {
  // Ưu tiên URL chuẩn SMTP nếu có
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }

  // Cấu hình theo host/port nếu khai báo
  if (process.env.MAIL_HOST) {
    const port = Number(process.env.MAIL_PORT || 587);
    const secure = process.env.MAIL_SECURE === "true" || port === 465;

    const auth =
      process.env.MAIL_USER && process.env.MAIL_PASS
        ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
        : undefined;

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure,
      auth,
    });
  }

  // Fallback Gmail nếu có SMTP_USER/PASS
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Không có cấu hình hợp lệ
  return null;
};

export const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const transporter = buildTransporter();
  if (!transporter) {
    console.warn(
      "[mail] transport not configured. Please set SMTP_URL or MAIL_HOST/PORT/USER/PASS or SMTP_USER/SMTP_PASS."
    );
    return null;
  }

  try {
    await transporter.verify();
    cachedTransporter = transporter;
    return cachedTransporter;
  } catch (err) {
    console.error("[mail] transporter verify failed:", err.message);
    // Vẫn cache để thử gửi; nhiều server không hỗ trợ verify
    cachedTransporter = transporter;
    return cachedTransporter;
  }
};

const fromIdentity =
  process.env.MAIL_FROM || '"Maison de Flavor" <noreply@restaurant.com>';

const buildTextLines = (lines) => lines.filter(Boolean).join("\n");

const buildCommonInfo = ({ customerName, date, time, tableNumber, guestCount }) =>
  buildTextLines([
    `Xin chào ${customerName},`,
    "",
    `- Ngày: ${date}`,
    `- Giờ: ${time}`,
    `- Bàn: ${tableNumber}`,
    `- Số khách: ${guestCount}`,
    "",
    "Trân trọng.",
    "[Maison de Flavor]",
  ]);

// Gửi mail tiện ích chung
export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const transporter = await getTransporter();
  if (!transporter) {
    throw new Error("Email service not configured");
  }
  const mailOptions = {
    from: fromIdentity,
    to,
    subject,
    text,
    html,
    attachments,
  };
  return transporter.sendMail(mailOptions);
};

// Gửi mail theo trạng thái booking
export const sendConfirmationEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
  const transporter = await getTransporter();
  if (!transporter) throw new Error("Email service not configured");

  const mailOptions = {
    from: fromIdentity,
    to,
    subject: "Xác nhận đặt bàn",
    text: buildTextLines([
      `Xin chào ${customerName},`,
      "",
      "Yêu cầu đặt bàn của Quý khách đã được xác nhận:",
      `- Ngày: ${date}`,
      `- Giờ: ${time}`,
      `- Bàn: ${tableNumber}`,
      `- Số khách: ${guestCount}`,
      "",
      "Chúng tôi rất hân hạnh được phục vụ Quý khách.",
      "",
      "Trân trọng.",
      "[Maison de Flavor]",
    ]),
  };
  return transporter.sendMail(mailOptions);
};

export const sendCancelEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
  const transporter = await getTransporter();
  if (!transporter) throw new Error("Email service not configured");

  const mailOptions = {
    from: fromIdentity,
    to,
    subject: "Hủy đặt bàn",
    text: buildTextLines([
      `Xin chào ${customerName},`,
      "",
      "Rất tiếc, yêu cầu đặt bàn của Quý khách đã bị từ chối trong khung giờ đã chọn.",
      `- Ngày: ${date}`,
      `- Giờ: ${time}`,
      `- Bàn: ${tableNumber}`,
      `- Số khách: ${guestCount}`,
      "",
      "Rất mong Quý khách thông cảm. Xin vui lòng chọn khung giờ khác hoặc liên hệ để được hỗ trợ.",
      "",
      "Trân trọng.",
      "[Maison de Flavor]",
    ]),
  };
  return transporter.sendMail(mailOptions);
};

export const sendPendingEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
  const transporter = await getTransporter();
  if (!transporter) throw new Error("Email service not configured");

  const mailOptions = {
    from: fromIdentity,
    to,
    subject: "Tiếp nhận yêu cầu đặt bàn",
    text: buildTextLines([
      `Xin chào ${customerName},`,
      "",
      "Chúng tôi đã tiếp nhận yêu cầu đặt bàn của Quý khách và đang xử lý:",
      `- Ngày: ${date}`,
      `- Giờ: ${time}`,
      `- Bàn: ${tableNumber}`,
      `- Số khách: ${guestCount}`,
      "",
      "Chúng tôi sẽ sớm phản hồi xác nhận hoặc đề xuất phương án thay thế.",
      "",
      "Trân trọng.",
      "[Maison de Flavor]",
    ]),
  };
  return transporter.sendMail(mailOptions);
};

export const sendCompletedEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
  const transporter = await getTransporter();
  if (!transporter) throw new Error("Email service not configured");

  const mailOptions = {
    from: fromIdentity,
    to,
    subject: "Cảm ơn Quý khách",
    text: buildTextLines([
      `Xin chào ${customerName},`,
      "",
      "Cảm ơn Quý khách đã dùng bữa tại nhà hàng chúng tôi. Rất mong được phục vụ Quý khách trong lần tới!",
      `- Ngày: ${date}`,
      `- Giờ: ${time}`,
      `- Bàn: ${tableNumber}`,
      `- Số khách: ${guestCount}`,
      "",
      "Trân trọng.",
      "[Maison de Flavor]",
    ]),
  };
  return transporter.sendMail(mailOptions);
};
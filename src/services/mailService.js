import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error("[mail] transporter verify failed:", err.message);
    return false;
  }
};

const fromIdentity = '"Maison de Flavor" <noreply@restaurant.com>';

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

export const sendConfirmationEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
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
    ])
  };
  return transporter.sendMail(mailOptions);
};

export const sendCancelEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
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
    ])
  };
  return transporter.sendMail(mailOptions);
};

export const sendPendingEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
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
    ])
  };
  return transporter.sendMail(mailOptions);
};

export const sendCompletedEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
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
    ])
  };
  return transporter.sendMail(mailOptions);
};
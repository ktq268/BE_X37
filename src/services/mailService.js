import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendConfirmationEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
  const mailOptions = {
    from: '"5-Star Restaurant" <noreply@restaurant.com>',
    to,
    subject: "Xác nhận đặt bàn",
    text: `Xin chào ${customerName},\n\nBạn đã đặt bàn thành công:\n- Ngày: ${date}\n- Giờ: ${time}\n- Bàn: ${tableNumber}\n- Số khách: ${guestCount}\n\nChúng tôi rất hân hạnh được phục vụ bạn.\n\nTrân trọng.`
  };
  return transporter.sendMail(mailOptions);
};
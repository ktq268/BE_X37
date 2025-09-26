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
    from: '"Maison de Flavor" <noreply@restaurant.com>',
    to,
    subject: "Xác nhận đặt bàn",
    text: `Xin chào ${customerName},\n\nBạn đã đặt bàn thành công:\n- Ngày: ${date}\n- Giờ: ${time}\n- Bàn: ${tableNumber}\n- Số khách: ${guestCount}\n\nChúng tôi rất hân hạnh được phục vụ bạn.\n\nTrân trọng.\n[Maison de Flavor]`
  };
  return transporter.sendMail(mailOptions);
};

export const sendCancelEmail = async (to, { customerName, date, time, tableNumber, guestCount }) => {
  const mailOptions = {
    from: '"Maison de Flavor" <noreply@restaurant.com>',
    to,
    subject: "Hủy đặt bàn",
    text: `Xin chào ${customerName},\n\nChúng tôi rất tiếc phải thông báo rằng yêu cầu hủy đặt bàn của Quý khách không thể được tiếp nhận vào thời gian này vì toàn bộ bàn trong khung giờ trên đã được đặt kín.\n\n- Ngày: ${date}\n- Giờ: ${time}\n- Bàn: ${tableNumber}\n- Số khách: ${guestCount}\n\nRất mong Quý khách thông cảm cho sự bất tiện này. Chúng tôi hy vọng sẽ có cơ hội được phục vụ Quý khách vào một dịp khác trong thời gian sớm nhất.\n\nTrân trọng.\n[Maison de Flavor]`
  };
  return transporter.sendMail(mailOptions);
};
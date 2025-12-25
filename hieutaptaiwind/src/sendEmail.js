import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Tạo một transporter (đối tượng chịu trách nhiệm gửi mail)
  // Ở đây chúng ta dùng Gmail làm ví dụ.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // email của bạn
      pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng của bạn
    },
  });

  // 2. Định nghĩa các tùy chọn cho email
  const mailOptions = {
    from: '"HieuShop" <no-reply@hieushop.com>', // Tên và địa chỉ người gửi
    to: options.email, // Địa chỉ người nhận
    subject: options.subject, // Tiêu đề email
    html: options.html, // Nội dung email dạng HTML
  };

  // 3. Gửi email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Không thể gửi email, vui lòng thử lại sau.");
  }
};

export default sendEmail;
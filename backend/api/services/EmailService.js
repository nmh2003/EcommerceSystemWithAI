const nodemailer = require("nodemailer");

class EmailService {
  constructor() {

    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "nguyen.minh.hieu.sinhnam2k3@gmail.com",
        pass: "ylkb lfia pllf nhbm", // App Password (không phải password thật)
      },
    });

    this.defaultFrom = {
      name: "Mini CMS System",
      address: "nguyen.minh.hieu.sinhnam2k3@gmail.com",
    };
  }

  async sendOTP(toEmail, otpCode) {

    try {
      const mailOptions = {
        from: this.defaultFrom,
        to: toEmail,
        subject: "Mã OTP xác thực tài khoản",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Xác thực tài khoản Mini CMS</h2>
            <p>Kính chào,</p>
            <p>Mã OTP của bạn là:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #007bff;">${otpCode}</span>
            </div>
            <p><strong>Lưu ý:</strong></p>
            <ul>
              <li>Mã OTP có hiệu lực trong <strong>5 phút</strong></li>
              <li>Vui lòng không chia sẻ mã này với任何人</li>
              <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này</li>
            </ul>
            <p>Trân trọng,<br>Mini CMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Lỗi gửi OTP email:", error);
      return false;
    }
  }

  async sendWelcome(toEmail, fullName) {

    try {
      const mailOptions = {
        from: this.defaultFrom,
        to: toEmail,
        subject: "Chào mừng bạn đến với Mini CMS!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Chào mừng ${fullName}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Mini CMS</strong>.</p>
            <p>Hệ thống của chúng tôi cung cấp:</p>
            <ul>
              <li>🏪 Quản lý sản phẩm và danh mục</li>
              <li>🛒 Đặt hàng trực tuyến</li>
              <li>📊 Báo cáo và thống kê</li>
              <li>👥 Quản lý người dùng</li>
            </ul>
            <p>Bạn có thể bắt đầu sử dụng hệ thống ngay bây giờ!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}"
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Truy cập hệ thống
              </a>
            </div>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ.</p>
            <p>Trân trọng,<br>Mini CMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Lỗi gửi welcome email:", error);
      return false;
    }
  }

  async sendResetPassword(toEmail, resetLink) {

    try {
      const mailOptions = {
        from: this.defaultFrom,
        to: toEmail,
        subject: "Đặt lại mật khẩu Mini CMS",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Đặt lại mật khẩu</h2>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Mini CMS.</p>
            <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}"
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p><strong>Lưu ý quan trọng:</strong></p>
            <ul>
              <li>Liên kết có hiệu lực trong <strong>15 phút</strong></li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              <li>Liên kết chỉ có thể sử dụng một lần</li>
            </ul>
            <p>Nếu nút không hoạt động, copy và paste liên kết sau vào trình duyệt:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetLink}</p>
            <p>Trân trọng,<br>Mini CMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Lỗi gửi reset password email:", error);
      return false;
    }
  }

  async sendOrderConfirmation(toEmail, fullName, orderDetails) {

    try {
      const { orderId, items, totalPrice, shippingAddress, paymentMethod } =
        orderDetails;

      const itemsHtml = items
        .map(
          (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            item.name
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${
            item.quantity
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toLocaleString()} VND</td>
        </tr>
      `
        )
        .join("");

      const mailOptions = {
        from: this.defaultFrom,
        to: toEmail,
        subject: `Xác nhận đơn hàng #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Đơn hàng đã được xác nhận!</h2>
            <p>Kính chào ${fullName},</p>
            <p>Cảm ơn bạn đã đặt hàng tại Mini CMS. Đơn hàng của bạn đã được xác nhận.</p>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
              <h3>Mã đơn hàng: #${orderId}</h3>
              <p><strong>Thông tin giao hàng:</strong> ${shippingAddress}</p>
              <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
            </div>

            <h3>Chi tiết đơn hàng:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #007bff; color: white;">
                  <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                  <th style="padding: 10px; text-align: center;">Số lượng</th>
                  <th style="padding: 10px; text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="2" style="padding: 10px; text-align: right;">Tổng cộng:</td>
                  <td style="padding: 10px; text-align: right;">${totalPrice.toLocaleString()} VND</td>
                </tr>
              </tfoot>
            </table>

            <p>Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất. Bạn sẽ nhận được thông báo khi đơn hàng được giao.</p>
            <p>Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Mini CMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Lỗi gửi order confirmation email:", error);
      return false;
    }
  }

  async sendOrderStatusUpdate(
    toEmail,
    fullName,
    orderId,
    oldStatus,
    newStatus
  ) {

    try {
      const statusMessages = {
        pending: "Đang chờ xử lý",
        processing: "Đang xử lý",
        shipped: "Đã giao cho đơn vị vận chuyển",
        delivered: "Đã giao thành công",
        cancelled: "Đã hủy",
      };

      const statusColors = {
        pending: "#ffc107",
        processing: "#17a2b8",
        shipped: "#007bff",
        delivered: "#28a745",
        cancelled: "#dc3545",
      };

      const mailOptions = {
        from: this.defaultFrom,
        to: toEmail,
        subject: `Cập nhật trạng thái đơn hàng #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColors[newStatus]};">Cập nhật đơn hàng</h2>
            <p>Kính chào ${fullName},</p>
            <p>Đơn hàng <strong>#${orderId}</strong> của bạn đã được cập nhật trạng thái.</p>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 5px solid ${statusColors[newStatus]};">
              <p><strong>Trạng thái cũ:</strong> ${statusMessages[oldStatus]}</p>
              <p><strong>Trạng thái mới:</strong> <span style="color: ${statusColors[newStatus]}; font-weight: bold;">${statusMessages[newStatus]}</span></p>
            </div>

            <p>Chi tiết về trạng thái:</p>
            <ul>
              <li><strong>Đang chờ xử lý:</strong> Đơn hàng đang được kiểm tra và chuẩn bị</li>
              <li><strong>Đang xử lý:</strong> Đơn hàng đang được đóng gói</li>
              <li><strong>Đã giao cho đơn vị vận chuyển:</strong> Đơn hàng đã được gửi đi</li>
              <li><strong>Đã giao thành công:</strong> Đơn hàng đã đến tay bạn</li>
            </ul>

            <p>Bạn có thể theo dõi đơn hàng tại trang tài khoản của mình.</p>
            <p>Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Mini CMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Lỗi gửi order status update email:", error);
      return false;
    }
  }

  async sendPaymentConfirmation(toEmail, fullName, orderId, paymentAmount) {

    try {
      const mailOptions = {
        from: this.defaultFrom,
        to: toEmail,
        subject: `Xác nhận thanh toán đơn hàng #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Thanh toán thành công!</h2>
            <p>Kính chào ${fullName},</p>
            <p>Cảm ơn bạn đã thanh toán đơn hàng tại Mini CMS.</p>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 5px solid #28a745;">
              <h3>Mã đơn hàng: #${orderId}</h3>
              <p><strong>Số tiền thanh toán:</strong> ${paymentAmount.toLocaleString()} VND</p>
              <p><strong>Thời gian thanh toán:</strong> ${new Date().toLocaleString(
                "vi-VN"
              )}</p>
            </div>

            <p>Đơn hàng của bạn sẽ được xử lý và giao trong thời gian sớm nhất.</p>
            <p>Bạn có thể theo dõi trạng thái đơn hàng tại trang tài khoản của mình.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/orders"
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Xem đơn hàng của tôi
              </a>
            </div>

            <p>Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi.</p>
            <p>Trân trọng,<br>Mini CMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("❌ Lỗi gửi payment confirmation email:", error);
      return false;
    }
  }
}

module.exports = new EmailService();

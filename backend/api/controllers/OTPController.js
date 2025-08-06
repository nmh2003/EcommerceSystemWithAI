const crypto = require("crypto");
const EmailService = require("../services/EmailService");

module.exports = {

  send: async function (req, res) {

    try {

      const { email } = req.body;

      if (!email) {
        return res.badRequest({
          success: false,
          message: "Email là bắt buộc",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.badRequest({
          success: false,
          message: "Email không hợp lệ",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.notFound({
          success: false,
          message: "Email chưa được đăng ký",
        });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 phút

      await User.updateOne({ id: user.id }).set({
        otpCode: otpCode,
        otpExpiresAt: otpExpiresAt,
      });

      const emailSent = await EmailService.sendOTP(email, otpCode);

      if (!emailSent) {

        await User.updateOne({ id: user.id }).set({
          otpCode: null,
          otpExpiresAt: null,
        });

        return res.serverError({
          success: false,
          message: "Không thể gửi email OTP. Vui lòng thử lại sau.",
        });
      }

      return res.json({
        success: true,
        message:
          "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
      });
    } catch (error) {
      console.error("❌ Lỗi trong send OTP:", error);
      return res.serverError({
        success: false,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  },

  verify: async function (req, res) {

    try {

      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.badRequest({
          success: false,
          message: "Email và OTP là bắt buộc",
        });
      }

      if (!/^\d{6}$/.test(otp)) {
        return res.badRequest({
          success: false,
          message: "OTP phải là 6 chữ số",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.notFound({
          success: false,
          message: "Email không tồn tại",
        });
      }

      if (!user.otpCode || user.otpCode !== otp) {
        return res.badRequest({
          success: false,
          message: "Mã OTP không hợp lệ",
        });
      }

      const now = new Date();
      const expireTime = user.otpExpiresAt ? new Date(user.otpExpiresAt) : null;
      if (!expireTime || now > expireTime) {

        await User.updateOne({ id: user.id }).set({
          otpCode: null,
          otpExpiresAt: null,
        });

        return res.badRequest({
          success: false,
          message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
        });
      }

      await User.updateOne({ id: user.id }).set({
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      });

      return res.json({
        success: true,
        message: "Xác thực OTP thành công",
      });
    } catch (error) {
      console.error("❌ Lỗi trong verify OTP:", error);
      return res.serverError({
        success: false,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  },
};

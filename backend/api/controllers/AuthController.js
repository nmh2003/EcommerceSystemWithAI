const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {

  register: async function (req, res) {
    try {
      const { fullName, email, password } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({
          error: "Vui lòng nhập đầy đủ thông tin",
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        fullName,
        email,
        password: hashed,
        isVerified: false, // Mặc định chưa verify, cần OTP
      }).fetch();

      const EmailService = require("../services/EmailService");
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Lưu dưới dạng ISO string

      await User.updateOne({ id: user.id }).set({
        otpCode: otpCode,
        otpExpiresAt: otpExpiresAt,
      });

      const emailSent = await EmailService.sendOTP(email, otpCode);

      if (!emailSent) {

        await User.destroyOne({ id: user.id });
        return res.status(500).json({
          error: "Không thể gửi email xác thực. Vui lòng thử lại.",
        });
      }

      delete user.password;

      return res.status(201).json({
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        user: user,
        requiresVerification: true, // Flag báo cần verify
      });
    } catch (err) {

      if (err.code === "E_UNIQUE") {
        return res.status(400).json({
          error: "Email đã tồn tại",
          details: {
            email:
              "This email is already registered. Please use a different email or login.",
          },
        });
      }

      console.error("Register error:", err);

      return res.status(500).json({
        error: "An unexpected error occurred. Please try again later.",
      });
    }
  },

  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Validation failed",
          details: {
            email: !email ? "Vui lòng nhập Email" : undefined,
            password: !password ? "Vui lòng nhập Mật khẩu" : undefined,
          },
        });
      }

      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Sai thông tin Đăng nhập" });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          error: "Email chưa được xác thực",
          message:
            "Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
          requiresVerification: true,
        });
      }

      const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "24h" });

      delete user.password;

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 GIỜ thay vì 1 giờ
      });

      return res.json({ token, user });
    } catch (err) {

      console.error("Login error:", err);

      return res.status(500).json({
        error: "Hệ thống đang bảo trì. Vui lòng quay lại sau",
      });
    }
  },

  logout: async function (req, res) {
    try {

      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json({ message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        error: "An unexpected error occurred. Please try again later.",
      });
    }
  },

  forgotPassword: async function (req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Vui lòng nhập Email",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          error: "Email không tìm thấy",
        });
      }

      const crypto = require("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");

      const resetTokenExpiresAt = new Date(
        Date.now() + 15 * 60 * 1000
      ).toISOString();

      await User.updateOne({ id: user.id }).set({
        resetToken: resetToken,
        resetTokenExpiresAt: resetTokenExpiresAt,
      });

      const resetLink = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password?token=${resetToken}`;

      const EmailService = require("../services/EmailService");
      const emailSent = await EmailService.sendResetPassword(
        user.email,
        resetLink
      );

      if (!emailSent) {
        return res.status(500).json({
          error: "Không thể gửi email, vui lòng thử lại",
        });
      }

      return res.json({
        success: true,
        message: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
      });
    } catch (error) {
      console.error("❌ Lỗi forgot password:", error);
      return res.status(500).json({
        error: "Không thể gửi email, vui lòng thử lại",
      });
    }
  },

  resetPassword: async function (req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          error: "Token và mật khẩu mới là bắt buộc",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "Mật khẩu phải có ít nhất 6 ký tự",
        });
      }

      const user = await User.findOne({ resetToken: token });

      if (!user) {
        return res.status(400).json({
          error: "Mã OTP không hợp lệ",
        });
      }

      const now = new Date();
      const expireTime = user.resetTokenExpiresAt
        ? new Date(user.resetTokenExpiresAt)
        : null;
      if (!expireTime || now > expireTime) {
        return res.status(400).json({
          error: "Mã OTP đã hết hạn",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.updateOne({ id: user.id }).set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      });

      return res.json({
        success: true,
        message:
          "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.",
      });
    } catch (error) {
      console.error("❌ Lỗi reset password:", error);
      return res.status(500).json({
        error: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  },
};

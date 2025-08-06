module.exports = {

  getProfile: async function (req, res) {
    try {

      return res.json({
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        address: req.user.address,
        phone: req.user.phone,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.serverError("Không thể lấy thông tin profile");
    }
  },

  updateProfile: async function (req, res) {
    try {
      const { fullName, address, phone, password } = req.body;

      if (!fullName || fullName.trim().length === 0) {
        return res.badRequest("Full name không được để trống");
      }

      const updateData = {
        fullName: fullName.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        updatedAt: new Date(),
      };

      if (password && password.trim().length > 0) {
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        updateData.password = hashedPassword;
      }

      const updatedUser = await User.updateOne({ id: req.user.id }).set(
        updateData
      );

      if (!updatedUser) {
        return res.notFound("User không tồn tại");
      }

      return res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        address: updatedUser.address,
        phone: updatedUser.phone,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.serverError("Lỗi cập nhật. Vui lòng thử lại");
    }
  },

  changePassword: async function (req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || currentPassword.trim().length === 0) {
        return res.badRequest("Mật khẩu hiện tại không được để trống");
      }

      if (!newPassword || newPassword.trim().length < 6) {
        return res.badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
      }

      const bcrypt = require("bcrypt");
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword.trim(),
        req.user.password
      );

      if (!isCurrentPasswordValid) {
        return res.badRequest("Mật khẩu hiện tại không đúng");
      }

      const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

      await User.updateOne({ id: req.user.id }).set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      });

      return res.json({
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.serverError("Không thể đổi mật khẩu");
    }
  },

  getAllUsers: async function (req, res) {
    try {

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role; // Filter theo role (user/admin)

      const skip = (page - 1) * limit;

      const where = {};
      if (role) {
        where.role = role;
      }

      const users = await User.find({
        where: where,
        skip: skip,
        limit: limit,
        sort: "createdAt DESC", // Sắp xếp theo thời gian tạo (mới nhất trước)
      });

      const totalUsers = await User.count(where);

      const totalPages = Math.ceil(totalUsers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.json({
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalUsers: totalUsers,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
          limit: limit,
        },
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return res.serverError("Không thể lấy danh sách users");
    }
  },

  getUserById: async function (req, res) {
    try {
      const userId = req.params.id;

      const user = await User.findOne({ id: userId }).populate("orders");

      if (!user) {
        return res.notFound("User không tồn tại");
      }

      return res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        address: user.address,
        phone: user.phone,
        role: user.role,
        orders: user.orders || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      return res.serverError("Không thể lấy thông tin user");
    }
  },

  updateUserById: async function (req, res) {
    try {
      const userId = req.params.id;
      const { fullName, address, phone, role, email } = req.body;

      if (!fullName || fullName.trim().length === 0) {
        return res.badRequest("Full name không được để trống");
      }

      if (email && (!email.includes("@") || email.trim().length < 5)) {
        return res.badRequest("Email không hợp lệ");
      }

      if (role && !["user", "admin"].includes(role)) {
        return res.badRequest("Role phải là 'user' hoặc 'admin'");
      }

      const updateData = {
        fullName: fullName.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        updatedAt: new Date(),
      };

      if (email) {
        updateData.email = email.trim();
      }

      if (role) {
        updateData.role = role;
      }

      const updatedUser = await User.updateOne({ id: userId }).set(updateData);

      if (!updatedUser) {
        return res.notFound("User không tồn tại");
      }

      return res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        address: updatedUser.address,
        phone: updatedUser.phone,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      });
    } catch (error) {
      console.error("Update user by ID error:", error);
      return res.serverError("Không thể cập nhật user");
    }
  },

  deleteUserById: async function (req, res) {
    try {
      const userId = req.params.id;

      const user = await User.findOne({ id: userId });

      if (!user) {
        return res.notFound("User không tồn tại");
      }

      if (user.role === "admin") {
        return res.badRequest("Không thể xóa Admin");
      }

      await User.destroyOne({ id: userId });

      return res.json({
        message: "Xóa user thành công",
        deletedUser: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      console.error("Delete user by ID error:", error);
      return res.serverError("Không thể xóa user");
    }
  },
};

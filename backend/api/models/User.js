module.exports = {

  attributes: {

    email: {
      type: "string",
      required: true,
      unique: true, // Không trùng lặp
      isEmail: true, // Validate format email
      maxLength: 255,

    },

    password: {
      type: "string",
      required: true,
      protect: true, // Không trả về trong query (bảo mật)

    },

    role: {
      type: "string",
      isIn: ["user", "admin"], // Chỉ nhận 2 giá trị
      defaultsTo: "user", // Mặc định là user

    },

    fullName: {
      type: "string",
      required: true, // ✅ BẮT BUỘC (như Ecom username required: true)
      maxLength: 100,

    },

    address: {
      type: "string",
      allowNull: true,
      maxLength: 500,

    },

    phone: {
      type: "string",
      allowNull: true,
      maxLength: 15,

    },

    orders: {
      collection: "order", // Quan hệ 1-nhiều với Order model
      via: "user", // Thông qua field 'user' trong Order

    },

    isVerified: {
      type: "boolean",
      defaultsTo: false, // Mặc định chưa xác thực

    },

    otpCode: {
      type: "string",
      allowNull: true, // Null khi không có OTP active

    },

    otpExpiresAt: {
      type: "string", // Lưu dưới dạng ISO string
      allowNull: true,

    },

    resetToken: {
      type: "string",
      allowNull: true,

    },

    resetTokenExpiresAt: {
      type: "string", // Lưu dưới dạng ISO string
      allowNull: true,

    },
  },

  customToJSON: function () {

    return {
      id: this.id,
      email: this.email,
      role: this.role,
      fullName: this.fullName,
      address: this.address,
      phone: this.phone,
      isVerified: this.isVerified,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

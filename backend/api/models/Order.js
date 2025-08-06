module.exports = {

  attributes: {

    user: {
      model: "user", // Quan hệ nhiều-1 với User model
      required: true, // Bắt buộc phải có user

    },

    orderItems: {
      type: "json", // Lưu dạng JSON array
      required: true, // Bắt buộc (không có sản phẩm thì không phải đơn hàng)

    },

    shippingAddress: {
      type: "json",
      required: true,

    },

    paymentMethod: {
      type: "string",
      defaultsTo: "COD", // Cash On Delivery (Thanh toán khi nhận hàng)
      isIn: ["COD", "Bank Transfer", "Credit Card", "E-wallet", "PayPal"],

    },

    totalPrice: {
      type: "number",
      required: true,
      min: 0,
      columnType: "decimal(12,2)", // Tối đa 999,999,999.99

    },

    shippingPrice: {
      type: "number",
      defaultsTo: 0,
      min: 0,
      columnType: "decimal(10,2)",

    },

    taxPrice: {
      type: "number",
      defaultsTo: 0,
      min: 0,
      columnType: "decimal(10,2)",

    },

    isPaid: {
      type: "boolean",
      defaultsTo: false, // Mặc định chưa thanh toán

    },

    paidAt: {
      type: "ref",
      columnType: "datetime",

    },

    isDelivered: {
      type: "boolean",
      defaultsTo: false,

    },

    deliveredAt: {
      type: "ref",
      columnType: "datetime",

    },

    notes: {
      type: "string",
      allowNull: true,
      maxLength: 1000,

    },
  },

  customToJSON: function () {

    return {
      id: this.id,
      user: this.user, // Nếu populate => trả về object User
      orderItems: this.orderItems,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      totalPrice: this.totalPrice,
      shippingPrice: this.shippingPrice,
      taxPrice: this.taxPrice,
      isPaid: this.isPaid,
      paidAt: this.paidAt,
      isDelivered: this.isDelivered,
      deliveredAt: this.deliveredAt,
      notes: this.notes,

      status: this.isDelivered
        ? "Đã giao"
        : this.isPaid
        ? "Đang giao"
        : "Chờ thanh toán",

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

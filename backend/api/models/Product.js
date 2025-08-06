module.exports = {

  attributes: {

    name: {
      type: "string",
      required: true, // Bắt buộc phải có tên
      maxLength: 200, // Tối đa 200 ký tự

    },

    description: {
      type: "string",
      allowNull: true, // Cho phép để trống
      maxLength: 2000, // Mô tả dài tối đa 2000 ký tự

    },

    price: {
      type: "number",
      required: true, // Bắt buộc có giá
      min: 0, // Giá không được âm
      columnType: "decimal(10,2)", // Lưu dạng decimal (2 số thập phân)

    },

    image: {
      type: "string",
      defaultsTo: "/images/default-product.png", // Ảnh mặc định

    },

    category: {
      model: "category", // Quan hệ nhiều-1 với Category model

    },

    countInStock: {
      type: "number",
      defaultsTo: 0, // Mặc định = 0 (hết hàng)
      min: 0, // Không được âm

    },

    rating: {
      type: "number",
      defaultsTo: 0, // Chưa có đánh giá
      min: 0, // Tối thiểu 0 sao
      max: 5, // Tối đa 5 sao
      columnType: "decimal(2,1)", // 1 chữ số thập phân (ví dụ: 4.5)

    },

    numReviews: {
      type: "number",
      defaultsTo: 0, // Chưa có review nào
      min: 0,

    },

    brand: {
      type: "string",
      allowNull: true,
      maxLength: 100,

    },
  },

  customToJSON: function () {

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      image: this.image,
      category: this.category, // Nếu đã populate, trả về object
      countInStock: this.countInStock,
      rating: this.rating,
      numReviews: this.numReviews,
      brand: this.brand,

      inStock: this.countInStock > 0,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

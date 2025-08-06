module.exports = {

  attributes: {

    name: {
      type: "string", // Kiểu dữ liệu: chuỗi ký tự (text)
      required: true, // Bắt buộc phải nhập (không được để trống)
      unique: true, // Giá trị duy nhất (không trùng lặp trong DB)
      maxLength: 100, // Độ dài tối đa: 100 ký tự

    },

    description: {
      type: "string", // Kiểu dữ liệu: chuỗi ký tự
      allowNull: true, // Cho phép để trống (không bắt buộc)
      maxLength: 500, // Mô tả tối đa 500 ký tự

    },

    products: {
      collection: "product", // Liên kết với model Product (quan hệ 1-nhiều)
      via: "category", // Thông qua trường 'category' trong Product model

    },

    image: {
      type: "string", // Lưu URL hoặc đường dẫn file
      allowNull: true, // Không bắt buộc
      defaultsTo: "/images/default-category.png", // Ảnh mặc định

    },
  },

  customToJSON: function () {

    return {
      id: this.id, // ID duy nhất của category
      name: this.name, // Tên category
      description: this.description, // Mô tả
      image: this.image, // Đường dẫn ảnh
      createdAt: this.createdAt, // Thời gian tạo (tự động)
      updatedAt: this.updatedAt, // Thời gian cập nhật (tự động)

    };
  },
};

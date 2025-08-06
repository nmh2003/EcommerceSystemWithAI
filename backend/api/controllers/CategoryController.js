module.exports = {

  create: async function (req, res) {

    try {

      const { name, description, image } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          error: "Tên danh mục không được để trống",
        });
      }

      const newCategory = await Category.create({
        name: name.trim(),
        description: description ? description.trim() : "",
        image: image || "/images/default-category.png",
      }).fetch();

      return res.status(201).json(newCategory);

    } catch (error) {

      console.error("Lỗi khi tạo category:", error);

      if (error.code === "E_UNIQUE") {
        return res.status(409).json({
          error: "Tên danh mục đã tồn tại",
        });
      }

      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });

    }
  },

  findAll: async function (req, res) {

    try {

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const categories = await Category.find()
        .skip(skip)
        .limit(limit)
        .sort("name ASC");

      const total = await Category.count();

      return res.json({
        categories,
        pagination: {
          total, // Tổng số records
          page, // Trang hiện tại
          limit, // Số items/trang
          totalPages: Math.ceil(total / limit), // Tổng số trang
        },
      });

    } catch (error) {
      console.error("❌ Lỗi find categories:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  findOne: async function (req, res) {

    try {

      const { id } = req.params;

      const category = await Category.findOne({ id }).populate("products", {
        limit: 10,
        sort: "name ASC",
      });

      if (!category) {
        return res.status(404).json({
          error: "Không tìm thấy danh mục",
        });
      }

      return res.json(category);
    } catch (error) {
      console.error("❌ Lỗi findOne category:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  update: async function (req, res) {

    try {
      const { id } = req.params;
      const { name, description, image } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          error: "Tên danh mục không được để trống",
        });
      }

      const oldCategory = await Category.findOne({ id });

      if (!oldCategory) {
        return res.status(404).json({
          error: "Không tìm thấy danh mục",
        });
      }

      const updatedCategory = await Category.updateOne({ id }).set({
        name: name.trim(),
        description: description ? description.trim() : "",
        image: image || oldCategory.image, // Giữ ảnh cũ nếu không truyền mới
      });

      if (!updatedCategory) {
        return res.status(404).json({
          error: "Không tìm thấy danh mục",
        });
      }

      if (image && image !== oldCategory.image) {
        const fs = require("fs");
        const path = require("path");

        const oldImagePath = path.resolve(
          sails.config.appPath,
          "uploads",
          path.basename(oldCategory.image)
        );

        if (
          fs.existsSync(oldImagePath) &&
          oldCategory.image !== "/images/default-category.png"
        ) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log("✅ Đã xóa ảnh cũ:", oldImagePath);
          } catch (err) {
            console.error("⚠️ Không thể xóa ảnh cũ:", err);

          }
        }

      }

      return res.json(updatedCategory);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật category:", error);

      if (error.code === "E_UNIQUE") {
        return res.status(409).json({
          error: "Tên danh mục đã tồn tại",
        });
      }

      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },

  delete: async function (req, res) {

    try {
      const { id } = req.params;

      const category = await Category.findOne({ id });

      if (!category) {
        return res.status(404).json({
          error: "Không tìm thấy danh mục",
        });
      }

      const productsCount = await Product.count({ category: id });

      if (productsCount > 0) {
        return res.status(400).json({
          error: `Không thể xóa danh mục vì còn ${productsCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
        });
      }

      const deletedCategory = await Category.destroyOne({ id });

      if (!deletedCategory) {
        return res.status(404).json({
          error: "Không tìm thấy danh mục",
        });
      }

      if (category.image && category.image !== "/images/default-category.png") {
        const fs = require("fs");
        const path = require("path");

        const imagePath = path.resolve(
          sails.config.appPath,
          "uploads",
          path.basename(category.image)
        );

        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
            console.log("✅ Đã xóa ảnh category:", imagePath);
          } catch (err) {
            console.error("⚠️ Không thể xóa ảnh:", err);

          }
        }

      }

      return res.json({
        message: "Xóa danh mục thành công",
        deletedCategory,
      });

    } catch (error) {
      console.error("❌ Lỗi khi xóa category:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });

    }
  },
};

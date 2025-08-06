module.exports = {

  find: async function (req, res) {
    try {

      const { search, page = 1, limit = 5, category } = req.query;

      const query = {};

      if (search) {
        query.name = { contains: search };
      }

      if (category) {
        query.category = category;
      }

      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .populate("category") // Populate category (lấy thông tin đầy đủ)
        .skip(skip)
        .limit(parseInt(limit))
        .sort("createdAt DESC"); // Sắp xếp mới nhất trước

      const total = await Product.count(query);

      const totalPages = Math.ceil(total / limit);

      const productsWithDefaultImage = products.map((product) => ({
        ...product,
        image: product.image || "/images/SampleProduct.jpeg",
      }));

      return res.json({
        products: productsWithDefaultImage,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      });
    } catch (error) {
      console.error("❌ Lỗi find products:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },

  findOne: async function (req, res) {
    try {
      const productId = req.param("id");

      const product = await Product.findOne({ id: productId }).populate(
        "category"
      );

      if (!product) {
        return res.status(404).json({
          error: "Sản phẩm không tồn tại",
        });
      }

      const productWithDefaultImage = {
        ...product,
        image: product.image || "/images/SampleProduct.jpeg",
      };

      return res.json(productWithDefaultImage);

    } catch (error) {
      console.error("❌ Lỗi findOne product:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },

  create: async function (req, res) {
    try {

      const { name, price, image, description, category, countInStock, brand } =
        req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          error: "Tên sản phẩm không được để trống",
        });
      }

      if (!price || price <= 0) {
        return res.status(400).json({
          error: "Giá sản phẩm phải lớn hơn 0",
        });
      }

      const newProduct = await Product.create({
        name,
        description,
        price,
        image, // imageUrl từ upload API
        category, // Category ID
        countInStock: countInStock || 0, // Default 0 nếu không truyền
        brand,
      }).fetch();

      if (newProduct.category) {
        const productWithCategory = await Product.findOne({
          id: newProduct.id,
        }).populate("category");

        return res.status(201).json(productWithCategory);
      }

      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("❌ Lỗi create product:", error);

      if (error.code === "E_INVALID_NEW_RECORD") {
        return res.status(400).json({
          error: "Category không tồn tại",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },

  update: async function (req, res) {
    try {
      const productId = req.param("id");

      const { name, price } = req.body;

      if (name && name.trim() === "") {
        return res.status(400).json({
          error: "Tên sản phẩm không được để trống",
        });
      }

      if (price && price <= 0) {
        return res.status(400).json({
          error: "Giá sản phẩm phải lớn hơn 0",
        });
      }

      const oldProduct = await Product.findOne({ id: productId });

      if (!oldProduct) {
        return res.status(404).json({
          error: "Sản phẩm không tồn tại",
        });
      }

      const updatedProduct = await Product.updateOne({ id: productId }).set(
        req.body
      );

      if (!updatedProduct) {
        return res.status(404).json({
          error: "Sản phẩm không tồn tại",
        });
      }

      if (req.body.image && req.body.image !== oldProduct.image) {
        const fs = require("fs");
        const path = require("path");

        const oldImagePath = path.resolve(
          sails.config.appPath,
          "uploads",
          path.basename(oldProduct.image)
        );

        if (
          fs.existsSync(oldImagePath) &&
          oldProduct.image !== "/images/default-product.png"
        ) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log("✅ Đã xóa ảnh cũ:", oldImagePath);
          } catch (err) {
            console.error("⚠️ Không thể xóa ảnh cũ:", err);
          }
        }

      }

      const productWithCategory = await Product.findOne({
        id: productId,
      }).populate("category");

      return res.json(productWithCategory || updatedProduct);
    } catch (error) {
      console.error("❌ Lỗi update product:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },

  getTopProducts: async function (req, res) {
    try {

      const topProducts = await Product.find()
        .populate("category")
        .sort("rating DESC") // Sắp xếp rating cao nhất trước
        .limit(10); // Giới hạn 10 sản phẩm

      return res.json(topProducts);
    } catch (error) {
      console.error("❌ Lỗi get top products:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },

  destroy: async function (req, res) {
    try {
      const productId = req.param("id");

      const product = await Product.findOne({ id: productId });

      if (!product) {
        return res.status(404).json({
          error: "Sản phẩm không tồn tại",
        });
      }

      const deletedProduct = await Product.destroyOne({ id: productId });

      if (product.image && product.image !== "/images/default-product.png") {
        const fs = require("fs");
        const path = require("path");

        const imagePath = path.resolve(
          sails.config.appPath,
          "uploads",
          path.basename(product.image)
        );

        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
            console.log("✅ Đã xóa ảnh:", imagePath);
          } catch (err) {
            console.error("⚠️ Không thể xóa ảnh:", err);
          }
        }
      }

      return res.json({
        message: "Xóa sản phẩm thành công",
        product: deletedProduct,
      });
    } catch (error) {
      console.error("❌ Lỗi delete product:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
        details: error.message,
      });
    }
  },
};

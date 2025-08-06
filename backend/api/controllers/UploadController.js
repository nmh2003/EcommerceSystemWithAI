module.exports = {

  uploadImage: async function (req, res) {

    try {

      req.file("image").upload(
        {

          dirname: require("path").resolve(sails.config.appPath, "uploads"),

          maxBytes: 5 * 1024 * 1024, // 5MB

          saveAs: function (file, cb) {

            const originalFilename = file.filename; // Ví dụ: "product.jpg"
            const extension = originalFilename.split(".").pop(); // "jpg"

            const timestamp = Date.now(); // Thời gian hiện tại (milliseconds)
            const randomString = Math.random().toString(36).substring(7);

            const uniqueFilename = `${timestamp}-${randomString}.${extension}`;

            cb(null, uniqueFilename);

          },
        },

        async function (err, uploadedFiles) {

          if (err) {
            console.error("Lỗi upload file:", err);

            if (err.code === "E_EXCEEDS_UPLOAD_LIMIT") {
              return res.status(400).json({
                error: "File quá lớn. Kích thước tối đa: 5MB",
              });
            }

            return res.status(500).json({
              error: "Lỗi server khi upload file",
            });
          }

          if (uploadedFiles.length === 0) {
            return res.status(400).json({
              error: "Không có file nào được upload. Vui lòng chọn file.",
            });
          }

          const file = uploadedFiles[0];

          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ];

          if (!allowedTypes.includes(file.type)) {

            const fs = require("fs");
            fs.unlinkSync(file.fd);

            return res.status(400).json({
              error:
                "File không hợp lệ. Chỉ chấp nhận ảnh: JPG, PNG, GIF, WebP",
            });
          }

          const path = require("path");
          const actualFilename = path.basename(file.fd);

          const imageUrl = `/uploads/${actualFilename}`;

          return res.status(200).json({
            message: "Upload ảnh thành công",
            imageUrl,
            fileInfo: {
              filename: actualFilename,
              size: file.size,
              type: file.type,
            },
          });

        }
      );
    } catch (error) {
      console.error("Lỗi trong uploadImage:", error);
      return res.status(500).json({
        error: "Lỗi server khi xử lý upload",
      });
    }
  },

  deleteImage: async function (req, res) {

    try {
      const { filename } = req.query;

      if (!filename) {
        return res.status(400).json({
          error: "Thiếu tên file",
        });
      }

      const filePath = require("path").resolve(
        sails.config.appPath,
        "uploads",
        filename
      );

      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: "File không tồn tại",
        });
      }

      fs.unlinkSync(filePath);

      return res.json({
        message: "Xóa ảnh thành công",
      });
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      return res.status(500).json({
        error: "Lỗi server khi xóa ảnh",
      });
    }
  },
};

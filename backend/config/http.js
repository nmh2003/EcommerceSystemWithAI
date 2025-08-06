/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {
  /****************************************************************************
   *                                                                           *
   * Sails/Express middleware to run for every HTTP request.                   *
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
   *                                                                           *
   * https://sailsjs.com/documentation/concepts/middleware                     *
   *                                                                           *
   ****************************************************************************/

  /**
   * 📖 CORS CONFIGURATION - CHO PHÉP FRONTEND GỬI COOKIE
   *
   * GIẢI THÍCH:
   * - Frontend (localhost:5173) và Backend (localhost:1337) khác origin
   * - credentials: 'include' yêu cầu CORS allow credentials
   * - Nếu không config → Cookie không được gửi → 403 Forbidden
   *
   * CẤU HÌNH:
   * - origin: Cho phép frontend origin
   * - credentials: true → Cho phép gửi cookie/auth headers
   * - methods: Cho phép các HTTP methods
   * - allowedHeaders: Cho phép headers cần thiết
   */
  cors: {
    origin: ["http://localhost:5173"], // Frontend URL
    credentials: true, // Quan trọng! Cho phép gửi cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  middleware: {
    /**
     * 📸 STATIC FILE SERVING - CHO PHÉP TRUY CẬP ẢNH
     *
     * GIẢI THÍCH:
     * - express.static() cần được MOUNT vào một URL path cụ thể
     * - Sails middleware không tự động mount → Phải tự tạo wrapper
     *
     * CÁCH HOẠT ĐỘNG:
     * 1. Request: GET /uploads/image.jpg
     * 2. Middleware kiểm tra: URL bắt đầu bằng /uploads?
     * 3. Nếu YES → Strip /uploads → Tìm file "image.jpg" trong thư mục
     * 4. Nếu file tồn tại → Serve file
     * 5. Nếu không → next() → Router xử lý (404)
     */
    serveUploads: (function () {
      const path = require("path");
      const express = require("express");
      const uploadsPath = path.resolve(__dirname, "../uploads");

      console.log("📂 Serving uploads from:", uploadsPath);

      // Tạo static middleware
      const staticMiddleware = express.static(uploadsPath);

      // Wrapper để mount vào /uploads path
      return function (req, res, next) {
        // Chỉ xử lý request bắt đầu bằng /uploads
        if (req.url.startsWith("/uploads")) {
          // Strip /uploads prefix trước khi pass vào express.static
          const originalUrl = req.url;
          req.url = req.url.replace(/^\/uploads/, "");

          console.log(`🔍 Static file request: ${originalUrl} → ${req.url}`);

          // Gọi express.static middleware
          staticMiddleware(req, res, function (err) {
            // Restore original URL nếu file không tồn tại
            req.url = originalUrl;
            next(err);
          });
        } else {
          // Không phải /uploads → Skip middleware này
          next();
        }
      };
    })(),

    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP requests.           *
     * (This Sails app's routes are handled by the "router" middleware below.)  *
     *                                                                          *
     ***************************************************************************/

    /**
     * 📌 THỨ TỰ MIDDLEWARE:
     *
     * - cookieParser: Parse cookies từ request headers
     * - session: Quản lý session (nếu dùng)
     * - bodyParser: Parse request body (JSON, form-data)
     * - compress: Nén response (gzip)
     * - serveUploads: Serve static files từ uploads/ ← ĐẶT TRƯỚC ROUTER!
     * - poweredBy: Thêm header X-Powered-By: Sails
     * - router: Xử lý routes (config/routes.js)
     * - www: Serve static files từ .tmp/public/
     * - favicon: Serve favicon.ico
     *
     * LƯU Ý: serveUploads PHẢI đặt TRƯỚC router
     * - Nếu router trước → Routes match trước → Static files không được serve
     * - serveUploads trước → Check static file trước → Nếu không có mới check routes
     */
    order: [
      "cookieParser",
      "session",
      "bodyParser",
      "compress",
      "serveUploads", // ← Đặt TRƯỚC router để serve static files trước
      "poweredBy",
      "router",
      "www",
      "favicon",
    ],

    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests.       *
     *                                                                          *
     * https://sailsjs.com/config/http#?customizing-the-body-parser             *
     *                                                                          *
     ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),
  },
};

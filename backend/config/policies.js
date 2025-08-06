/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */
/**
 * ============================================================
 * policies.js - CẤU HÌNH PHÂN QUYỀN CHO ROUTES
 * ============================================================
 *
 * 📚 KIẾN THỨC CƠ BẢN:
 *
 * 1. POLICIES LÀ GÌ?
 *    - Policies = Middleware kiểm tra quyền truy cập
 *    - Chạy TRƯỚC controller actions
 *    - Giống "bảo vệ" kiểm tra thẻ trước khi cho vào phòng
 *
 * 2. CẤU TRÚC:
 *    ControllerName: {
 *      actionName: ['policy1', 'policy2'],  // Chạy theo thứ tự
 *      '*': 'policy'                        // Áp dụng cho tất cả actions
 *    }
 *
 * 3. WILDCARD:
 *    - '*': Áp dụng cho tất cả actions trong controller
 *    - Action cụ thể ghi đè wildcard
 *
 * ============================================================
 */

module.exports.policies = {
  // ============================================================
  // CATEGORY CONTROLLER - QUẢN LÝ DANH MỤC
  // ============================================================

  CategoryController: {
    /**
     * 📖 GIẢI THÍCH:
     *
     * - findAll, findOne: Ai cũng xem được (public)
     * - create, update, delete: Chỉ admin (isAuthenticated + isAdmin)
     *
     * CÁCH HOẠT ĐỘNG:
     * GET /api/categories → findAll → true → Không cần đăng nhập
     * POST /api/categories → create → ['isAuthenticated', 'isAdmin'] → Cần đăng nhập VÀ là admin
     */

    findAll: true, // Public: Ai cũng xem danh sách categories
    findOne: true, // Public: Ai cũng xem chi tiết 1 category

    create: ["isAuthenticated", "isAdmin"], // Chỉ admin mới tạo category
    update: ["isAuthenticated", "isAdmin"], // Chỉ admin mới sửa category
    delete: ["isAuthenticated", "isAdmin"], // Chỉ admin mới xóa category
  },

  // ============================================================
  // PRODUCT CONTROLLER - QUẢN LÝ SẢN PHẨM
  // ============================================================

  ProductController: {
    /**
     * 📖 GIẢI THÍCH:
     *
     * - find (findAll): Public (user xem sản phẩm)
     * - findOne: Public (xem chi tiết sản phẩm)
     * - create, update, destroy: Chỉ admin
     *
     * LƯU Ý:
     * - ProductController dùng blueprint actions (Sails.js tự tạo)
     * - find, findOne, create, update, destroy là tên actions mặc định
     */

    find: true, // Public: Xem danh sách sản phẩm
    findOne: true, // Public: Xem chi tiết sản phẩm

    create: ["isAuthenticated", "isAdmin"], // Chỉ admin mới thêm sản phẩm
    update: ["isAuthenticated", "isAdmin"], // Chỉ admin mới sửa sản phẩm
    destroy: ["isAuthenticated", "isAdmin"], // Chỉ admin mới xóa sản phẩm
  },

  // ============================================================
  // ORDER CONTROLLER - QUẢN LÝ ĐƠN HÀNG
  // ============================================================

  OrderController: {
    /**
     * 📖 GIẢI THÍCH:
     *
     * - create: User đăng nhập mới đặt hàng
     * - getUserOrders: User xem đơn của mình
     * - findOne: User xem chi tiết đơn (logic trong controller kiểm tra quyền)
     * - getAllOrders: Chỉ admin xem tất cả đơn
     * - updateOrderStatus: Chỉ admin cập nhật trạng thái
     *
     * PHÂN QUYỀN CHI TIẾT:
     * - User: create, getUserOrders, findOne (chỉ xem đơn của mình)
     * - Admin: Tất cả (create, getUserOrders, findOne, getAllOrders, updateOrderStatus)
     */

    create: ["isAuthenticated"], // User đăng nhập mới đặt hàng
    getUserOrders: ["isAuthenticated"], // User xem đơn của mình
    findOne: ["isAuthenticated"], // User/Admin xem chi tiết (logic trong controller)

    getAllOrders: ["isAuthenticated", "isAdmin"], // Chỉ admin xem tất cả đơn
    updateOrderStatus: ["isAuthenticated", "isAdmin"], // Chỉ admin cập nhật trạng thái
    markAsDelivered: ["isAuthenticated", "isAdmin"], // Chỉ admin đánh dấu giao hàng
    pay: ["isAuthenticated"], // User đăng nhập mới thanh toán đơn hàng

    // ============================================================
    // DASHBOARD STATISTICS POLICIES
    // ============================================================

    /**
     * 📖 GIẢI THÍCH:
     *
     * 3 API MỚI CHO DASHBOARD:
     * - getStatistics: Lấy thống kê tổng quan (revenue, orders, users, products)
     * - getSalesByDate: Lấy dữ liệu doanh thu theo ngày (cho chart)
     * - getRecentOrders: Lấy 5 đơn hàng gần nhất
     *
     * PHÂN QUYỀN:
     * - Chỉ admin được xem thống kê
     * - ['isAuthenticated', 'isAdmin']: Kiểm tra 2 lớp bảo mật
     *
     * TẠI SAO CẦN ADMIN?
     * - Thống kê là thông tin nhạy cảm (doanh thu, số user, ...)
     * - User thường không cần biết tổng doanh thu hệ thống
     * - Admin dùng để quản lý, ra quyết định kinh doanh
     */

    getStatistics: ["isAuthenticated", "isAdmin"], // Admin xem KPI tổng quan
    getSalesByDate: ["isAuthenticated", "isAdmin"], // Admin xem chart doanh thu
    getRecentOrders: ["isAuthenticated", "isAdmin"], // Admin xem đơn gần nhất
  },

  // ============================================================
  // USER CONTROLLER - QUẢN LÝ NGƯỜI DÙNG
  // ============================================================

  UserController: {
    /**
     * 📖 GIẢI THÍCH USER POLICIES:
     *
     * - getProfile, updateProfile: isAuthenticated (user thường)
     * - getAllUsers, getUserById, updateUserById, deleteUserById: isAuthenticated + isAdmin
     *
     * CÁCH HOẠT ĐỘNG:
     * - User thường: Chỉ xem/sửa profile của mình
     * - Admin: Xem/sửa/xóa tất cả users + profile của mình
     */

    getProfile: ["isAuthenticated"], // User xem profile của mình
    updateProfile: ["isAuthenticated"], // User cập nhật profile của mình
    changePassword: ["isAuthenticated"], // User đổi mật khẩu của mình

    getAllUsers: ["isAuthenticated", "isAdmin"], // Admin xem tất cả users
    getUserById: ["isAuthenticated", "isAdmin"], // Admin xem chi tiết 1 user
    updateUserById: ["isAuthenticated", "isAdmin"], // Admin cập nhật user
    deleteUserById: ["isAuthenticated", "isAdmin"], // Admin xóa user
  },

  // ============================================================
  // AUTH CONTROLLER - ĐĂNG KÝ/ĐĂNG NHẬP
  // ============================================================
  ArticleController: {
    find: true, // Public: Ai cũng xem danh sách
    create: ["isAuthenticated", "isAdmin"], // Chỉ user đăng nhập mới tạo
  },
  AuthController: {
    /**
     * 📖 GIẢI THÍCH:
     *
     * - register, login: Public (ai cũng đăng ký/đăng nhập được)
     * - Không cần policies
     */

    "*": true, // Tất cả actions trong AuthController đều public
  },

  // ============================================================
  // PING CONTROLLER - TEST API
  // ============================================================

  PingController: {
    "*": true, // Public (dùng để test API có hoạt động không)
  },

  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

  // '*': true,

  /**
   * 📌 GIẢI THÍCH DEFAULT POLICY:
   *
   * - Nếu uncomment '*': true => Tất cả routes đều public (không bảo mật)
   * - Nên comment lại và config từng controller cụ thể (bảo mật hơn)
   *
   * LƯU Ý:
   * - Policy cụ thể ghi đè policy chung
   * - Ví dụ: '*': true nhưng ProductController: { '*': 'isAuthenticated' }
   *   => ProductController vẫn cần đăng nhập
   */
};

/**
 * ============================================================
 * 📚 TÓM TẮT: LUỒNG HOẠT ĐỘNG POLICY
 * ============================================================
 *
 * VÍ DỤ 1: User thường xem danh sách sản phẩm
 * 1. Request: GET /api/products
 * 2. Routes: Gọi ProductController.find
 * 3. Policies: find: true => Không cần policy
 * 4. Controller: ProductController.find xử lý
 * 5. Response: { products: [...] }
 *
 * VÍ DỤ 2: Admin xóa category
 * 1. Request: DELETE /api/categories/1
 * 2. Routes: Gọi CategoryController.delete
 * 3. Policies: delete: ['isAuthenticated', 'isAdmin']
 * 4. Policy isAuthenticated: Kiểm tra JWT token → Pass
 * 5. Policy isAdmin: Kiểm tra role === 'admin' → Pass
 * 6. Controller: CategoryController.delete xử lý
 * 7. Response: { message: "Xóa thành công" }
 *
 * VÍ DỤ 3: User thường cố xóa category
 * 1. Request: DELETE /api/categories/1
 * 2. Routes: Gọi CategoryController.delete
 * 3. Policies: delete: ['isAuthenticated', 'isAdmin']
 * 4. Policy isAuthenticated: Pass (có token)
 * 5. Policy isAdmin: Fail (role === 'user' !== 'admin')
 * 6. Response: 403 Forbidden { error: "Bạn không có quyền..." }
 * 7. Controller: KHÔNG CHẠY (bị chặn bởi policy)
 *
 * VÍ DỤ 4: User đặt hàng
 * 1. Request: POST /api/orders
 * 2. Routes: Gọi OrderController.create
 * 3. Policies: create: ['isAuthenticated']
 * 4. Policy isAuthenticated: Pass (có token)
 * 5. Controller: OrderController.create xử lý
 * 6. Response: { message: "Đặt hàng thành công", order: {...} }
 *
 * ============================================================
 * 💡 SO SÁNH VỚI ĐỜI THỰC:
 * ============================================================
 *
 * POLICIES GIỐNG NHƯ BẢO VỆ:
 * - Public (true): Ai cũng vào được (sảnh công cộng)
 * - isAuthenticated: Phải có thẻ ra vào (nhân viên công ty)
 * - isAdmin: Phải có thẻ cấp cao (quản lý)
 *
 * LUỒNG:
 * 1. Request đến cổng (Routes)
 * 2. Bảo vệ kiểm tra (Policies)
 * 3. Nếu pass → Vào phòng (Controller)
 * 4. Nếu fail → Chặn lại (403/401)
 *
 * ============================================================
 * 🔗 BƯỚC TIẾP THEO:
 * ============================================================
 *
 * 1. Test API bằng Postman:
 *    - Tạo user thường → Lấy token
 *    - Cố gọi POST /api/categories → 403
 *    - Tạo admin → Lấy token
 *    - Gọi POST /api/categories → 201
 *
 * 2. Frontend:
 *    - Lưu token vào localStorage
 *    - Gửi token trong header: Authorization: Bearer <token>
 *    - Ẩn/hiện UI dựa trên role
 *
 * 3. Nâng cấp AuthController:
 *    - Trả về role trong JWT payload
 *    - Frontend dùng role để hiển thị menu admin
 *
 * ============================================================
 */

export const API_BASE_URL = "http://localhost:1337";

export const API_ENDPOINTS = {

  auth: {
    register: "/api/register", // POST: Đăng ký user mới
    login: "/api/login", // POST: Đăng nhập
    logout: "/api/logout", // POST: Đăng xuất (nếu có)
    verifyOTP: "/api/otp/verify", // POST: Xác thực OTP
    sendOTP: "/api/otp/send", // POST: Gửi OTP
  },

  products: {
    getAll: "/api/products", // GET: Lấy danh sách products (có query params)
    getById: (id) => `/api/products/${id}`, // GET: Lấy 1 product theo ID
    create: "/api/products", // POST: Tạo product mới (Admin)
    update: (id) => `/api/products/${id}`, // PUT: Cập nhật product (Admin)
    delete: (id) => `/api/products/${id}`, // DELETE: Xóa product (Admin)
  },

  categories: {
    getAll: "/api/categories", // GET: Lấy danh sách categories
    getById: (id) => `/api/categories/${id}`, // GET: Chi tiết category
    create: "/api/categories", // POST: Tạo category (Admin)
    update: (id) => `/api/categories/${id}`, // PUT: Cập nhật (Admin)
    delete: (id) => `/api/categories/${id}`, // DELETE: Xóa (Admin)
  },

  orders: {
    create: "/api/orders", // POST: Tạo order mới (User)
    getMine: "/api/orders/mine", // GET: Đơn hàng của user hiện tại
    getById: (id) => `/api/orders/${id}`, // GET: Chi tiết order
    getAll: "/api/orders", // GET: Tất cả orders (Admin)
    updateStatus: (id) => `/api/orders/${id}/status`, // PUT: Cập nhật status (Admin)
  },

  upload: {
    image: "/api/upload", // POST: Upload ảnh
    delete: "/api/upload", // DELETE: Xóa ảnh (query param: ?filename=xxx)
  },
};

export const STORAGE_KEYS = {
  USER: "my-cms-user", // Lưu thông tin user đã login
  TOKEN: "my-cms-token", // Lưu JWT token (backup, vì đã có cookie)
  CART: "my-cms-cart", // Lưu giỏ hàng
  FAVORITES: "my-cms-favorites", // Lưu danh sách sản phẩm yêu thích
  THEME: "my-cms-theme", // Lưu theme (light/dark)
  RECENT_SEARCHES: "my-cms-recent-searches", // Lưu từ khóa tìm kiếm gần đây
};

export const USER_ROLES = {
  USER: "user", // User thường
  ADMIN: "admin", // Admin (full quyền)
};

export const ORDER_STATUS = {
  PENDING_PAYMENT: "Chờ thanh toán", // Mới tạo, chưa thanh toán
  PROCESSING: "Đang xử lý", // Đã thanh toán, chưa giao
  SHIPPING: "Đang giao", // Đang trên đường giao
  DELIVERED: "Đã giao", // Đã giao thành công
  CANCELLED: "Đã hủy", // Đã hủy
};

export const PAGINATION = {
  DEFAULT_PAGE: 1, // Trang mặc định
  DEFAULT_LIMIT: 10, // Số items/trang mặc định
  PRODUCTS_PER_PAGE: 12, // Số products hiển thị/trang
  ORDERS_PER_PAGE: 10, // Số orders hiển thị/trang
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB (5 * 1024KB * 1024B)
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "webp"],
};

export const MESSAGES = {

  success: {
    login: "Đăng nhập thành công!",
    register: "Đăng ký thành công!",
    logout: "Đăng xuất thành công!",
    productCreated: "Tạo sản phẩm thành công!",
    productUpdated: "Cập nhật sản phẩm thành công!",
    productDeleted: "Xóa sản phẩm thành công!",
    categoryCreated: "Tạo danh mục thành công!",
    categoryUpdated: "Cập nhật danh mục thành công!",
    categoryDeleted: "Xóa danh mục thành công!",
    orderCreated: "Đặt hàng thành công!",
    orderUpdated: "Cập nhật đơn hàng thành công!",
    addedToCart: "Đã thêm vào giỏ hàng!",
    addedToFavorites: "Đã thêm vào yêu thích!",
  },

  error: {
    loginFailed: "Đăng nhập thất bại. Vui lòng kiểm tra lại email/password.",
    registerFailed: "Đăng ký thất bại. Email có thể đã tồn tại.",
    unauthorized: "Bạn cần đăng nhập để thực hiện thao tác này.",
    forbidden: "Bạn không có quyền truy cập.",
    notFound: "Không tìm thấy dữ liệu.",
    serverError: "Lỗi server. Vui lòng thử lại sau.",
    networkError: "Lỗi kết nối. Vui lòng kiểm tra internet.",
    invalidInput: "Dữ liệu không hợp lệ.",
    fileTooLarge: `File quá lớn. Kích thước tối đa ${
      FILE_UPLOAD.MAX_SIZE / 1024 / 1024
    }MB.`,
    invalidFileType: `Chỉ chấp nhận file: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(
      ", "
    )}`,
    outOfStock: "Sản phẩm đã hết hàng.",
    insufficientStock: "Số lượng trong kho không đủ.",
  },

  loading: {
    default: "Đang tải...",
    login: "Đang đăng nhập...",
    register: "Đang đăng ký...",
    uploading: "Đang upload...",
    processing: "Đang xử lý...",
  },

  confirm: {
    deleteProduct: "Bạn có chắc muốn xóa sản phẩm này?",
    deleteCategory: "Bạn có chắc muốn xóa danh mục này?",
    cancelOrder: "Bạn có chắc muốn hủy đơn hàng?",
    logout: "Bạn có chắc muốn đăng xuất?",
    clearCart: "Bạn có chắc muốn xóa toàn bộ giỏ hàng?",
  },
};

export const ROUTES = {

  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SHOP: "/shop",
  PRODUCT_DETAIL: (id) => `/product/${id}`,
  CART: "/cart",

  PROFILE: "/profile",
  USER_ORDERS: "/user-orders",
  FAVORITES: "/favorites",
  SHIPPING: "/shipping",
  PLACE_ORDER: "/place-order",
  ORDER_DETAIL: (id) => `/order/${id}`,

  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_USERS: "/admin/users",
  ADMIN_PRODUCT_CREATE: "/admin/product/create",
  ADMIN_PRODUCT_EDIT: (id) => `/admin/product/edit/${id}`,
};

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export const VALIDATION = {
  email: {
    required: "Email là bắt buộc",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Email không hợp lệ",
    },
  },
  password: {
    required: "Password là bắt buộc",
    minLength: {
      value: 6,
      message: "Password phải có ít nhất 6 ký tự",
    },
  },
  productName: {
    required: "Tên sản phẩm là bắt buộc",
    minLength: {
      value: 3,
      message: "Tên sản phẩm phải có ít nhất 3 ký tự",
    },
  },
  price: {
    required: "Giá là bắt buộc",
    min: {
      value: 0,
      message: "Giá phải lớn hơn 0",
    },
  },
  stock: {
    required: "Số lượng là bắt buộc",
    min: {
      value: 0,
      message: "Số lượng không được âm",
    },
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  STORAGE_KEYS,
  USER_ROLES,
  ORDER_STATUS,
  PAGINATION,
  FILE_UPLOAD,
  MESSAGES,
  ROUTES,
  THEMES,
  VALIDATION,
};

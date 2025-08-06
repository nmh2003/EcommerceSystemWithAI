/**
 * ============================================================
 * seedData.js - SCRIPT TẠO DỮ LIỆU MẪU CHO TOÀN BỘ DATABASE
 * ============================================================
 *
 * 📚 MỤC ĐÍCH:
 * - Tạo dữ liệu mẫu cho toàn bộ hệ thống sau khi database bị drop
 * - Populate database với users, categories, products, orders
 * - Giúp test đầy đủ các tính năng frontend và backend
 *
 * 🎯 CÁCH CHẠY:
 * cd e:\DOCUMENT\projects\EcomFin\fin\my-cms\backend
 * node seedData.js
 *
 * 🔄 WORKFLOW:
 * 1. Kết nối MongoDB
 * 2. Tạo categories (3-4 danh mục)
 * 3. Tạo users (3-4 users, 1 admin)
 * 4. Tạo products (10-20 sản phẩm)
 * 5. Tạo orders (3-4 đơn hàng)
 * 6. Log kết quả và thống kê
 *
 * ============================================================
 */

// ============================================
// IMPORTS
// ============================================
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt"); // Để hash password

// ============================================
// CONFIG
// ============================================
const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "mycms";

// Collections
const COLLECTIONS = {
  users: "user",
  categories: "category",
  products: "product",
  orders: "order",
};

// ============================================
// DỮ LIỆU MẪU (SAMPLE DATA)
// ============================================

/**
 * 📖 CATEGORIES MẪU
 * Ý nghĩa: Danh mục sản phẩm cơ bản
 * Giá trị: 4 danh mục phổ biến
 */
const SAMPLE_CATEGORIES = [
  {
    name: "Điện thoại",
    description: "Smartphone và điện thoại di động",
    image: "/images/phone-category.jpg",
  },
  {
    name: "Laptop",
    description: "Máy tính xách tay và laptop",
    image: "/images/laptop-category.jpg",
  },
  {
    name: "Phụ kiện",
    description: "Phụ kiện công nghệ và điện tử",
    image: "/images/accessories-category.jpg",
  },
  {
    name: "Đồ gia dụng",
    description: "Đồ dùng gia đình và nhà bếp",
    image: "/images/home-category.jpg",
  },
];

/**
 * 📖 USERS MẪU
 * Ý nghĩa: Tài khoản người dùng để test
 * Giá trị: 4 users với 1 admin
 */
const SAMPLE_USERS = [
  {
    email: "admin@example.com",
    password: "admin123", // Sẽ được hash
    role: "admin",
    fullName: "Administrator",
    address: "123 Đường Admin, Quận 1, TP.HCM",
    phone: "0900000000",
  },
  {
    email: "user1@example.com",
    password: "user123",
    role: "user",
    fullName: "Nguyễn Văn A",
    address: "456 Đường ABC, Quận 2, TP.HCM",
    phone: "0912345678",
  },
  {
    email: "user2@example.com",
    password: "user123",
    role: "user",
    fullName: "Trần Thị B",
    address: "789 Đường XYZ, Quận 3, TP.HCM",
    phone: "0987654321",
  },
  {
    email: "user3@example.com",
    password: "user123",
    role: "user",
    fullName: "Lê Văn C",
    address: "321 Đường DEF, Quận 4, TP.HCM",
    phone: "0977777777",
  },
];

/**
 * 📖 PRODUCTS MẪU
 * Ý nghĩa: Sản phẩm để test CRUD và ordering
 * Giá trị: 12 sản phẩm đa dạng
 */
const SAMPLE_PRODUCTS = [
  // Điện thoại
  {
    name: "iPhone 15 Pro Max",
    description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP",
    price: 29990000,
    image: "/uploads/1760352463029-pto20e.jpg",
    brand: "Apple",
    countInStock: 10,
    rating: 4.8,
    numReviews: 25,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung Galaxy S24 Ultra với S Pen, camera 200MP",
    price: 26990000,
    image: "/uploads/1760353646939-bdwztc.jpg",
    brand: "Samsung",
    countInStock: 8,
    rating: 4.6,
    numReviews: 18,
  },
  {
    name: "Xiaomi 14 Pro",
    description: "Xiaomi 14 Pro camera Leica, chip Snapdragon 8 Gen 3",
    price: 18990000,
    image: "/uploads/1760353763924-nrkz8c.jpg",
    brand: "Xiaomi",
    countInStock: 15,
    rating: 4.4,
    numReviews: 12,
  },

  // Laptop
  {
    name: "MacBook Air M3",
    description: "MacBook Air với chip M3, màn hình Liquid Retina",
    price: 34990000,
    image: "/uploads/1760353951491-vjqusk.jpg",
    brand: "Apple",
    countInStock: 5,
    rating: 4.9,
    numReviews: 32,
  },
  {
    name: "Dell XPS 13",
    description: "Dell XPS 13 màn hình 13.4 inch, chip Intel Core i7",
    price: 28990000,
    image: "/uploads/1760354686466-7am3be.jpg",
    brand: "Dell",
    countInStock: 7,
    rating: 4.5,
    numReviews: 15,
  },
  {
    name: "ASUS ROG Strix G15",
    description: "ASUS ROG Strix G15 gaming laptop, RTX 4070",
    price: 45990000,
    image: "/uploads/image.png",
    brand: "ASUS",
    countInStock: 3,
    rating: 4.7,
    numReviews: 28,
  },

  // Phụ kiện
  {
    name: "AirPods Pro 2",
    description: "Tai nghe không dây AirPods Pro thế hệ 2",
    price: 5990000,
    image: "/uploads/iphone15.jpg",
    brand: "Apple",
    countInStock: 20,
    rating: 4.6,
    numReviews: 45,
  },
  {
    name: "Samsung Galaxy Buds 3",
    description: "Tai nghe không dây Samsung Galaxy Buds 3",
    price: 3490000,
    image: "/uploads/1760352463029-pto20e.jpg",
    brand: "Samsung",
    countInStock: 12,
    rating: 4.3,
    numReviews: 22,
  },
  {
    name: "Logitech MX Master 3S",
    description: "Chuột không dây Logitech MX Master 3S",
    price: 2490000,
    image: "/uploads/1760353646939-bdwztc.jpg",
    brand: "Logitech",
    countInStock: 18,
    rating: 4.8,
    numReviews: 38,
  },

  // Đồ gia dụng
  {
    name: "iRobot Roomba j7+",
    description: "Robot hút bụi thông minh iRobot Roomba j7+",
    price: 15990000,
    image: "/uploads/1760353763924-nrkz8c.jpg",
    brand: "iRobot",
    countInStock: 6,
    rating: 4.5,
    numReviews: 19,
  },
  {
    name: "Philips Air Fryer XXL",
    description: "Nồi chiên không dầu Philips dung tích 7L",
    price: 7990000,
    image: "/uploads/1760353951491-vjqusk.jpg",
    brand: "Philips",
    countInStock: 9,
    rating: 4.4,
    numReviews: 31,
  },
  {
    name: "Dyson V15 Detect",
    description: "Máy hút bụi Dyson V15 Detect laser",
    price: 18990000,
    image: "/uploads/1760354686466-7am3be.jpg",
    brand: "Dyson",
    countInStock: 4,
    rating: 4.7,
    numReviews: 27,
  },
];

/**
 * 📖 ORDERS MẪU
 * Ý nghĩa: Đơn hàng để test order management
 * Giá trị: 4 đơn hàng với trạng thái khác nhau
 */
const SAMPLE_ORDERS = [
  // Đơn hàng đã giao
  {
    orderItems: [
      {
        product: null, // Sẽ set sau khi tạo products
        name: "iPhone 15 Pro Max",
        qty: 1,
        price: 29990000,
        image: "/uploads/1760352463029-pto20e.jpg",
      },
      {
        product: null,
        name: "AirPods Pro 2",
        qty: 1,
        price: 5990000,
        image: "/uploads/iphone15.jpg",
      },
    ],
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      address: "456 Đường ABC, Quận 2, TP.HCM",
      city: "TP.HCM",
      phone: "0912345678",
    },
    paymentMethod: "COD",
    totalPrice: 35990000,
    shippingPrice: 0,
    taxPrice: 3599000,
    isPaid: true,
    paidAt: new Date("2025-01-10T10:00:00Z"),
    isDelivered: true,
    deliveredAt: new Date("2025-01-12T14:30:00Z"),
    notes: "Giao hàng cẩn thận",
  },

  // Đơn hàng đang giao
  {
    orderItems: [
      {
        product: null,
        name: "MacBook Air M3",
        qty: 1,
        price: 34990000,
        image: "/uploads/1760353951491-vjqusk.jpg",
      },
    ],
    shippingAddress: {
      fullName: "Trần Thị B",
      address: "789 Đường XYZ, Quận 3, TP.HCM",
      city: "TP.HCM",
      phone: "0987654321",
    },
    paymentMethod: "Bank Transfer",
    totalPrice: 34990000,
    shippingPrice: 0,
    taxPrice: 3499000,
    isPaid: true,
    paidAt: new Date("2025-01-15T09:15:00Z"),
    isDelivered: false,
    notes: "Khách VIP, ưu tiên giao hàng",
  },

  // Đơn hàng chờ thanh toán
  {
    orderItems: [
      {
        product: null,
        name: "Dell XPS 13",
        qty: 1,
        price: 28990000,
        image: "/uploads/1760354686466-7am3be.jpg",
      },
      {
        product: null,
        name: "Logitech MX Master 3S",
        qty: 2,
        price: 2490000,
        image: "/uploads/1760353646939-bdwztc.jpg",
      },
    ],
    shippingAddress: {
      fullName: "Lê Văn C",
      address: "321 Đường DEF, Quận 4, TP.HCM",
      city: "TP.HCM",
      phone: "0977777777",
    },
    paymentMethod: "COD",
    totalPrice: 33980000,
    shippingPrice: 50000,
    taxPrice: 3398000,
    isPaid: false,
    notes: "Gọi điện trước khi giao",
  },

  // Đơn hàng vừa tạo
  {
    orderItems: [
      {
        product: null,
        name: "Samsung Galaxy Buds 3",
        qty: 1,
        price: 3490000,
        image: "/uploads/1760352463029-pto20e.jpg",
      },
    ],
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      address: "456 Đường ABC, Quận 2, TP.HCM",
      city: "TP.HCM",
      phone: "0912345678",
    },
    paymentMethod: "E-wallet",
    totalPrice: 3490000,
    shippingPrice: 30000,
    taxPrice: 349000,
    isPaid: false,
    notes: "Đơn hàng nhỏ, giao nhanh",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * 📖 HASH PASSWORD
 * Ý nghĩa: Mã hóa mật khẩu trước khi lưu
 * Giá trị: Bảo mật tài khoản user
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 📖 GET RANDOM CATEGORY
 * Ý nghĩa: Chọn category ngẫu nhiên cho product
 * Giá trị: Phân bổ products đều vào các categories
 */
function getRandomCategory(categories) {
  return categories[Math.floor(Math.random() * categories.length)]._id;
}

/**
 * 📖 GET USER BY EMAIL
 * Ý nghĩa: Tìm user theo email
 * Giá trị: Liên kết order với user
 */
function getUserByEmail(users, email) {
  return users.find((user) => user.email === email);
}

/**
 * 📖 GET PRODUCT BY NAME
 * Ý nghĩa: Tìm product theo tên
 * Giá trị: Liên kết order items với products
 */
function getProductByName(products, name) {
  return products.find((product) => product.name === name);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedDatabase() {
  let client;

  try {
    console.log("🚀 Bắt đầu tạo dữ liệu mẫu cho toàn bộ database...");

    // -------------------------------------------------------
    // BƯỚC 1: KẾT NỐI MONGODB
    // -------------------------------------------------------
    console.log("📡 Kết nối MongoDB...");
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("✅ Kết nối thành công!");

    const db = client.db(DB_NAME);

    // -------------------------------------------------------
    // BƯỚC 2: TẠO CATEGORIES
    // -------------------------------------------------------
    console.log("📂 Tạo categories...");
    const categoriesCollection = db.collection(COLLECTIONS.categories);

    // Xóa categories cũ
    await categoriesCollection.deleteMany({});
    console.log("🗑️ Đã xóa categories cũ");

    // Thêm timestamps
    const categoriesToInsert = SAMPLE_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const categoriesResult = await categoriesCollection.insertMany(
      categoriesToInsert
    );
    console.log(`✅ Đã tạo ${categoriesResult.insertedCount} categories`);

    // Lấy categories đã tạo
    const categories = await categoriesCollection.find({}).toArray();

    // -------------------------------------------------------
    // BƯỚC 3: TẠO USERS
    // -------------------------------------------------------
    console.log("👥 Tạo users...");
    const usersCollection = db.collection(COLLECTIONS.users);

    // Xóa users cũ
    await usersCollection.deleteMany({});
    console.log("🗑️ Đã xóa users cũ");

    // Hash passwords và thêm timestamps
    const usersToInsert = [];
    for (const user of SAMPLE_USERS) {
      const hashedPassword = await hashPassword(user.password);
      usersToInsert.push({
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const usersResult = await usersCollection.insertMany(usersToInsert);
    console.log(`✅ Đã tạo ${usersResult.insertedCount} users`);

    // Lấy users đã tạo
    const users = await usersCollection.find({}).toArray();

    // -------------------------------------------------------
    // BƯỚC 4: TẠO PRODUCTS
    // -------------------------------------------------------
    console.log("📦 Tạo products...");
    const productsCollection = db.collection(COLLECTIONS.products);

    // Xóa products cũ
    await productsCollection.deleteMany({});
    console.log("🗑️ Đã xóa products cũ");

    // Thêm category và timestamps
    const productsToInsert = SAMPLE_PRODUCTS.map((product) => ({
      ...product,
      category: getRandomCategory(categories),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const productsResult = await productsCollection.insertMany(
      productsToInsert
    );
    console.log(`✅ Đã tạo ${productsResult.insertedCount} products`);

    // Lấy products đã tạo
    const products = await productsCollection.find({}).toArray();

    // -------------------------------------------------------
    // BƯỚC 5: TẠO ORDERS
    // -------------------------------------------------------
    console.log("📋 Tạo orders...");
    const ordersCollection = db.collection(COLLECTIONS.orders);

    // Xóa orders cũ
    await ordersCollection.deleteMany({});
    console.log("🗑️ Đã xóa orders cũ");

    // Liên kết orders với users và products
    const ordersToInsert = SAMPLE_ORDERS.map((order, index) => {
      // Liên kết với user
      let userId;
      if (index === 0 || index === 3) {
        userId = getUserByEmail(users, "user1@example.com")._id;
      } else if (index === 1) {
        userId = getUserByEmail(users, "user2@example.com")._id;
      } else {
        userId = getUserByEmail(users, "user3@example.com")._id;
      }

      // Liên kết orderItems với products
      const orderItemsWithIds = order.orderItems.map((item) => ({
        ...item,
        product: getProductByName(products, item.name)._id,
      }));

      return {
        ...order,
        user: userId,
        orderItems: orderItemsWithIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const ordersResult = await ordersCollection.insertMany(ordersToInsert);
    console.log(`✅ Đã tạo ${ordersResult.insertedCount} orders`);

    // -------------------------------------------------------
    // BƯỚC 6: THỐNG KÊ VÀ LOG KẾT QUẢ
    // -------------------------------------------------------
    console.log("\n📊 THỐNG KÊ DATABASE:");

    const stats = {
      categories: await categoriesCollection.countDocuments(),
      users: await usersCollection.countDocuments(),
      products: await productsCollection.countDocuments(),
      orders: await ordersCollection.countDocuments(),
    };

    console.log(`- Categories: ${stats.categories}`);
    console.log(`- Users: ${stats.users}`);
    console.log(`- Products: ${stats.products}`);
    console.log(`- Orders: ${stats.orders}`);

    // Log sample data
    console.log("\n👥 USERS TẠO ĐƯỢC:");
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.fullName} (${user.email}) - ${user.role}`
      );
    });

    console.log("\n📦 PRODUCTS MẪU:");
    const sampleProducts = products.slice(0, 3);
    sampleProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - ${product.price.toLocaleString()}đ`
      );
    });

    console.log("\n📋 ORDERS MẪU:");
    const sampleOrders = await ordersCollection.find({}).limit(2).toArray();
    for (let i = 0; i < sampleOrders.length; i++) {
      const order = sampleOrders[i];
      console.log(
        `${i + 1}. Order ${order._id
          .toString()
          .slice(-6)} - ${order.totalPrice.toLocaleString()}đ - ${
          order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"
        }`
      );
    }

    console.log("\n🔐 TÀI KHOẢN TEST:");
    console.log("- Admin: admin@example.com / admin123");
    console.log("- User1: user1@example.com / user123");
    console.log("- User2: user2@example.com / user123");
    console.log("- User3: user3@example.com / user123");
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    // -------------------------------------------------------
    // BƯỚC 7: ĐÓNG KẾT NỐI
    // -------------------------------------------------------
    if (client) {
      await client.close();
      console.log("🔌 Đã đóng kết nối MongoDB");
    }
  }
}

// ============================================
// RUN SCRIPT
// ============================================
console.log("=".repeat(60));
console.log("🎯 SCRIPT TẠO DỮ LIỆU MẪU CHO TOÀN BỘ DATABASE");
console.log("=".repeat(60));

seedDatabase()
  .then(() => {
    console.log("=".repeat(60));
    console.log("🎉 Hoàn thành! Database đã có dữ liệu mẫu.");
    console.log("Chạy 'sails lift' để start server và test APIs.");
    console.log("=".repeat(60));
  })
  .catch(console.error);

/**
 * ============================================================
 * 📚 HƯỚNG DẪN SỬ DỤNG:
 * ============================================================
 *
 * 1. ĐẢM BẢO MONGODB ĐANG CHẠY:
 *    - Mở MongoDB Compass
 *    - Kiểm tra connection: mongodb://localhost:27017
 *
 * 2. CHẠY SCRIPT:
 *    cd e:\DOCUMENT\projects\EcomFin\fin\my-cms\backend
 *    node seedData.js
 *
 * 3. KIỂM TRA KẾT QUẢ:
 *    - Mở Postman test APIs:
 *      GET /api/categories
 *      GET /api/products
 *      GET /api/users (admin only)
 *      GET /api/orders (admin only)
 *
 * 4. TEST LOGIN:
 *    - POST /api/auth/login
 *    - Body: { "email": "admin@example.com", "password": "admin123" }
 *    - Sẽ nhận JWT token
 *
 * 5. CHẠY FRONTEND:
 *    cd ../frontend
 *    npm run dev
 *    → Test login, xem products, đặt hàng
 *
 * ============================================================
 * 🔧 TÙY CHỈNH DỮ LIỆU:
 * ============================================================
 *
 * THAY ĐỔI SỐ LƯỢNG:
 * - SAMPLE_PRODUCTS: Thêm/bớt products
 * - SAMPLE_USERS: Thêm users
 * - SAMPLE_ORDERS: Thêm orders
 *
 * THAY ĐỔI DỮ LIỆU:
 * - Sửa SAMPLE_CATEGORIES để thêm danh mục
 * - Sửa SAMPLE_PRODUCTS để thay giá, tên
 * - Sửa SAMPLE_USERS để đổi password
 *
 * ============================================================
 * 💡 Ý NGHĨA CỦA DỮ LIỆU MẪU:
 * ============================================================
 *
 * USERS:
 * - 1 Admin: Để test quản lý hệ thống
 * - 3 Users: Để test đặt hàng, profile
 *
 * PRODUCTS:
 * - 12 Products đa dạng: Điện thoại, laptop, phụ kiện, gia dụng
 * - Giá thực tế: Từ 2.5M đến 45M
 * - Stock đa dạng: Còn hàng/hết hàng
 *
 * ORDERS:
 * - 4 Orders với trạng thái khác nhau:
 *   - Đã giao: Test lịch sử đơn hàng
 *   - Đang giao: Test tracking
 *   - Chờ thanh toán: Test payment
 *   - Vừa tạo: Test order mới
 *
 * ============================================================
 */

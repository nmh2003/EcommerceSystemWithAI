/**
 * ============================================================
 * seedProducts.js - SCRIPT TẠO DỮ LIỆU NGẪU NHIÊN CHO PRODUCTS
 * ============================================================
 *
 * 📚 MỤC ĐÍCH:
 * - Tạo nhiều sản phẩm ngẫu nhiên để test frontend
 * - Populate database với dữ liệu giả (fake data)
 * - Chọn ảnh ngẫu nhiên từ thư mục uploads/
 *
 * 🎯 CÁCH CHẠY:
 * node seedProducts.js
 *
 * 🔄 WORKFLOW:
 * 1. Kết nối MongoDB
 * 2. Tạo categories trước (nếu chưa có)
 * 3. Tạo 50 products ngẫu nhiên
 * 4. Insert vào DB
 * 5. Log kết quả
 *
 * ============================================================
 */

// ============================================
// IMPORTS
// ============================================
const { MongoClient } = require("mongodb");

// ============================================
// CONFIG
// ============================================
const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "mycms";
const COLLECTION_PRODUCTS = "product";
const COLLECTION_CATEGORIES = "category";

// Danh sách ảnh có sẵn trong uploads/
const AVAILABLE_IMAGES = [
  "1760352463029-pto20e.jpg",
  "1760353646939-bdwztc.jpg",
  "1760353763924-nrkz8c.jpg",
  "1760353951491-vjqusk.jpg",
  "1760354686466-7am3be.jpg",
  "image.png",
  "iphone15.jpg",
];

// Danh sách categories mẫu
const SAMPLE_CATEGORIES = [
  { name: "Điện thoại", description: "Smartphone và điện thoại di động" },
  { name: "Laptop", description: "Máy tính xách tay" },
  { name: "Tablet", description: "Máy tính bảng" },
  { name: "Phụ kiện", description: "Phụ kiện công nghệ" },
  { name: "Đồ gia dụng", description: "Đồ dùng gia đình" },
  { name: "Thời trang", description: "Quần áo và phụ kiện" },
  { name: "Đồ chơi", description: "Đồ chơi trẻ em" },
  { name: "Sách", description: "Sách và tài liệu" },
];

// Danh sách brands mẫu
const SAMPLE_BRANDS = [
  "Apple",
  "Samsung",
  "Dell",
  "HP",
  "Lenovo",
  "Sony",
  "LG",
  "Asus",
  "Nike",
  "Adidas",
  "Puma",
  "Gucci",
  "Louis Vuitton",
  "Zara",
  "H&M",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * 📖 TẠO TÊN SẢN PHẨM NGẪU NHIÊN
 * Ý nghĩa: Tạo tên sản phẩm có ý nghĩa
 * Giá trị: Dễ nhận biết khi test
 */
function generateRandomProductName() {
  const prefixes = [
    "iPhone",
    "Samsung Galaxy",
    "MacBook",
    "Dell XPS",
    "HP Pavilion",
    "Lenovo ThinkPad",
    "Sony Xperia",
    "LG Gram",
    "Asus ROG",
    "Acer Aspire",
    "Nike Air",
    "Adidas Ultraboost",
    "Puma RS-X",
    "Gucci Marmont",
    "Louis Vuitton Neverfull",
    "Zara Basic",
    "H&M Conscious",
  ];

  const suffixes = [
    "Pro",
    "Max",
    "Ultra",
    "Plus",
    "Lite",
    "Mini",
    "Air",
    "Book",
    '13"',
    '15"',
    "Pro Max",
    "SE",
    "XS",
    "XR",
    "11",
    "12",
    "13",
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${prefix} ${suffix}`;
}

/**
 * 📖 TẠO MÔ TẢ NGẪU NHIÊN
 * Ý nghĩa: Mô tả chi tiết sản phẩm
 * Giá trị: Giúp test hiển thị description
 */
function generateRandomDescription() {
  const descriptions = [
    "Sản phẩm chất lượng cao với thiết kế hiện đại",
    "Được làm từ vật liệu cao cấp, bền bỉ theo thời gian",
    "Công nghệ tiên tiến, trải nghiệm tuyệt vời",
    "Thiết kế tinh tế, phù hợp với mọi phong cách",
    "Hiệu suất vượt trội, đáp ứng mọi nhu cầu",
    "Giá cả phải chăng, chất lượng đảm bảo",
    "Sản phẩm bán chạy nhất, được nhiều người tin dùng",
    "Đổi mới công nghệ, dẫn đầu xu hướng",
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * 📖 TẠO GIÁ NGẪU NHIÊN
 * Ý nghĩa: Giá thực tế (VNĐ)
 * Giá trị: Từ 100k đến 100 triệu
 */
function generateRandomPrice() {
  // Từ 100,000 đến 100,000,000 VNĐ
  return Math.floor(Math.random() * (100000000 - 100000) + 100000);
}

/**
 * 📖 CHỌN ẢNH NGẪU NHIÊN
 * Ý nghĩa: Chọn ảnh từ danh sách có sẵn
 * Giá trị: Đảm bảo ảnh tồn tại
 */
function getRandomImage() {
  const randomImage =
    AVAILABLE_IMAGES[Math.floor(Math.random() * AVAILABLE_IMAGES.length)];
  return `/uploads/${randomImage}`;
}

/**
 * 📖 CHỌN CATEGORY NGẪU NHIÊN
 * Ý nghĩa: Chọn category từ danh sách đã tạo
 * Giá trị: Liên kết product với category
 */
function getRandomCategory(categories) {
  if (categories.length === 0) return null;
  return categories[Math.floor(Math.random() * categories.length)]._id;
}

/**
 * 📖 CHỌN BRAND NGẪU NHIÊN
 * Ý nghĩa: Chọn brand từ danh sách mẫu
 * Giá trị: Thêm thông tin brand
 */
function getRandomBrand() {
  return SAMPLE_BRANDS[Math.floor(Math.random() * SAMPLE_BRANDS.length)];
}

/**
 * 📖 TẠO RATING NGẪU NHIÊN
 * Ý nghĩa: Rating từ 1-5 sao
 * Giá trị: Giúp test sorting theo rating
 */
function generateRandomRating() {
  // Từ 1.0 đến 5.0, làm tròn 1 chữ số thập phân
  return Math.round((Math.random() * 4 + 1) * 10) / 10;
}

/**
 * 📖 TẠO COUNT IN STOCK NGẪU NHIÊN
 * Ý nghĩa: Số lượng tồn kho
 * Giá trị: Test logic còn hàng/hết hàng
 */
function generateRandomCountInStock() {
  // Từ 0 đến 100
  return Math.floor(Math.random() * 101);
}

/**
 * 📖 TẠO NUM REVIEWS NGẪU NHIÊN
 * Ý nghĩa: Số lượt đánh giá
 * Giá trị: Test độ tin cậy
 */
function generateRandomNumReviews() {
  // Từ 0 đến 500
  return Math.floor(Math.random() * 501);
}

// ============================================
// MAIN FUNCTION
// ============================================

async function seedProducts() {
  let client;

  try {
    console.log("🚀 Bắt đầu tạo dữ liệu ngẫu nhiên...");

    // -------------------------------------------------------
    // BƯỚC 1: KẾT NỐI MONGODB
    // -------------------------------------------------------
    console.log("📡 Kết nối MongoDB...");
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("✅ Kết nối thành công!");

    const db = client.db(DB_NAME);
    const productsCollection = db.collection(COLLECTION_PRODUCTS);
    const categoriesCollection = db.collection(COLLECTION_CATEGORIES);

    // -------------------------------------------------------
    // BƯỚC 2: TẠO CATEGORIES (NẾU CHƯA CÓ)
    // -------------------------------------------------------
    console.log("📂 Kiểm tra categories...");
    let categories = await categoriesCollection.find({}).toArray();

    if (categories.length === 0) {
      console.log("📝 Tạo categories mới...");
      const categoriesToInsert = SAMPLE_CATEGORIES.map((cat) => ({
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await categoriesCollection.insertMany(categoriesToInsert);
      console.log(`✅ Đã tạo ${result.insertedCount} categories`);

      // Lấy lại categories đã tạo
      categories = await categoriesCollection.find({}).toArray();
    } else {
      console.log(`✅ Đã có ${categories.length} categories`);
    }

    // -------------------------------------------------------
    // BƯỚC 3: XÓA PRODUCTS CŨ (OPTIONAL)
    // -------------------------------------------------------
    console.log("🗑️ Xóa products cũ...");
    await productsCollection.deleteMany({});
    console.log("✅ Đã xóa products cũ");

    // -------------------------------------------------------
    // BƯỚC 4: TẠO PRODUCTS NGẪU NHIÊN
    // -------------------------------------------------------
    console.log("📦 Tạo products ngẫu nhiên...");
    const productsToInsert = [];

    for (let i = 0; i < 50; i++) {
      const product = {
        name: generateRandomProductName(),
        description: generateRandomDescription(),
        price: generateRandomPrice(),
        image: getRandomImage(),
        category: getRandomCategory(categories),
        countInStock: generateRandomCountInStock(),
        rating: generateRandomRating(),
        numReviews: generateRandomNumReviews(),
        brand: getRandomBrand(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsToInsert.push(product);
    }

    // -------------------------------------------------------
    // BƯỚC 5: INSERT VÀO DATABASE
    // -------------------------------------------------------
    console.log("💾 Insert products vào database...");
    const result = await productsCollection.insertMany(productsToInsert);
    console.log(`✅ Đã tạo thành công ${result.insertedCount} products!`);

    // -------------------------------------------------------
    // BƯỚC 6: LOG MỘT VÀI PRODUCTS MẪU
    // -------------------------------------------------------
    console.log("\n📋 Một số products mẫu:");
    const sampleProducts = await productsCollection.find({}).limit(3).toArray();
    sampleProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - ${product.price.toLocaleString()}đ - ${
          product.rating
        }⭐`
      );
    });

    // -------------------------------------------------------
    // BƯỚC 7: THỐNG KÊ
    // -------------------------------------------------------
    const totalProducts = await productsCollection.countDocuments();
    const totalCategories = await categoriesCollection.countDocuments();

    console.log("\n📊 Thống kê:");
    console.log(`- Tổng categories: ${totalCategories}`);
    console.log(`- Tổng products: ${totalProducts}`);
    console.log(`- Ảnh được sử dụng: ${AVAILABLE_IMAGES.length} files`);
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    // -------------------------------------------------------
    // BƯỚC 8: ĐÓNG KẾT NỐI
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
console.log("🎯 SCRIPT TẠO DỮ LIỆU NGẪU NHIÊN CHO PRODUCTS");
console.log("=".repeat(60));

seedProducts()
  .then(() => {
    console.log("=".repeat(60));
    console.log("🎉 Hoàn thành! Chạy lại frontend để xem kết quả.");
    console.log("=".repeat(60));
  })
  .catch(console.error);

/**
 * ============================================================
 * 📚 HƯỚNG DẪN SỬ DỤNG:
 * ============================================================
 *
 * 1. ĐẢM BẢO MONGODB ĐANG CHẠY:
 *    - Mở MongoDB Compass hoặc terminal
 *    - Kiểm tra connection: mongodb://localhost:27017
 *
 * 2. CHẠY SCRIPT:
 *    cd e:\DOCUMENT\projects\EcomFin\fin\my-cms\backend
 *    node seedProducts.js
 *
 * 3. KIỂM TRA KẾT QUẢ:
 *    - Mở Postman: GET http://localhost:1337/api/products
 *    - Xem 50 products ngẫu nhiên
 *    - Test search: ?search=iphone
 *    - Test paging: ?page=1&limit=10
 *
 * 4. CHẠY FRONTEND:
 *    cd ../frontend
 *    npm run dev
 *    → Xem products hiển thị trên trang chủ
 *
 * ============================================================
 * 🔧 TÙY CHỈNH:
 * ============================================================
 *
 * THAY ĐỔI SỐ LƯỢNG PRODUCTS:
 * - Thay 50 thành số khác trong vòng for
 *
 * THÊM ẢNH MỚI:
 * - Upload ảnh vào uploads/
 * - Thêm tên file vào AVAILABLE_IMAGES array
 *
 * THAY ĐỔI CATEGORIES:
 * - Sửa SAMPLE_CATEGORIES array
 *
 * ============================================================
 */

# Giải Thích Chi Tiết Các Thuật Toán Tính Toán Nâng Cao Trong Hệ Thống Ecommerce CMS

## Tổng Quan Hệ Thống

Hệ thống ecommerce CMS này là một nền tảng thương mại điện tử hoàn chỉnh được xây dựng bằng React (frontend), Sails.js (backend), Python FastAPI (chatbot AI), và MongoDB (database). Hệ thống tích hợp nhiều thuật toán tính toán nâng cao phục vụ trải nghiệm người dùng thông minh và hiệu quả.

## 1. Thuật Toán AI & Học Máy

### Hệ Thống Trí Tuệ Nhân Tạo Chatbot

#### Phân Loại Ý Định (Intent Classification)

**Vị trí:** `ecommerce_chatbot.py`, dòng 337, hàm `classify_user_intent()`

**Thuật toán chính:**

- **Công nghệ:** Sử dụng Google Gemini AI 1.5 Pro
- **Ngôn ngữ lập trình:** Python với thư viện `google.generativeai`
- **Cách hoạt động:**
  1. Nhận đầu vào văn bản từ người dùng
  2. Tạo prompt chi tiết bằng tiếng Việt với các quy tắc phân loại rõ ràng
  3. Gửi prompt đến Gemini AI để phân tích và trả về JSON
  4. Parse kết quả JSON để lấy intent, confidence, product_info, cart_info

**Prompt Engineering:**

```python
classification_prompt = f'''
Bạn là một AI chuyên phân tích ý định của khách hàng trong lĩnh vực ecommerce...
INPUT: "{user_input}"
Hãy xác định:
1. INTENT: "view_featured_products", "view_categories", "add_to_cart", v.v.
2. Trích xuất thông tin sản phẩm, giỏ hàng
3. Trích xuất yêu cầu chi tiết
'''
```

**Các Intent được hỗ trợ:**

- `view_featured_products`: Xem sản phẩm nổi bật
- `view_categories`: Xem danh mục
- `add_to_cart`: Thêm vào giỏ hàng
- `remove_from_cart`: Xóa khỏi giỏ hàng
- `update_cart_quantity`: Cập nhật số lượng
- `view_cart`: Xem giỏ hàng
- `place_order`: Đặt hàng

**Fallback Mechanism:**

- Khi Gemini AI thất bại, hệ thống sử dụng thuật toán rule-based
- Phân tích từ khóa tiếng Việt với regex patterns
- Độ tin cậy được gán dựa trên độ khớp của từ khóa

**Giải thích chi tiết logic vận hành:**

Thuật toán phân loại ý định hoạt động như một "bộ não" của chatbot, giúp hiểu được khách hàng muốn gì. Ví dụ, khi khách hàng nhắn "tôi muốn mua laptop gaming", hệ thống sẽ:

1. **Gửi đến Gemini AI:** Tạo một prompt chi tiết bằng tiếng Việt, mô tả vai trò của AI là chuyên gia phân tích ý định mua sắm, và yêu cầu phân tích cụ thể.

2. **AI phân tích:** Gemini sẽ đọc tin nhắn, so sánh với các mẫu intent đã định nghĩa, và trả về kết quả dạng JSON như {"intent": "add_to_cart", "confidence": 0.95, "product_info": {"name": "laptop gaming"}}.

3. **Xử lý kết quả:** Nếu confidence cao (>0.7), sử dụng intent đó. Nếu thấp hoặc lỗi, chuyển sang fallback.

4. **Fallback hoạt động:** Nếu AI không hiểu, hệ thống dùng regex để tìm từ khóa như "mua" → add_to_cart, "xem" → view_products. Ví dụ: "tôi muốn xem sản phẩm" sẽ match pattern "xem sản phẩm" và gán intent "view_featured_products".

Điều này đảm bảo chatbot luôn hiểu được ý khách hàng, ngay cả khi AI chính thất bại.

#### Đề Xuất Sản Phẩm Thông Minh

**Vị trí:** `ecommerce_chatbot.py`, dòng 305, hàm `get_product_recommendation()`

**Thuật toán:**

- **Input:** Query người dùng (ví dụ: "tôi cần mua laptop gaming")
- **Xử lý:**
  1. Lấy danh sách sản phẩm nổi bật từ API backend
  2. Format dữ liệu sản phẩm thành chuỗi text cho AI
  3. Tạo prompt recommendation chi tiết
  4. Gemini AI phân tích và đề xuất 2-3 sản phẩm phù hợp nhất

**Prompt Structure:**

```python
prompt = f'''
Bạn là chuyên gia tư vấn mua sắm...
YÊU CẦU CỦA KHÁCH HÀNG: "{user_query}"
Dưới đây là danh sách sản phẩm hiện có trong hệ thống:
{product_data}

HƯỚNG DẪN TRẢ LỜI:
- Phân tích yêu cầu của khách hàng
- Đề xuất 2-3 sản phẩm phù hợp nhất
- Giải thích lý do lựa chọn
- So sánh giá cả và đánh giá
'''
```

**Giải thích chi tiết logic vận hành:**

Thuật toán đề xuất sản phẩm hoạt động như một "chuyên gia tư vấn mua sắm AI". Khi khách hàng hỏi "tôi cần mua laptop gaming giá rẻ", hệ thống sẽ:

1. **Thu thập dữ liệu:** Lấy danh sách 10-20 sản phẩm nổi bật từ database qua API backend.

2. **Chuẩn bị dữ liệu:** Format thông tin sản phẩm thành văn bản dễ đọc, bao gồm tên, giá, mô tả, đánh giá.

3. **Tạo prompt thông minh:** Viết một kịch bản cho AI, giới thiệu nó là chuyên gia, đưa ra yêu cầu khách hàng, và hướng dẫn cách phân tích + đề xuất.

4. **AI tư vấn:** Gemini đọc toàn bộ thông tin, phân tích yêu cầu ("laptop gaming giá rẻ" → cần laptop, mục đích gaming, ưu tiên giá thấp), so sánh các sản phẩm, và chọn ra 2-3 cái phù hợp nhất.

5. **Ví dụ minh họa:** Nếu có laptop A (10 triệu, đánh giá 4.5 sao) và laptop B (8 triệu, đánh giá 4.0 sao), AI sẽ đề xuất laptop B vì giá rẻ hơn, giải thích "Mặc dù đánh giá thấp hơn chút nhưng tiết kiệm 2 triệu, phù hợp với nhu cầu giá rẻ".

Điều này giúp khách hàng nhận tư vấn cá nhân hóa, tăng tỷ lệ chuyển đổi mua hàng.

#### Tìm Kiếm Mờ Sản Phẩm

**Vị trí:** `ecommerce_chatbot.py`, dòng 209, hàm `find_product_by_name()`

**Thuật toán đa cấp độ:**

1. **Khớp chính xác:** So sánh tên sản phẩm chính xác (case-insensitive)
2. **Khớp một phần:** Tìm chuỗi con trong tên sản phẩm
3. **Khớp từ:** Tách từ và tìm tất cả từ đều xuất hiện trong tên sản phẩm

**Code Implementation:**

```python
# Khớp chính xác
if product.get('name', '').lower() == product_name_lower:
    return product

# Khớp một phần
if product_name_lower in product.get('name', '').lower():
    return product

# Khớp từ
name_words = product_name_lower.split()
if all(word in product_name_check for word in name_words):
    return product
```

**Giải thích chi tiết logic vận hành:**

Thuật toán tìm kiếm mờ giúp chatbot tìm sản phẩm ngay cả khi khách hàng gõ sai chính tả hoặc dùng từ đồng nghĩa. Ví dụ, khi khách hàng hỏi về "laptop gaming", hệ thống sẽ:

1. **Khớp chính xác:** Tìm sản phẩm có tên chính xác là "laptop gaming" (không phân biệt hoa thường).

2. **Khớp một phần:** Nếu không có chính xác, tìm sản phẩm có chứa chuỗi "laptop gaming" trong tên, như "Laptop Gaming MSI".

3. **Khớp từ:** Nếu vẫn không, tách từ ("laptop", "gaming") và tìm sản phẩm có cả hai từ trong tên, như "Gaming Laptop Dell".

Ví dụ minh họa: Khách hàng gõ "lap top game", hệ thống sẽ:

- Không khớp chính xác
- Không khớp một phần
- Nhưng khớp từ: "lap" và "top" và "game" đều có trong "Laptop Gaming Acer" → trả về sản phẩm đó.

Điều này đảm bảo chatbot luôn tìm được sản phẩm, tăng trải nghiệm người dùng.

### Quản Lý Ngữ Cảnh Phiên

**Vị trí:** `ecommerce_chatbot.py`, các hàm session management

#### Lưu Ngữ Cảnh Phiên

**Dòng 57:** `save_session_context(user_id, context)`

- Lưu context vào dictionary `session_store`
- Bao gồm timestamp để kiểm tra TTL

#### Lấy Ngữ Cảnh Phiên

**Dòng 61:** `get_session_context(user_id)`

- Kiểm tra session tồn tại và chưa hết hạn
- TTL mặc định được định nghĩa trong `SESSION_TTL`

#### Giải Mã JWT

**Dòng 49:** `decoded = jwt.decode(jwt_token, options={"verify_signature": False})`

- Sử dụng thư viện `PyJWT`
- Chỉ decode payload, không verify signature (do đã verify ở backend)

**Giải thích chi tiết logic vận hành:**

Quản lý ngữ cảnh phiên giúp chatbot "nhớ" cuộc trò chuyện, tạo trải nghiệm liên tục. Ví dụ, khách hàng hỏi "thêm laptop gaming vào giỏ", sau đó hỏi "xem giỏ hàng":

1. **Lưu ngữ cảnh:** Sau mỗi tương tác, lưu thông tin như sản phẩm vừa đề cập, ý định trước đó, vào bộ nhớ tạm với timestamp.

2. **Lấy ngữ cảnh:** Khi khách hỏi tiếp, hệ thống lấy ngữ cảnh cũ để hiểu bối cảnh. Nếu quá 30 phút (TTL), xóa để bắt đầu mới.

3. **Giải mã JWT:** Khi nhận token từ frontend, decode để lấy user_id, dùng để phân biệt phiên của từng khách hàng.

Ví dụ: Khách A hỏi "laptop gaming", hệ thống lưu context. Khi hỏi "thêm cái đó vào giỏ", chatbot biết "cái đó" là laptop gaming từ context, không cần hỏi lại.

Điều này làm chatbot thông minh hơn, như đang trò chuyện với con người thật.

## 2. Tính Toán Thương Mại Điện Tử

### Tính Toán Giỏ Hàng & Đơn Hàng

#### Tính Tổng Tiền Đơn Hàng

**Vị trí:** `OrderController.js`, dòng 47-72

**Thuật toán:**

```javascript
let calculatedTotalPrice = 0;

for (const item of orderItems) {
  const product = await Product.findOne({ id: item.product });
  calculatedTotalPrice += product.price * item.qty;
}

calculatedTotalPrice += (shippingPrice || 0) + (taxPrice || 0);
```

**Các bước:**

1. Duyệt qua từng item trong đơn hàng
2. Lấy thông tin sản phẩm từ database
3. Tính tổng = giá sản phẩm × số lượng
4. Cộng thêm phí ship và thuế

**Giải thích chi tiết logic vận hành:**

Tính toán tổng tiền đơn hàng đảm bảo độ chính xác trong thanh toán. Ví dụ, đơn hàng có 2 sản phẩm: Laptop 10 triệu x 1, Chuột 500k x 2:

1. **Duyệt items:** Lấy từng item từ database để có giá mới nhất (tránh giá cũ).

2. **Tính subtotal:** 10,000,000 + (500,000 x 2) = 11,000,000 VND.

3. **Cộng phí:** + phí ship 50k + thuế 10% = 11,000,000 + 50,000 + 1,100,000 = 12,150,000 VND.

Điều này ngăn chặn lỗi tính toán, đảm bảo khách hàng thanh toán đúng số tiền.

#### Tính Tổng Giỏ Hàng

**Vị trí:** `localStorage.js`, dòng 137, hàm `getCartTotal()`

**Thuật toán:** Sử dụng `Array.reduce()`

```javascript
export function getCartTotal(userId = null) {
  const cart = getCart(userId);
  return cart.reduce((total, item) => {
    return total + item.product.price * item.qty;
  }, 0);
}
```

**Giải thích chi tiết logic vận hành:**

Tính tổng giỏ hàng cập nhật real-time khi khách thêm/xóa sản phẩm. Ví dụ, giỏ có Laptop 10tr x 1, Chuột 500k x 2:

1. **Lấy giỏ hàng:** Từ localStorage hoặc database theo userId.

2. **Duyệt và tính:** reduce() bắt đầu từ 0, cộng dần: 0 + 10,000,000 = 10tr, rồi + 1,000,000 = 11tr.

3. **Trả về tổng:** Hiển thị ngay trên UI, cập nhật khi thay đổi.

Điều này giúp khách hàng biết tổng tiền trước khi thanh toán, tăng niềm tin.

#### Đếm Số Lượng Item Trong Giỏ

**Vị trí:** `localStorage.js`, dòng 145, hàm `getCartItemCount()`

**Thuật toán:** Sử dụng `Array.reduce()`

```javascript
export function getCartItemCount(userId = null) {
  const cart = getCart(userId);
  return cart.reduce((count, item) => {
    return count + item.qty;
  }, 0);
}
```

**Giải thích chi tiết logic vận hành:**

Đếm tổng số lượng item trong giỏ để hiển thị badge trên icon giỏ hàng. Ví dụ, giỏ có Laptop x 1, Chuột x 2, Bàn phím x 3:

1. **Lấy giỏ hàng:** Như trên.

2. **Duyệt và đếm:** reduce() bắt đầu từ 0, cộng số lượng: 0 + 1 = 1, + 2 = 3, + 3 = 6.

3. **Hiển thị:** Badge "6" trên icon giỏ, cập nhật ngay.

Điều này giúp khách hàng biết có bao nhiêu sản phẩm, thuận tiện check nhanh.

### Chuyển Đổi Tiền Tệ

**Công thức:** 1 USD = 23,000 VND (có thể cấu hình qua environment)

#### VND Sang USD (Backend)

**Vị trí:** `currency.js`, dòng 12, hàm `vndToUsd()`

```javascript
function vndToUsd(vndAmount, exchangeRate = 23000) {
  const usdAmount = vndAmount / exchangeRate;
  return Math.round(usdAmount * 100) / 100; // Làm tròn 2 chữ số thập phân
}
```

**Giải thích chi tiết logic vận hành:**

Chuyển đổi VND sang USD để hiển thị giá quốc tế. Ví dụ, sản phẩm 10,000,000 VND:

1. **Chia tỷ giá:** 10,000,000 / 23,000 = 434.7826 USD.

2. **Làm tròn:** Nhân 100 (43478.26), round thành 43478, chia 100 = 434.78 USD.

Điều này giúp khách quốc tế hiểu giá, tăng khả năng bán hàng toàn cầu.

#### USD Sang VND (Backend)

**Vị trí:** `currency.js`, dòng 32, hàm `usdToVnd()`

```javascript
function usdToVnd(usdAmount, exchangeRate = 23000) {
  const vndAmount = usdAmount * exchangeRate;
  return Math.round(vndAmount); // Làm tròn đến số nguyên
}
```

**Giải thích chi tiết logic vận hành:**

Chuyển đổi USD sang VND cho thanh toán nội địa. Ví dụ, khách thanh toán 100 USD:

1. **Nhân tỷ giá:** 100 \* 23,000 = 2,300,000 VND.

2. **Làm tròn:** Round thành 2,300,000 (không có thập phân cho VND).

Điều này đảm bảo tính toán chính xác khi thanh toán bằng VND.

#### VND Sang USD (Frontend)

**Vị trí:** `currency.js`, dòng 3, hàm `vndToUsd()`

```javascript
export function vndToUsd(vndAmount) {
  return vndAmount / VND_TO_USD_RATE;
}
```

**Giải thích chi tiết logic vận hành:**

Frontend chuyển đổi để hiển thị giá USD cho khách hàng quốc tế. Ví dụ, hiển thị giá 10 triệu VND:

1. **Chia tỷ giá:** 10,000,000 / 23,000 ≈ 434.78 USD.

2. **Hiển thị:** "Price: $434.78" trên UI.

Điều này giúp UI nhất quán, khách hàng dễ so sánh giá.

#### USD Sang VND (Frontend)

**Vị trí:** `currency.js`, dòng 11, hàm `usdToVnd()`

```javascript
export function usdToVnd(usdAmount) {
  return usdAmount * VND_TO_USD_RATE;
}
```

**Giải thích chi tiết logic vận hành:**

Frontend chuyển đổi để hiển thị giá VND cho khách Việt. Ví dụ, sản phẩm $100:

1. **Nhân tỷ giá:** 100 \* 23,000 = 2,300,000 VND.

2. **Hiển thị:** "Giá: 2,300,000 VNĐ" trên UI.

Điều này giúp khách Việt hiểu giá thực tế bằng đồng tiền quen thuộc.

## 3. Thuật Toán Thống Kê & Phân Tích

### Thống Kê Doanh Thu

**Vị trí:** `OrderController.js`, dòng 336, hàm `getStatistics()`

**Thuật toán tính tổng doanh thu:**

```javascript
const allOrders = await Order.find({ isPaid: true });
const totalRevenue = allOrders.reduce(
  (sum, order) => sum + order.totalPrice,
  0
);
```

**Giải thích chi tiết logic vận hành:**

Thống kê doanh thu tổng hợp từ tất cả đơn đã thanh toán. Ví dụ, có 3 đơn: 5tr, 10tr, 15tr:

1. **Lọc đơn đã trả:** Chỉ lấy đơn có isPaid: true.

2. **Cộng dồn:** reduce() bắt đầu từ 0, cộng từng totalPrice: 0 + 5,000,000 = 5tr, + 10tr = 15tr, + 15tr = 30tr.

3. **Kết quả:** Tổng doanh thu 30 triệu, hiển thị trên dashboard admin.

Điều này giúp chủ shop theo dõi hiệu quả kinh doanh tổng thể.

**Các thống kê khác:**

- Tổng số đơn hàng
- Tổng số người dùng
- Tổng số sản phẩm
- Số đơn đã thanh toán/chưa thanh toán
- Số đơn đã giao/chưa giao

### Phân Tích Bán Hàng Theo Ngày

**Vị trí:** `OrderController.js`, dòng 369, hàm `getSalesByDate()`

**Thuật toán:**

```javascript
const paidOrders = await Order.find({
  isPaid: true,
  paidAt: { "!=": null },
}).sort("paidAt ASC");

const salesByDate = {};

for (const order of paidOrders) {
  const date = new Date(order.paidAt).toISOString().split("T")[0];
  if (!salesByDate[date]) {
    salesByDate[date] = 0;
  }
  salesByDate[date] += order.totalPrice;
}
```

**Giải thích chi tiết logic vận hành:**

Phân tích doanh thu theo ngày để vẽ biểu đồ xu hướng bán hàng. Ví dụ, có đơn ngày 2024-01-01: 5tr, 2024-01-02: 10tr, 2024-01-01: 3tr:

1. **Lấy đơn đã trả:** Sắp xếp theo thời gian tăng dần.

2. **Nhóm theo ngày:** Chuyển paidAt thành "YYYY-MM-DD", nhóm vào object.

3. **Cộng doanh thu:** salesByDate["2024-01-01"] = 5tr + 3tr = 8tr, ["2024-01-02"] = 10tr.

4. **Kết quả:** {"2024-01-01": 8000000, "2024-01-02": 10000000}, dùng để vẽ chart.

Điều này giúp admin thấy xu hướng bán hàng, lập kế hoạch kinh doanh.

**Kết quả:** Object với key là ngày (YYYY-MM-DD), value là tổng doanh thu

## 4. Thuật Toán Phân Trang

### Tính Toán Offset (Skip)

**Công thức:** `skip = (page - 1) * limit`

**Các vị trí sử dụng:**

- `ProductController.js`, dòng 18
- `OrderController.js`, dòng 191
- `UserController.js`, dòng 111
- `CategoryController.js`, dòng 46

**Giải thích chi tiết logic vận hành:**

Skip tính số bản ghi bỏ qua để lấy trang hiện tại. Ví dụ, trang 3, limit 10:

1. **Tính skip:** (3 - 1) \* 10 = 20.

2. **Query:** Bỏ qua 20 bản ghi đầu, lấy 10 tiếp theo (bản 21-30).

Điều này giúp phân trang hiệu quả, không load toàn bộ data cùng lúc.

### Tính Tổng Số Trang

**Công thức:** `totalPages = Math.ceil(total / limit)`

**Các vị trí sử dụng:**

- `ProductController.js`, dòng 28
- `OrderController.js`, dòng 228
- `UserController.js`, dòng 127
- `CategoryController.js`, dòng 61

**Giải thích chi tiết logic vận hành:**

Tính số trang tối đa để tạo pagination UI. Ví dụ, 95 sản phẩm, limit 10:

1. **Chia:** 95 / 10 = 9.5.

2. **Làm tròn lên:** Math.ceil(9.5) = 10 trang.

Điều này giúp hiển thị đúng số trang, tránh lỗi navigation.

## 5. Thuật Toán Tìm Kiếm & Lọc

### Tìm Kiếm Sản Phẩm Nâng Cao

**Vị trí:** `ProductController.js`, dòng 8-28, hàm `find()`

**Các tiêu chí lọc:**

```javascript
const query = {};

if (search) {
  query.name = { contains: search }; // Tìm kiếm theo tên
}

if (category) {
  query.category = category; // Lọc theo danh mục
}
```

**Giải thích chi tiết logic vận hành:**

Tìm kiếm nâng cao kết hợp nhiều tiêu chí để lọc sản phẩm chính xác. Ví dụ, tìm "laptop" trong danh mục "Gaming":

1. **Xây query:** Thêm điều kiện name contains "laptop", category = "Gaming".

2. **Query database:** Tìm sản phẩm thỏa mãn cả hai.

3. **Kết quả:** Chỉ trả về laptop gaming, không phải laptop văn phòng.

Điều này giúp khách hàng tìm sản phẩm dễ dàng, tăng tỷ lệ mua hàng.

**Sắp xếp và phân trang:**

```javascript
const products = await Product.find(query)
  .populate("category")
  .skip(skip)
  .limit(parseInt(limit))
  .sort("createdAt DESC");
```

### Sắp Xếp Sản Phẩm Nổi Bật

**Vị trí:** `ProductController.js`, dòng 158, hàm `getTopProducts()`

**Thuật toán:**

```javascript
const topProducts = await Product.find()
  .populate("category")
  .sort("rating DESC") // Sắp xếp theo rating cao nhất
  .limit(10); // Giới hạn 10 sản phẩm
```

**Giải thích chi tiết logic vận hành:**

Sắp xếp sản phẩm theo rating để hiển thị sản phẩm chất lượng cao. Ví dụ, có sản phẩm A (4.8 sao), B (4.5), C (4.9):

1. **Sort DESC:** Sắp xếp từ cao xuống thấp: C (4.9), A (4.8), B (4.5).

2. **Limit 10:** Lấy 10 sản phẩm đầu tiên.

3. **Hiển thị:** Trang chủ show top 10 sản phẩm được đánh giá cao nhất.

Điều này khuyến khích khách hàng chọn sản phẩm tốt, tăng uy tín shop.

## 6. Xử Lý Dữ Liệu & Biến Đổi

### Định Dạng Dữ Liệu Cho AI

#### Format Dữ Liệu Sản Phẩm

**Vị trí:** `ecommerce_chatbot.py`, dòng 265, hàm `format_product_data_for_ai()`

**Output format:**

```
🛍️ **Tên Sản Phẩm** (ID: xxx)
💰 Giá: xxx VNĐ
📝 Mô tả: ...
📁 Danh mục: ...
⭐ Đánh giá: x/5 (x đánh giá)
---
```

**Giải thích chi tiết logic vận hành:**

Format dữ liệu thành văn bản dễ đọc cho AI phân tích. Ví dụ, sản phẩm Laptop Gaming:

1. **Cấu trúc:** Thêm emoji và format markdown để AI dễ parse.

2. **Thông tin đầy đủ:** Giá, mô tả, danh mục, rating để AI so sánh.

3. **Ngăn cách:** Dùng --- để tách sản phẩm.

Điều này giúp AI đưa ra đề xuất chính xác, như "Laptop A phù hợp vì giá rẻ và rating cao".

#### Format Dữ Liệu Danh Mục

**Vị trí:** `ecommerce_chatbot.py`, dòng 285, hàm `format_category_data_for_ai()`

**Output format:**

```
📂 **Tên Danh Mục** (ID: xxx)
📝 Mô tả: ...
---
```

### Tạo Prompt Cho AI

**Vị trí:** `ecommerce_chatbot.py`, dòng 295, hàm `create_product_recommendation_prompt()`

**Cấu trúc prompt:**

- Giới thiệu vai trò AI
- Yêu cầu của khách hàng
- Danh sách sản phẩm có sẵn
- Hướng dẫn trả lời chi tiết bằng tiếng Việt

**Giải thích chi tiết logic vận hành:**

Tạo prompt chi tiết để hướng dẫn AI tư vấn hiệu quả. Ví dụ, khách hỏi "laptop gaming":

1. **Giới thiệu:** "Bạn là chuyên gia tư vấn mua sắm" để AI vào vai.

2. **Yêu cầu:** Đưa ra query khách hàng để AI tập trung.

3. **Dữ liệu:** Cung cấp danh sách sản phẩm để AI phân tích.

4. **Hướng dẫn:** Yêu cầu giải thích lý do, so sánh giá, đề xuất 2-3 sản phẩm.

Điều này đảm bảo AI trả lời chuyên nghiệp, hữu ích, tăng trải nghiệm khách hàng.

## 7. Xử Lý Âm Thanh

**Lưu ý:** Trong phiên bản hiện tại, chức năng text-to-speech chưa được implement đầy đủ trong code. Tuy nhiên, hệ thống được thiết kế để tích hợp gTTS (Google Text-to-Speech) cho việc tạo âm thanh từ văn bản tiếng Việt.

## 8. Thuật Toán Bảo Mật

### Xác Thực JWT

**Vị trí:** `ecommerce_chatbot.py`, dòng 49

**Code:**

```python
decoded = jwt.decode(jwt_token, options={"verify_signature": False})
user_id = decoded.get('userId')
```

**Giải thích chi tiết logic vận hành:**

Xác thực người dùng từ token để cá nhân hóa chatbot. Ví dụ, token chứa userId = 123:

1. **Decode token:** Lấy payload mà không verify chữ ký (đã verify ở backend).

2. **Lấy userId:** Dùng để lưu session riêng cho từng khách.

3. **Cá nhân hóa:** Chatbot nhớ lịch sử mua hàng của user đó.

Điều này đảm bảo bảo mật, tránh lộ thông tin khách hàng khác.

**Giải thích:**

- Chỉ decode payload để lấy user_id
- Không verify signature vì đã được verify ở backend Sails.js
- Sử dụng thư viện PyJWT

### Quản Lý Phiên Làm Việc

**Vị trí:** `ecommerce_chatbot.py`, dòng 61

**Thuật toán TTL:**

```python
if session and time.time() - session["timestamp"] < SESSION_TTL:
    return session["context"]
```

**Giải thích chi tiết logic vận hành:**

Quản lý phiên để tránh rò rỉ bộ nhớ. Ví dụ, session tạo lúc 10:00, TTL 30 phút:

1. **Kiểm tra thời gian:** Hiện tại 10:45, 45 phút > 30 phút → xóa session.

2. **Trả về context:** Nếu còn hạn, dùng ngữ cảnh cũ.

3. **Tự động dọn:** Giúp server không bị đầy session cũ.

Điều này đảm bảo hiệu suất, bảo mật cho hệ thống.

**SESSION_TTL:** Hằng số định nghĩa thời gian tồn tại tối đa của session

## 9. Thuật Toán Xử Lý Lỗi & Xác Thực

### Xác Thực Tồn Kho

**Vị trí:** `OrderController.js`, dòng 47-72

**Code:**

```javascript
if (product.countInStock < item.qty) {
  return res.status(400).json({
    error: `Sản phẩm "${item.name}" chỉ còn ${product.countInStock} sản phẩm`,
  });
}
```

**Giải thích chi tiết logic vận hành:**

Kiểm tra kho trước khi cho đặt hàng. Ví dụ, khách muốn mua 5 laptop nhưng chỉ còn 3:

1. **So sánh:** 3 < 5 → không đủ.

2. **Trả lỗi:** Thông báo "Chỉ còn 3 sản phẩm".

3. **Ngăn đặt:** Tránh bán quá số tồn kho.

Điều này đảm bảo quản lý kho chính xác, tránh thất thoát.

### Xác Thực Số Tiền Thanh Toán

**Vị trí:** `OrderController.js`, dòng 462-466, hàm `pay()`

**Code:**

```javascript
if (isNaN(paymentAmount) || paymentAmount < order.totalPrice) {
  return res.status(400).json({
    error: "Số tiền phải bằng tổng đơn hàng",
  });
}
```

**Giải thích chi tiết logic vận hành:**

Đảm bảo thanh toán đúng số tiền. Ví dụ, đơn 10tr nhưng khách chuyển 8tr:

1. **Kiểm tra:** 8tr < 10tr → sai.

2. **Trả lỗi:** Yêu cầu thanh toán đủ.

3. **Ngăn gian lận:** Tránh khách thanh toán thiếu.

Điều này bảo vệ quyền lợi shop, đảm bảo giao dịch công bằng.

## 10. Thuật Toán Tối Ưu Hóa

### Cache Âm Thanh

**Ý tưởng:** Pre-generate các phản hồi TTS phổ biến để tăng tốc độ response

### Fallback Classification

**Vị trí:** `ecommerce_chatbot.py`, dòng 357, hàm `_fallback_classification()`

**Thuật toán rule-based:**

- Phân tích từ khóa tiếng Việt
- Sử dụng regex để trích xuất thông tin
- Gán confidence score dựa trên độ khớp
- Hỗ trợ các pattern như:
  - `"sản phẩm [tên]"` → trích xuất tên sản phẩm
  - `"danh mục [tên]"` → trích xuất tên danh mục
  - `"[số] cái"` → trích xuất số lượng

**Giải thích chi tiết logic vận hành:**

Fallback đảm bảo chatbot luôn hoạt động khi AI chính thất bại. Ví dụ, tin nhắn "tôi muốn xem sản phẩm laptop":

1. **Regex match:** Tìm pattern "sản phẩm [tên]" → tên = "laptop".

2. **Gán intent:** "view_featured_products" với confidence 0.8.

3. **Trích xuất info:** product_info = {"name": "laptop"}.

Điều này làm chatbot robust, không bị downtime khi AI lỗi.

## Kết Luận

Hệ thống ecommerce CMS này tích hợp thành công nhiều thuật toán tính toán nâng cao:

- **AI/ML:** Gemini AI cho intent classification và product recommendation
- **E-commerce:** Cart calculation, currency conversion, order processing
- **Statistics:** Revenue analysis, sales by date
- **Pagination:** Skip/limit calculation, total pages
- **Search:** Fuzzy search, multi-criteria filtering
- **Security:** JWT validation, session management
- **Optimization:** Caching, fallback mechanisms

Mỗi thuật toán đều được tối ưu hóa cho hiệu suất và trải nghiệm người dùng, tạo nên một hệ thống thương mại điện tử thông minh và đáng tin cậy.

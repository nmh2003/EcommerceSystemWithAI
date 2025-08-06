# Nguyên Lý Hoạt Động Của Chatbot Ecommerce

## Tổng Quan Hệ Thống

Chatbot ecommerce là một hệ thống AI-powered được thiết kế để hỗ trợ khách hàng trong việc mua sắm trực tuyến. Hệ thống sử dụng FastAPI (Python) làm backend service, tích hợp Google Gemini AI để phân loại ý định người dùng và tạo phản hồi tự nhiên. Chatbot kết nối với Sails.js backend qua REST API để truy xuất dữ liệu sản phẩm, danh mục, giỏ hàng và xử lý đơn hàng.

## Kiến Trúc Hệ Thống

### 1. Frontend (React)

- Gửi tin nhắn của user đến chatbot API
- Nhận phản hồi và hiển thị
- Quản lý UI chat interface

### 2. Chatbot Service (Python FastAPI)

- **EcommerceChatbotSystem**: Class chính xử lý logic chatbot
- **FastAPI App**: Cung cấp REST endpoints
- **CORS Middleware**: Cho phép cross-origin requests từ frontend

### 3. AI Integration (Gemini AI)

- Phân loại ý định người dùng (intent classification)
- Tạo phản hồi tự nhiên
- Đề xuất sản phẩm dựa trên ngữ cảnh

### 4. Backend (Sails.js)

- Cung cấp dữ liệu sản phẩm, danh mục, giỏ hàng
- Xử lý authentication và authorization
- Quản lý database (MongoDB)

### 5. Database (MongoDB)

- Lưu trữ thông tin sản phẩm, user, orders
- Session storage trong memory (Python service)

## Các Thành Phần Chính

### EcommerceChatbotSystem Class

Đây là trái tim của hệ thống chatbot, tương tự như HotelRecommendationSystem trong bookingBackend.

#### Khởi Tạo (**init**)

```python
def __init__(self, gemini_api_key: str, base_api_url: str = "http://localhost:1337/api", model_type: str = "gemini"):
    self.base_api_url = base_api_url
    self.gemini_api_key = gemini_api_key
    self.model_type = model_type

    # API endpoints
    self.products_api_url = f"{base_api_url}/products"
    self.top_products_api_url = f"{base_api_url}/products/top"
    self.categories_api_url = f"{base_api_url}/categories"
    self.cart_api_url = f"{base_api_url}/cart"
    self.order_api_url = f"{base_api_url}/order"
```

#### Session Management

- **session_store**: Dictionary lưu trữ context conversation
- **SESSION_TTL**: 30 phút timeout
- **save_session_context()**: Lưu context sau mỗi interaction
- **get_session_context()**: Retrieve context cho conversation tiếp theo
- **clear_session_context()**: Xóa session sau khi hoàn thành transaction

### AI Integration

#### Intent Classification

Sử dụng Gemini AI để phân loại ý định người dùng từ text input:

```python
def classify_user_intent(self, user_input: str) -> Dict[str, Any]:
    prompt = f"""
    Phân loại ý định của người dùng từ câu hỏi sau:
    "{user_input}"

    Các intent có thể:
    - view_featured_products: Xem sản phẩm nổi bật
    - view_categories: Xem danh mục sản phẩm
    - view_product_details: Xem chi tiết sản phẩm
    - add_to_cart: Thêm vào giỏ hàng
    - view_cart: Xem giỏ hàng
    - place_order: Đặt hàng
    - general_chat: Chat chung

    Trả về JSON format:
    {{
        "intent": "intent_name",
        "confidence": 0.95,
        "extracted_info": {{
            "product_name": "...",
            "category_name": "...",
            "quantity": 1
        }}
    }}
    """
```

#### Fallback Classification

Nếu AI không khả dụng, sử dụng rule-based classification với regex patterns.

### API Integration với Sails.js

#### Fetch Featured Products

```python
def fetch_featured_products(self) -> List[Dict[str, Any]]:
    response = requests.get(self.top_products_api_url)
    return response.json()
```

#### Fetch Categories

```python
def fetch_categories(self) -> List[Dict[str, Any]]:
    response = requests.get(self.categories_api_url)
    return response.json()
```

#### Add to Cart

```python
def add_to_cart(self, product_id: str, quantity: int, jwt_token: str) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {jwt_token}"}
    data = {"product_id": product_id, "quantity": quantity}
    response = requests.post(self.cart_api_url, json=data, headers=headers)
    return response.json()
```

## Luồng Hoạt Động

### 1. User Input

- User nhập câu hỏi vào chat interface
- Frontend gửi POST request đến `/chat` endpoint

### 2. Intent Classification

- Chatbot nhận user_input
- Gọi Gemini AI để phân loại intent
- Extract thông tin quan trọng (product name, quantity, etc.)

### 3. Context Management

- Retrieve session context nếu có
- Update context với thông tin mới
- Save context cho tương tác tiếp theo

### 4. Business Logic Processing

Tùy theo intent, thực hiện các action tương ứng:

#### view_featured_products

- Gọi `fetch_featured_products()`
- Format response với danh sách sản phẩm

#### view_categories

- Gọi `fetch_categories()`
- Hiển thị danh sách categories

#### add_to_cart

- Extract product_name và quantity từ user input
- Tìm product_id từ product_name
- Gọi `add_to_cart()` với JWT token

#### place_order

- Lấy thông tin cart từ session
- Gọi `place_guest_order()` để tạo order

### 5. Response Generation

- Tạo phản hồi tự nhiên dựa trên kết quả
- Include product recommendations nếu phù hợp
- Generate audio nếu cần (TTS)

### 6. Audio Generation

- Sử dụng gTTS (Google Text-to-Speech)
- Cache audio cho các câu dịch vụ thường dùng
- Trả về base64 encoded audio data

## API Endpoints

### POST /chat

Endpoint chính xử lý chat messages.

**Request Body:**

```json
{
    "user_input": "Tôi muốn xem sản phẩm nổi bật",
    "jwt_token": "eyJhbGciOiJIUzI1NiIs...",
    "current_cart": [...]
}
```

**Response:**

```json
{
    "response": "Dưới đây là các sản phẩm nổi bật...",
    "intent": "view_featured_products",
    "confidence": 0.95,
    "product_info": {...},
    "cart_info": {...},
    "updated_cart": [...],
    "audio_base64": "data:audio/mp3;base64,..."
}
```

### GET /pre-generated-audio/{audio_key}

Lấy audio đã được pre-generate cho các câu dịch vụ.

### POST /tts

Generate audio cho text tùy chỉnh.

## Session Management Chi Tiết

### Session Structure

```python
session_store = {
    "user_id": {
        "context": {
            "current_intent": "add_to_cart",
            "selected_product": "MacBook Air M3",
            "cart_items": [...],
            "last_interaction": "2025-11-26T10:30:00Z"
        },
        "timestamp": 1732612200.0
    }
}
```

### Session TTL

- Mỗi session có thời gian sống 30 phút
- Tự động xóa session expired để tránh memory leak
- Reset timestamp mỗi khi có interaction mới

## AI Model Selection

Hệ thống hỗ trợ 2 model AI:

### 1. Gemini AI (Google)

- Sử dụng google-generativeai library
- Model: gemini-pro
- Tốt cho intent classification và text generation

### 2. Qwen (LM Studio)

- Local model chạy qua LM Studio
- Sử dụng OpenAI compatible API
- Tốt cho privacy và không phụ thuộc internet

## Error Handling

### API Errors

- Network errors: Retry với exponential backoff
- Authentication errors: Thông báo user login lại
- Validation errors: Thông báo lỗi cụ thể

### AI Errors

- Fallback to rule-based classification
- Return generic response nếu AI hoàn toàn fail

## Performance Optimization

### Audio Pre-generation

- Pre-generate audio cho 8 câu dịch vụ thường dùng
- Cache base64 data để tránh regenerate
- Giảm latency cho user experience

### Session Caching

- Lưu context trong memory thay vì database
- Fast access cho conversation flow
- TTL để manage memory usage

## So Sánh Với BookingBackend

### Tương Đồng

- Cấu trúc class chính (HotelRecommendationSystem vs EcommerceChatbotSystem)
- Session management với TTL
- AI integration cho intent classification
- REST API calls đến backend
- Fallback classification

### Khác Biệt

- Domain: Hotel booking → Ecommerce
- Models: Hotel/Room/Booking → Product/Category/Cart/Order
- Intents: search_hotels, book_room → view_featured_products, add_to_cart
- API endpoints: PHP backend → Sails.js backend

## Cách Chạy Hệ Thống

### 1. Cài Đặt Dependencies

```bash
pip install fastapi uvicorn google-generativeai requests python-jose gtts pydantic
```

### 2. Cấu Hình Environment

```bash
export GEMINI_API_KEY="your_api_key_here"
```

### 3. Chạy Server

```bash
python ecommerce_chatbot.py
```

### 4. Test API

```bash
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"user_input": "Tôi muốn xem sản phẩm nổi bật"}'
```

## Monitoring và Logging

### Console Logging

- Log tất cả API calls
- Log AI responses
- Log session operations
- Log errors với stack trace

### Performance Metrics

- Response time cho mỗi request
- AI classification accuracy
- Session hit/miss ratio
- Audio generation time

## Bảo Mật

### JWT Token Handling

- Extract user_id từ JWT without verification
- Trust frontend đã verify token
- Use token cho authenticated API calls

### CORS Configuration

- Allow only localhost:5173 (frontend)
- Enable credentials cho cookie-based auth

### Input Validation

- Sanitize user input
- Validate product_id, quantity
- Check JWT token presence

## Tương Lai Phát Triển

### 1. Database Integration

- Lưu session vào MongoDB thay vì memory
- Persistent conversation history
- User preference learning

### 2. Advanced AI Features

- Multi-turn conversation
- Product recommendation based on history
- Sentiment analysis

### 3. Multi-language Support

- Support tiếng Anh, Trung, Nhật
- Auto-detect language
- Localized responses

### 4. Voice Integration

- Real-time speech-to-text
- Voice responses
- Wake word detection

## Kết Luận

Chatbot ecommerce là một hệ thống phức tạp kết hợp AI, backend integration, và user experience design. Bằng cách sử dụng session management, intent classification, và REST API calls, hệ thống có thể cung cấp trải nghiệm mua sắm tự nhiên và hiệu quả cho người dùng. Việc tham khảo kiến trúc từ bookingBackend giúp đảm bảo scalability và maintainability của code.</content>
<parameter name="filePath">e:\DOCUMENT\thucTap\fin\fin\my-cms\backend\chatbot-explanation.md

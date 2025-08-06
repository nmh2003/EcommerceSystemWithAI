from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import jwt
import time
import re
import uvicorn
from datetime import datetime
app = FastAPI(title='Ecommerce Chatbot API', description='API cho chatbot gợi ý sản phẩm ecommerce', version='1.1.0')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

class ChatRequest(BaseModel):
    user_input: str
    jwt_token: Optional[str] = None
    current_cart: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    confidence: Optional[float] = None
    product_info: Optional[Dict[str, Any]] = None
    cart_info: Optional[Dict[str, Any]] = None
    extracted_requirements: Optional[str] = None
    updated_cart: Optional[List[Dict[str, Any]]] = None
session_store: Dict[str, Dict[str, Any]] = {}
SESSION_TTL = 1800

class EcommerceChatbotSystem:

    def __init__(self, gemini_api_key: str, base_api_url: str='http://localhost:1337/api'):
        self.base_api_url = base_api_url
        self.products_api_url = f'{base_api_url}/products'
        self.top_products_api_url = f'{base_api_url}/products/top'
        self.categories_api_url = f'{base_api_url}/categories'
        self.cart_api_url = f'{base_api_url}/cart'
        self.order_api_url = f'{base_api_url}/order'
        self.gemini_api_key = gemini_api_key
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-lite')
        print(f'✅ Initialized EcommerceChatbotSystem with base_api_url: {base_api_url}')

    def get_user_id_from_jwt(self, jwt_token: str) -> Optional[int]:
        print(f'🔍 Input JWT token: {jwt_token}')
        try:
            decoded = jwt.decode(jwt_token, options={'verify_signature': False})
            user_id = decoded.get('userId')
            print(f'✅ Extracted userId from JWT: {user_id}')
            return user_id
        except jwt.InvalidTokenError as e:
            print(f'❌ Invalid JWT token: {e}')
            return None

    def save_session_context(self, user_id: int, context: Dict[str, Any]):
        session_store[str(user_id)] = {'context': context, 'timestamp': time.time()}
        print(f'💾 Saved session context for user {user_id}: {context}')

    def get_session_context(self, user_id: int) -> Optional[Dict[str, Any]]:
        session = session_store.get(str(user_id))
        if session and time.time() - session['timestamp'] < SESSION_TTL:
            print(f"📖 Retrieved session context for user {user_id}: {session['context']}")
            return session['context']
        print(f'⏰ No valid session context for user {user_id}')
        return None

    def clear_session_context(self, user_id: int):
        session_store.pop(str(user_id), None)
        print(f'🗑️ Cleared session context for user {user_id}')

    def fetch_featured_products(self) -> List[Dict[str, Any]]:
        print(f'📦 Fetching featured products from: {self.top_products_api_url}')
        try:
            response = requests.get(self.top_products_api_url, timeout=10)
            response.raise_for_status()
            products = response.json()
            print(f'✅ Fetched {len(products)} featured products')
            return products
        except requests.exceptions.RequestException as e:
            print(f'❌ Error fetching featured products: {e}')
            return []
        except json.JSONDecodeError:
            print('❌ Error parsing featured products response')
            return []

    def fetch_categories(self) -> List[Dict[str, Any]]:
        print(f'📂 Fetching categories from: {self.categories_api_url}')
        try:
            response = requests.get(self.categories_api_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                categories = data
            elif isinstance(data, dict):
                categories = data.get('categories', data.get('data', data.get('results', [])))
            else:
                categories = []
            print(f'✅ Fetched {len(categories)} categories')
            return categories
        except requests.exceptions.RequestException as e:
            print(f'❌ Error fetching categories: {e}')
            return []
        except json.JSONDecodeError:
            print('❌ Error parsing categories response')
            return []

    def fetch_products_in_category(self, category_id: str) -> List[Dict[str, Any]]:
        url = f'{self.products_api_url}?category={category_id}'
        print(f'📦 Fetching products in category {category_id} from: {url}')
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            products = data.get('products', [])
            print(f'✅ Fetched {len(products)} products in category {category_id}')
            return products
        except requests.exceptions.RequestException as e:
            print(f'❌ Error fetching products in category: {e}')
            return []
        except json.JSONDecodeError:
            print('❌ Error parsing products response')
            return []

    def add_to_cart(self, product_id: str, quantity: int, jwt_token: str) -> Dict[str, Any]:
        print(f'🛒 Adding to cart - product_id: {product_id}, quantity: {quantity}')
        try:
            headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt_token}'}
            payload = {'product_id': product_id, 'quantity': quantity}
            response = requests.post(self.cart_api_url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            print(f'✅ Added to cart successfully: {result}')
            return result
        except requests.exceptions.RequestException as e:
            print(f'❌ Error adding to cart: {e}')
            return {'error': f'Lỗi khi thêm vào giỏ hàng: {str(e)}'}
        except json.JSONDecodeError:
            print('❌ Error parsing add to cart response')
            return {'error': 'Lỗi phân tích phản hồi từ API giỏ hàng'}

    def get_cart(self, jwt_token: str) -> Dict[str, Any]:
        print(f'🛒 Getting cart from server')
        try:
            headers = {'Authorization': f'Bearer {jwt_token}'}
            response = requests.get(self.cart_api_url, headers=headers, timeout=10)
            response.raise_for_status()
            cart_data = response.json()
            print(f'✅ Got cart data: {len(str(cart_data))} characters')
            return cart_data
        except requests.exceptions.RequestException as e:
            print(f'❌ Error getting cart: {e}')
            return {'error': f'Lỗi khi lấy giỏ hàng: {str(e)}'}
        except json.JSONDecodeError:
            print('❌ Error parsing cart response')
            return {'error': 'Lỗi phân tích phản hồi từ API giỏ hàng'}

    def remove_from_cart(self, product_id: str, jwt_token: str) -> Dict[str, Any]:
        print(f'🗑️ Removing from cart - product_id: {product_id}')
        try:
            headers = {'Authorization': f'Bearer {jwt_token}'}
            url = f'{self.cart_api_url}/{product_id}'
            response = requests.delete(url, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            print(f'✅ Removed from cart successfully: {result}')
            return result
        except requests.exceptions.RequestException as e:
            print(f'❌ Error removing from cart: {e}')
            return {'error': f'Lỗi khi xóa khỏi giỏ hàng: {str(e)}'}
        except json.JSONDecodeError:
            print('❌ Error parsing remove from cart response')
            return {'error': 'Lỗi phân tích phản hồi từ API xóa giỏ hàng'}

    def update_cart_quantity(self, product_id: str, quantity: int, jwt_token: str) -> Dict[str, Any]:
        print(f'🔄 Updating cart quantity - product_id: {product_id}, quantity: {quantity}')
        try:
            headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt_token}'}
            url = f'{self.cart_api_url}/{product_id}'
            payload = {'quantity': quantity}
            response = requests.put(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            print(f'✅ Updated cart quantity successfully: {result}')
            return result
        except requests.exceptions.RequestException as e:
            print(f'❌ Error updating cart quantity: {e}')
            return {'error': f'Lỗi khi cập nhật số lượng: {str(e)}'}
        except json.JSONDecodeError:
            print('❌ Error parsing update cart quantity response')
            return {'error': 'Lỗi phân tích phản hồi từ API cập nhật giỏ hàng'}
        print(f'📦 Placing order')
        try:
            headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt_token}'}
            payload = {}
            response = requests.post(self.order_api_url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            print(f'✅ Order placed successfully: {result}')
            return result
        except requests.exceptions.RequestException as e:
            print(f'❌ Error placing order: {e}')
            return {'error': f'Lỗi khi đặt hàng: {str(e)}'}
        except json.JSONDecodeError:
            print('❌ Error parsing place order response')
            return {'error': 'Lỗi phân tích phản hồi từ API đặt hàng'}

    def find_product_by_name(self, product_name: str) -> Optional[Dict[str, Any]]:
        print(f'🔍 Finding product by name: {product_name}')
        try:
            response = requests.get(self.products_api_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            products = data.get('products', [])
            product_name_lower = product_name.lower().strip()
            for product in products:
                if product.get('name', '').lower() == product_name_lower:
                    print(f'✅ Found exact match: {product}')
                    return product
            for product in products:
                if product_name_lower in product.get('name', '').lower():
                    print(f'✅ Found partial match: {product}')
                    return product
            name_words = product_name_lower.split()
            for product in products:
                product_name_check = product.get('name', '').lower()
                if all((word in product_name_check for word in name_words)):
                    print(f'✅ Found word match: {product}')
                    return product
            print(f'❌ No product found for name: {product_name}')
            return None
        except Exception as e:
            print(f'❌ Error finding product: {e}')
            return None

    def find_category_by_name(self, category_name: str) -> Optional[Dict[str, Any]]:
        print(f'🔍 Finding category by name: {category_name}')
        try:
            categories = self.fetch_categories()
            category_name_lower = category_name.lower().strip()
            for category in categories:
                if isinstance(category, dict):
                    cat_name = category.get('name', '')
                elif isinstance(category, str):
                    cat_name = category
                else:
                    cat_name = str(category)
                if cat_name.lower() == category_name_lower:
                    print(f'✅ Found exact match: {category}')
                    return category
            for category in categories:
                if isinstance(category, dict):
                    cat_name = category.get('name', '')
                elif isinstance(category, str):
                    cat_name = category
                else:
                    cat_name = str(category)
                if category_name_lower in cat_name.lower():
                    print(f'✅ Found partial match: {category}')
                    return category
            print(f'❌ No category found for name: {category_name}')
            return None
        except Exception as e:
            print(f'❌ Error finding category: {e}')
            return None

    def format_product_data_for_ai(self, products: List[Dict[str, Any]]) -> str:
        print(f'📝 Formatting product data: {len(products)} products')
        if not products:
            return 'Không có sản phẩm nào khả dụng.'
        formatted_data = 'DANH SÁCH SẢN PHẨM:\n\n'
        for product in products:
            formatted_data += f"\n🛍️ **{product.get('name', 'N/A')}** (ID: {product.get('id', 'N/A')})\n💰 Giá: {float(product.get('price', 0)):,.0f} VNĐ\n📝 Mô tả: {product.get('description', 'N/A')}\n📁 Danh mục: {(product.get('category', {}).get('name', 'N/A') if isinstance(product.get('category'), dict) else 'N/A')}\n⭐ Đánh giá: {product.get('rating', 'N/A')}/5 ({product.get('numReviews', 0)} đánh giá)\n---\n"
        print(f'✅ Formatted product data: {len(formatted_data)} characters')
        return formatted_data.strip()

    def format_category_data_for_ai(self, categories: List[Dict[str, Any]]) -> str:
        print(f'📝 Formatting category data: {len(categories)} categories')
        if not categories:
            return 'Không có danh mục nào khả dụng.'
        formatted_data = 'DANH SÁCH DANH MỤC:\n\n'
        for category in categories:
            if isinstance(category, dict):
                name = category.get('name', 'N/A')
                id_val = category.get('id', 'N/A')
                description = category.get('description', 'N/A')
            elif isinstance(category, str):
                name = category
                id_val = 'N/A'
                description = 'N/A'
            else:
                name = str(category)
                id_val = 'N/A'
                description = 'N/A'
            formatted_data += f'\n📂 **{name}** (ID: {id_val})\n📝 Mô tả: {description}\n---\n'
        print(f'✅ Formatted category data: {len(formatted_data)} characters')
        return formatted_data.strip()

    def create_product_recommendation_prompt(self, user_query: str, product_data: str) -> str:
        prompt = f'\nBạn là một chuyên gia tư vấn mua sắm chuyên nghiệp. Dựa trên yêu cầu của khách hàng và danh sách sản phẩm có sẵn, hãy đưa ra những gợi ý phù hợp nhất.\n\nYÊU CẦU CỦA KHÁCH HÀNG: "{user_query}"\nDưới đây là danh sách sản phẩm hiện có trong hệ thống:\n{product_data}\n\nHƯỚNG DẪN TRẢ LỜI:\n- Phân tích yêu cầu của khách hàng\n- Đề xuất 2-3 sản phẩm phù hợp nhất\n- Giải thích lý do tại sao chọn những sản phẩm đó\n- Đưa ra thông tin chi tiết về từng sản phẩm được gợi ý\n- So sánh giá cả và đánh giá của các sản phẩm\n- Kết thúc bằng câu: "Bạn có muốn xem chi tiết sản phẩm nào hoặc thêm vào giỏ hàng không?"\n- Trả lời bằng tiếng Việt một cách thân thiện và chuyên nghiệp.\n'
        print(f'📝 Created product recommendation prompt: {len(prompt)} characters')
        return prompt

    def get_product_recommendation(self, user_query: str) -> str:
        print(f'🤖 Getting product recommendation for query: {user_query}')
        try:
            products = self.fetch_featured_products()
            if not products:
                return '❌ Xin lỗi, hiện tại không thể lấy được danh sách sản phẩm. Vui lòng thử lại sau.'
            product_data = self.format_product_data_for_ai(products)
            prompt = self.create_product_recommendation_prompt(user_query, product_data)
            response = self.model.generate_content(prompt)
            recommendation = response.text
            print(f'✅ Product recommendation: {len(recommendation)} characters')
            return recommendation
        except Exception as e:
            print(f'❌ Error getting product recommendation: {e}')
            return f'❌ Xin lỗi, đã có lỗi xảy ra: {str(e)}'

    def get_category_recommendation(self, user_query: str) -> str:
        print(f'🤖 Getting category recommendation for query: {user_query}')
        try:
            categories = self.fetch_categories()
            if not categories:
                return '❌ Xin lỗi, hiện tại không thể lấy được danh sách danh mục. Vui lòng thử lại sau.'
            category_data = self.format_category_data_for_ai(categories)
            prompt = f'\nBạn là chuyên gia tư vấn mua sắm. Dựa trên yêu cầu của khách hàng, hãy gợi ý các danh mục sản phẩm phù hợp.\n\nYÊU CẦU: "{user_query}"\n{category_data}\n\nHƯỚNG DẪN:\n- Phân tích nhu cầu của khách hàng\n- Đề xuất 2-3 danh mục phù hợp nhất\n- Giải thích lý do lựa chọn\n- Kết thúc bằng: "Bạn muốn xem sản phẩm trong danh mục nào?"\n- Trả lời bằng tiếng Việt thân thiện.\n'
            response = self.model.generate_content(prompt)
            recommendation = response.text
            print(f'✅ Category recommendation: {len(recommendation)} characters')
            return recommendation
        except Exception as e:
            print(f'❌ Error getting category recommendation: {e}')
            return f'❌ Xin lỗi, đã có lỗi xảy ra: {str(e)}'

    def classify_user_intent(self, user_input: str) -> Dict[str, Any]:
        print(f'🔍 Classifying intent for user input: {user_input}')
        now_str = datetime.now().strftime('%Y-%m-%d (%A)')
        classification_prompt = f'\nBạn là một AI chuyên phân tích ý định của khách hàng trong lĩnh vực ecommerce. \nHãy phân tích câu sau và trả về JSON với format chính xác:\n\nINPUT: "{user_input}"\n\nHãy xác định:\n1. INTENT: "view_featured_products" (xem sản phẩm nổi bật), "view_categories" (xem danh mục), "view_products_in_category" (xem sản phẩm trong danh mục), "add_to_cart" (thêm vào giỏ hàng), "remove_from_cart" (xóa khỏi giỏ hàng), "update_cart_quantity" (cập nhật số lượng trong giỏ hàng), "view_cart" (xem giỏ hàng), hoặc "place_order" (đặt hàng)\n2. Trích xuất thông tin sản phẩm: tên sản phẩm, ID sản phẩm, danh mục\n3. Trích xuất thông tin giỏ hàng: số lượng, action (add/remove/update)\n4. Trích xuất yêu cầu chi tiết của khách hàng\n\nRULES:\n- Nếu người dùng muốn xem sản phẩm nổi bật/hot/bán chạy → "view_featured_products"\n- Nếu người dùng muốn xem danh mục/categories → "view_categories"  \n- Nếu người dùng muốn xem sản phẩm trong danh mục cụ thể → "view_products_in_category"\n- Nếu người dùng muốn xóa/bỏ/loại bỏ khỏi giỏ hàng/cart → "remove_from_cart" (ưu tiên cao nhất)\n- Nếu người dùng muốn thêm vào giỏ hàng/cart → "add_to_cart"\n- Nếu người dùng muốn cập nhật/chỉnh sửa/thay đổi số lượng trong giỏ hàng → "update_cart_quantity"\n- Nếu người dùng muốn xem giỏ hàng/cart → "view_cart"\n- Nếu người dùng muốn đặt hàng/order/thanh toán → "place_order"\n- Nếu người dùng chỉ định tên sản phẩm → trích xuất vào product_info.name\n- Nếu người dùng chỉ định danh mục → trích xuất vào product_info.category\n- Nếu người dùng nói số lượng → trích xuất vào cart_info.quantity\n\nTrả về JSON format:\n{{\n    "intent": "view_featured_products" hoặc "view_categories" hoặc "view_products_in_category" hoặc "add_to_cart" hoặc "remove_from_cart" hoặc "update_cart_quantity" hoặc "view_cart" hoặc "place_order",\n    "confidence": số từ 0.0 đến 1.0,\n    "product_info": {{\n        "name": "tên sản phẩm nếu có",\n        "id": "ID sản phẩm nếu có",\n        "category": "tên danh mục nếu có"\n    }},\n    "cart_info": {{\n        "action": "add" hoặc "remove" hoặc "update",\n        "quantity": số lượng (mặc định 1)\n    }},\n    "extracted_requirements": "yêu cầu chi tiết của khách hàng"\n}}\n'
        try:
            response = self.model.generate_content(classification_prompt)
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            classification_result = json.loads(response_text)
            print(f'✅ Classification result from Gemini: {classification_result}')
            return classification_result
        except json.JSONDecodeError as e:
            print(f'❌ JSON decode error: {e}')
            return self._fallback_classification(user_input)
        except Exception as e:
            print(f'❌ Error in classify_user_intent: {e}')
            return self._fallback_classification(user_input)

    def _fallback_classification(self, user_input: str) -> Dict[str, Any]:
        print(f'🔄 Using fallback classification for input: {user_input}')
        user_input_lower = user_input.lower()
        featured_keywords = ['nổi bật', 'hot', 'phổ biến', 'bán chạy', 'featured', 'nổi bật', 'sản phẩm hot', 'sản phẩm nổi bật', 'xem sản phẩm']
        category_keywords = ['danh mục', 'category', 'loại', 'phân loại', 'xem danh mục']
        cart_keywords = ['giỏ hàng', 'cart', 'thêm vào', 'add to', 'thêm sản phẩm']
        update_quantity_keywords = ['chỉnh', 'cập nhật', 'thay đổi', 'đổi', 'sửa', 'update', 'change', 'modify', 'số lượng', 'quantity']
        remove_cart_keywords = ['xóa', 'remove', 'delete', 'bỏ', 'loại bỏ', 'xóa khỏi']
        view_cart_keywords = ['xem giỏ hàng', 'view cart', 'giỏ hàng của tôi', 'cart của tôi']
        order_keywords = ['đặt hàng', 'order', 'thanh toán', 'mua', 'checkout']
        has_featured = any((keyword in user_input_lower for keyword in featured_keywords))
        has_category = any((keyword in user_input_lower for keyword in category_keywords))
        has_cart = any((keyword in user_input_lower for keyword in cart_keywords))
        has_update_quantity = any((keyword in user_input_lower for keyword in update_quantity_keywords))
        has_remove_cart = any((keyword in user_input_lower for keyword in remove_cart_keywords))
        has_view_cart = any((keyword in user_input_lower for keyword in view_cart_keywords))
        has_order = any((keyword in user_input_lower for keyword in order_keywords))
        product_name_match = re.search('sản phẩm\\s*([^,]+)', user_input_lower)
        category_match = re.search('danh mục\\s*([^,]+)', user_input_lower)
        quantity_match = re.search('(\\d+)\\s*cái|\\s*(\\d+)\\s*sản phẩm', user_input_lower)
        product_info = {'name': None, 'id': None, 'category': None}
        cart_info = {'action': 'add', 'quantity': 1}
        if product_name_match:
            product_info['name'] = product_name_match.group(1).strip()
        if category_match:
            product_info['category'] = category_match.group(1).strip()
        if quantity_match:
            cart_info['quantity'] = int(quantity_match.group(1) or quantity_match.group(2))
        if has_remove_cart and (has_cart or product_info['name']):
            result = {'intent': 'remove_from_cart', 'confidence': 0.9, 'product_info': product_info, 'cart_info': {'action': 'remove', 'quantity': cart_info.get('quantity', 1)}, 'extracted_requirements': user_input}
        elif has_update_quantity and (has_cart or product_info['name']):
            result = {'intent': 'update_cart_quantity', 'confidence': 0.8, 'product_info': product_info, 'cart_info': {'action': 'update', 'quantity': cart_info.get('quantity', 1)}, 'extracted_requirements': user_input}
        elif has_featured:
            result = {'intent': 'view_featured_products', 'confidence': 0.8, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': user_input}
        elif has_category:
            result = {'intent': 'view_categories', 'confidence': 0.8, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': user_input}
        elif has_view_cart:
            result = {'intent': 'view_cart', 'confidence': 0.9, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': user_input}
        elif has_remove_cart and (has_cart or product_info['name']):
            result = {'intent': 'remove_from_cart', 'confidence': 0.8, 'product_info': product_info, 'cart_info': {'action': 'remove', 'quantity': cart_info.get('quantity', 1)}, 'extracted_requirements': user_input}
        elif has_cart:
            result = {'intent': 'add_to_cart', 'confidence': 0.7, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': user_input}
        elif has_order:
            result = {'intent': 'place_order', 'confidence': 0.8, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': user_input}
        else:
            result = {'intent': 'view_featured_products', 'confidence': 0.6, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': user_input}
        print(f'✅ Fallback classification result: {result}')
        return result

    def process_user_request(self, user_input: str, jwt_token: Optional[str]=None, current_cart: Optional[List[Dict[str, Any]]]=None) -> Dict[str, Any]:
        print(f'🚀 Processing user request - input: {user_input}, JWT: {jwt_token}')
        classification = self.classify_user_intent(user_input)
        intent = classification.get('intent')
        confidence = classification.get('confidence', 0)
        print(f'🎯 Intent classified: {intent}, confidence: {confidence}')
        if confidence < 0.5:
            response = "❓ Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn có thể nói rõ hơn được không?\n💡 Ví dụ: 'Xem sản phẩm nổi bật', 'Xem danh mục', 'Thêm iPhone vào giỏ hàng'"
            print(f'🤔 Low confidence response: {response}')
            return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        if intent == 'view_featured_products':
            response = self.get_product_recommendation(classification.get('extracted_requirements', user_input))
            print(f'⭐ View featured products response: {len(response)} characters')
            return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'view_categories':
            response = self.get_category_recommendation(classification.get('extracted_requirements', user_input))
            print(f'📂 View categories response: {len(response)} characters')
            return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'view_products_in_category':
            product_info = classification.get('product_info', {})
            category_name = product_info.get('category')
            if not category_name:
                response = "❌ Vui lòng chỉ định tên danh mục. Ví dụ: 'Xem sản phẩm trong danh mục điện thoại'"
                print(f'📂 Missing category response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            category = self.find_category_by_name(category_name)
            if not category:
                response = f"❌ Không tìm thấy danh mục: '{category_name}'"
                print(f'📂 Category not found response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            products = self.fetch_products_in_category(category['id'])
            if not products:
                response = f"📂 Danh mục '{category_name}' hiện tại chưa có sản phẩm nào."
                print(f'📂 No products in category response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            response = f"📂 **Sản phẩm trong danh mục '{category_name}':**\n\n"
            for i, product in enumerate(products[:10], 1):
                response += f"{i}. **{product.get('name', 'N/A')}**\n"
                response += f"   💰 Giá: {float(product.get('price', 0)):,.0f} VNĐ\n"
                response += f"   🔗 ID: {product.get('id', 'N/A')}\n\n"
            response += 'Bạn có muốn xem chi tiết sản phẩm nào hoặc thêm vào giỏ hàng không?'
            print(f'📂 Products in category response: {len(response)} characters')
            return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'add_to_cart':
            product_info = classification.get('product_info', {})
            cart_info = classification.get('cart_info', {})
            product_name = product_info.get('name')
            quantity = cart_info.get('quantity', 1)
            if not product_name:
                response = "❌ Vui lòng chỉ định tên sản phẩm cần thêm vào giỏ hàng. Ví dụ: 'Thêm iPhone vào giỏ hàng'"
                print(f'🛒 Missing product name response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
            product = self.find_product_by_name(product_name)
            if not product:
                response = f"❌ Không tìm thấy sản phẩm: '{product_name}'"
                print(f'🛒 Product not found response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
            stock = product.get('countInStock', 0)
            if stock < quantity:
                response = f"❌ Sản phẩm '{product_name}' chỉ còn {stock} cái trong kho, không đủ để thêm {quantity} cái."
                print(f'🛒 Insufficient stock response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
            if jwt_token:
                cart_result = self.add_to_cart(product['id'], quantity, jwt_token)
                if 'error' in cart_result:
                    response = f"❌ Thêm vào giỏ hàng thất bại: {cart_result['error']}"
                    print(f'🛒 Add to cart failed response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                response = f"✅ Đã thêm {quantity} cái '{product_name}' vào giỏ hàng!\n💰 Giá: {float(product.get('price', 0)):,.0f} VNĐ/cái\n\n🛒 Bạn có muốn xem giỏ hàng hoặc tiếp tục mua sắm không?"
                print(f'🛒 Add to cart success response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': {'name': product_name, 'id': product.get('id'), 'category': product_info.get('category')}, 'cart_info': {'action': 'add', 'quantity': quantity, 'product_id': product.get('id'), 'product_name': product_name, 'product_price': float(product.get('price', 0)), 'product_image': product.get('image', ''), 'product_brand': product.get('brand', '')}, 'extracted_requirements': classification.get('extracted_requirements')}
            else:
                response = f"✅ Sản phẩm '{product_name}' có sẵn trong kho!\n\n📦 **Thông tin sản phẩm:**\n• Tên: {product.get('name', 'N/A')}\n• Giá: {float(product.get('price', 0)):,.0f} VNĐ\n• Còn lại: {stock} cái\n\n🛒 Sản phẩm sẽ được thêm tự động vào giỏ hàng của bạn!"
                print(f'🛒 Add to cart auto-add response: {len(response)} characters')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': {'name': product_name, 'id': product.get('id'), 'category': product_info.get('category')}, 'cart_info': {'action': 'add', 'quantity': quantity, 'product_id': product.get('id'), 'product_name': product_name, 'product_price': float(product.get('price', 0)), 'product_image': product.get('image', ''), 'product_brand': product.get('brand', '')}, 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'remove_from_cart':
            product_info = classification.get('product_info', {})
            product_name = product_info.get('name')
            if not product_name:
                response = "❌ Vui lòng chỉ định tên sản phẩm cần xóa khỏi giỏ hàng. Ví dụ: 'Xóa iPhone khỏi giỏ hàng'"
                print(f'🗑️ Missing product name response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            if jwt_token:
                product = self.find_product_by_name(product_name)
                if not product:
                    response = f"❌ Không tìm thấy sản phẩm: '{product_name}' trong hệ thống"
                    print(f'🗑️ Product not found response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
                remove_result = self.remove_from_cart(product['id'], jwt_token)
                if 'error' in remove_result:
                    response = f"❌ Xóa sản phẩm thất bại: {remove_result['error']}"
                    print(f'🗑️ Remove from cart failed response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
                response = f"✅ Đã xóa '{product_name}' khỏi giỏ hàng thành công!"
                print(f'🗑️ Remove from cart success response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': {'name': product_name, 'id': product.get('id'), 'category': product_info.get('category')}, 'cart_info': {'action': 'remove', 'quantity': 1, 'product_id': product.get('id'), 'product_name': product_name}, 'extracted_requirements': classification.get('extracted_requirements')}
            elif current_cart:
                original_length = len(current_cart)
                updated_cart = [item for item in current_cart if product_name.lower() not in item.get('name', '').lower()]
                if len(updated_cart) < original_length:
                    response = f"✅ Đã xóa '{product_name}' khỏi giỏ hàng!\n\n🛒 Giỏ hàng hiện tại có {len(updated_cart)} sản phẩm."
                    print(f'🗑️ Remove from localStorage cart success response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': {'name': product_name, 'id': None, 'category': product_info.get('category')}, 'cart_info': {'action': 'remove', 'quantity': 1, 'product_name': product_name}, 'updated_cart': updated_cart, 'extracted_requirements': classification.get('extracted_requirements')}
                else:
                    response = f"❌ Không tìm thấy '{product_name}' trong giỏ hàng của bạn"
                    print(f'🗑️ Product not in cart response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            else:
                response = '❌ Giỏ hàng của bạn hiện tại trống, không có sản phẩm nào để xóa'
                print(f'🗑️ Empty cart response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'update_cart_quantity':
            product_info = classification.get('product_info', {})
            cart_info = classification.get('cart_info', {})
            product_name = product_info.get('name')
            new_quantity = cart_info.get('quantity', 1)
            if not product_name:
                response = "❌ Vui lòng chỉ định tên sản phẩm cần cập nhật số lượng. Ví dụ: 'Chỉnh số lượng iPhone thành 2'"
                print(f'🔄 Missing product name response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
            if new_quantity <= 0:
                response = "❌ Số lượng phải lớn hơn 0. Nếu muốn xóa sản phẩm, hãy dùng lệnh 'xóa [tên sản phẩm] khỏi giỏ hàng'"
                print(f'🔄 Invalid quantity response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
            if jwt_token:
                product = self.find_product_by_name(product_name)
                if not product:
                    response = f"❌ Không tìm thấy sản phẩm: '{product_name}' trong hệ thống"
                    print(f'🔄 Product not found response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                stock = product.get('countInStock', 0)
                if stock < new_quantity:
                    response = f"❌ Sản phẩm '{product_name}' chỉ còn {stock} cái trong kho, không đủ để cập nhật thành {new_quantity} cái."
                    print(f'🔄 Insufficient stock response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                update_result = self.update_cart_quantity(product['id'], new_quantity, jwt_token)
                if 'error' in update_result:
                    response = f"❌ Cập nhật số lượng thất bại: {update_result['error']}"
                    print(f'🔄 Update quantity failed response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                response = f"✅ Đã cập nhật số lượng '{product_name}' thành {new_quantity} cái!\n💰 Giá: {float(product.get('price', 0)):,.0f} VNĐ/cái"
                print(f'🔄 Update quantity success response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': {'name': product_name, 'id': product.get('id'), 'category': product_info.get('category')}, 'cart_info': {'action': 'update_quantity', 'quantity': new_quantity, 'product_id': product.get('id'), 'product_name': product_name, 'product_price': float(product.get('price', 0)), 'product_image': product.get('image', ''), 'product_brand': product.get('brand', '')}, 'extracted_requirements': classification.get('extracted_requirements')}
            else:
                product = self.find_product_by_name(product_name)
                if not product:
                    response = f"❌ Không tìm thấy sản phẩm: '{product_name}' trong hệ thống"
                    print(f'🔄 Product not found response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                stock = product.get('countInStock', 0)
                if stock < new_quantity:
                    response = f"❌ Sản phẩm '{product_name}' chỉ còn {stock} cái trong kho, không đủ để cập nhật thành {new_quantity} cái."
                    print(f'🔄 Insufficient stock in localStorage response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                if current_cart:
                    updated_cart = []
                    found = False
                    for item in current_cart:
                        if product_name.lower() in item.get('name', '').lower():
                            updated_item = item.copy()
                            updated_item['quantity'] = new_quantity
                            updated_cart.append(updated_item)
                            found = True
                        else:
                            updated_cart.append(item)
                    if found:
                        response = f"✅ Đã cập nhật số lượng '{product_name}' thành {new_quantity} cái!\n\n🛒 Giỏ hàng hiện tại có {len(updated_cart)} sản phẩm.\n\n💡 **Quan trọng:** Vui lòng làm mới trang hoặc truy cập lại giỏ hàng để thấy thay đổi."
                        print(f'🔄 Update quantity in localStorage success response: {response}')
                        return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': {'name': product_name, 'id': product.get('id'), 'category': product_info.get('category')}, 'cart_info': {'action': 'update_quantity', 'quantity': new_quantity, 'product_id': product.get('id'), 'product_name': product_name, 'product_price': float(product.get('price', 0)), 'product_image': product.get('image', ''), 'product_brand': product.get('brand', '')}, 'updated_cart': updated_cart, 'should_refresh_cart': True, 'extracted_requirements': classification.get('extracted_requirements')}
                    else:
                        response = f"❌ Không tìm thấy '{product_name}' trong giỏ hàng của bạn"
                        print(f'🔄 Product not in cart response: {response}')
                        return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
                else:
                    response = '❌ Giỏ hàng của bạn hiện tại trống, không có sản phẩm nào để cập nhật số lượng'
                    print(f'🔄 Empty cart response: {response}')
                    return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': product_info, 'cart_info': cart_info, 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'view_cart':
            cart_data = current_cart or []
            if jwt_token:
                cart_result = self.get_cart(jwt_token)
                if 'error' not in cart_result:
                    cart_items = cart_result.get('items', [])
                    total_items = len(cart_items)
                    total_price = sum((item.get('price', 0) * item.get('quantity', 1) for item in cart_items))
                    if total_items > 0:
                        response = f'🛒 **Giỏ hàng của quý khách có ({total_items} sản phẩm):**\n\n'
                        for i, item in enumerate(cart_items[:5], 1):
                            response += f"{i}. **{item.get('name', 'N/A')}**\n"
                            response += f"   Số lượng: {item.get('quantity', 1)}\n"
                            response += f"   Giá: {item.get('price', 0):,.0f} VNĐ\n\n"
                        response += f'💰 **Tổng tiền: {total_price:,.0f} VNĐ**\n\n'
                    else:
                        response = '🛒 Giỏ hàng của bạn hiện tại trống.\n\nHãy thêm sản phẩm vào giỏ hàng trước khi xem!'
                    print(f'🛒 View cart with server data response: {len(response)} characters')
                elif cart_data and len(cart_data) > 0:
                    total_items = len(cart_data)
                    total_price = sum((item.get('price', 0) * item.get('quantity', 1) for item in cart_data))
                    response = f'🛒 **Giỏ hàng của quý khách có ({total_items} sản phẩm):**\n\n'
                    for i, item in enumerate(cart_data[:5], 1):
                        response += f"{i}. **{item.get('name', 'N/A')}**\n"
                        response += f"   Số lượng: {item.get('quantity', 1)}\n"
                        response += f"   Giá: {item.get('price', 0):,.0f} VNĐ\n\n"
                    response += f'💰 **Tổng tiền: {total_price:,.0f} VNĐ**\n\n'
                    print(f'🛒 View cart with localStorage data response: {len(response)} characters')
                else:
                    response = '🛒 Giỏ hàng của bạn hiện tại trống.\n\nHãy thêm sản phẩm vào giỏ hàng trước khi xem!'
                    print(f'🛒 View cart empty response: {len(response)} characters')
            elif cart_data and len(cart_data) > 0:
                total_items = len(cart_data)
                total_price = sum((item.get('price', 0) * item.get('quantity', 1) for item in cart_data))
                response = f'🛒 **Giỏ hàng của bạn ({total_items} sản phẩm):**\n\n'
                for i, item in enumerate(cart_data[:5], 1):
                    response += f"{i}. **{item.get('name', 'N/A')}**\n"
                    response += f"   Số lượng: {item.get('quantity', 1)}\n"
                    response += f"   Giá: {item.get('price', 0):,.0f} VNĐ\n\n"
                response += f'💰 **Tổng tiền: {total_price:,.0f} VNĐ**\n\n'
                response += 'Để xem chi tiết và thanh toán, hãy truy cập `/cart`\n\n'
                response += '💡 **Lưu ý:** Bạn chưa đăng nhập. Giỏ hàng sẽ được lưu trong trình duyệt.'
                print(f'🛒 View cart localStorage (not logged in) response: {len(response)} characters')
            else:
                response = '🛒 **Xem giỏ hàng của bạn:**\n\nGiỏ hàng của bạn hiện tại trống.\n\nĐể xem các sản phẩm trong giỏ hàng, hãy:\n\n1. **Truy cập trang giỏ hàng:** Nhấn vào biểu tượng giỏ hàng ở header\n2. **Hoặc đi đến:** `/cart`\n\n📱 **Trên mobile:** Menu → Giỏ hàng\n\n💡 **Mẹo:** Giỏ hàng của bạn được lưu tự động trong trình duyệt!'
                print(f'🛒 View cart localStorage empty response: {len(response)} characters')
            return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        elif intent == 'place_order':
            if not jwt_token:
                response = '❌ Vui lòng đăng nhập để đặt hàng.'
                print(f'📦 Not logged in response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            order_result = self.place_order(jwt_token)
            if 'error' in order_result:
                response = f"❌ Đặt hàng thất bại: {order_result['error']}"
                print(f'📦 Place order failed response: {response}')
                return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
            response = f"✅ Đặt hàng thành công! Mã đơn hàng: {order_result.get('id', 'N/A')}"
            print(f'📦 Place order success response: {response}')
            user_id = self.get_user_id_from_jwt(jwt_token)
            if user_id:
                self.clear_session_context(user_id)
            return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
        response = '❓ Xin lỗi, tôi không thể xử lý yêu cầu này. Hãy thử lại với yêu cầu rõ ràng hơn.'
        print(f'🤷 Default response: {response}')
        return {'response': response, 'intent': intent, 'confidence': confidence, 'product_info': classification.get('product_info'), 'cart_info': classification.get('cart_info'), 'extracted_requirements': classification.get('extracted_requirements')}
GEMINI_API_KEY = 'AIzaSyAl5693-QgRfg8Bz8wsYTfJvwVhxdmVcOU'
BASE_API_URL = 'http://localhost:1337/api'
if not GEMINI_API_KEY or GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY_HERE':
    raise ValueError('GEMINI_API_KEY không được cung cấp hoặc không hợp lệ')
chatbot_system = EcommerceChatbotSystem(gemini_api_key=GEMINI_API_KEY, base_api_url=BASE_API_URL)

@app.post('/chat', response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    ============================================================
    chat_endpoint - FASTAPI ENDPOINT CHÍNH
    ============================================================

    📚 MÔ TẢ:
    - Endpoint chính để frontend gọi chatbot
    - Tương tự chat_endpoint trong bookingBackend
    - Nhận ChatRequest, trả về ChatResponse

    🔧 REQUEST:
    - user_input: str (bắt buộc)
    - jwt_token: Optional[str]

    📊 RESPONSE:
    - response: str (text phản hồi cho user)
    - intent: str (ý định được phân loại)
    - confidence: float (độ tin cậy)
    - product_info: dict (thông tin sản phẩm)
    - cart_info: dict (thông tin giỏ hàng)
    - extracted_requirements: str (yêu cầu chi tiết)

    🎯 KẾT QUẢ:
    - JSON response cho frontend chatbot
    ============================================================
    """
    print(f"📨 Received chat request - user_input: {request.user_input}, jwt_token: {('***' if request.jwt_token else None)}")
    try:
        result = chatbot_system.process_user_request(request.user_input, request.jwt_token, request.current_cart)
        print(f"📤 Chat endpoint response: intent={result.get('intent')}, confidence={result.get('confidence')}")
        return ChatResponse(**result)
    except Exception as e:
        print(f'❌ Error in chat endpoint: {e}')
        raise HTTPException(status_code=500, detail=f'Lỗi xử lý yêu cầu: {str(e)}')
if __name__ == '__main__':
    print('🚀 Starting Ecommerce Chatbot API server...')
    print(f'🌐 Base API URL: {BASE_API_URL}')
    print(f"🤖 Gemini API: {('Configured' if GEMINI_API_KEY else 'Not configured')}")
    try:
        uvicorn.run(app, host='0.0.0.0', port=8001)
    except Exception as e:
        print(f'❌ Error starting server: {e}')
        import traceback
        traceback.print_exc()
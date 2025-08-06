const jwt = require("jsonwebtoken");
const axios = require("axios");

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyAl5693-QgRfg8Bz8wsYTfJvwVhxdmVcOU";
const GEMINI_MODEL = "gemini-2.0-flash-lite";

const SESSION_TTL = 30 * 60 * 1000; // 30 phút tính bằng milliseconds
const sessionStore = new Map(); // Lưu trữ session trong memory

function getUserIdFromJWT(token) {
  try {

    const decoded = jwt.decode(token, { complete: false });
    return decoded ? decoded.userId || decoded.id : null;
  } catch (error) {
    sails.log.warn("Error decoding JWT token:", error.message);
    return null;
  }
}

function saveSessionContext(userId, context) {
  sessionStore.set(userId.toString(), {
    context: context,
    timestamp: Date.now(),
  });
  sails.log.info(`Saved session context for user ${userId}:`, context);
}

function getSessionContext(userId) {
  const session = sessionStore.get(userId.toString());

  if (!session) {
    return null;
  }

  if (Date.now() - session.timestamp > SESSION_TTL) {

    sessionStore.delete(userId.toString());
    sails.log.info(`Session expired for user ${userId}`);
    return null;
  }

  return session.context;
}

function clearSessionContext(userId) {
  sessionStore.delete(userId.toString());
  sails.log.info(`Cleared session context for user ${userId}`);
}

async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    sails.log.error("Error calling Gemini API:", error.message);
    throw new Error("Không thể kết nối với AI service");
  }
}

module.exports = {

  chat: async function (req, res) {
    try {

      const { user_input, jwt_token } = req.body;

      if (!user_input || typeof user_input !== "string" || !user_input.trim()) {
        return res.badRequest({
          error: "user_input là bắt buộc và phải là string không rỗng",
        });
      }

      sails.log.info("Chatbot request:", {
        user_input: user_input.substring(0, 100) + "...",
      });

      let userId = null;
      if (jwt_token) {
        userId = getUserIdFromJWT(jwt_token);
        if (userId) {
          sails.log.info(`User authenticated: ${userId}`);
        }
      }

      const classification = await classifyUserIntent(user_input);
      const intent = classification.intent;
      const confidence = classification.confidence || 0;

      sails.log.info(`Intent classified: ${intent}, confidence: ${confidence}`);

      let response;

      if (confidence < 0.5) {
        response = {
          response:
            "❓ Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn có thể nói rõ hơn được không?\n💡 Ví dụ: 'Xem sản phẩm nổi bật', 'Xem danh mục điện thoại', hoặc 'Thêm iPhone vào giỏ hàng'",
          intent: intent,
          confidence: confidence,
          product_info: classification.product_info,
          cart_info: classification.cart_info,
          extracted_requirements: classification.extracted_requirements,
        };
      }

      else if (intent === "view_featured_products") {
        response = await handleViewFeaturedProducts(userId);
      }

      else if (intent === "view_categories") {
        response = await handleViewCategories(userId);
      }

      else if (intent === "view_products_in_category") {
        response = await handleViewProductsInCategory(
          classification.product_info,
          userId
        );
      }

      else if (intent === "add_to_cart") {
        response = await handleAddToCart(
          classification.product_info,
          userId,
          jwt_token
        );
      }

      else if (intent === "place_order") {
        response = await handlePlaceOrder(userId, jwt_token);
      }

      else {
        response = {
          response:
            "❓ Xin lỗi, tôi không thể xử lý yêu cầu này. Hãy thử lại với yêu cầu rõ ràng hơn.",
          intent: intent,
          confidence: confidence,
          product_info: classification.product_info,
          cart_info: classification.cart_info,
          extracted_requirements: classification.extracted_requirements,
        };
      }

      return res.json(response);
    } catch (error) {
      sails.log.error("Chatbot error:", error);

      return res.serverError({
        error: "Có lỗi xảy ra khi xử lý yêu cầu chatbot",
        details: error.message,
      });
    }
  },
};

async function classifyUserIntent(userInput) {
  const prompt = `Bạn là một AI chuyên phân tích ý định của khách hàng trong lĩnh vực ecommerce Việt Nam.
Hãy phân tích câu sau và trả về JSON với format chính xác:

INPUT: "${userInput}"

Hãy xác định:
1. INTENT: "view_featured_products" (xem sản phẩm nổi bật), "view_categories" (xem danh mục), "view_products_in_category" (xem sản phẩm trong danh mục), "add_to_cart" (thêm vào giỏ hàng), hoặc "place_order" (đặt hàng)
2. Trích xuất thông tin sản phẩm nếu có (tên sản phẩm, ID, danh mục)
3. Trích xuất thông tin giỏ hàng nếu có

RULES:
- Nếu người dùng muốn xem sản phẩm hot/nổi bật/phổ biến → "view_featured_products"
- Nếu người dùng muốn xem danh mục/danh sách category → "view_categories"
- Nếu người dùng chỉ định danh mục cụ thể → "view_products_in_category"
- Nếu người dùng muốn thêm/bỏ vào giỏ hàng → "add_to_cart"
- Nếu người dùng muốn đặt hàng/thanh toán → "place_order"
- Tên sản phẩm có thể viết không dấu hoặc có dấu
- Danh mục có thể là: điện thoại, laptop, tablet, phụ kiện, etc.

Trả về JSON format:
{
    "intent": "view_featured_products" hoặc "view_categories" hoặc "view_products_in_category" hoặc "add_to_cart" hoặc "place_order",
    "confidence": số từ 0.0 đến 1.0,
    "product_info": {
        "name": "tên sản phẩm nếu có",
        "id": số ID nếu có,
        "category": "tên danh mục nếu có"
    },
    "cart_info": {
        "action": "add" hoặc "remove",
        "quantity": số lượng (mặc định 1)
    },
    "extracted_requirements": "yêu cầu chi tiết của khách hàng"
}`;

  try {
    const aiResponse = await callGeminiAPI(prompt);

    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    const result = JSON.parse(cleanResponse);

    return {
      intent: result.intent || "unknown",
      confidence: result.confidence || 0,
      productInfo: result.product_info || {},
      cartInfo: result.cart_info || {},
      extractedRequirements: result.extracted_requirements || userInput,
    };
  } catch (error) {
    sails.log.warn("Error classifying intent, using fallback:", error.message);

    return fallbackClassification(userInput);
  }
}

function fallbackClassification(userInput) {
  const input = userInput.toLowerCase();

  const featuredKeywords = [
    "nổi bật",
    "hot",
    "phổ biến",
    "bán chạy",
    "featured",
  ];
  const categoryKeywords = ["danh mục", "category", "loại", "phân loại"];
  const cartKeywords = ["giỏ hàng", "cart", "thêm vào", "add to"];
  const orderKeywords = ["đặt hàng", "order", "thanh toán", "mua"];

  if (featuredKeywords.some((keyword) => input.includes(keyword))) {
    return {
      intent: "view_featured_products",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: userInput,
    };
  }

  if (categoryKeywords.some((keyword) => input.includes(keyword))) {
    return {
      intent: "view_categories",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: userInput,
    };
  }

  if (cartKeywords.some((keyword) => input.includes(keyword))) {
    return {
      intent: "add_to_cart",
      confidence: 0.7,
      product_info: {},
      cart_info: { action: "add", quantity: 1 },
      extracted_requirements: userInput,
    };
  }

  if (orderKeywords.some((keyword) => input.includes(keyword))) {
    return {
      intent: "place_order",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: userInput,
    };
  }

  return {
    intent: "unknown",
    confidence: 0.3,
    product_info: {},
    cart_info: {},
    extracted_requirements: userInput,
  };
}

async function handleViewFeaturedProducts(userId) {
  try {

    const products = await Product.find({
      isActive: true,

    })
      .limit(10)
      .populate("category");

    if (!products || products.length === 0) {
      return {
        response: "❌ Hiện tại chưa có sản phẩm nổi bật nào.",
        intent: "view_featured_products",
        confidence: 0.8,
        product_info: {},
        cart_info: {},
        extracted_requirements: "Xem sản phẩm nổi bật",
      };
    }

    let response = "🌟 **Sản phẩm nổi bật:**\n\n";
    products.forEach((product, index) => {
      response += `${index + 1}. **${product.name}**\n`;
      response += `   💰 Giá: ${product.price.toLocaleString("vi-VN")} VND\n`;
      response += `   📁 Danh mục: ${
        product.category ? product.category.name : "N/A"
      }\n`;
      response += `   🔗 ID: ${product.id}\n\n`;
    });

    response +=
      "Bạn có muốn xem chi tiết sản phẩm nào hoặc thêm vào giỏ hàng không?";

    return {
      response: response,
      intent: "view_featured_products",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: "Xem sản phẩm nổi bật",
    };
  } catch (error) {
    sails.log.error("Error fetching featured products:", error);
    return {
      response:
        "❌ Có lỗi xảy ra khi tải sản phẩm nổi bật. Vui lòng thử lại sau.",
      intent: "view_featured_products",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: "Xem sản phẩm nổi bật",
    };
  }
}

async function handleViewCategories(userId) {
  try {
    const categories = await Category.find({ isActive: true });

    if (!categories || categories.length === 0) {
      return {
        response: "❌ Hiện tại chưa có danh mục nào.",
        intent: "view_categories",
        confidence: 0.8,
        product_info: {},
        cart_info: {},
        extracted_requirements: "Xem danh mục",
      };
    }

    let response = "📂 **Danh sách danh mục:**\n\n";
    categories.forEach((category, index) => {
      response += `${index + 1}. **${category.name}**\n`;
      response += `   🔗 ID: ${category.id}\n`;
      if (category.description) {
        response += `   📝 ${category.description}\n`;
      }
      response += "\n";
    });

    response +=
      "Bạn muốn xem sản phẩm trong danh mục nào? (VD: 'Xem sản phẩm trong danh mục điện thoại')";

    return {
      response: response,
      intent: "view_categories",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: "Xem danh mục",
    };
  } catch (error) {
    sails.log.error("Error fetching categories:", error);
    return {
      response: "❌ Có lỗi xảy ra khi tải danh mục. Vui lòng thử lại sau.",
      intent: "view_categories",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: "Xem danh mục",
    };
  }
}

async function handleViewProductsInCategory(productInfo, userId) {
  try {
    const categoryName = productInfo.category;

    if (!categoryName) {
      return {
        response:
          "❌ Vui lòng chỉ định tên danh mục. Ví dụ: 'Xem sản phẩm trong danh mục điện thoại'",
        intent: "view_products_in_category",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: {},
        extracted_requirements: "Xem sản phẩm trong danh mục",
      };
    }

    const category = await Category.findOne({
      name: { contains: categoryName }, // Case-insensitive search
      isActive: true,
    });

    if (!category) {
      return {
        response: `❌ Không tìm thấy danh mục: "${categoryName}". Vui lòng kiểm tra lại tên danh mục.`,
        intent: "view_products_in_category",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: {},
        extracted_requirements: `Xem sản phẩm trong danh mục ${categoryName}`,
      };
    }

    const products = await Product.find({
      category: category.id,
      isActive: true,
    }).limit(20);

    if (!products || products.length === 0) {
      return {
        response: `📂 Danh mục "${category.name}" hiện tại chưa có sản phẩm nào.`,
        intent: "view_products_in_category",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: {},
        extracted_requirements: `Xem sản phẩm trong danh mục ${categoryName}`,
      };
    }

    let response = `📂 **Sản phẩm trong danh mục "${category.name}":**\n\n`;
    products.forEach((product, index) => {
      response += `${index + 1}. **${product.name}**\n`;
      response += `   💰 Giá: ${product.price.toLocaleString("vi-VN")} VND\n`;
      response += `   🔗 ID: ${product.id}\n\n`;
    });

    response +=
      "Bạn có muốn xem chi tiết sản phẩm nào hoặc thêm vào giỏ hàng không?";

    return {
      response: response,
      intent: "view_products_in_category",
      confidence: 0.7,
      product_info: productInfo,
      cart_info: {},
      extracted_requirements: `Xem sản phẩm trong danh mục ${categoryName}`,
    };
  } catch (error) {
    sails.log.error("Error fetching products in category:", error);
    return {
      response: "❌ Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.",
      intent: "view_products_in_category",
      confidence: 0.7,
      product_info: productInfo,
      cart_info: {},
      extracted_requirements: "Xem sản phẩm trong danh mục",
    };
  }
}

async function handleAddToCart(productInfo, userId, jwtToken) {
  try {
    if (!userId || !jwtToken) {
      return {
        response: "❌ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        intent: "add_to_cart",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: { action: "add", quantity: 1 },
        extracted_requirements: "Thêm vào giỏ hàng",
      };
    }

    const productName = productInfo.name;
    const quantity = productInfo.quantity || 1;

    if (!productName) {
      return {
        response:
          "❌ Vui lòng chỉ định tên sản phẩm cần thêm vào giỏ hàng. Ví dụ: 'Thêm iPhone vào giỏ hàng'",
        intent: "add_to_cart",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: { action: "add", quantity: quantity },
        extracted_requirements: "Thêm vào giỏ hàng",
      };
    }

    const product = await Product.findOne({
      name: { contains: productName },
      isActive: true,
    });

    if (!product) {
      return {
        response: `❌ Không tìm thấy sản phẩm: "${productName}". Vui lòng kiểm tra lại tên sản phẩm.`,
        intent: "add_to_cart",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: { action: "add", quantity: quantity },
        extracted_requirements: `Thêm ${productName} vào giỏ hàng`,
      };
    }

    if (product.countInStock < quantity) {
      return {
        response: `❌ Sản phẩm "${product.name}" chỉ còn ${product.countInStock} cái trong kho.`,
        intent: "add_to_cart",
        confidence: 0.7,
        product_info: productInfo,
        cart_info: { action: "add", quantity: quantity },
        extracted_requirements: `Thêm ${productName} vào giỏ hàng`,
      };
    }

    const cartItem = await Cart.findOrCreate(
      {
        user: userId,
        product: product.id,
      },
      {
        user: userId,
        product: product.id,
        quantity: 0,
      }
    );

    await Cart.updateOne({ id: cartItem.id }).set({
      quantity: cartItem.quantity + quantity,
    });

    return {
      response: `✅ Đã thêm ${quantity} cái "${
        product.name
      }" vào giỏ hàng!\n💰 Giá: ${product.price.toLocaleString(
        "vi-VN"
      )} VND/cái\n🛒 Tổng: ${(product.price * quantity).toLocaleString(
        "vi-VN"
      )} VND`,
      intent: "add_to_cart",
      confidence: 0.7,
      product_info: productInfo,
      cart_info: { action: "add", quantity: quantity },
      extracted_requirements: `Thêm ${productName} vào giỏ hàng`,
    };
  } catch (error) {
    sails.log.error("Error adding to cart:", error);
    return {
      response: "❌ Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại sau.",
      intent: "add_to_cart",
      confidence: 0.7,
      product_info: productInfo,
      cart_info: { action: "add", quantity: 1 },
      extracted_requirements: "Thêm vào giỏ hàng",
    };
  }
}

async function handlePlaceOrder(userId, jwtToken) {
  try {
    if (!userId || !jwtToken) {
      return {
        response: "❌ Vui lòng đăng nhập để đặt hàng.",
        intent: "place_order",
        confidence: 0.8,
        product_info: {},
        cart_info: {},
        extracted_requirements: "Đặt hàng",
      };
    }

    const cartItems = await Cart.find({ user: userId }).populate("product");

    if (!cartItems || cartItems.length === 0) {
      return {
        response:
          "❌ Giỏ hàng của bạn đang trống. Hãy thêm sản phẩm vào giỏ hàng trước khi đặt hàng.",
        intent: "place_order",
        confidence: 0.8,
        product_info: {},
        cart_info: {},
        extracted_requirements: "Đặt hàng",
      };
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (!item.product || !item.product.isActive) {
        continue; // Skip inactive products
      }

      if (item.product.countInStock < item.quantity) {
        return {
          response: `❌ Sản phẩm "${item.product.name}" chỉ còn ${item.product.countInStock} cái trong kho.`,
          intent: "place_order",
          confidence: 0.8,
          product_info: {},
          cart_info: {},
          extracted_requirements: "Đặt hàng",
        };
      }

      totalAmount += item.product.price * item.quantity;
      orderItems.push({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    if (orderItems.length === 0) {
      return {
        response: "❌ Không có sản phẩm hợp lệ trong giỏ hàng để đặt hàng.",
        intent: "place_order",
        confidence: 0.8,
        product_info: {},
        cart_info: {},
        extracted_requirements: "Đặt hàng",
      };
    }

    const order = await Order.create({
      user: userId,
      orderItems: orderItems,
      totalAmount: totalAmount,
      status: "pending",
      paymentMethod: "cod", // Default COD
      shippingAddress: "Địa chỉ mặc định", // Trong thực tế cần lấy từ user profile
    }).fetch();

    for (const item of orderItems) {
      await Product.updateOne({ id: item.product }).set({
        countInStock:
          (await Product.findOne({ id: item.product })).countInStock -
          item.quantity,
      });
    }

    await Cart.destroy({ user: userId });

    return {
      response: `✅ Đặt hàng thành công!\n🆔 Mã đơn hàng: ${
        order.id
      }\n💰 Tổng tiền: ${totalAmount.toLocaleString(
        "vi-VN"
      )} VND\n📦 Trạng thái: Chờ xác nhận\n\nCảm ơn bạn đã mua hàng!`,
      intent: "place_order",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: "Đặt hàng",
    };
  } catch (error) {
    sails.log.error("Error placing order:", error);
    return {
      response: "❌ Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.",
      intent: "place_order",
      confidence: 0.8,
      product_info: {},
      cart_info: {},
      extracted_requirements: "Đặt hàng",
    };
  }
}

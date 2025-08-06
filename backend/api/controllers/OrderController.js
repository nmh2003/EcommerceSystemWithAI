module.exports = {

  create: async function (req, res) {

    try {

      const {
        orderItems,
        shippingAddress,
        paymentMethod,
        shippingPrice,
        taxPrice,
      } = req.body;

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: "Hệ thống đang bảo trì",
        });
      }

      const userId = req.user.id; // Lấy từ JWT token (middleware isAuthenticated)

      console.log("=== CREATE ORDER DEBUG ===");
      console.log("userId:", userId);
      console.log("Request method:", req.method);
      console.log("Request URL:", req.url);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("orderItems:", JSON.stringify(orderItems, null, 2));
      console.log("shippingAddress:", JSON.stringify(shippingAddress, null, 2));

      if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({
          error: "Đơn hàng phải có ít nhất 1 sản phẩm",
        });
      }

      if (
        !shippingAddress ||
        !shippingAddress.fullName ||
        !shippingAddress.address
      ) {
        return res.status(400).json({
          error: "Thiếu thông tin địa chỉ giao hàng",
        });
      }

      let calculatedTotalPrice = 0;

      for (const item of orderItems) {

        console.log(`🔍 Checking product: ${item.product}`);
        const product = await Product.findOne({ id: item.product });
        console.log(`✅ Product found:`, product ? product.name : "NOT FOUND");

        if (!product) {
          console.error(`❌ Product not found: ${item.product}`);
          return res.status(404).json({
            error: "Sản phẩm không tồn tại",
          });
        }

        if (product.countInStock < item.qty) {
          return res.status(400).json({
            error: `Sản phẩm "${item.name}" chỉ còn ${product.countInStock} sản phẩm, không đủ số lượng bạn yêu cầu (${item.qty})`,
          });
        }

        calculatedTotalPrice += product.price * item.qty;

      }

      calculatedTotalPrice += (shippingPrice || 0) + (taxPrice || 0);

      for (const item of orderItems) {

        const product = await Product.findOne({ id: item.product });

        const newStock = product.countInStock - item.qty;
        console.log(
          `📦 Updating stock: ${product.name} (${product.countInStock} → ${newStock})`
        );

        await Product.updateOne({ id: item.product }).set({
          countInStock: newStock,
        });

      }

      console.log("=== CREATING ORDER IN DB ===");
      console.log("userId:", userId);
      console.log("calculatedTotalPrice:", calculatedTotalPrice);
      console.log("orderItems:", JSON.stringify(orderItems, null, 2));
      console.log("shippingAddress:", JSON.stringify(shippingAddress, null, 2));

      const newOrder = await Order.create({
        user: userId,
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || "COD",
        totalPrice: calculatedTotalPrice,
        shippingPrice: shippingPrice || 0,
        taxPrice: taxPrice || 0,
        isPaid: false, // Mặc định chưa thanh toán
        isDelivered: false, // Mặc định chưa giao hàng
      }).fetch();

      console.log("✅ Order created successfully:", newOrder.id);

      try {
        const EmailService = require("../services/EmailService");

        const user = await User.findOne({ id: userId });

        const orderDetails = {
          orderId: newOrder.id,
          items: orderItems.map((item) => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
          })),
          totalPrice: calculatedTotalPrice,
          shippingAddress: `${shippingAddress.fullName}, ${
            shippingAddress.address
          }${shippingAddress.city ? ", " + shippingAddress.city : ""}${
            shippingAddress.phone ? ", " + shippingAddress.phone : ""
          }`,
          paymentMethod: paymentMethod || "COD",
        };

        const emailSent = await EmailService.sendOrderConfirmation(
          user.email,
          user.fullName,
          orderDetails
        );

        if (!emailSent) {
          console.warn(
            "⚠️ Không thể gửi email xác nhận đơn hàng, nhưng đơn hàng đã được tạo thành công"
          );
        } else {
          console.log(
            "✅ Email xác nhận đơn hàng đã được gửi đến:",
            user.email
          );
        }
      } catch (emailError) {
        console.error("❌ Lỗi gửi email xác nhận đơn hàng:", emailError);

      }

      return res.status(201).json({
        message: "Đặt hàng thành công",
        order: newOrder,
      });

    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);

      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  getUserOrders: async function (req, res) {

    try {
      const userId = req.user.id;

      const orders = await Order.find({ user: userId }).sort("createdAt DESC");

      return res.json({
        orders,
        total: orders.length,
      });

    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  getAllOrders: async function (req, res) {

    try {

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const isPaidFilter = req.query.isPaid;
      const isDeliveredFilter = req.query.isDelivered;

      const filter = {};

      if (isPaidFilter !== undefined) {
        filter.isPaid = isPaidFilter === "true"; // Convert string to boolean
      }

      if (isDeliveredFilter !== undefined) {
        filter.isDelivered = isDeliveredFilter === "true";
      }

      const orders = await Order.find(filter)
        .populate("user") // Lấy kèm thông tin user
        .skip(skip)
        .limit(limit)
        .sort("createdAt DESC");

      const total = await Order.count(filter);

      const ordersWithDefaultImages = orders.map((order) => ({
        ...order,
        orderItems: order.orderItems.map((item) => ({
          ...item,
          image: item.image || "/images/SampleProduct.jpeg",
        })),
      }));

      return res.json({
        orders: ordersWithDefaultImages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  updateOrderStatus: async function (req, res) {

    try {
      const { id } = req.params;
      const { isPaid, isDelivered } = req.body;

      const order = await Order.findOne({ id });

      if (!order) {
        return res.status(404).json({
          error: "Đơn hàng không tồn tại",
        });
      }

      const updateData = {};

      if (isPaid === true && !order.isPaid) {
        updateData.isPaid = true;
        updateData.paidAt = new Date(); // Lưu thời gian thanh toán
      }

      if (isDelivered === true && !order.isDelivered) {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date(); // Lưu thời gian giao hàng
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: "Không có thông tin cần cập nhật",
        });
      }

      const updatedOrder = await Order.updateOne({ id }).set(updateData);

      if (!updatedOrder) {
        return res.status(404).json({
          error: "Đơn hàng không tồn tại",
        });
      }

      try {
        const EmailService = require("../services/EmailService");

        const orderWithUser = await Order.findOne({ id }).populate("user");

        let oldStatus = "pending";
        let newStatus = "pending";

        if (isPaid === true) {
          oldStatus = order.isPaid ? "paid" : "unpaid";
          newStatus = "paid";
        } else if (isDelivered === true) {
          oldStatus = order.isDelivered ? "delivered" : "processing";
          newStatus = "delivered";
        }

        const emailSent = await EmailService.sendOrderStatusUpdate(
          orderWithUser.user.email,
          orderWithUser.user.fullName,
          orderWithUser.id,
          oldStatus,
          newStatus
        );

        if (!emailSent) {
          console.warn("⚠️ Không thể gửi email cập nhật trạng thái đơn hàng");
        } else {
          console.log(
            "✅ Email cập nhật trạng thái đã được gửi đến:",
            orderWithUser.user.email
          );
        }
      } catch (emailError) {
        console.error("❌ Lỗi gửi email cập nhật trạng thái:", emailError);

      }

      return res.json({
        message: "Cập nhật trạng thái đơn hàng thành công",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  getStatistics: async function (req, res) {

    try {

      const totalOrders = await Order.count();

      const allOrders = await Order.find({ isPaid: true });
      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );

      const totalUsers = await User.count();

      const totalProducts = await Product.count();

      const paidOrders = await Order.count({ isPaid: true });
      const unpaidOrders = await Order.count({ isPaid: false });
      const deliveredOrders = await Order.count({ isDelivered: true });
      const pendingOrders = await Order.count({ isDelivered: false });

      return res.json({
        totalRevenue, // Tổng doanh thu (chỉ đơn đã thanh toán)
        totalOrders, // Tổng số đơn hàng
        totalUsers, // Tổng số người dùng
        totalProducts, // Tổng số sản phẩm
        paidOrders, // Số đơn đã thanh toán
        unpaidOrders, // Số đơn chưa thanh toán
        deliveredOrders, // Số đơn đã giao
        pendingOrders, // Số đơn chưa giao
      });

    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  getSalesByDate: async function (req, res) {

    try {

      const paidOrders = await Order.find({
        isPaid: true,
        paidAt: { "!=": null }, // paidAt phải có giá trị
      }).sort("paidAt ASC");

      const salesByDate = {};

      for (const order of paidOrders) {

        const date = new Date(order.paidAt).toISOString().split("T")[0];

        if (!salesByDate[date]) {
          salesByDate[date] = 0;
        }

        salesByDate[date] += order.totalPrice;

      }

      const result = Object.keys(salesByDate).map((date) => ({
        date,
        sales: salesByDate[date],
      }));

      return res.json(result);
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu theo ngày:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  getRecentOrders: async function (req, res) {

    try {
      const recentOrders = await Order.find()
        .populate("user") // Lấy kèm thông tin user
        .sort("createdAt DESC") // Sắp xếp mới nhất trước
        .limit(5); // Chỉ lấy 5 đơn

      return res.json(recentOrders);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng gần nhất:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  findOne: async function (req, res) {

    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const order = await Order.findOne({ id }).populate("user");

      if (!order) {
        return res.status(404).json({
          error: "Đơn hàng không tồn tại",
        });
      }

      if (userRole !== "admin" && order.user.id !== userId) {
        return res.status(403).json({
          error: "Bạn không có quyền xem đơn hàng này",
        });
      }

      return res.json(order);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  markAsDelivered: async function (req, res) {

    try {
      const { id } = req.params;

      const order = await Order.findOne({ id });

      if (!order) {
        return res.status(404).json({
          error: "Đơn hàng không tồn tại",
        });
      }

      if (!order.isPaid) {
        return res.status(400).json({
          error: "Không thể giao đơn hàng chưa thanh toán",
        });
      }

      if (order.isDelivered) {
        return res.status(400).json({
          error: "Đơn hàng đã được giao rồi",
        });
      }

      const updatedOrder = await Order.updateOne({ id }).set({
        isDelivered: true,
        deliveredAt: new Date(),
      });

      return res.json({
        message: "Đã đánh dấu giao hàng thành công",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Lỗi khi đánh dấu giao hàng:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

  pay: async function (req, res) {

    try {
      const { id } = req.params;
      const { amount, details } = req.body; // details cho PayPal, amount cho manual
      const userId = req.user.id;

      const order = await Order.findOne({ id });

      if (!order) {
        return res.status(404).json({
          error: "Đơn hàng không tồn tại",
        });
      }

      if (order.user !== userId) {
        return res.status(403).json({
          error: "Bạn không có quyền thanh toán đơn hàng này",
        });
      }

      if (order.isPaid) {
        return res.status(400).json({
          error: "Đơn hàng đã được thanh toán rồi",
        });
      }

      let paymentAmount = 0;
      let paymentMethod = "Bank Transfer";

      if (details) {

        paymentMethod = "PayPal";
        paymentAmount = order.totalPrice; // PayPal handles the amount

        console.log("✅ PayPal payment received:", {
          paypalOrderId: details.id,
          paypalStatus: details.status,
          orderTotal: order.totalPrice,
        });
      } else if (amount) {

        paymentAmount = parseFloat(amount);

        if (isNaN(paymentAmount) || paymentAmount < order.totalPrice) {
          return res.status(400).json({
            error: "Số tiền phải bằng tổng đơn hàng",
          });
        }

        console.log("✅ Manual payment validated:", {
          paymentAmount,
          orderTotal: order.totalPrice,
        });
      } else {
        return res.status(400).json({
          error: "Phương thức thanh toán không được hỗ trợ",
        });
      }

      const updatedOrder = await Order.updateOne({ id }).set({
        isPaid: true,
        paidAt: new Date(),
        paymentMethod: paymentMethod, // Lưu payment method
      });

      if (!updatedOrder) {
        return res.status(500).json({
          error: "Không thể cập nhật trạng thái thanh toán",
        });
      }

      console.log("✅ Order payment status updated:", {
        orderId: id,
        isPaid: true,
        paidAt: new Date(),
        paymentMethod: paymentMethod,
      });

      try {
        const EmailService = require("../services/EmailService");

        const user = await User.findOne({ id: userId });

        const emailSent = await EmailService.sendPaymentConfirmation(
          user.email,
          user.fullName,
          order.id,
          paymentAmount
        );

        if (!emailSent) {
          console.warn("⚠️ Không thể gửi email xác nhận thanh toán");
        } else {
          console.log(
            "✅ Email xác nhận thanh toán đã được gửi đến:",
            user.email
          );
        }
      } catch (emailError) {
        console.error("❌ Lỗi gửi email xác nhận thanh toán:", emailError);

      }

      return res.json({
        message: "Thanh toán thành công",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Lỗi khi thanh toán đơn hàng:", error);
      return res.status(500).json({
        error: "Hệ thống đang bảo trì",
      });
    }
  },

};

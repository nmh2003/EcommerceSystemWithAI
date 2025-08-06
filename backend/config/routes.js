/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  "/": { view: "pages/homepage" },

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
  // ... các route mặc định ...

  "GET /api/ping": "PingController.ping",
  "POST /api/register": "AuthController.register",
  "POST /api/auth/register": "AuthController.register",
  "POST /api/login": "AuthController.login",
  "GET /api/products": "ProductController.find",
  "GET /api/products/top": "ProductController.getTopProducts",
  "GET /api/products/:id": "ProductController.findOne",
  "POST /api/products": "ProductController.create",
  "PUT /api/products/:id": "ProductController.update",
  "DELETE /api/products/:id": "ProductController.destroy",
  "GET /api/categories": "CategoryController.findAll",
  "GET /api/categories/:id": "CategoryController.findOne",
  "POST /api/categories": "CategoryController.create",
  "PUT /api/categories/:id": "CategoryController.update",
  "DELETE /api/categories/:id": "CategoryController.delete",
  "POST /api/orders": "OrderController.create",
  "GET /api/orders/mine": "OrderController.getUserOrders",
  "GET /api/orders/:id": "OrderController.findOne",
  "GET /api/orders": "OrderController.getAllOrders",
  "PUT /api/orders/:id/status": "OrderController.updateOrderStatus",
  "PUT /api/orders/:id/deliver": "OrderController.markAsDelivered",
  "PUT /api/orders/:id/pay": "OrderController.pay",
  "GET /api/orders/statistics": "OrderController.getStatistics",
  "GET /api/orders/sales-by-date": "OrderController.getSalesByDate",
  "GET /api/orders/recent": "OrderController.getRecentOrders",
  "GET /api/users/profile": "UserController.getProfile",
  "PUT /api/users/profile": "UserController.updateProfile",
  "PUT /api/users/change-password": "UserController.changePassword",
  "GET /api/users": "UserController.getAllUsers",
  "GET /api/users/:id": "UserController.getUserById",
  "PUT /api/users/:id": "UserController.updateUserById",
  "DELETE /api/users/:id": "UserController.deleteUserById",
  "POST /api/upload": "UploadController.uploadImage",
  "DELETE /api/upload": "UploadController.deleteImage",
  "POST /api/otp/send": "OTPController.send",
  "POST /api/otp/verify": "OTPController.verify",
  "POST /api/auth/forgot-password": "AuthController.forgotPassword",
  "POST /api/auth/reset-password": "AuthController.resetPassword",
  "POST /api/chatbot/chat": "ChatbotController.chat",
  "GET /api/config/paypal": "ConfigController.paypal",
  "GET /api/articles": "ArticleController.find",
  "POST /api/articles": "ArticleController.create",
};

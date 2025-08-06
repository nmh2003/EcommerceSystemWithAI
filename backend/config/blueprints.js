/**
 * Blueprint API Configuration
 * (sails.config.blueprints)
 *
 * For background on the blueprint API in Sails, check out:
 * https://sailsjs.com/docs/reference/blueprint-api
 *
 * For details and more available options, see:
 * https://sailsjs.com/config/blueprints
 */

module.exports.blueprints = {
  /***************************************************************************
   *                                                                          *
   * Automatically expose implicit routes for every action in your app?       *
   *                                                                          *
   ***************************************************************************/

  // ⚠️ TẮT blueprint actions để policies hoạt động đúng
  // actions: false được uncomment → Chỉ dùng routes đã định nghĩa trong config/routes.js
  actions: false,

  /***************************************************************************
   *                                                                          *
   * Automatically expose RESTful routes for your models?                     *
   *                                                                          *
   ***************************************************************************/

  // ⚠️ TẮT blueprint REST routes để tránh conflict với policies
  // rest: true tự tạo routes CRUD cho models → BỎ QUA policies
  rest: false,

  /***************************************************************************
   *                                                                          *
   * Automatically expose CRUD "shortcut" routes to GET requests?             *
   * (These are enabled by default in development only.)                      *
   *                                                                          *
   ***************************************************************************/

  // ⚠️ TẮT shortcuts để bảo mật
  // shortcuts: true tạo routes /model/create?name=xxx → KHÔNG AN TOÀN
  shortcuts: false,
};

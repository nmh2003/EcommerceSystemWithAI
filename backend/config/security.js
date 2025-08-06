/**
 * Security Settings
 * (sails.config.security)
 *
 * These settings affect aspects of your app's security, such
 * as how it deals with cross-origin requests (CORS) and which
 * routes require a CSRF token to be included with the request.
 *
 * For an overview of how Sails handles security, see:
 * https://sailsjs.com/documentation/concepts/security
 *
 * For additional options and more information, see:
 * https://sailsjs.com/config/security
 */

module.exports.security = {
  /***************************************************************************
   *                                                                          *
   * CORS is like a more modern version of JSONP-- it allows your application *
   * to circumvent browsers' same-origin policy, so that the responses from   *
   * your Sails app hosted on one domain (e.g. example.com) can be received   *
   * in the client-side JavaScript code from a page you trust hosted on _some *
   * other_ domain (e.g. trustedsite.net).                                    *
   *                                                                          *
   * For additional options and more information, see:                        *
   * https://sailsjs.com/docs/concepts/security/cors                          *
   *                                                                          *
   ***************************************************************************/

  cors: {
    // Enable CORS for all routes.
    // Ý nghĩa: allRoutes: true - apply CORS policy cho tất cả routes.
    // Giá trị: Frontend có thể call API từ domain khác.
    allRoutes: true,

    // Allow specific origins.
    // Ý nghĩa: allowOrigins array chứa domains được phép access API.
    // Giá trị: Chỉ localhost:5173 (frontend) có thể call API, bảo mật.
    allowOrigins: ["http://localhost:5173"],

    // Allow credentials (cookies, authorization headers).
    // Ý nghĩa: allowCredentials: true - cho phép gửi cookies và auth headers.
    // Giá trị: Enable authentication với JWT token.
    allowCredentials: true,

    // Allow specific request headers including Authorization.
    // Ý nghĩa: allowRequestHeaders array chứa headers được phép trong request.
    // Giá trị: Frontend có thể gửi Authorization header với JWT token.
    allowRequestHeaders: "Content-Type, Authorization",
  },

  /****************************************************************************
   *                                                                           *
   * By default, Sails' built-in CSRF protection is disabled to facilitate     *
   * rapid development.  But be warned!  If your Sails app will be accessed by *
   * web browsers, you should _always_ enable CSRF protection before deploying *
   * to production.                                                            *
   *                                                                           *
   * To enable CSRF protection, set this to `true`.                            *
   *                                                                           *
   * For more information, see:                                                *
   * https://sailsjs.com/docs/concepts/security/csrf                           *
   *                                                                           *
   ****************************************************************************/

  // csrf: false
};

const jwt = require("jsonwebtoken");

module.exports = async function (req, res, proceed) {

  let token = req.cookies.jwt;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized. No token provided.",
    });
  }

  try {

    const decoded = jwt.verify(token, "secret"); // Verify JWT với secret key.

    const User = req._sails.models.user;
    const user = await User.findOne({ id: decoded.id });

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized. User không tồn tại.",
      });
    }

    req.user = user;

    req.userId = decoded.id;

    return proceed();
  } catch (error) {

    return res.forbidden("Invalid or expired token");
  }
};

module.exports = async function (req, res, proceed) {

  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized. Bạn cần đăng nhập trước.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden. Bạn không có quyền truy cập tài nguyên này.",
    });
  }

  return proceed();

};

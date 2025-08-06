module.exports = {
  find: async function (req, res) {
    try {
      const articles = await Article.find();
      return res.json(articles);
    } catch (error) {
      console.error("❌ Lỗi find articles:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy danh sách",
      });
    }
  },
  create: async function (req, res) {
    try {
      const { title, content } = req.body;
      const newArticle = await Article.create({
        title,
        content,
      }).fetch();
      return res.status(201).json(newArticle);
    } catch (error) {
      console.error("❌ Lỗi tạo article:", error);
      return res.status(500).json({
        error: "Lỗi server khi tạo article",
      });
    }
  },
};

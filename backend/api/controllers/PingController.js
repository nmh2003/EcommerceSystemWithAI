module.exports = {

  ping: async function (req, res) {

    return res.json({ message: "pong" });
  },
};

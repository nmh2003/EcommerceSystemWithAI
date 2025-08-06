module.exports = {

  paypal: function (req, res) {
    try {

      const clientId = process.env.PAYPAL_CLIENT_ID;

      if (!clientId) {
        return res.status(500).json({
          message: "PayPal client ID not configured",
        });
      }

      return res.json({
        clientId: clientId,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving PayPal configuration",
      });
    }
  },
};

const sails = require("sails");

async function checkProducts() {
  try {
    // Lift Sails without starting server
    await sails.lift({
      log: { level: "error" },
      hooks: { grunt: false },
      models: { migrate: "safe" },
    });

    // Import Product model after Sails is lifted
    const Product = sails.models.product;

    const products = await Product.find({ isActive: true });
    console.log("Active products found:", products.length);

    if (products.length > 0) {
      console.log("Sample products:");
      products.slice(0, 3).forEach((product, index) => {
        console.log(
          `${index + 1}. ${product.name} - ${product.price} VND - Active: ${
            product.isActive
          }`
        );
      });
    } else {
      console.log("No active products found");
      // Check all products
      const allProducts = await Product.find({});
      console.log("Total products in DB:", allProducts.length);
      if (allProducts.length > 0) {
        console.log("Sample inactive products:");
        allProducts.slice(0, 3).forEach((product, index) => {
          console.log(
            `${index + 1}. ${product.name} - Active: ${product.isActive}`
          );
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkProducts();

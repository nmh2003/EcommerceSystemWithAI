const sails = require("sails");

async function createSampleData() {
  try {
    // Lift Sails without starting server
    await sails.lift({
      log: { level: "error" },
      hooks: { grunt: false },
      models: { migrate: "safe" },
    });

    // Import models after Sails is lifted
    const Category = sails.models.category;
    const Product = sails.models.product;

    console.log("Creating sample categories and products...");

    // Create categories
    const phoneCategory = await Category.create({
      name: "Điện thoại",
      description: "Các loại điện thoại di động",
      isActive: true,
    }).fetch();

    const laptopCategory = await Category.create({
      name: "Laptop",
      description: "Máy tính xách tay",
      isActive: true,
    }).fetch();

    console.log("Created categories:", phoneCategory.name, laptopCategory.name);

    // Create products
    const products = [
      {
        name: "iPhone 15 Pro",
        description: "Điện thoại iPhone 15 Pro với chip A17 Pro",
        price: 29990000,
        image: "/images/default-product.png",
        category: phoneCategory.id,
        countInStock: 50,
        brand: "Apple",
        isActive: true,
        rating: 4.8,
        numReviews: 120,
      },
      {
        name: "Samsung Galaxy S24",
        description: "Điện thoại Samsung Galaxy S24 Ultra",
        price: 25990000,
        image: "/images/default-product.png",
        category: phoneCategory.id,
        countInStock: 30,
        brand: "Samsung",
        isActive: true,
        rating: 4.6,
        numReviews: 85,
      },
      {
        name: "MacBook Pro M3",
        description: "Laptop MacBook Pro với chip M3",
        price: 45990000,
        image: "/images/default-product.png",
        category: laptopCategory.id,
        countInStock: 20,
        brand: "Apple",
        isActive: true,
        rating: 4.9,
        numReviews: 200,
      },
      {
        name: "Dell XPS 13",
        description: "Laptop Dell XPS 13 siêu mỏng",
        price: 32990000,
        image: "/images/default-product.png",
        category: laptopCategory.id,
        countInStock: 15,
        brand: "Dell",
        isActive: true,
        rating: 4.5,
        numReviews: 95,
      },
    ];

    for (const productData of products) {
      const product = await Product.create(productData).fetch();
      console.log(
        "Created product:",
        product.name,
        "- Price:",
        product.price.toLocaleString("vi-VN"),
        "VND"
      );
    }

    console.log("Sample data created successfully!");
    console.log(
      "Active products count:",
      await Product.count({ isActive: true })
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating sample data:", error.message);
    process.exit(1);
  }
}

createSampleData();

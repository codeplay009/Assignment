const mongoose = require("mongoose");
const Product = require("./src/models/Product");
require("dotenv").config();

const products = [
  {
    name: "Wireless Headphones",
    description: "Great sound quality",
    price: 199.99,
    category: "Electronics",
    images: ["https://picsum.photos/400/400"],
    rating: 4.5,
    stock: 25,
    isFeatured: true,
    isTrending: true,
  },
  {
    name: "Cotton T-Shirt",
    description: "Comfortable shirt",
    price: 29.99,
    category: "Clothing",
    images: ["https://picsum.photos/400/400"],
    rating: 4.2,
    stock: 100,
    isFeatured: false,
    isTrending: true,
  },
  {
    name: "Coffee Maker",
    description: "Makes great coffee",
    price: 149.99,
    category: "Home",
    images: ["https://picsum.photos/400/400"],
    rating: 4.4,
    stock: 20,
    isFeatured: true,
    isTrending: false,
  },
  {
    name: "Yoga Mat",
    description: "Non-slip mat",
    price: 39.99,
    category: "Sports",
    images: ["https://picsum.photos/400/400"],
    rating: 4.3,
    stock: 75,
    isFeatured: false,
    isTrending: false,
  },
  {
    name: "JavaScript Book",
    description: "Learn JavaScript",
    price: 49.99,
    category: "Books",
    images: ["https://picsum.photos/400/400"],
    rating: 4.8,
    stock: 50,
    isFeatured: false,
    isTrending: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    await Product.deleteMany();
    console.log("Cleared products");

    await Product.insertMany(products);
    console.log(`Added ${products.length} products`);

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedDB();

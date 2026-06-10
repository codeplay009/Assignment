const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [999999, "Price cannot exceed 999999"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Electronics",
          "Clothing",
          "Books",
          "Home",
          "Sports",
          "Beauty",
          "Toys",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    images: [
      {
        type: String,
        required: [true, "At least one image is required"],
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
      min: [0, "Stock cannot be negative"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for search functionality
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);

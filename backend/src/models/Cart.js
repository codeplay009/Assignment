const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  },
);

// Virtual field for total price
cartSchema.virtual("totalPrice").get(async function () {
  if (!this.items.length) return 0;

  await this.populate("items.product");
  return this.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

// Ensure virtuals are included in JSON
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

// Middleware to populate product on find
cartSchema.pre(/^find/, function (next) {
  this.populate("items.product");
  next();
});

module.exports = mongoose.model("Cart", cartSchema);

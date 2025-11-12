const mongoose = require("mongoose");
const cartProductSchema = new mongoose.Schema(
  {
    itemCart: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
          default: 1,
        },
        size: {
          type: String,
          default: "S",
        },
        price: { type: Number },
      },
    ],

    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const CartProduct = mongoose.model(
  "CartProduct",
  cartProductSchema,
  "cart-product"
);
module.exports = CartProduct;

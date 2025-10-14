const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        url: { type: String, required: true }, // URL ảnh
        public_id: { type: String, required: true }, // public_id để xóa ảnh
      },
    ],
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    countInStock: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    size: [
      {
        type: String,
        default: null,
      },
    ],

    deleted: {
      type: Boolean,
      default: false,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema, "products");
module.exports = Product;

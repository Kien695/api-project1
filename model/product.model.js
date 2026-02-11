const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
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
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sale: {
      type: Number,
      default: 0,
    },
    size: {
      type: [String],
      default: null,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      account_id: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
      deletedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);
const Product = mongoose.model("Product", productSchema, "products");
module.exports = Product;

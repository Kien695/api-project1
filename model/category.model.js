const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    images: {
      type: String,
      default: "",
    },
    images_public_id: { type: String, default: "" },
    parentCatName: {
      default: null,
      type: String,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);
const Category = mongoose.model("Category", categorySchema, "categories");
module.exports = Category;

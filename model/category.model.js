const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
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

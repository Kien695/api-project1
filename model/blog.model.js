const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Vui lòng nhập tiêu đề!"],
    },
    images: {
      type: String,
      default: "",
    },
    images_public_id: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      require: [true, "Vui lòng nhập mô tả!"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const BlogSchema = mongoose.model("BlogSchema", blogSchema, "blogs");
module.exports = BlogSchema;

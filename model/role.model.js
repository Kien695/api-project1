const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Vui lòng nhập tên nhóm quyền"],
    },
    description: String,
    permissions: {
      type: Array,
      default: [],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);
const Role = mongoose.model("Role", roleSchema, "role");
model.exports = Role;

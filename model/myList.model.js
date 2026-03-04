const mongoose = require("mongoose");
const myListSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
const MyList = mongoose.model("MyList", myListSchema, "myList");
module.exports = MyList;

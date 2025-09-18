const mongoose = require("mongoose");
const myListSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      ref: "Product",
    },

    userId: {
      type: String,
      ref: "User",
    },
    productTitle: {
      type: String,

      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
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

    rating: {
      type: Number,
      default: 0,
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

const mongose = require("mongoose");

const reviewProductSchema = new mongose.Schema(
  {
    productId: {
      type: mongose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
const ReviewProduct = mongose.model(
  "ReviewProduct",
  reviewProductSchema,
  "reviewProduct",
);
module.exports = ReviewProduct;

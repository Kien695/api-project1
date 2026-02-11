const Order = require("../../model/order.model");
const Product = require("../../model/product.model");
const ReviewProduct = require("../../model/reviewProduct.model");
const mongoose = require("mongoose");
//get review product
module.exports.getReviewProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewProduct.find({ productId: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      error: false,
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};
//create review
module.exports.createReviewProduct = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;

    const order = await Order.findOne({
      userId: res.locals.userId,
      productItems: {
        $elemMatch: {
          productId: productId,
          order_status: { $in: ["delivering", "confirm"] },
        },
      },
    });

    if (!order) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Vui lòng mua sản phẩm trước khi đánh giá.",
      });
    }
    let savedReview;
    const review = await ReviewProduct.findOne({
      user: res.locals.userId,
      productId: productId,
    }).populate("user", "name avatar");
    if (review) {
      review.rating = rating;
      review.comment = comment;
      savedReview = await review.save();
    } else {
      savedReview = await ReviewProduct.create({
        productId,
        user: res.locals.userId,
        rating,
        comment,
      });
    }
    const stats = await ReviewProduct.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: stats[0]?.avgRating || 0,
      numReviews: stats[0]?.count || 0,
    });

    return res.status(200).json({
      error: false,
      success: true,
      message: "Viết đánh giá thành công",
      review: savedReview,
      rating: stats[0]?.avgRating || 0,
      numReviews: stats[0]?.count || 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, success: false, message: error.message });
  }
};

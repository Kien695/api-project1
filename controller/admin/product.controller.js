const Product = require("../../model/product.model");
const UserAdmin = require("../../model/userAdmin.model");
const Category = require("../../model/category.model");
const searchHelper = require("../../Helper/Search");
const categoryHelper = require("../../Helper/categoryAllFIlter");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

//create Product
module.exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    if (!product) {
      res.status(400).json({
        error: true,
        success: false,
        message: "Sản phẩm không được tạo",
      });
    }
    res.status(200).json({
      message: "Tạo sản phẩm thành công",
      error: false,
      success: true,
      
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
//get Product
module.exports.getProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;

    //search
    const objectSearch = searchHelper(req.query);
    let find = { deleted: false };
    if (objectSearch.regex) {
      find.name = objectSearch.regex;
    }
    //filter category
    const categoryName = req.query.category;

    const category = await Category.findOne({ name: categoryName });

    if (category) {
      const categoryIds = await categoryHelper(category._id);
      find.category = { $in: categoryIds };
    }
    // filter rating
    const rate = req.query.rate;
    if (rate) {
      find.rating = rate;
    }
    //sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.price = "desc";
    }
    const product = await Product.find(find)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort(sort)
      .exec();
    const totalProduct = await Product.countDocuments(find);
    const totalPage = Math.ceil(totalProduct / perPage);

    res.status(200).json({
      success: true,
      error: false,
      products: product,
      perPage: perPage,
      page: page,
      totalItems: totalProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//delete Product(vĩnh viễn)
module.exports.deleteProductTrash = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }
    if (product.public_id) {
      cloudinary.uploader.destroy(product.public_id);
    }
    const deleteProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      res.status(400).json({
        error: true,
        success: false,
        message: "Sản phẩm không được xóa!",
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//delete Product(mềm)
module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }
    const deleteProduct = await Product.updateOne(
      { _id: req.params.id },
      {
        deleted: true,
        deletedBy: {
          account_id: res.locals.userId,
          deletedAt: new Date(),
        },
      },
    );

    if (!deleteProduct) {
      res.status(400).json({
        error: true,
        success: false,
        message: "Sản phẩm không được xóa!",
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//restore Product
module.exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }
    const restoreProduct = await Product.updateOne(
      { _id: req.params.id },
      { deleted: false },
    );

    if (!restoreProduct) {
      res.status(400).json({
        error: true,
        success: false,
        message: "Sản phẩm không được khôi phục!",
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: "Khôi phục thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get single product
module.exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//
//update product
module.exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại", success: false });
    }

    const newImages = req.body.images || [];

    // Xóa ảnh bị bỏ đi
    const imagesToDelete = oldProduct.images.filter(
      (oldImg) => !newImages.some((img) => img.public_id === oldImg.public_id),
    );
    for (const img of imagesToDelete) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    // Update
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: newImages },
      { new: true },
    );

    return res.json({ success: true, message: "Cập nhật sản phẩm thành công" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
//change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { type, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách ID không hợp lệ!",
      });
    }

    switch (type) {
      case "delete-all":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: {
              account_id: res.locals.userId,
              deletedAt: new Date(),
            },
          },
        );
        return res.json({ success: true, message: "Đã chuyển vào thùng rác!" });

      case "delete-hard-all":
        const products = await Product.find({ _id: { $in: ids } });

        const allPublicIds = products
          .flatMap((p) => p.images?.map((img) => img.public_id) || [])
          .filter(Boolean); // <-- lọc null/undefined

        if (allPublicIds.length > 0) {
          await Promise.all(
            allPublicIds.map((id) =>
              cloudinary.uploader
                .destroy(id)
                .catch((err) => console.error("Cloudinary delete error:", err)),
            ),
          );
        }

        await Product.deleteMany({ _id: { $in: ids } });

        return res.json({
          success: true,
          message: "Đã xóa vĩnh viễn tất cả sản phẩm thành công!",
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Yêu cầu không hợp lệ!",
        });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get trash
module.exports.getTrash = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;

    const product = await Product.find({ deleted: true })
      .populate("category")
      .populate("deletedBy.account_id", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const totalProduct = await Product.countDocuments({ deleted: true });
    const totalPage = Math.ceil(totalProduct / perPage);

    res.status(200).json({
      success: true,
      error: false,
      products: product,
      perPage: perPage,
      page: page,
      totalItems: totalProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

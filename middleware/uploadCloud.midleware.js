const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

//end cloudinary

//upload nhiều
module.exports.upload = async (req, res, next) => {
  const streamUpload = (file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "category-images" }, // Tùy bạn đổi tên folder
        (error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  };

  try {
    const uploadPromises = req.files.map((file) => streamUpload(file));
    const imageUrls = await Promise.all(uploadPromises);

    // Gán vào req.body hoặc req.images để sử dụng tiếp
    req.body.images = imageUrls;

    next(); // ⬅ Quan trọng để đi tiếp!
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
};
//upload 1
module.exports.uploadOne = async (req, res, next) => {
  if (!req.file) {
    // Nếu không có file mới, bỏ qua upload
    return next();
  }
  const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  try {
    const result = await streamUpload(req);
    console.log(result);
    req.body.avatar = result.secure_url; // chỉ lấy link ảnh
    req.body.avatar_public_id = result.public_id; // lưu public_id để tiện xóa
    next();
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
};

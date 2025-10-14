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
  try {
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "category-images" },
              (error, result) => {
                if (result) {
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                  });
                } else reject(error);
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          })
      );
      newImages = await Promise.all(uploadPromises);
    }

    // Parse oldImages (nếu có)
    let oldImages = [];
    if (req.body.oldImages) {
      try {
        oldImages = JSON.parse(req.body.oldImages);
      } catch (e) {
        oldImages = [];
      }
    }

    // Merge ảnh cũ + ảnh mới
    req.body.images = [...oldImages, ...newImages];

    next();
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err });
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

    req.body.avatar = result.secure_url; // chỉ lấy link ảnh
    req.body.avatar_public_id = result.public_id; // lưu public_id để tiện xóa
    next();
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
};

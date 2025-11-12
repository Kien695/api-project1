const crypto = require("crypto");
const queryString = require("qs");
const moment = require("moment");

module.exports.payMent = async (req, res) => {
  try {
    const amount = parseInt(req.query.amount);

    // --- Thông tin VNPay (sandbox)
    const vnp_TmnCode = "3PA3GEGK";
    const vnp_HashSecret = "YRMBQAI9F5YFURG8JKTB2Q36RIO5DLPZ";
    const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl = "http://localhost:5173/result";

    // --- Lấy IP người dùng (phòng khi req.ip bị sai định dạng)
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "127.0.0.1";

    // --- Tạo tham số thanh toán
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: moment().format("YYYYMMDDHHmmss"),
      vnp_OrderInfo: "Thanh_toan_don_hang",
      vnp_OrderType: "billpayment",
      vnp_Amount: amount * 100, // nhân 100 theo yêu cầu VNPay
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    // --- Sắp xếp tham số theo thứ tự alphabet
    vnp_Params = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    // --- Chuỗi ký (chú ý encode: false)
    const signData = queryString.stringify(vnp_Params, { encode: true });

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const secureHash = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // --- Thêm hash vào tham số
    vnp_Params["vnp_SecureHash"] = secureHash;

    // --- Tạo URL thanh toán
    const paymentUrl = `${vnp_Url}?${queryString.stringify(vnp_Params)}`;

    return res
      .status(200)
      .json({ error: false, success: true, url: paymentUrl });
  } catch (error) {
    console.error("VNPay error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Lỗi tạo thanh toán VNPay" });
  }
};
//check payment
module.exports.resultPayment = async (req, res) => {
  try {
    const query = req.query;
    const secretKey = "YRMBQAI9F5YFURG8JKTB2Q36RIO5DLPZ";
    const vnp_SecureHash = req.query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    const signData = queryString.stringify(query);
    const hmac = crypto.createHmac("sha512", secretKey);
    const checkSum = hmac.update(signData).digest("hex");
    if (vnp_SecureHash == checkSum) {
      if (query.vnp_ResponseCode == "00") {
        res.json({ message: "Thanh toán thành công!", data: query });
      } else {
        res.json({ message: "Thanh toán thất bại!", data: query });
      }
    } else {
      res.status(400).json({ message: "Dử liệu không hợp lệ!" });
    }
  } catch (error) {}
};

const Order = require("../../model/order.model");
const Product = require("../../model/product.model");
const Cart = require("../../model/cartproduct.model");
const crypto = require("crypto");
const axios = require("axios");
const queryString = require("qs");
const moment = require("moment");
const qs = require("qs");
// Thanh toán VNPay
module.exports.payMent = async (req, res) => {
  try {
    const amount = parseInt(req.body.totalAmount);
    const order = await Order.create({
      userId: res.locals.userId,
      productItems: req.body.productItems,
      paymentMethod: req.body.paymentMethod,
      delivery_address: req.body.delivery_address,
      totalAmount: amount,
      payment_status: "no",
      typeAddress: req.body.typeAddress,
      buyMethod: req.body.buyMethod,
      mobile: req.body.mobile,
    });
    // --- Thông tin VNPay (sandbox)
    const vnp_TmnCode = process.env.TMN_CODE;
    const vnp_HashSecret = process.env.HASH_SECRET;
    const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl = process.env.RETURN_URL;

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
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: "Thanh_toan_don_hang",
      vnp_OrderType: "billpayment",
      vnp_Amount: amount * 100, // nhân 100 theo yêu cầu VNPay
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_BankCode: "VNBANK",
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
    const query = { ...req.query };
    const orderId = query.vnp_TxnRef;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }
    const vnp_SecureHash = query.vnp_SecureHash;

    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sorted = {};
    Object.keys(query)
      .sort()
      .forEach((key) => {
        sorted[key] = query[key];
      });

    const signData = qs.stringify(sorted, { encode: false });

    const hmac = crypto.createHmac("sha512", process.env.HASH_SECRET);
    const checkSum = hmac.update(signData, "utf-8").digest("hex");

    if (vnp_SecureHash == checkSum) {
      if (query.vnp_ResponseCode == "00") {
        await Cart.deleteMany({ userId: order.userId });
        // Cập nhật số lượng đã bán cho từng sản phẩm
        for (const item of order.productItems) {
          const updated = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              countInStock: { $gte: item.quantity },
            },
            {
              $inc: { countInStock: -item.quantity },
            },
            { new: true },
          );

          if (!updated) {
            return res.status(400).json({
              message: "Sản phẩm không đủ hàng",
            });
          }
        }
        order.payment_status = "yes";
        await order.save();
        res.json({ message: "Thanh toán thành công!", data: query });
      } else {
        order.payment_status = "failed";
        await order.save();
        res.json({ message: "Thanh toán thất bại!", data: query });
      }
    } else {
      res.status(400).json({ message: "Dử liệu không hợp lệ!" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Lỗi xử lý kết quả thanh toán" });
  }
};
// ----------
// Thanh toán Momo
module.exports.paymentMomo = async (req, res) => {
  try {
    const totalAmount = parseInt(req.body.totalAmount);
    const order = await Order.create({
      userId: res.locals.userId,
      productItems: req.body.productItems,
      paymentMethod: req.body.paymentMethod,
      delivery_address: req.body.delivery_address,
      totalAmount: totalAmount,
      payment_status: "no",
      typeAddress: req.body.typeAddress,
      buyMethod: req.body.buyMethod,
      mobile: req.body.mobile,
    });
    //parameters
    var accessKey = process.env.ACCESS_KEY;
    var secretKey = process.env.SECRET_KEY;
    var orderInfo = "pay with MoMo";
    var partnerCode = "MOMO";
    var redirectUrl = process.env.RETURN_URL;
    var ipnUrl = process.env.IPN_URL;
    var requestType = "payWithMethod";
    var amount = totalAmount * 100;
    var orderId = order._id.toString();
    var requestId = orderId;
    var extraData = "";
    var paymentCode =
      "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
    var orderGroupId = "";
    var autoCapture = true;
    var lang = "vi";

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;

    //signature

    var signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });
    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };
    let result;
    try {
      result = await axios(options);
      return res.status(200).json({
        error: false,
        success: true,
        url: result.data.payUrl,
      });
    } catch (error) {
      console.error("Momo error:", error);
      return res
        .status(500)
        .json({ error: true, message: "Lỗi tạo thanh toán Momo" });
    }
  } catch (error) {
    console.error("VNPay error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Lỗi tạo thanh toán VNPay" });
  }
};
module.exports.resultPaymentMomo = async (req, res) => {
  try {
    const { orderId, resultCode, signature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }
    const rawSignature = `accessKey=${process.env.ACCESS_KEY}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const secretKey = process.env.SECRET_KEY;

    const generatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: "Lỗi" });
    }

    // 3️ Nếu thanh toán thành công
    if (resultCode === 0) {
      await Cart.deleteMany({ userId: order.userId });
      // Cập nhật số lượng đã bán cho từng sản phẩm
      for (const item of order.productItems) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            countInStock: { $gte: item.quantity },
          },
          {
            $inc: { countInStock: -item.quantity },
          },
          { new: true },
        );

        if (!updated) {
          return res.status(400).json({
            message: "Sản phẩm không đủ hàng",
          });
        }
      }
      order.payment_status = "yes";
      await order.save();
      res.json({ message: "Thanh toán thành công!", data: query });
    } else {
      order.payment_status = "failed";
      order.save();
      res.json({ message: "Thanh toán thất bại!" });
    }
    return res.status(200).json({ message: "Thanh toán thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

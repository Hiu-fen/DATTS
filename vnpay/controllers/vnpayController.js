const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
const axios = require("axios");
require("dotenv").config();

// Encode chuẩn theo yêu cầu của VNPAY
const encodeValue = (value) => {
  if (typeof value === "string") {
    return encodeURIComponent(value).replace(/%20/g, "+");
  }
  return value;
};

// ===== TẠO URL THANH TOÁN VNPAY =====
const createVnpayUrl = (req, res) => {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
    ipAddr = "127.0.0.1";
  }

  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET.trim();
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = moment();
  const createDate = date.format("YYYYMMDDHHmmss");
  const orderCode = (req.body.orderCode || "").trim();
  const amount = parseInt(req.body.amount) * 100;
  const orderInfo = `Thanh toan don hang ${orderCode}`;

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params).filter(([_, v]) => v != null && v !== "").sort()
  );

  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
  );

  const signData = qs.stringify(encodedParams, { encode: false });
  const secureHash = crypto.createHmac("sha512", secretKey).update(signData).digest("hex");

  sortedParams.vnp_SecureHash = secureHash;

  const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;
  res.json({ paymentUrl });
};

// ===== CALLBACK TRẢ VỀ TỪ VNPAY SAU KHI THANH TOÁN =====
const vnpayReturn = async (req, res) => {
  const vnp_Params = { ...req.query };
  const receivedHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const secretKey = process.env.VNP_HASHSECRET.trim();

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params).filter(([_, v]) => v != null && v !== "").sort()
  );

  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
  );

  const signData = qs.stringify(encodedParams, { encode: false });
  const calculatedHash = crypto.createHmac("sha512", secretKey).update(signData).digest("hex");

  const isValid = receivedHash === calculatedHash;

  if (!isValid) {
    return res.status(400).json({ success: false, message: "❌ Checksum không hợp lệ" });
  }

  if (vnp_Params.vnp_ResponseCode === "00") {
    const orderCode = vnp_Params.vnp_TxnRef;

    try {
      // Gọi API để lấy đơn hàng
      const response = await axios.get(`http://localhost:4000/orders?orderCode=${orderCode}`);
      const order = response.data[0];

      if (!order) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
      }

      // Cập nhật đơn hàng
      await axios.patch(`http://localhost:4000/orders/${order.id}`, {
        isPaid: true,
        paymentStatus: "Đã thanh toán",
        status: "Chờ xác nhận"
      });

      return res.json({ success: true, orderCode });
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error.message);
      return res.status(500).json({ success: false, message: "Lỗi server." });
    }
  } else {
    return res.json({ success: false, message: "Thanh toán thất bại." });
  }
};

// ✅ API JSON cho FE gọi khi thanh toán xong (có thể gộp chung với vnpayReturn nếu muốn)
const verifyVnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const receivedHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const secretKey = process.env.VNP_HASHSECRET.trim();
    if (!secretKey) {
      return res.status(500).json({ success: false, message: "Secret key không được cấu hình." });
    }

    const sortedParams = Object.fromEntries(
      Object.entries(vnp_Params).filter(([_, v]) => v).sort()
    );

    const encodedParams = Object.fromEntries(
      Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
    );

    const signData = qs.stringify(encodedParams, { encode: false });
    const calculatedHash = crypto.createHmac("sha512", secretKey).update(signData).digest("hex");

    if (calculatedHash !== receivedHash) {
      return res.status(400).json({ success: false, message: "Checksum không hợp lệ" });
    }

    if (vnp_Params.vnp_ResponseCode === "00") {
      const orderCode = vnp_Params.vnp_TxnRef;

      const response = await axios.get(`http://localhost:4000/orders?orderCode=${orderCode}`);
      const order = response.data[0];

      if (!order) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
      }

      await axios.patch(`http://localhost:4000/orders/${order.id}`, {
        isPaid: true,
        paymentStatus: "Đã thanh toán",
        status: "Chờ xác nhận"
      });

      return res.json({ success: true, orderCode });
    }

    return res.json({ success: false, message: "Thanh toán thất bại" });
  } catch (err) {
    console.error("Lỗi verifyVnpayReturn:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  createVnpayUrl,
  vnpayReturn,
  verifyVnpayReturn,
};

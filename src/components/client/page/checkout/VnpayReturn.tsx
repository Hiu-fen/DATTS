import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Spin } from "antd";
import Confetti from "react-confetti";
import {
  LoadingOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [orderId, setOrderId] = useState<number | null>(null);        // ✅ Dùng để điều hướng
  const [orderCode, setOrderCode] = useState<string | null>(null);    // ✅ Hiển thị mã đơn
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const confirmVnpay = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vnpay/verify_return${location.search}`);
        const result = await res.json();

        if (result.success && result.orderId) {
          setStatus("success");
          setOrderId(result.orderId);          // ✅ Nhận ID đơn hàng từ backend
          setOrderCode(result.orderCode);      // ✅ Mã đơn hàng để hiển thị
          setShowConfetti(true);

          const token = localStorage.getItem("token");
          const user = JSON.parse(localStorage.getItem("user") || "{}");

          if (user?.id && token) {
            await fetch(`http://localhost:4000/carts/${user.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    confirmVnpay();
  }, [location.search]);

  const goToDetailOrder = () => {
    if (orderId) {
      navigate(`/detail_order/${orderId}`); // ✅ điều hướng bằng ID chứ không phải orderCode
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 text-center relative bg-white">
      {showConfetti && <Confetti />}

      {/* LOADING */}
      {status === "processing" && (
        <>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 60, color: "#1890ff" }} spin />}
          />
          <h2 className="text-lg font-semibold text-gray-700">Đang xác minh thanh toán...</h2>
          <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát.</p>
        </>
      )}

      {/* SUCCESS */}
      {status === "success" && orderId && (
        <>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 80 }} />
          <h2 className="text-2xl font-bold text-green-600">🎉 Thanh toán thành công!</h2>
          {orderCode && (
            <p>Mã đơn hàng: <strong>{orderCode}</strong></p>
          )}
          <div className="flex gap-3">
            <Button type="primary" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
            <Button onClick={goToDetailOrder} type="default">
              Xem chi tiết đơn hàng
            </Button>
          </div>
        </>
      )}

      {/* ERROR */}
      {status === "error" && (
        <>
          <CloseCircleTwoTone twoToneColor="#f5222d" style={{ fontSize: 80 }} />
          <h2 className="text-2xl font-bold text-red-500">Thanh toán thất bại</h2>
          <p>Giao dịch không thành công hoặc có lỗi xảy ra.</p>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </>
      )}
    </div>
  );
};

export default VnpayReturn;

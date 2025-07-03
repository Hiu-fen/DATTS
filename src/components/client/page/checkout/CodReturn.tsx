import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "antd";
import Confetti from "react-confetti";
import { CheckCircleTwoTone } from "@ant-design/icons";

const CodReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("orderId");
    const code = params.get("orderCode");

    if (id && !isNaN(Number(id))) {
  setOrderId(Number(id));
}
if (code) {
  setOrderCode(code);
}


    setShowConfetti(true);
  }, [location.search]);

  const goToDetailOrder = () => {
    if (orderId) {
      navigate(`/detail_order/${orderId}`);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 text-center bg-white">
      {showConfetti && <Confetti />}

      <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 80 }} />
      <h2 className="text-2xl font-bold text-green-600">🎉 Đặt hàng thành công!</h2>
      {orderCode && (
        <p>Mã đơn hàng: <strong>{orderCode}</strong></p>
      )}
      <p className="text-gray-600">Cảm ơn bạn đã mua hàng. Đơn hàng sẽ được giao sớm nhất.</p>

      <div className="flex gap-3">
        <Button type="primary" onClick={() => navigate("/")}>
          Về trang chủ
        </Button>
{typeof orderId === "number" && !isNaN(orderId) && (
  <Button type="default" onClick={goToDetailOrder}>
    Xem chi tiết đơn hàng
  </Button>
)}

      </div>
    </div>
  );
};

export default CodReturn;

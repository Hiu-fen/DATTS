// src/components/client/page/DetailOrders.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaHashtag,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { message, Modal } from "antd";

interface IOrderItem {
  productId: number;
  productName: string;
  soluong: number;
  price: number;
  color: string;
  storage: string;
}

interface IOrder {
  id: number;
  orderCode: string;
  date: string;
  total: number;
  status: string;
  paymentMethod: string;
  address: string;
  items: IOrderItem[];
}

const DetailOrders: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios
      .get<{ data: IOrder }>(`http://localhost:4000/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const payload = res.data.data ?? (res.data as any);
        setOrder(payload);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      });
  }, [id, user]);

  const handleCancelOrder = async () => {
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng?",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      okText: "Hủy đơn",
      cancelText: "Đóng",
      onOk: async () => {
        setCancelling(true);
        try {
          const token = localStorage.getItem("token");
          await axios.patch(
            `http://localhost:4000/orders/${id}`,
            { status: "Đã hủy" },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setOrder((prev) => (prev ? { ...prev, status: "Đã hủy" } : prev));
          message.success("Đơn hàng đã được hủy.");
        } catch (err) {
          console.error("Lỗi khi hủy đơn hàng:", err);
          message.error("Không thể hủy đơn hàng. Vui lòng thử lại.");
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  if (!order) {
    return (
      <div className="text-center text-gray-500 py-10 text-lg">
        Đang tải dữ liệu đơn hàng...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Đơn hàng <span className="font-mono">#{order.orderCode}</span>
        </h2>
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
          >
            <FaArrowLeft /> Quay lại
          </Link>
          {order.status !== "Đã giao" && order.status !== "Đã hủy" && (
            <button
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="text-red-600 hover:underline text-sm border border-red-500 px-3 py-1 rounded-md"
            >
              {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          )}
        </div>
      </div>

      {/* Thông tin tóm tắt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
        <div>
          <p className="text-gray-600 mb-1">Mã đơn:</p>
          <p className="font-medium text-gray-800">{order.orderCode}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Ngày đặt:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            <FaCalendarAlt />
            {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Trạng thái:</p>
          <p className="font-medium text-blue-600">{order.status}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Thanh toán:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            <FaCreditCard />
            {order.paymentMethod}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Địa chỉ:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            <FaMapMarkerAlt />
            {order.address}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Số sản phẩm:</p>
          <p className="font-medium text-gray-800 flex items-center gap-2">
            <FaHashtag />
            {order.items.length}
          </p>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b bg-gray-50 font-semibold text-gray-700 text-lg">
          Danh sách sản phẩm
        </div>
        <div>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Màu: {item.color || "-"} | Dung lượng: {item.storage || "-"}
                </p>
                <p className="text-sm text-gray-500">
                  Số lượng: {item.soluong}
                </p>
                <p className="text-sm text-gray-500">
                  Giá: {(Number(item.price) || 0).toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div className="text-right text-green-600 font-semibold min-w-[100px]">
                {(item.price * item.soluong).toLocaleString("vi-VN")} ₫
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="mt-6 text-right">
        <p className="text-xl text-gray-800 font-bold flex justify-end items-center gap-2">
          <FaMoneyBillWave className="text-green-600" />
          Tổng cộng:{" "}
          <span className="text-green-700">
            {order.total.toLocaleString("vi-VN")} ₫
          </span>
        </p>
      </div>
    </div>
  );
};

export default DetailOrders;

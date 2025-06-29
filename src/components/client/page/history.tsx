import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaEye,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBoxOpen,
  FaShoppingBag,
  FaCalendarAlt,
} from "react-icons/fa";

interface IOrderItem {
  productName: string;
  soluong: number;
  price: number;
  color: string;
  storage: string;
}

interface IOrder {
  id: string;
  orderCode: string;
  total: number;
  status: string;
  date: string;
  paymentMethod?: string;
  address: string;
  items: IOrderItem[];
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get<IOrder[]>(
          `http://localhost:4000/orders/user/${user.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        setOrders(res.data || []);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setOrders([]);
        } else {
          console.error("Lỗi khi tải lịch sử:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("chờ")) return "text-yellow-600";
    if (s.includes("xử lý")) return "text-blue-600";
    if (s.includes("giao")) return "text-green-600";
    if (s.includes("hủy")) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="pt-20 pb-8 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-10 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 pt-8 flex items-center gap-3">
          <FaShoppingBag className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử đơn hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow border p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBoxOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bạn chưa có đơn hàng nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy bắt đầu mua sắm và đơn hàng sẽ hiển thị tại đây.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow border text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Ngày</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Thanh toán</th>
                  <th className="px-4 py-3 text-left">Địa chỉ</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        #{order.orderCode}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.items.length} sản phẩm
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        {order.total.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-1">
                          <FaCreditCard className="text-blue-500" />
                          {order.paymentMethod || "COD"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-start gap-1">
                          <FaMapMarkerAlt className="text-gray-400 mt-0.5" />
                          {order.address}
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/detail_order/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-xs"
                        >
                          <FaEye /> Xem
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

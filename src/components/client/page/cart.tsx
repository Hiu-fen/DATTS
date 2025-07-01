// src/components/client/page/Cart.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { message, Button } from "antd";
import { useUser } from "../context/UserContext";

export interface IProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: number;
  status: string;
  ram?: string;
  color?: string;
}

interface ICartItemFull {
  id: string;
  productId: IProduct;
  quantity: number;
  price: number;
  color: string;
  storage: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;

  const [cartItems, setCartItems] = useState<ICartItemFull[]>([]);
  const [loading, setLoading] = useState(true);

  // formatPrice: fallback về 0 nếu không phải number
  const formatPrice = (price?: number) => {
    const p = typeof price === "number" ? price : 0;
    return p.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Lấy giỏ hàng; nếu 404 → giỏ trống
  const getProductCart = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    message.error("Bạn chưa đăng nhập");
    setLoading(false);
    return;
  }

  try {
    const res = await axios.get(
      `http://localhost:4000/carts/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Response:", res.data);
    const items: any[] = res.data?.items || res.data?.data?.items || [];

    const mapped: ICartItemFull[] = items.map((it) => ({
      id: `${it.productId.id}-${it.productId.ram || ""}-${it.productId.color || ""}`,
      productId: it.productId,
      quantity: it.quantity,
      price: typeof it.productId.price === "number" ? it.productId.price : 0,
      color: it.productId.color || "",
      storage: it.productId.ram || "",
    }));

    setCartItems(mapped);
  } catch (err: any) {
    console.error("Lỗi lấy giỏ hàng:", err);

    if (err.response?.status === 401) {
      message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } else if (err.response?.status === 404 || err.response?.data?.message === "Cart not found") {
      setCartItems([]);
    } else {
      message.error("Không thể tải giỏ hàng");
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    getProductCart();
  }, [userId]);

  // PUT cập nhật giỏ hàng
  const updateCartOnServer = async (updatedItems: ICartItemFull[]) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/carts/${userId}`,
        {
          items: updatedItems.map((item) => ({
            productId: item.productId.id,
            color: item.color,
            storage: item.storage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng:", error);
    }
  };

  const updateCartItems = (updatedItems: ICartItemFull[]) => {
    setCartItems(updatedItems);
    updateCartOnServer(updatedItems);
  };

  const handleQuantityChange = (
    productId: string,
    color: string,
    storage: string,
    delta: number
  ) => {
    const updated = cartItems.map((item) =>
      item.id === `${productId}-${storage}-${color}`
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    updateCartItems(updated);
  };

  const handleRemove = (
    productId: string,
    color: string,
    storage: string
  ) => {
    const updated = cartItems.filter(
      (item) => item.id !== `${productId}-${storage}-${color}`
    );
    updateCartItems(updated);
    message.success("Xóa sản phẩm thành công");
  };

  const handleCheckout = () => {
    if (!userId) {
      message.error("Bạn chưa đăng nhập");
      return;
    }
    navigate("/checkout");
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) {
    return <p className="text-center py-10">Đang tải giỏ hàng...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Nút xem lịch sử */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Giỏ Hàng Của Bạn</h1>
        <div className="space-x-2">
          <Button type="default" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </Button>
          <Button type="link" onClick={() => navigate("/history")}>
            Lịch sử đơn hàng
          </Button>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Giỏ hàng của bạn đang trống.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-4 text-center">
                  <input type="checkbox" className="w-4" />
                </th>
                <th className="p-4 text-center">STT</th>
                <th className="p-4 text-left">Sản phẩm</th>
                <th className="p-4 text-center">Màu sắc</th>
                <th className="p-4 text-center">Dung lượng</th>
                <th className="p-4 text-center">Đơn giá</th>
                <th className="p-4 text-center">Số lượng</th>
                <th className="p-4 text-center">Thành tiền</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, idx) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-center">
                    <input type="checkbox" className="w-4" />
                  </td>
                  <td className="text-center p-4 font-semibold">{idx + 1}</td>
                  <td className="p-4 flex items-center gap-4">
                    <img
                      src={item.productId.image}
                      alt={item.productId.name}
                      className="w-16 h-16 rounded-lg border object-cover"
                    />
                    <span className="font-medium text-gray-800">
                      {item.productId.name}
                    </span>
                  </td>
                  <td className="text-center p-4">{item.color || "-"}</td>
                  <td className="text-center p-4">{item.storage || "-"}</td>
                  <td className="text-center p-4 text-red-500 font-medium">
                    {formatPrice(item.price)}
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId.id.toString(),
                            item.color,
                            item.storage,
                            -1
                          )
                        }
                        className="w-7 h-7 border rounded"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId.id.toString(),
                            item.color,
                            item.storage,
                            1
                          )
                        }
                        className="w-7 h-7 border rounded"
                      >
                        ＋
                      </button>
                    </div>
                  </td>
                  <td className="text-center p-4 font-semibold text-red-600">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                  <td className="text-center p-4">
                    <button
                      onClick={() =>
                        handleRemove(
                          item.productId.id.toString(),
                          item.color,
                          item.storage
                        )
                      }
                      className="px-3 py-1 text-red-600 border rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-6 border-t pt-6 px-4 pb-6">
            <span className="text-xl font-bold">
              Tổng Tiền: <span className="text-red-600">{formatPrice(total)}</span>
            </span>
            <Button type="primary" onClick={handleCheckout}>
              Đặt hàng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

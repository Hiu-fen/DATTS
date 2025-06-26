import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
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

const Cart = () => {
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

  // Lấy giỏ hàng
  const getProductCart = async () => {
    try {
      const res = await axios.get("http://localhost:4000/carts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const items: any[] = res.data.data?.items || [];

      const mapped: ICartItemFull[] = items.map((it) => ({
        // tạo id duy nhất cho row
        id: `${it.productId.id}-${it.productId.ram || ""}-${it.productId.color || ""}`,
        productId: it.productId,
        quantity: it.quantity,
        price: typeof it.productId.price === "number" ? it.productId.price : 0,
        color: it.productId.color || "",
        storage: it.productId.ram   || "",
      }));

      setCartItems(mapped);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      message.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
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
            color:      item.color,
            storage:    item.storage,
            price:      item.price,
            quantity:   item.quantity,
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
    const updatedItems = cartItems.map((item) =>
      item.id === `${productId}-${storage}-${color}`
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    updateCartItems(updatedItems);
  };

  const handleRemove = (productId: string, color: string, storage: string) => {
    const updatedItems = cartItems.filter(
      (item) => item.id !== `${productId}-${storage}-${color}`
    );
    updateCartItems(updatedItems);
    message.success("Xóa sản phẩm thành công");
  };

  const handleCheckout = async () => {
    if (!userId) {
      message.error("Bạn chưa đăng nhập");
      return;
    }
    try {
      await axios.put(
        `http://localhost:4000/carts/${userId}`,
        {
          items: cartItems.map((item) => ({
            productId: item.productId.id,
            color:      item.color,
            storage:    item.storage,
            price:      item.price,
            quantity:   item.quantity,
          })),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate("/checkout");
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      message.error("Không thể đặt hàng. Vui lòng thử lại");
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading)
    return <p className="text-center py-10">Đang tải giỏ hàng...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

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
              {cartItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-4 text-center">
                    <input type="checkbox" className="w-4" />
                  </td>
                  <td className="text-center p-4 font-semibold">
                    {index + 1}
                  </td>
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
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId.id.toString(),
                            item.color,
                            item.storage,
                            -1
                          )
                        }
                        className="w-7 h-7 text-lg border rounded hover:bg-gray-100"
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
                        className="w-7 h-7 text-lg border rounded hover:bg-gray-100"
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
                      className="text-sm text-red-600 font-semibold px-3 py-1 rounded border border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-6 px-4 pb-6">
            <Link
              to="/"
              className="text-blue-600 hover:underline text-sm mb-4 md:mb-0"
            >
              ← Quay lại tiếp tục mua sắm
            </Link>

            <div className="text-right space-y-2">
              <p className="text-xl font-bold">
                Tổng Tiền:{" "}
                <span className="text-red-600">{formatPrice(total)}</span>
              </p>
              <button
                onClick={handleCheckout}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-semibold"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

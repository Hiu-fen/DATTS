import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin, Image } from "antd";
import axios from "axios";
import { useUser } from "../../context/UserContext";

interface ICartItemFull {
  productId: {
    id: number;
    name: string;
    price: number;
    image: string;
    album?: string[];
    description?: string;
    ram?: string;
    color?: string;
  };
  quantity: number;
  color: string;
  storage: string;
}

const SHIPPING_FEE = 35000;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;
  const [cartItems, setCartItems] = useState<ICartItemFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderCode] = useState(() => 
    "ORD-" + Math.random().toString(36).substr(2, 5).toUpperCase()
  );

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    email: user?.email || "",
    note: "",
    paymentMethod: "COD",
    shippingProvider: "Giao hàng tiêu chuẩn",
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:4000/carts/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const items: ICartItemFull[] = (res.data.data.items || []).map((it: any) => ({
          productId: it.productId,
          quantity: it.quantity,
          color: it.color ?? "",
          storage: it.storage ?? "",
        }));
        setCartItems(items);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );
  const totalWithShipping = totalPrice + SHIPPING_FEE;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOrder = async () => {
  if (!userId) {
    message.error("Vui lòng đăng nhập để đặt hàng");
    return navigate("/login");
  }
  if (!form.name || !form.phone || !form.address || !form.email) {
    return message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return message.error("Email không hợp lệ");
  }

  const payload = {
    orderCode,
    customerName: form.name,
    phone: form.phone,
    address: form.address,
    email: form.email,
    notes: form.note,
    paymentMethod: form.paymentMethod,
    shippingProvider: form.shippingProvider,
    total: totalWithShipping,
    status: "Chờ xác nhận",
    date: new Date().toISOString(),
    isPaid: form.paymentMethod !== "COD",
    refunded: false,
    items: cartItems.map(item => ({
      productId: item.productId.id,
      productName: item.productId.name,
      soluong: item.quantity,
      price: item.productId.price,
      color: item.color,
      storage: item.storage,
    })),
    userId,
  };

  try {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:4000/orders",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await axios.delete(
      `http://localhost:4000/carts/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    message.success(`Đặt hàng thành công! Mã đơn: ${orderCode}`);

    // Đợi lâu hơn để json-server chắc chắn commit
    await new Promise(res => setTimeout(res, 500));

    const res = await axios.get(`http://localhost:4000/orders?orderCode=${orderCode}`);
    console.log("Kết quả tìm đơn sau POST:", res.data);
    if (res.data && res.data.length > 0 && res.data[0].id) {
      navigate(`/detail_order/${res.data[0].id}`);
    } else {
      message.warning("Đặt hàng thành công nhưng không tìm thấy chi tiết đơn.");
      navigate("/history");
    }
  } catch (err: any) {
    console.error(err);
    message.error(err.response?.data?.message || "Đặt hàng thất bại");
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!userId || cartItems.length === 0) {
    return (
      <div className="p-10 text-center text-xl">
        {!userId
          ? "Vui lòng đăng nhập để thanh toán."
          : "Giỏ hàng của bạn đang trống."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-12 mb-12">
      <h1 className="text-3xl font-bold mb-2 text-center">Xác nhận đơn hàng</h1>
      <p className="text-center text-gray-600 mb-6">
        Mã đơn hàng của bạn: <span className="font-mono">{orderCode}</span>
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
            Thông tin người nhận
          </h2>
          <div className="space-y-5 mt-6">
            <input name="name" placeholder="Họ tên *" value={form.name} onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
            <input name="phone" placeholder="Số điện thoại *" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
            <input name="address" placeholder="Địa chỉ nhận hàng *" value={form.address} onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
            <input name="email" placeholder="Email *" value={form.email} onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
            <textarea name="note" placeholder="Ghi chú (tùy chọn)" value={form.note} onChange={handleChange} rows={3} className="w-full border rounded-lg px-4 py-3 resize-none" />
            <select name="shippingProvider" value={form.shippingProvider} onChange={handleChange} className="w-full border rounded-lg px-4 py-3">
              <option>Giao hàng tiêu chuẩn</option>
              <option>J&T Express</option>
              <option>Giao hàng nhanh (GHN)</option>
            </select>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Phương thức thanh toán</h3>
            {["COD", "Momo", "Bank"].map((m) => (
              <label key={m} className="flex items-center mb-2">
                <input type="radio" name="paymentMethod" value={m} checked={form.paymentMethod === m} onChange={handleChange} className="form-radio" />
                <span className="ml-2">
                  {m === "COD" ? "Thanh toán khi nhận hàng" : m === "Momo" ? "Thanh toán qua Momo" : "Chuyển khoản ngân hàng"}
                </span>
              </label>
            ))}
          </div>
          <button onClick={handleOrder} className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition">
            Đặt hàng ngay
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
            Sản phẩm trong giỏ hàng
          </h2>
          <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {cartItems.map((item, i) => (
              <li key={i} className="flex items-center py-4">
                <Image src={item.productId.image} width={64} className="rounded-lg mr-4" />
                <div className="flex-1">
                  <p className="font-medium">{item.productId.name}</p>
                  <p className="text-sm">Màu: {item.color || "–"}</p>
                  <p className="text-sm">Dung lượng: {item.storage || "–"}</p>
                  <p className="text-sm">Số lượng: {item.quantity}</p>
                </div>
                <div className="font-semibold">
                  {(item.productId.price * item.quantity).toLocaleString("vi-VN")} ₫
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Tổng tiền:</span>
              <span>{totalPrice.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển:</span>
              <span>{SHIPPING_FEE.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Tổng cộng:</span>
              <span>{totalWithShipping.toLocaleString("vi-VN")} ₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

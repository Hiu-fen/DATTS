import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { IProduct } from '../../../interface/product';
import { useUser } from '../context/UserContext';

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

  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  // Lấy giỏ hàng
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:4000/carts/${userId}`)
      .then(res => setCartItems(res.data.data?.items || []))
      .catch(() => message.error('Không thể tải giỏ hàng'))
      .finally(() => setLoading(false));
  }, [userId]);

  // Cập nhật server
  const updateCartOnServer = async (items: ICartItemFull[]) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:4000/carts/${userId}`,
        { items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            color: i.color,
            storage: i.storage,
          })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error('Lỗi cập nhật giỏ hàng:', e);
    }
  };

  // Thay đổi số lượng
  const handleQuantityChange = async (
    pid: string,
    color: string,
    storage: string,
    delta: number
  ) => {
    const updated = cartItems.map(item =>
      `${item.productId.id}` === pid &&
      item.color === color &&
      item.storage === storage
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCartItems(updated);
    await updateCartOnServer(updated);
  };

  // Xóa
  const handleRemove = (pid: string, color: string, storage: string) => {
    const updated = cartItems.filter(
      item =>
        `${item.productId.id}` !== pid ||
        item.color !== color ||
        item.storage !== storage
    );
    setCartItems(updated);
    updateCartOnServer(updated);
    message.success('Xóa sản phẩm thành công');
  };

  // Đặt hàng
  const handleCheckout = async () => {
    if (!userId) return message.error('Bạn chưa đăng nhập');
    try {
      await axios.put(`http://localhost:4000/carts/${userId}`, {
        items: cartItems.map(i => ({
          productId: i.productId.id,
          quantity: i.quantity,
          color: i.color,
          storage: i.storage,
        })),
      });
      navigate('/checkout');
    } catch {
      message.error('Không thể đặt hàng. Vui lòng thử lại');
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  if (loading) {
    return <p className="text-center py-10">Đang tải giỏ hàng…</p>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Giỏ hàng của bạn đang trống.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-4 text-center">
                  <input type="checkbox" className="w-4" />
                </th>
                <th className="p-4 text-center">STT</th>
                <th className="p-4 text-left">Sản phẩm</th>
                <th className="p-4 text-center">Màu sắc</th>
                <th className="p-4 text-center">Ram</th>
                <th className="p-4 text-center">Đơn giá</th>
                <th className="p-4 text-center">Số lượng</th>
                <th className="p-4 text-center">Thành tiền</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, idx) => (
                <tr
                  key={`${item.productId.id}-${item.color}-${item.storage}`}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-4 text-center">
                    <input type="checkbox" className="w-4" />
                  </td>
                  <td className="p-4 text-center font-semibold">{idx + 1}</td>
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
                  <td className="p-4 text-center text-gray-700">
                    {item.color || '-'}
                  </td>
                  <td className="p-4 text-center text-gray-700">
                    {item.storage || '-'}
                  </td>
                  <td className="p-4 text-center text-red-500 font-medium">
                    {formatPrice(item.productId.price)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            String(item.productId.id),
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
                            String(item.productId.id),
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
                  <td className="p-4 text-center font-semibold text-red-600">
                    {formatPrice(item.productId.price * item.quantity)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        handleRemove(
                          String(item.productId.id),
                          item.color,
                          item.storage
                        )
                      }
                      className="text-sm text-red-600 font-semibold px-3 py-1 rounded border border-red-600 hover:bg-red-600 hover:text-white transition-colors"
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
              ← Quay lại mua sắm
            </Link>
            <div className="text-right space-y-2">
              <p className="text-xl font-bold">
                Tổng Tiền:{' '}
                <span className="text-red-600">{formatPrice(total)}</span>
              </p>
              <button
                onClick={handleCheckout}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition font-semibold"
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

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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  };

  const getProductCart = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/carts/${userId}`);
      const items = res.data.data?.items || [];
      setCartItems(items);
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      message.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    getProductCart();
  }, [userId]);

  const updateCartOnServer = async (updatedItems: ICartItemFull[]) => {
    try {
      await axios.put(`http://localhost:4000/carts/${userId}`, {
        items: updatedItems.map((item) => ({
          productId: item.productId.id,
          quantity: item.quantity,
          color: item.color,
          storage: item.storage,
        })),
      });
    } catch (error) {
      console.error('Lỗi cập nhật giỏ hàng:', error);
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
      String(item.productId.id) === productId &&
      item.color === color &&
      item.storage === storage
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    updateCartItems(updatedItems);
  };

  const handleRemove = (itemId: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    updateCartItems(updatedItems);
    message.success('Xóa sản phẩm thành công');
  };

  const handleCheckout = async () => {
    if (!userId) {
      message.error('Bạn chưa đăng nhập');
      return;
    }

    try {
      await axios.put(`http://localhost:4000/carts/${userId}`, {
        items: cartItems.map((item) => ({
          productId: item.productId.id,
          quantity: item.quantity,
          color: item.color,
          storage: item.storage,
        })),
      });
      navigate('/checkout');
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      message.error('Không thể đặt hàng. Vui lòng thử lại');
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
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
                  key={`${item.id}-${item.color}-${item.storage}`}
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
                      src={
                        item.productId.image ||
                        'https://dummyimage.com/100x100/cccccc/000000.png&text=No+Image'
                      }
                      alt={item.productId.name}
                      className="w-16 h-16 rounded-lg border object-cover"
                    />
                    <span className="font-medium text-gray-800">
                      {item.productId.name}
                    </span>
                  </td>
                  <td className="text-center p-4">{item.color || '-'}</td>
                  <td className="text-center p-4">{item.storage || '-'}</td>
                  <td className="text-center p-4 text-red-500 font-medium">
                    {formatPrice(item.productId.price)}
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center items-center gap-2">
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
                  <td className="text-center p-4 font-semibold text-red-600">
                    {formatPrice(item.productId.price * item.quantity)}
                  </td>
                  <td className="text-center p-4">
                    <button
                      onClick={() => handleRemove(item.id)}
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
                Tổng Tiền:{' '}
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

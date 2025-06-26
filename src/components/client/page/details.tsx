import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { message } from "antd";

const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        message.error("Không thể tải thông tin sản phẩm.");
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchCategoryNames = async () => {
      if (!product?.category) return;

      const categoryIds = Array.isArray(product.category) ? product.category : [product.category];
      const names = await Promise.all(
        categoryIds.map(async (categoryId: string) => {
          try {
            const res = await axios.get(`http://localhost:4000/category/${categoryId}`);
            return res.data.name || "Không xác định";
          } catch (error) {
            return "Không xác định";
          }
        })
      );
      setCategoryNames(names);
    };

    fetchCategoryNames();
  }, [product]);

  if (!product) {
    return <div className="p-10 text-center text-xl">Đang tải thông tin sản phẩm...</div>;
  }
  const handleAddToCart = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category,
    };

    await axios.post(
      "http://localhost:4000/carts",
      {
        product: productData, // gửi đầy đủ thông tin
        quantity: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    message.success("Đã thêm sản phẩm vào giỏ hàng!");
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng:", error);
    message.error("Thêm vào giỏ hàng thất bại.");
  }
};

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-10">

          {/* Ảnh sản phẩm */}
          <div className="flex justify-center items-center">
            <img
              src={product.image || "/default-image.jpg"}
              alt={product.name}
              className="rounded-lg w-full max-w-md object-cover shadow-md"
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="mb-3">
                <span className="font-medium text-gray-600">Danh mục:</span>{" "}
                <span className="text-blue-600 font-semibold">{categoryNames.join(", ") || "Không xác định"}</span>
              </div>

              <div className="mb-4">
                <span className="text-xl text-red-600 font-bold">
                  {Number(product.price).toLocaleString()} ₫
                </span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Không có mô tả cho sản phẩm này."}
                </p>
              </div>
            </div>

            {/* Nút thêm vào giỏ */}
            <div className="mt-6">
 <button
  onClick={handleAddToCart}
  className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200"
>
  Thêm vào giỏ hàng
</button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;

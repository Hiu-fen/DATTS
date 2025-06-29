import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Spin,
  Image,
  InputNumber,
  Button,
  message,
  Breadcrumb,
} from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface IVariantForm {
  id: number;
  ram: string;
  color: string;
  quantity: number;
  price: number;
}

interface IProductDetail {
  id: number;
  name: string;
  image: string;
  album: string[];
  price: number;
  description: string;
  status: string;
  category: number;
  variants?: IVariantForm[];
}

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;

  const [product, setProduct] = useState<IProductDetail | null>(null);
  const [categoryName, setCategoryName] = useState<string>("Danh mục");
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<IProductDetail>(
          `http://localhost:4000/products/${id}`
        );
        const data = res.data;
        setProduct(data);
        setMainImage(data.image);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }

        if (data.category) {
          const catRes = await axios.get<{ id: number; name: string }>(
            `http://localhost:4000/category/${data.category}`
          );
          setCategoryName(catRes.data.name);
        }

      } catch (err) {
        console.error(err);
        message.error("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng.");
    }
    if (!userId) {
      return message.error("Không xác định được người dùng.");
    }
    if (!selectedVariantId) {
      return message.error("Vui lòng chọn 1 biến thể.");
    }

    const variant = product!.variants!.find(v => v.id === selectedVariantId)!;

    const productForCart = {
      id: product!.id,
      name: product!.name,
      price: variant.price,
      image: product!.image,
      description: product!.description,
      ram: variant.ram,
      color: variant.color
    };

    try {
      await axios.post(
        "http://localhost:4000/carts",
        {
          product: productForCart,
          quantity: qty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      message.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      message.error("Thêm vào giỏ hàng thất bại.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-10 text-center text-xl">Sản phẩm không tồn tại.</div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mb-4">
        <Breadcrumb separator="/">
          <Breadcrumb.Item onClick={() => navigate('/')} className="cursor-pointer">Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate('/category')} className="cursor-pointer">{categoryName}</Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div style={{ width: "100%", height: "500px", overflow: "hidden" }}>
              <Image
                src={mainImage}
                alt={product.name}
                width="100%"
                height="100%"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              {[product.image, ...product.album].map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  width={80}
                  preview={false}
                  className="cursor-pointer"
                  onClick={() => setMainImage(url)}
                />
              ))}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="border rounded-xl p-4 bg-gradient-to-tr from-white to-blue-50 border-blue-200 inline-block mb-4">
              <p className="text-gray-600 text-sm mb-1">Giá sản phẩm</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-black">
                  {product.price.toLocaleString()}<sup className="text-base">đ</sup>
                </span>
                <span className="line-through text-gray-400 text-lg">
                  {(product.price * 1.13).toLocaleString()}đ
                </span>
              </div>
            </div>

            <p className="mb-4">
              <span className="font-medium">Tình trạng:</span>{" "}
              <span
                className={
                  product.status === "Còn hàng" ? "text-green-600" : "text-red-600"
                }
              >
                {product.status}
              </span>
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="font-medium mb-2">Chọn biến thể:</p>
                <Row gutter={[16, 16]}>
                  {product.variants.map(v => (
                    <Col key={v.id} xs={24} sm={12}>
                      <div
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`
                          w-full p-4 rounded-lg border relative transition-all cursor-pointer
                          ${selectedVariantId === v.id
                            ? "border-blue-500 ring-2 ring-blue-300 shadow-lg"
                            : "border-gray-300 hover:border-blue-400"
                          }
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Ram: {v.ram}</p>
                            <p className="font-medium">Màu: {v.color}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-500 font-semibold">{v.price.toLocaleString()} ₫</p>
                            <p className="text-sm text-gray-500">Tồn kho: {v.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <div className="mb-6 text-gray-700">{product.description}</div>

            <div className="flex items-center gap-4 mb-6">
              <Button onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
              <InputNumber min={1} value={qty} onChange={(v) => setQty(v || 1)} />
              <Button onClick={() => setQty(q => q + 1)}>＋</Button>
            </div>

            <Button type="primary" block size="large" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Details;

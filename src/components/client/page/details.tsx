import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Spin,
  Image,
  Radio,
  InputNumber,
  Button,
  message,
} from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ← import useUser

interface IVariantForm {
  id: number;
  ram: string;
  color: string;
  quantity: number; // tồn kho của biến thể
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
  variants?: IVariantForm[];
}

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();                  // ← lấy user từ context
  const userId = user?.id;                     // ← userId

  const [product, setProduct] = useState<IProductDetail | null>(null);
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
      } catch (err) {
        console.error(err);
        message.error("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

    try {
      // 1. Lấy giỏ hàng hiện tại
      const cartRes = await axios.get(
        `http://localhost:4000/carts/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const items: any[] = cartRes.data.data?.items || [];

      // 2. Lấy biến thể đã chọn
      const variant = product.variants!.find(v => v.id === selectedVariantId)!;

      // 3. Cập nhật mảng items
      const idx = items.findIndex(i => i.variantId === variant.id);
      if (idx >= 0) {
        items[idx].quantity += qty;
      } else {
        items.push({
          variantId: variant.id,
          productId: product.id,
          color: variant.color,
          storage: variant.ram,
          price: variant.price,
          quantity: qty,
        });
      }

      // 4. PUT cập nhật
      await axios.put(
        `http://localhost:4000/carts/${userId}`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      message.error("Thêm vào giỏ hàng thất bại.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <Row gutter={[32, 32]}>
          {/* Ảnh */}
          <Col xs={24} md={12}>
            <Image src={mainImage} alt={product.name} />
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

          {/* Thông tin + biến thể + số lượng */}
          <Col xs={24} md={12}>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl text-red-600 font-semibold mb-4">
              {product.price.toLocaleString()} ₫
            </p>
            <p className="mb-6 text-gray-700">{product.description}</p>
            <p className="mb-6">
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
                <Radio.Group
                  onChange={e => setSelectedVariantId(e.target.value)}
                  value={selectedVariantId}
                >
                  <Row gutter={[16, 16]}>
                    {product.variants.map(v => (
                      <Col key={v.id} span={24}>
                        <Radio value={v.id} className="w-full p-3 border rounded">
                          <div className="flex justify-between">
                            <div>
                              <p>Ram: <b>{v.ram}</b></p>
                              <p>Màu: <b>{v.color}</b></p>
                            </div>
                            <div className="text-right">
                              <p>Giá: {v.price.toLocaleString()}₫</p>
                              <p>
                                Tồn kho:{" "}
                                <span className="font-semibold">{v.quantity}</span>
                              </p>
                            </div>
                          </div>
                        </Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </div>
            )}

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

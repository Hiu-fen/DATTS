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
  Input,
} from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { IComment } from "../../../interface/comments";

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
  const [newComment, setNewComment] = useState<string>("");
  const [comments, setComments] = useState<any[]>([]);
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

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/comments?productId=${id}`);
      const filtered = res.data
  .filter((c: IComment) => c.status === true)
  .sort((a: IComment, b: IComment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setComments(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    const email = localStorage.getItem("email");
    if (!email) return message.warning("Bạn cần đăng nhập để bình luận.");
    if (!newComment.trim()) return message.warning("Vui lòng nhập nội dung bình luận.");

    try {
      await axios.post("http://localhost:4000/comments", {
        user: email,
        content: newComment.trim(),
        productId: Number(id),
        createdAt: new Date().toISOString(),
        status: false,
      });
      message.success("Đã gửi bình luận, đang chờ duyệt!");
      setNewComment("");
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm bình luận.");
    }
  };

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
    fetchComments();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng.");
    if (!userId) return message.error("Không xác định được người dùng.");
    if (!selectedVariantId) return message.error("Vui lòng chọn 1 biến thể.");

    const variant = product!.variants!.find(v => v.id === selectedVariantId)!;

    const productForCart = {
      id: product!.id,
      name: product!.name,
      price: variant.price,
      image: product!.image,
      description: product!.description,
      ram: variant.ram,
      color: variant.color,
    };

    try {
      await axios.post(
        "http://localhost:4000/carts",
        {
          product: productForCart,
          quantity: qty,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      message.error("Thêm vào giỏ hàng thất bại.");
    }
  };

  const handleCheckout = () => {
    if (!selectedVariantId) return message.error("Vui lòng chọn 1 biến thể.");
    const variant = product!.variants!.find(v => v.id === selectedVariantId)!;

    const orderItem = {
      productId: {
        id: product!.id,
        name: product!.name,
        price: variant.price,
        image: product!.image,
        album: product!.album,
        description: product!.description,
        ram: variant.ram,
        color: variant.color,
      },
      quantity: qty,
      color: variant.color,
      storage: variant.ram,
    };

    localStorage.setItem("checkoutItem", JSON.stringify(orderItem));
    navigate("/checkout-product");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-10 text-center text-xl">Sản phẩm không tồn tại.</div>;
  }

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-4">
        <Breadcrumb
          items={[
            {
              title: <span className="cursor-pointer" onClick={() => navigate("/")}>Trang chủ</span>,
            },
            {
              title: <span className="cursor-pointer" onClick={() => navigate("/category")}>{categoryName}</span>,
            },
            {
              title: product.name,
            },
          ]}
        />
      </div>

      {/* Product detail */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <Row gutter={[32, 32]}>
          {/* Ảnh sản phẩm */}
          <Col xs={24} md={12}>
            <Image
              src={mainImage}
              alt={product.name}
              width="100%"
              height={450}
              style={{ objectFit: "contain" }}
              className="rounded-lg"
            />
            <div className="flex gap-2 mt-4 flex-wrap">
              {[product.image, ...product.album].map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  width={80}
                  preview={false}
                  className={`cursor-pointer rounded-md border ${url === mainImage ? "border-blue-500" : "border-gray-300"
                    }`}
                  onClick={() => setMainImage(url)}
                />
              ))}
            </div>
          </Col>

          {/* Thông tin sản phẩm */}
          <Col xs={24} md={12}>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Giá sản phẩm</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-black">
                  {displayPrice.toLocaleString()}<sup className="text-base">₫</sup>
                </span>
                <span className="line-through text-gray-400 text-lg">
                  {(displayPrice * 1.13).toLocaleString()}₫
                </span>
              </div>
            </div>

            <p className="mb-4 text-base">
              <span className="font-semibold">Tình trạng: </span>
              <span className={product.status === "Còn hàng" ? "text-green-600" : "text-red-600"}>
                {product.status}
              </span>
            </p>

            {/* Biến thể */}
            {product.variants?.length ? (
              <div className="mb-6">
                <p className="font-medium mb-2">Chọn biến thể:</p>
                <Row gutter={[16, 16]}>
                  {product.variants.map((v) => (
                    <Col key={v.id} xs={24} sm={12}>
                      <div
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedVariantId === v.id
                          ? "border-blue-500 shadow-md ring-2 ring-blue-200"
                          : "border-gray-300 hover:border-blue-400"
                          }`}
                      >
                        <p>📦 Ram: <b>{v.ram}</b></p>
                        <p>🎨 Màu: <b>{v.color}</b></p>
                        <p>💲 Giá: <span className="text-red-500 font-semibold">{v.price.toLocaleString()} ₫</span></p>
                        <p>📦 Tồn kho: {v.quantity}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ) : null}

            <div className="mb-6 text-gray-700 text-justify">{product.description}</div>

            <div className="flex items-center gap-4 mb-6">
              <Button onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
              <InputNumber min={1} value={qty} onChange={v => setQty(v || 1)} />
              <Button onClick={() => setQty(q => q + 1)}>＋</Button>
            </div>

            <div className="flex flex-col gap-3">
              <Button type="primary" block size="large" onClick={handleAddToCart}>
                🛒 Thêm vào giỏ hàng
              </Button>
              <Button
                type="default"
                block
                size="large"
                onClick={handleCheckout}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                🚀 Mua ngay
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Bình luận */}
      <div className="max-w-6xl mx-auto mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">💬 Bình luận</h2>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
            {(localStorage.getItem("email") || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <Input.TextArea
              rows={3}
              placeholder="Nhập bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <div className="flex justify-end mt-2">
              <Button type="primary" onClick={handleAddComment}>
                Gửi bình luận
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có bình luận nào được duyệt.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border rounded p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                      {c.user.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{c.user}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;

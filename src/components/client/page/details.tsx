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
      setComments(res.data);
    } catch (err) {
      console.error(err);
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
  const handleAddComment = async () => {
    const email = localStorage.getItem("email");
    if (!email) return message.warning("Bạn cần đăng nhập để bình luận.");
    if (!newComment.trim()) return message.warning("Vui lòng nhập nội dung bình luận.");

    try {
      await axios.post("http://localhost:4000/comments", {
        userId: email,
        content: newComment,
        productId: Number(id),
        date: new Date().toISOString(),
        status: true,
      });
      message.success("Đã thêm bình luận!");
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm bình luận.");
    }
  };



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

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-4">
        <Breadcrumb separator=">">
          <Breadcrumb.Item onClick={() => navigate("/")} className="cursor-pointer">
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate("/category")} className="cursor-pointer">
            {categoryName}
          </Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <Row gutter={[32, 32]}>
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

          <Col xs={24} md={12}>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Giá sản phẩm</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-black">
                  {product.price.toLocaleString()}<sup className="text-base">₫</sup>
                </span>
                <span className="line-through text-gray-400 text-lg">
                  {(product.price * 1.13).toLocaleString()}₫
                </span>
              </div>
            </div>

            <p className="mb-4 text-base">
              <span className="font-semibold">Tình trạng: </span>
              <span
                className={product.status === "Còn hàng" ? "text-green-600" : "text-red-600"}
              >
                {product.status}
              </span>
            </p>

            {product.variants?.length ? (
              <div className="mb-6">
                <p className="font-medium mb-2">Chọn biến thể:</p>
                <Row gutter={[16, 16]}>
                  {product.variants?.map((v) => (
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
      <div className="max-w-6xl mx-auto mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">💬 Bình luận</h2>
        <Input
          placeholder="Nhập bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={handleAddComment}
        />
        <Button className="mt-2" type="primary" onClick={handleAddComment}>
          Thêm bình luận
        </Button>

        <div className="mt-4 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="border rounded p-2">
              <div className="flex justify-between">
                <span className="font-medium">{c.userId}</span>
                <span className="text-sm text-gray-500">
                  {new Date(c.date).toLocaleString()}
                </span>
              </div>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>


    </div>

  );
};

export default Details;

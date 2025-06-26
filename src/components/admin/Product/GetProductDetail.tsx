import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Row,
  Col,
  Spin,
  Tag,
  Button,
  Collapse,
} from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { IProduct, IVariantForm } from "../../../interface/product";
import { ArrowLeftOutlined } from "@ant-design/icons";

const GetProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  const [variants, setVariants] = useState<IVariantForm[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy chi tiết sản phẩm
        const res = await axios.get<IProduct>(`http://localhost:4000/products/${id}`);
        const data = res.data;
        if (!Array.isArray(data.album)) data.album = [];

        setProduct(data);
        setMainImage(data.image);
        setVariants(data.variants || []);

        // Lấy tên danh mục
        const catRes = await axios.get<{ id: number; name: string }[]>("http://localhost:4000/category");
        const cat = catRes.data.find((c) => c.id === data.category);
        setCategoryName(cat?.name || "Không có danh mục");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      <div className="flex justify-center items-center h-screen text-red-600">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  // Chuẩn bị panels cho Collapse
  const panels = variants.map((v, idx) => ({
    key: v.id ?? idx,
    label: `ID: ${v.id ?? idx + 1}`,
    children: (
      <div>
        <p><b>RAM:</b> {("ram" in v ? (v as any).ram : v.attributes?.ram) || "-"}</p>
        <p><b>Color:</b> {("color" in v ? (v as any).color : v.attributes?.color) || "-"}</p>
        <p><b>Số lượng:</b> {v.quantity}</p>
        <p><b>Giá:</b> {v.price.toLocaleString()} VND</p>
      </div>
    ),
  }));

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/phone/list")}
        className="mb-6"
      >
        Quay lại danh sách
      </Button>

      <Card title={<h2 className="text-2xl font-bold">{product.name}</h2>} className="shadow-lg">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            {/* Ảnh chính */}
            <div className="mb-4">
              <img
                src={mainImage || product.image}
                alt={product.name}
                className="w-full h-[360px] object-contain border"
              />
            </div>
            {/* Album */}
            <div className="flex gap-2">
              {[product.image, ...product.album].map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover border cursor-pointer"
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </Col>

          <Col xs={24} md={12}>
            {/* Thông tin chung */}
            <Descriptions
              bordered
              column={1}
              size="middle"
              styles={{
                label: { width: 150, fontWeight: 600 },
                content: { backgroundColor: "#ffffff" },
              }}
            >
              <Descriptions.Item label="Giá">
                {product.price.toLocaleString()} VND
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {categoryName}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={product.status === "Còn hàng" ? "green" : "red"}>
                  {product.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {product.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {product.description}
              </Descriptions.Item>
            </Descriptions>

            {/* Biến thể sản phẩm */}
            {panels.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Biến thể sản phẩm</h3>
                <Collapse accordion items={panels} />
              </div>
            )}

            <div className="mt-4">
              <Button type="primary" onClick={() => navigate(`/admin/phone/${id}/edit`)}>
                Chỉnh sửa
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GetProductDetail;

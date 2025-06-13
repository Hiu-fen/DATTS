import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Image,
  Row,
  Col,
  Spin,
  Tag,
  Button,
  Collapse,
} from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { IProduct } from "../../interface/product";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const GetProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(
          `http://localhost:4000/products/${id}`
        );
        let data = productRes.data;

        // Handle album parsing
        if (typeof data.album === "string") {
          try {
            data.album = JSON.parse(data.album);
          } catch (err) {
            console.warn("Album parsing failed:", err);
            data.album = [];
          }
        }

        if (!Array.isArray(data.album)) {
          data.album = [];
        }

        setProduct(data);

        const categoryRes = await axios.get(`http://localhost:4000/category`);
        const cat = categoryRes.data.find((c: any) => c.id === +data.category);
        setCategoryName(cat ? cat.name : "Không có danh mục");
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Không thể tải chi tiết sản phẩm. Vui lòng thử lại.");
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

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 text-lg font-semibold">
          {error || "Sản phẩm không tồn tại."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/phone/list")}
        className="mb-6 hover:bg-blue-100 transition-colors duration-300"
      >
        Quay lại danh sách
      </Button>
      <Card
        title={
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
        }
        className="shadow-lg rounded-xl border-none bg-white"
        headStyle={{
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Row gutter={[32, 32]} className="p-4">
          <Col xs={24} md={12}>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full rounded-lg transition-transform duration-300 hover:scale-105"
                preview={{ maskClassName: "rounded-lg" }}
              />
              <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-700">
                Album ảnh
              </h3>
              <Row gutter={[16, 16]}>
                {product.album.length > 0 ? (
                  product.album.map((img: string, idx: number) => (
                    <Col xs={12} sm={8} key={idx}>
                      <Image
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-md transition-transform duration-300 hover:scale-105"
                        preview={{ maskClassName: "rounded-md" }}
                      />
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <p className="text-gray-500 italic">
                      Không có ảnh trong album.
                    </p>
                  </Col>
                )}
              </Row>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{
                fontWeight: 600,
                backgroundColor: "#f1f5f9",
                padding: "12px",
                width: "150px",
              }}
              contentStyle={{ padding: "12px", backgroundColor: "#ffffff" }}
              className="rounded-lg shadow-sm"
            >
              <Descriptions.Item label="Tên">{product.name}</Descriptions.Item>
              <Descriptions.Item label="Giá">
                {parseInt(product.price).toLocaleString()} VND
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {categoryName}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={product.status === "Còn hàng" ? "green" : "red"}
                  className="px-3 py-1 text-sm font-medium"
                >
                  {product.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {product.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm đánh giá">
                {product.score ?? "Chưa có"}
              </Descriptions.Item>
            </Descriptions>
            <div className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || "Không có mô tả."}
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              <Button
                type="primary"
                onClick={() => navigate(`/admin/phone/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
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

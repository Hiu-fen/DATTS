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
import { IProduct } from "../../../interface/product";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const GetProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<IProduct[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(
          `http://localhost:4000/products/${id}`
        );
        let data = productRes.data;

        if (typeof data.album === "string") {
          try {
            data.album = JSON.parse(data.album);
          } catch {
            data.album = [];
          }
        }

        if (!Array.isArray(data.album)) {
          data.album = [];
        }

        setProduct(data);
        setMainImage(data.image); // 👈 Gán ảnh chính ban đầu
        setVariants(data.variants || []);

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
              {/* Ảnh chính */}
              <div className="w-full h-[360px] bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                <img
                  src={mainImage || product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </div>

              {/* Album ảnh */}
              <h3 className="text-base font-medium mb-2 text-gray-700">
                Album ảnh
              </h3>
              <div className="flex flex-wrap gap-3">
                {[product.image, ...product.album].map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-200
            ${
              mainImage === img
                ? "border-blue-500"
                : "border-gray-300 hover:border-blue-400"
            }`}
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
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
                {product.priceRange ? (
                  <>
                    {product.priceRange.toString().includes("-") ? (
                      <>
                        {product.priceRange
                          .split("-")
                          .map((p) => parseInt(p).toLocaleString())
                          .join(" – ")}{" "}
                        VND
                      </>
                    ) : (
                      `${parseInt(product.priceRange).toLocaleString()} VND`
                    )}
                    <div className="text-gray-500 text-sm">
                      (Giá gốc: {parseInt(product.price).toLocaleString()} VND)
                    </div>
                  </>
                ) : (
                  `${parseInt(product.price).toLocaleString()} VND`
                )}
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

            {/* BIẾN THỂ SẢN PHẨM */}
            {variants.length > 0 && (
              <div className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Biến thể sản phẩm
                </h3>
                <Collapse accordion>
                  {variants.map((variant, idx) => (
                    <Panel header={variant.name} key={idx}>
                      <p>
                        <b>Giá:</b> {parseInt(variant.price).toLocaleString()}{" "}
                        VND
                      </p>
                      <p>
                        <b>Số lượng:</b> {variant.quantity}
                      </p>
                      <p>
                        <b>Trạng thái:</b>{" "}
                        <Tag
                          color={
                            variant.status === "Còn hàng" ? "green" : "red"
                          }
                        >
                          {variant.status}
                        </Tag>
                      </p>
                      <p>
                        <b>Thuộc tính:</b>
                      </p>
                      <ul className="list-disc ml-5 text-gray-600">
                        {variant.attributes &&
                          Object.entries(variant.attributes).map(
                            ([key, value]) => (
                              <li key={key}>
                                {key}: <b>{value}</b>
                              </li>
                            )
                          )}
                      </ul>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            )}

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

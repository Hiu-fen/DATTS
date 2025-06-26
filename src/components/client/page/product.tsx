import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { Icatagory } from '../../../interface/category';
import { Card, Row, Col, Typography, Button, Input, Select, Space, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
// import BannerClient from "../componentChild/Home/banner";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  // Fetch danh sách sản phẩm từ API
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:4000/products')).data,
  });

  // Fetch danh mục từ API
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:4000/category')).data,
  });

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
  let filtered = products || [];

  // Lọc theo danh mục
  if (selectedCategory) {
  filtered = filtered.filter((product: IProduct) => product.category === Number(selectedCategory));
}


  // Lọc theo tên sản phẩm
  if (searchText) {
    filtered = filtered.filter((product: IProduct) =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  return filtered;
}, [products, selectedCategory, searchText]);


  const handleCategoryChange = (value: number | null) => {
    setSelectedCategory(value);
  };

  // Loading spinner khi dữ liệu đang được tải
  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* <BannerClient /> */}
      <Title level={2} className="text-center mb-8 text-3xl font-bold text-gray-800">Danh sách sản phẩm</Title>

      {/* Bộ lọc sản phẩm */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
        <Space direction="vertical" size="large" className="w-full">
          {/* Danh mục sản phẩm và tìm kiếm */}
          <div className="mb-4 flex justify-between items-center">
            <div className="w-1/2">
              <Text strong className="block mb-3 text-lg text-gray-700">Danh mục sản phẩm:</Text>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full rounded-lg"
                allowClear
                placeholder="Chọn danh mục"
              >
                {categories?.map((category: Icatagory) => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </div>
            <div className="w-1/2">
              <Text strong className="block mb-3 text-lg text-gray-700">Tìm kiếm sản phẩm:</Text>
              <Search
                placeholder="Tìm kiếm sản phẩm"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </Space>
      </div>

      {/* Hiển thị số lượng sản phẩm đã lọc */}
      <div className="mb-6">
        <Text className="text-gray-600">
          {selectedCategory
            ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục ${categories?.find((c: Icatagory) => c.id === selectedCategory)?.name}`
            : `Hiển thị ${filteredProducts.length} sản phẩm`}
        </Text>
      </div>

      {/* Danh sách sản phẩm */}
      <Row gutter={[24, 24]}>
        {filteredProducts.map((product: IProduct) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Link to={`/product/${product.id}`}>
              <Card
                hoverable
                className="h-full transition-all duration-300 hover:shadow-xl"
                cover={
                  <div className="relative h-48 overflow-hidden">
                    <img
                      alt={product.name}
                      src={product.image}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                }
              >
                <Title level={4} className="mb-2 line-clamp-2 text-gray-800 hover:text-blue-600 transition-colors">
                  {product.name}
                </Title>
                <Text className="block text-lg font-bold text-red-600 mb-2">
                  {Number(product.price).toLocaleString('vi-VN')} VNĐ
                </Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Thông báo khi không có sản phẩm */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Text className="text-gray-500 text-lg">
            {selectedCategory
              ? `Không tìm thấy sản phẩm nào trong danh mục ${categories?.find((c: Icatagory) => c.id === selectedCategory)?.name}`
              : 'Không tìm thấy sản phẩm phù hợp'}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ProductPage;

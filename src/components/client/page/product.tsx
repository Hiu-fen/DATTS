import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IProduct } from '../../../interface/product';
import { Icatagory } from '../../../interface/category';
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Spin,
  Divider,
  Empty,
} from 'antd';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

const { Title, Text } = Typography;
const { Search } = Input;

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  // Fetch sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () =>
      (await axios.get('http://localhost:4000/products')).data,
  });

  // Fetch danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () =>
      (await axios.get('http://localhost:4000/category')).data,
  });

  // Xử lý lọc
  const filteredProducts = useMemo(() => {
    let filtered = products || [];

    if (selectedCategory) {
      filtered = filtered.filter(
        (product: IProduct) => product.category === selectedCategory
      );
    }

    if (searchText.trim()) {
      const normalizedSearch = searchText.toLowerCase().trim();
      filtered = filtered.filter((product: IProduct) =>
        product.name.toLowerCase().includes(normalizedSearch)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchText]);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-6 bg-gray-100 min-h-screen">
      <Title level={2} className="text-center mb-8 text-3xl font-bold text-gray-800">
        Danh sách sản phẩm
      </Title>

      {/* Bộ lọc */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tìm kiếm */}
          <div>
            <Text strong className="block mb-2 text-gray-700">
              Tìm kiếm sản phẩm:
            </Text>
            <Search
              placeholder="Nhập tên sản phẩm..."
              allowClear
              enterButton="Tìm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </div>

          {/* Danh mục sản phẩm */}
          <div>
            <Text strong className="block mb-2 text-gray-700">
              Lọc theo danh mục:
            </Text>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full border ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                } hover:bg-blue-500 hover:text-white transition`}
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </button>
              {categories?.map((cat: Icatagory) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-blue-500 hover:text-white transition`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin tổng sản phẩm */}
      <div className="text-center mb-4">
        <Text type="secondary" className="text-lg">
          {selectedCategory
            ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục: ${
                categories?.find((c: Icatagory) => c.id === selectedCategory)
                  ?.name || ''
              }`
            : `Tổng cộng ${filteredProducts.length} sản phẩm`}
        </Text>
      </div>

      <Divider />

      {/* Danh sách sản phẩm */}
      <Row gutter={[24, 24]}>
        {filteredProducts.map((product: IProduct) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Link to={`/product/${product.id}`}>
              <Card
                hoverable
                className="h-full rounded-lg overflow-hidden shadow-md"
                cover={
                  <img
                    alt={product.name}
                    src={product.image}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                }
              >
                <Title level={5} className="text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </Title>
                <Text strong className="text-red-600 block text-lg">
                  {Number(product.price).toLocaleString('vi-VN')} VNĐ
                </Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Không có sản phẩm */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Empty description="Không tìm thấy sản phẩm phù hợp" />
        </div>
      )}
    </div>
  );
};

export default ProductPage;

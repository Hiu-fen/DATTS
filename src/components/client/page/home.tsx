import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const Home = () => {
  const nav = useNavigate();

  // Fetch sản phẩm từ API (laptop)
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await axios.get("http://localhost:4000/products")).data,
  });

  // Fetch danh mục từ API (laptop)
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await axios.get("http://localhost:4000/category")).data,
  });

   // Lấy tất cả đơn hàng
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await axios.get("http://localhost:4000/orders")).data,
  });

  // Tính sản phẩm bán chạy nhất
  const bestSellingProducts = useMemo(() => {
    if (!orders || !products) return [];

    const productSales: Record<number, number> = {};

    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const id = item.productId;
        productSales[id] = (productSales[id] || 0) + item.soluong;
      });
    });

    const top3Ids = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => Number(id));

    return products.filter((p: any) => top3Ids.includes(p.id));
  }, [orders, products]);

  

  // Hàm điều hướng tới trang chi tiết sản phẩm
  const goToProductDetail = (productId: number) => {
    nav(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <div className="bg-cover bg-center h-[50vh] text-white relative" style={{ backgroundImage: 'url(https://via.placeholder.com/1500x500?text=Laptop+Shop)' }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex justify-center items-center text-center px-6">
          <div>
            <h1 className="text-5xl font-bold">Chào mừng đến với Shop Laptop</h1>
            <p className="mt-4 text-xl">Khám phá các mẫu laptop mới nhất với giá ưu đãi hấp dẫn</p>
            <Button className="mt-6 text-white bg-blue-600 hover:bg-blue-700" size="large" onClick={() => nav("/products")}>
              Khám Phá Laptop Ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Top 3 sản phẩm bán chạy */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">Top 3 Sản Phẩm Bán Chạy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {bestSellingProducts.map((product: any) => (
            <div key={product.id} className="bg-white shadow-md rounded-lg p-6 text-center hover:scale-105 transition">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-md" />
              <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-500">{product.price.toLocaleString()} VND</p>
              <Button className="mt-4" type="primary" onClick={() => goToProductDetail(product.id)}>
                Xem Chi Tiết
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Danh mục sản phẩm (Laptop) */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">Danh Mục Laptop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories?.map((category: any) => (
            <div key={category.id} className="bg-white shadow-lg rounded-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
              <img src={category.image} alt={category.name} className="w-full h-40 object-cover rounded-md" />
              <h3 className="mt-4 text-xl font-semibold">{category.name}</h3>
              <p className="text-gray-500">{category.mota}</p>
              <Button className="mt-4" type="primary" onClick={() => nav(`/category/${category.id}`)}>
                Xem Laptop
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách sản phẩm (Laptop) */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">Tất Cả Sản Phẩm</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products?.map((product: any) => (
            <div key={product.id} className="bg-white shadow-lg rounded-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-md" />
              <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-500">{product.price.toLocaleString()} VND</p>
              <p className="text-gray-400">{product.description}</p>
              <Button className="mt-4" type="primary" onClick={() => goToProductDetail(product.id)}>
                Xem Chi Tiết
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Giới thiệu về cửa hàng */}
      <div className="max-w-7xl mx-auto py-16 px-6 flex items-center justify-between">
        <div className="w-1/2">
          <img src="https://via.placeholder.com/600x400" alt="Laptop Shop" className="w-full h-auto object-cover rounded-lg" />
        </div>
        <div className="w-1/2 pl-12">
          <h2 className="text-3xl font-semibold mb-4">Về Chúng Tôi</h2>
          <p className="text-lg text-gray-700 mb-6">
            Shop Laptop chuyên cung cấp các dòng sản phẩm laptop chính hãng, chất lượng cao với giá thành hợp lý.
            Chúng tôi luôn cam kết mang đến trải nghiệm mua sắm tuyệt vời cho khách hàng.
          </p>
          <Button type="primary" onClick={() => nav("/about")} size="large">Tìm Hiểu Thêm</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;

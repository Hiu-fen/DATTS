import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";

const Home = () => {
  const nav = useNavigate();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const today = new Date();
  const past7Days = new Date();
  past7Days.setDate(today.getDate() - 6); // 7 ngày bao gồm hôm nay

  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => (await axios.get("http://localhost:4000/banners")).data,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) =>
        banners && banners.length > 0 ? (prev + 1) % banners.length : 0
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await axios.get("http://localhost:4000/products")).data,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await axios.get("http://localhost:4000/category")).data,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await axios.get("http://localhost:4000/orders")).data,
  });

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

  const goToProductDetail = (productId: number) => {
    nav(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <div
        className="bg-cover bg-center h-[50vh] text-white relative"
        style={{
          backgroundImage: `url(${banners?.[currentBannerIndex]?.image || "https://via.placeholder.com/1500x500?text=Laptop+Shop"})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex justify-center items-center text-center px-6">
          <div>
            <h1 className="text-5xl font-bold">Chào mừng đến với Shop Laptop</h1>
            <p className="mt-4 text-xl">
              Khám phá các mẫu laptop mới nhất với giá ưu đãi hấp dẫn
            </p>
            <Button
              className="mt-6 text-white bg-blue-600 hover:bg-blue-700"
              size="large"
              onClick={() => nav("/product")}
            >
              Khám Phá Laptop Ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Top 3 Sản phẩm bán chạy */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-50 ring-2 ring-yellow-300 rounded-2xl shadow-2xl p-8 animate-pulse">
          <h2 className="text-3xl font-semibold text-center mb-2 text-yellow-700 drop-shadow">
            🔥 Top 3 Sản Phẩm Bán Chạy
          </h2>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Từ <strong>{formatDate(past7Days)}</strong> đến{" "}
            <strong>{formatDate(today)}</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {bestSellingProducts.map((product: any, index: number) => (
              <div
                key={product.id}
                className="bg-white shadow-md rounded-lg p-6 text-center hover:scale-105 transition relative"
              >
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  #{index + 1}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-500">{product.price.toLocaleString()} VND</p>
                <Button className="mt-4" type="primary" onClick={() => goToProductDetail(product.id)}>
                  Xem Chi Tiết
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">Danh Mục Laptop</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 w-max">
            {categories?.map((category: any) => (
              <div
                key={category.id}
                className="w-[220px] min-w-[220px] bg-white shadow-lg rounded-lg p-4 text-center hover:scale-105 transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-md"
                />
                <h3 className="mt-2 text-lg font-semibold">{category.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{category.mota}</p>
                <Button
                  className="mt-3"
                  type="primary"
                  size="small"
                  onClick={() => nav(`/category/${category.id}`)}
                >
                  Xem Laptop
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tất cả sản phẩm */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">Tất Cả Sản Phẩm</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products?.map((product: any) => (
            <div
              key={product.id}
              className="bg-white shadow-lg rounded-lg p-6 text-center transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-500">{product.price.toLocaleString()} VND</p>
              <Button className="mt-4" type="primary" onClick={() => goToProductDetail(product.id)}>
                Xem Chi Tiết
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Giới thiệu */}
      <div className="max-w-7xl mx-auto py-16 px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="md:w-1/2 w-full">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTUP7WjdLYwGdLC99X28tuR-aBmnd7Iw59Ig&s"
            alt="Laptop Shop"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        <div className="md:w-1/2 w-full">
          <h2 className="text-3xl font-semibold mb-4">Về Chúng Tôi</h2>
          <p className="text-lg text-gray-700 mb-6">
            Shop Laptop chuyên cung cấp các dòng sản phẩm laptop chính hãng, chất lượng cao với giá thành hợp lý.
            Chúng tôi luôn cam kết mang đến trải nghiệm mua sắm tuyệt vời cho khách hàng.
          </p>
          <Button type="primary" onClick={() => nav("/about")} size="large">
            Tìm Hiểu Thêm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { IProduct } from "../../../interface/product";
import { Icatagory } from "../../../interface/category";

const Categorys: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);


  // Lấy danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery<Icatagory[]>({
    queryKey: ["categories"],
    queryFn: async () => (await axios.get("http://localhost:4000/category")).data,
  });

  // Lấy sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery<IProduct[]>({
    queryKey: ["products"],
    queryFn: async () => (await axios.get("http://localhost:4000/products")).data,
  });

  const scrollLeft = () => {
    const container = document.getElementById("scroll-container");
    if (container) container.scrollLeft -= 200;
  };

  const scrollRight = () => {
    const container = document.getElementById("scroll-container");
    if (container) container.scrollLeft += 200;
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedCategoryId) return products;
    return products.filter((product) => product.category === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId || !categories) return "";
    const category = categories.find((cat) => cat.id === selectedCategoryId);
    return category?.name || "";
  }, [selectedCategoryId, categories]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* DANH MỤC */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center mb-3">Danh mục sản phẩm</h2>
        <div className="relative">
          
          <div
            id="scroll-container"
            className="flex gap-3 overflow-x-auto px-10 py-2 scroll-smooth no-scrollbar"
          >
            <div
              className={`px-4 py-2 rounded-full text-sm cursor-pointer border ${
                !selectedCategoryId ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setSelectedCategoryId(null)}
            >
              Tất cả
            </div>
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className={`px-4 py-2 rounded-full text-sm cursor-pointer border whitespace-nowrap ${
                  selectedCategoryId === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </div>
            ))}
          </div>
          
        </div>
      </div>

      {/* SẢN PHẨM */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">
          {selectedCategoryId
            ? `Sản phẩm trong danh mục "${selectedCategoryName}"`
            : "Tất cả sản phẩm"}
        </h2>
        <p className="text-gray-500 text-sm">
          Hiển thị {filteredProducts.length} sản phẩm
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-w-screen-xl mx-auto">
        {filteredProducts.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition duration-300 overflow-hidden group"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="p-4">
              <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
              <p className="text-red-600 font-bold text-sm mt-2">
                {Number(product.price).toLocaleString()} VNĐ
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* KHÔNG CÓ SẢN PHẨM */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {selectedCategoryId
            ? `Không có sản phẩm trong danh mục "${selectedCategoryName}"`
            : "Không có sản phẩm nào."}
        </div>
      )}
    </div>
  );
};

export default Categorys;

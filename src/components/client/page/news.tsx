import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FireOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface INews {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: string;
  image: string;
}

const NewsClient = () => {
  const [news, setNews] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:4000/news");
      const sorted = res.data.sort(
        (a: INews, b: INews) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNews(sorted);
    } catch (error) {
      console.error("Lỗi khi lấy tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(news.map((item) => item.category))];

  const filteredNews =
    selectedCategory === "All"
      ? news
      : news.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm font-semibold">
            Đang tải
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center overflow-hidden">
        <img
          src="https://plus.unsplash.com/premium_photo-1661817214148-2d4cf768a7c3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dGVjaG5vbG9neSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md animate-fade-in">
            Tin Tức Công Nghệ Mới Nhất
          </h1>
          <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-100 animate-fade-in-delayed">
            Xu hướng mới, thiết bị đỉnh cao, mẹo hữu ích cho thế hệ số.
          </p>
          <div className="mt-4 animate-fade-in-delayed">
            <span className="inline-block bg-yellow-500 text-black font-semibold text-xs uppercase px-3 py-1 rounded-full shadow tracking-wider">
              #Tech2025
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gray-800 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <img
                  src={
                    item.image ||
                    "https://tse1.mm.bing.net/th?id=OIP.H1gHhKVbteqm1U5SrwpPgwHaFj&pid=Api&P=0&h=180"
                  }
                  alt={item.title}
                  className="w-full h-60 object-cover rounded-t-xl transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://tse1.mm.bing.net/th?id=OIP.H1gHhKVbteqm1U5SrwpPgwHaFj&pid=Api&P=0&h=180";
                  }}
                />
                {index < 2 && (
                  <span className="absolute top-4 right-4 px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md animate-pulse">
                    <FireOutlined className="mr-1" /> HOT
                  </span>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-400 text-black font-semibold text-xs uppercase px-3 py-1 rounded-full shadow">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarOutlined />
                    {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserOutlined /> {item.author}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-gray-700 transition-colors duration-300">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.content}
                </p>
                <Link
                  to={`/news/${item.id}`}
                  className="inline-flex items-center px-5 py-2 bg-gray-800 text-white text-sm font-medium rounded-full hover:bg-gray-700 hover:scale-105 transition-all duration-300"
                >
                  Đọc thêm
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline CSS for Animations */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 1s ease-out;
          }
          .animate-fade-in-delayed {
            animation: fadeIn 1s ease-out 0.3s forwards;
            opacity: 0;
          }
          .animate-fade-in-card {
            animation: fadeInCard 0.6s ease-out forwards;
            opacity: 0;
          }
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInCard {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NewsClient;

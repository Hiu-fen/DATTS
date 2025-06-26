import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
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

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<INews | null>(null);
  const [relatedNews, setRelatedNews] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/news/${id}`);
      setNews(res.data);
      fetchRelatedNews(res.data.category, res.data.id);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết tin tức:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async (category: string, currentId: number) => {
    try {
      const res = await axios.get("http://localhost:4000/news");
      const related = res.data.filter(
        (item: INews) => item.category === category && item.id !== currentId
      );
      setRelatedNews(related.slice(0, 3));
    } catch (err) {
      console.error("Lỗi khi lấy bài viết liên quan:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/news"
          className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftOutlined className="mr-2" /> Quay lại
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <img
            src={news.image}
            alt={news.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://tse1.mm.bing.net/th?id=OIP.H1gHhKVbteqm1U5SrwpPgwHaFj&pid=Api&P=0&h=180";
            }}
            className="w-full h-80 object-cover rounded-md mb-6"
          />

          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-yellow-400 text-black text-sm font-semibold shadow">
            {news.category}
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {news.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <CalendarOutlined />
              {new Date(news.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <UserOutlined /> {news.author}
            </span>
          </div>

          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {news.content}
          </div>
        </div>

        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bài viết cùng danh mục
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={
                        item.image && item.image.trim() !== ""
                          ? item.image
                          : "https://tse1.mm.bing.net/th?id=OIP.H1gHhKVbteqm1U5SrwpPgwHaFj&pid=Api&P=0&h=180"
                      }
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://tse1.mm.bing.net/th?id=OIP.H1gHhKVbteqm1U5SrwpPgwHaFj&pid=Api&P=0&h=180";
                      }}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-black font-semibold text-xs uppercase px-3 py-1 rounded-full shadow">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                      <CalendarOutlined />
                      {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;

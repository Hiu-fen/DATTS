import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NewsClient = () => {
    const [news, setNews] = useState<any[]>([]); // Dữ liệu tin tức giả
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    // Dữ liệu tin tức giả lập
    const fetchNews = async () => {
        // Dữ liệu giả cho tin tức
        const fakeNews = [
            {
                _id: "1",
                title: "Laptop X mới ra mắt, giá tốt hơn bao giờ hết!",
                content: "Laptop X mới vừa được ra mắt với nhiều cải tiến vượt bậc về hiệu suất và thiết kế, mang đến cho người dùng trải nghiệm tuyệt vời...",
                category: "Công Nghệ",
                createdAt: "2023-06-15T10:00:00Z",
                author: "John Doe",
                image: "https://via.placeholder.com/400x300?text=Laptop+X",
            },
            {
                _id: "2",
                title: "5 mẫu laptop gaming đáng chú ý năm 2023",
                content: "Với sự phát triển mạnh mẽ của công nghệ, năm 2023 đã chứng kiến sự xuất hiện của nhiều mẫu laptop gaming cực kỳ mạnh mẽ...",
                category: "Gaming",
                createdAt: "2023-06-18T14:30:00Z",
                author: "Jane Smith",
                image: "https://via.placeholder.com/400x300?text=Laptop+Gaming",
            },
            {
                _id: "3",
                title: "Top 10 mẹo làm việc hiệu quả trên laptop",
                content: "Hãy khám phá các mẹo vặt giúp bạn làm việc hiệu quả hơn khi sử dụng laptop, từ các phím tắt đến cách tối ưu hóa hiệu suất...",
                category: "Mẹo vặt",
                createdAt: "2023-06-20T09:00:00Z",
                author: "Alice Lee",
                image: "https://via.placeholder.com/400x300?text=Mẹo+Laptop",
            },
            {
                _id: "4",
                title: "Máy tính bảng có thể thay thế laptop? Cùng tìm hiểu",
                content: "Trong thế giới công nghệ hiện đại, câu hỏi liệu máy tính bảng có thể thay thế laptop hay không đang ngày càng nhận được sự chú ý...",
                category: "Công Nghệ",
                createdAt: "2023-06-22T16:00:00Z",
                author: "Bob Brown",
                image: "https://via.placeholder.com/400x300?text=Máy+Tính+Bảng",
            },
        ];

        // Sắp xếp tin tức theo thời gian tạo mới nhất
        const sortedNews = fakeNews.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNews(sortedNews);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Tin Tức</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="relative">
                                <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                                {index < 2 && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                                            HOT
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-500">{item.category}</span>
                                    <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <h2 className="text-xl font-semibold mb-3 text-gray-800 hover:text-blue-600 transition-colors duration-300">
                                    {item.title}
                                </h2>
                                <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">Tác giả: {item.author}</span>
                                    <Link 
                                        to={`/news/${item._id}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300"
                                    >
                                        Đọc thêm
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsClient;

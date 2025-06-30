import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';
import axios from 'axios';

const ClientHeader = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch sản phẩm khi gõ từ khóa
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (keyword.trim()) {
        const res = await axios.get(`http://localhost:4000/products`);
        const filtered = res.data.filter((product: any) =>
          product.name.toLowerCase().includes(keyword.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 5)); // lấy 5 kết quả
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delaySearch);
  }, [keyword]);

  const handleSelectProduct = (id: number) => {
    setKeyword('');
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/product/${id}`);
  };

  return (
    <header className="bg-gray-800 text-white relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 relative">
        <div className="text-2xl font-semibold">
          <Link to="/">LOGO</Link>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative w-full max-w-md mx-4">
          <input
            className="outline-0 text-black px-4 py-2 w-full rounded-lg"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          {/* Dropdown kết quả tìm kiếm */}
          {showDropdown && searchResults.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto z-50 text-black">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  onClick={() => handleSelectProduct(item.id)}
                >
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.price.toLocaleString()} VND</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 ml-auto">
          <ul className="flex items-center gap-6">
            <li><Link to="/" className="hover:text-gray-300">Trang chủ</Link></li>
            <li><Link to="/about" className="hover:text-gray-300">Giới thiệu</Link></li>
            <li><Link to="/product" className="hover:text-gray-300">Shop</Link></li>
            <li><Link to="/news" className="hover:text-gray-300">Tin tức</Link></li>
            <li><Link to="/call" className="hover:text-gray-300">Liên hệ</Link></li>

            {!token ? (
              <>
                <li><Link to="/register" className="hover:text-gray-300">Đăng ký</Link></li>
                <li><Link to="/login" className="hover:text-gray-300">Đăng nhập</Link></li>
              </>
            ) : (
              <li>
                <button onClick={handleLogout} className="hover:text-red-400">
                  <FiLogOut className="w-6 h-6" />
                </button>
              </li>
            )}

            <li>
              <Link to="/carts" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h14l-1.35 6.45a2 2 0 01-1.97 1.55H7.42a2 2 0 01-1.98-1.75L4 6H2"></path>
                </svg>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default ClientHeader;

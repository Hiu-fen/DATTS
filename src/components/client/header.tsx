import { Link, useNavigate } from 'react-router-dom';

const ClientHeader = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // nếu có lưu user
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="text-2xl font-semibold">LOGO</div>
        
        {/* Tìm kiếm ở giữa */}
        <div className="flex justify-center w-full md:w-[300px]">
          <form className="relative w-full">
            <input
              className="outline-0 text-black px-4 py-2 w-full rounded-lg"
              type="text"
              placeholder="Tìm kiếm"
            />
            <button className="absolute top-2 right-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
                <path d="M352 224c0 70.7-57.3 128-128 128-39.7 0-75.3-17.8-100.2-46.3l-141.5 141.5c-9.4 9.4-24.6 9.4-34.1 0-9.4-9.4-9.4-24.6 0-34.1l141.5-141.5c-28.5-38.7-46.3-86.1-46.3-135.6C56 100.3 112.3 44 176 44c70.7 0 128 57.3 128 128 0 39.7-17.8 75.3-46.3 100.2l141.5 141.5c9.4 9.4 9.4 24.6 0 34.1-9.4 9.4-24.6 9.4-34.1 0l-141.5-141.5C296.7 148.3 352 185.3 352 224z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Navigation links */}
        <nav className="flex gap-6 ml-auto">
          <ul className="flex gap-6">
            <li>
              <Link to="/" className="group hover:text-gray-300 relative">
                Trang chủ
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="group hover:text-gray-300 relative">
                Giới thiệu
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </li>
            <li>
              <Link to="/product" className="group hover:text-gray-300 relative">
                Shop
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </li>
            <li>
              <Link to="/news" className="group hover:text-gray-300 relative">
                Tin tức
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </li>
            <li>
              <Link to="/call" className="group hover:text-gray-300 relative">
                Liên hệ
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </li>

            {!token ? (
              <>
                <li>
                  <Link to="/register" className="group hover:text-gray-300 relative">
                    Đăng ký
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="group hover:text-gray-300 relative">
                    Đăng nhập
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <button onClick={handleLogout} className="text-gray-300 hover:text-gray-500">
                  Đăng xuất
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default ClientHeader;

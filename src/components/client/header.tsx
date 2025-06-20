import { Link, useNavigate } from 'react-router-dom';

const ClientHeader = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // nếu có lưu user
    navigate('/client/login');
  };

  return (
    <header className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
        <div className="text-2xl font-semibold">LOGO</div>
        <div className="flex justify-between w-full py-4">
          <form className="relative">
            <input
              className="outline-0 text-black px-4 py-2 w-[300px] rounded-lg"
              type="text"
              placeholder="Tìm kiếm"
            />
            <button className="absolute top-2 right-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
                <path d="M352 224c0 70.7-57.3 128-128 128-39.7 0-75.3-17.8-100.2-46.3l-141.5 141.5c-9.4 9.4-24.6 9.4-34.1 0-9.4-9.4-9.4-24.6 0-34.1l141.5-141.5c-28.5-38.7-46.3-86.1-46.3-135.6C56 100.3 112.3 44 176 44c70.7 0 128 57.3 128 128 0 39.7-17.8 75.3-46.3 100.2l141.5 141.5c9.4 9.4 9.4 24.6 0 34.1-9.4 9.4-24.6 9.4-34.1 0l-141.5-141.5C296.7 148.3 352 185.3 352 224z"/>
              </svg>
            </button>
          </form>
          <nav>
            <ul className="flex gap-6">
              <li><Link to="/client" className="hover:text-gray-300">Trang chủ</Link></li>
              <li><Link to="/client/about" className="hover:text-gray-300">Giới thiệu</Link></li>
              <li><Link to="/client/shop" className="hover:text-gray-300">Shop</Link></li>
              <li><Link to="/client/news" className="hover:text-gray-300">Tin tức</Link></li>
              <li><Link to="/client/contact" className="hover:text-gray-300">Liên hệ</Link></li>

              {!token ? (
                <>
                  <li><Link to="/client/register" className="hover:text-gray-300">Đăng ký</Link></li>
                  <li><Link to="/client/login" className="hover:text-gray-300">Đăng nhập</Link></li>
                </>
              ) : (
                <li>
                  <button onClick={handleLogout} className="text-gray-300 hover:text-gray-500">Đăng xuất</button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;

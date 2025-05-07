import React from 'react';
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
    <header className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>LOGO</div>
        <div className="flex justify-between w-full py-4">
          <form className="pl-10 relative">
            <input
              className="outline-0 text-black px-3 py-1 w-[300px] rounded"
              type="text"
              placeholder="Tìm kiếm"
            />
            <button className="absolute top-2 right-2">
              <svg className="w-5 h-5" fill="#999" viewBox="0 0 512 512">
                <path d="..." />
              </svg>
            </button>
          </form>
          <nav>
            <ul className="flex gap-4">
              <li><Link to="/client">Trang chủ</Link></li>
              <li>Giới thiệu</li>
              <li>Shop</li>
              <li>Tin tức</li>
              <li>Liên hệ</li>

              {!token ? (
                <>
                  <li><Link to="/client/register">Đăng ký</Link></li>
                  <li><Link to="/client/login">Đăng nhập</Link></li>
                </>
              ) : (
                <li>
                  <button onClick={handleLogout}>Đăng xuất</button>
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

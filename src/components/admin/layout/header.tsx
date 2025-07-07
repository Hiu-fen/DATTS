import React from 'react'

const AdminHeader = () => {
  const [showMenu, setShowMenu] = React.useState(false);
  const user = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin');
    window.location.href = '/admin/login';
  };
  const goToProfile = () => {
    window.location.href = '/admin/user/profileadmin';
  };
  return (
    <header className='bg-white w-full shadow-md flex p-4 relative z-50'>
        <div className='logo w-1/5'>Laptop</div>
        <div className='right-header w-4/5 flex justify-between'>
            <form>
                <input className='border rounded-md w-[350px] px-2 py-1' type='text' placeholder='Tìm kiếm'/>
            </form>
            <ul
      className="relative"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <li className="cursor-pointer">
        👋 Xin chào, <strong>{user.name}</strong>
        
      </li>

      {showMenu && (
        <div className="absolute bg-white border rounded shadow p-2 mt-2 right-0 z-10 w-40">
          <button
            onClick={goToProfile}
            className="block w-full text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left text-red-500 hover:bg-red-100 px-2 py-1 rounded mt-1"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </ul>
        </div>
    </header>
  )
}

export default AdminHeader
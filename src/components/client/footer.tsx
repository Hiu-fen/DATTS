import React from 'react'

const ClientFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Thông tin về Shop */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Về Shop</h3>
          <p className="text-gray-400">
            Cửa hàng của chúng tôi chuyên cung cấp các sản phẩm chính hãng với chất lượng tốt nhất. 
            Chúng tôi luôn cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.
          </p>
          <ul className="mt-4">
            <li><a href="/client/about-us" className="text-gray-400 hover:text-white">Giới thiệu</a></li>
            <li><a href="/client/shop" className="text-gray-400 hover:text-white">Cửa hàng</a></li>
            <li><a href="/client/contact" className="text-gray-400 hover:text-white">Liên hệ</a></li>
          </ul>
        </div>

        {/* Nhà tài trợ */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Nhà Tài Trợ</h3>
          <p className="text-gray-400">
            Chúng tôi rất tự hào được hợp tác với các đối tác lớn trong ngành để mang đến sản phẩm chất lượng cao.
          </p>
          <div className="mt-4">
            <img src="" alt="Partner 1" className="h-12 mr-4" />
            <img src="" alt="Partner 2" className="h-12 mr-4" />
            <img src="" alt="Partner 3" className="h-12" />
          </div>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Liên Hệ</h3>
          <ul className="text-gray-400">
            <li className="mb-2">
              <strong>Email:</strong> support@shop.com
            </li>
            <li className="mb-2">
              <strong>Địa chỉ:</strong> 123 Đường XYZ, Quận 1, TP. HCM
            </li>
            <li className="mb-2">
              <strong>Điện thoại:</strong> (+84) 123 456 789
            </li>
            <li className="mb-2">
              <strong>Giờ mở cửa:</strong> 9:00 AM - 6:00 PM (Thứ Hai - Thứ Bảy)
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="bg-gray-900 py-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>&copy; 2025 Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default ClientFooter

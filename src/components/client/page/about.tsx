import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow-lg p-8 mt-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Giới thiệu về LaptopStore</h1>
      <p className="mb-4 text-gray-700">
        LaptopStore là cửa hàng chuyên cung cấp các dòng laptop chính hãng, từ các thương hiệu nổi tiếng như Dell, HP, Lenovo, Asus, Apple và nhiều thương hiệu khác. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng cao, giá cả hợp lý, cùng với dịch vụ chăm sóc tận tâm.
      </p>

      <h2 className="text-xl font-semibold mb-2 text-blue-500">Tại sao chọn LaptopStore?</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>Sản phẩm laptop chính hãng 100%</li>
        <li>Bảo hành chính hãng, hỗ trợ đổi trả dễ dàng</li>
        <li>Đội ngũ tư vấn viên nhiệt tình, chuyên nghiệp</li>
        <li>Giao hàng nhanh chóng toàn quốc</li>
        <li>Chính sách ưu đãi và khuyến mãi hấp dẫn cho khách hàng thân thiết</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2 text-blue-500">Lợi ích khi mua hàng tại LaptopStore</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li><strong>Giá cả hợp lý:</strong> Chúng tôi cung cấp các sản phẩm với mức giá cạnh tranh nhất trên thị trường.</li>
        <li><strong>Đảm bảo chất lượng:</strong> Mọi sản phẩm đều được kiểm tra kỹ lưỡng và cam kết chính hãng.</li>
        <li><strong>Dịch vụ hậu mãi:</strong> Hỗ trợ sửa chữa và bảo trì dài hạn, đảm bảo sự hài lòng tuyệt đối cho khách hàng.</li>
        <li><strong>Tiện lợi mua sắm:</strong> Khách hàng có thể mua sắm trực tuyến và nhận hàng tại nhà.</li>
        <li><strong>Chính sách trả góp:</strong> Hỗ trợ trả góp lãi suất thấp, giúp bạn sở hữu sản phẩm laptop mơ ước một cách dễ dàng.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2 text-blue-500">Thông tin liên hệ</h2>
      <p className="text-gray-700">
        <strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM <br />
        <strong>Hotline:</strong> <span className="text-red-600 font-semibold">(+84) 123 456 789</span><br />
        <strong>Email:</strong> <a href="mailto:support@laptopstore.vn" className="text-blue-600 underline">support@laptopstore.vn</a>
      </p>

      {/* Google Maps Embedding */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-blue-500 mb-4">Địa chỉ cửa hàng trên Google Maps</h3>
        <div className="aspect-w-16 aspect-h-9">
          <iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.7539158981795!2d106.69242301474982!3d10.763318292324487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752c5d62ccf2e3%3A0xd5e9b3f1a1fd13d6!2zQ8O0bmcgQ0EsIFFu4bqtdCwgQ3VhbiAxLCBUUC5ITUgsIFZpZXRuYW0gMTI3LCBWaWV0bmFtIFRoYQ!5e0!3m2!1svi!2s!4v1631896816631!5m2!1svi!2s" 
  width="100%" 
  height="400" 
  style={{border:0}} 
  allowFullScreen={true} // Thay đổi đây thành true
  loading="lazy">
</iframe>

        </div>
      </div>
    </div>
  );
}

export default About;

import { useForm } from 'react-hook-form';
import { IContact } from '../../../interface/contact';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';

const ContactPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IContact>();

  // Gửi dữ liệu tới backend
  const mutation = useMutation({
    mutationFn: async (data: IContact) => {
      const res = await axios.post('http://localhost:4000/contacts', data);
      return res.data;
    },
    onSuccess: () => {
      message.success('Liên hệ của bạn đã được gửi!');
      reset();
    },
    onError: () => {
      message.error('Gửi liên hệ thất bại. Vui lòng thử lại.');
    },
  });

  // Xử lý gửi form
  const onSubmit = (data: Omit<IContact, 'status' | 'date'>) => {
    const contactData: IContact = {
      ...data,
      status: false,
      date: new Date().toLocaleDateString('en-GB'),
    };
    mutation.mutate(contactData);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      {/* Thông tin liên hệ */}
      <div>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 text-red-600">SneakTrend Shop</h2>
          <p className="text-gray-700 mb-2">
            Chuyên giày sneaker chính hãng, phong cách – chất lượng – giá tốt!
          </p>
          <p><strong>Địa chỉ:</strong> Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
          <p><strong>Hotline:</strong> 0989 999 999</p>
          <p><strong>Email:</strong> support@sneaktrend.vn</p>
        </div>

        {/* Form liên hệ */}
        <div className="bg-gray-100 rounded shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Gửi liên hệ cho chúng tôi</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <input
                  {...register('name', { required: 'Tên không được để trống' })}
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full px-3 py-2 border rounded"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="w-full">
                <input
                  {...register('email', { required: 'Email không được để trống' })}
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border rounded"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <input
                {...register('phone', { required: 'Số điện thoại không được để trống' })}
                type="text"
                placeholder="Số điện thoại"
                className="w-full px-3 py-2 border rounded"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
            <div>
              <textarea
                {...register('message', { required: 'Nội dung không được để trống' })}
                placeholder="Nội dung liên hệ"
                rows={4}
                className="w-full px-3 py-2 border rounded"
              />
              {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
            >
              Gửi liên hệ
            </button>
          </form>
        </div>
      </div>

      {/* Bản đồ Google Maps */}
      <div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8639311820666!2d105.74468687503176!3d21.03812978061353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1747882891526!5m2!1svi!2s"
          width="100%"
          height="550"
          loading="lazy"
          allowFullScreen
          className="rounded shadow"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactPage;

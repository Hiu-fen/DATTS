import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

interface INews {
  title: string;
  content: string;
  image: string; // base64 string
  address: string;
  createdAt: string;
  expiredAt: string;
  likes: number;
  status: boolean;
}

const NewsAdd = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<INews>();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: INews) => {
      return await axios.post('http://localhost:4000/news', data);
    },
    onSuccess: () => {
      message.success('Thêm tin tức thành công');
      navigate('/admin/news/list'); // điều hướng đúng route
    },
    onError: () => {
      message.error('Thêm tin tức thất bại');
    }
  });

  // Hàm chuyển file thành base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      const expired = expireDate.toISOString().split('T')[0];

      const file = data.image[0]; // Lấy file ảnh từ input
      const base64Image = await convertToBase64(file); // Chuyển sang base64

      mutation.mutate({
        ...data,
        image: base64Image,
        createdAt: today,
        expiredAt: expired,
        likes: 0,
        status: true,
      });

      reset();
    } catch (error) {
      message.error("Không thể xử lý ảnh");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Thêm tin tức</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title", { required: true })} placeholder="Tiêu đề" className="w-full border p-2" />
        <textarea {...register("content", { required: true })} placeholder="Nội dung" className="w-full border p-2" />
        
        <input type="file" {...register("image", { required: true })} className="w-full border p-2" accept="image/*" />
        {errors.image && <p className="text-red-500">Vui lòng chọn ảnh</p>}

        <input {...register("address", { required: true })} placeholder="Địa chỉ" className="w-full border p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Thêm</button>
      </form>
    </div>
  );
};

export default NewsAdd;

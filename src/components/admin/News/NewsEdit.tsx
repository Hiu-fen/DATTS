import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';

interface INews {
  title: string;
  content: string;
  image: string;
  address: string;
  createdAt: string;
  expiredAt: string;
  likes: number;
  status: boolean;
}

const NewsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<INews>();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:4000/news/${id}`);
      reset(res.data);
    };
    fetchData();
  }, [id, reset]);

  const mutation = useMutation({
    mutationFn: async (data: INews) => {
      return await axios.patch(`http://localhost:4000/news/${id}`, data);
    },
    onSuccess: () => {
      message.success('Cập nhật tin tức thành công');
      navigate('/admin/news/list');
    },
    onError: () => {
      message.error('Cập nhật tin tức thất bại');
    }
  });

  const onSubmit = (data: INews) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Sửa tin tức</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title", { required: true })} placeholder="Tiêu đề" className="w-full border p-2" />
        <textarea {...register("content", { required: true })} placeholder="Nội dung" className="w-full border p-2" />
        <input {...register("image", { required: true })} placeholder="URL ảnh" className="w-full border p-2" />
        <input {...register("address", { required: true })} placeholder="Địa chỉ" className="w-full border p-2" />
        <input {...register("createdAt", { required: true })} type="date" className="w-full border p-2" />
        <input {...register("expiredAt", { required: true })} type="date" className="w-full border p-2" />
        <input {...register("likes", { required: true })} type="number" className="w-full border p-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Lưu</button>
      </form>
    </div>
  );
};

export default NewsEdit;

import { useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

interface IContact {
  userId: number;
  date: string;
  mota: string;
}

const ContactAdd = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IContact>();
  const nav = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: IContact) => {
      const response = await axios.post('http://localhost:4000/contacts', data);
      return response.data;
    },
    onSuccess: () => {
      message.success("Thêm liên hệ thành công");
      nav(`/admin/contacts`);
    },
    onError: () => {
      message.error("Có lỗi xảy ra. Vui lòng thử lại");
    },
  });

  const onSubmit = (data: IContact) => {
    const contactData: IContact = {
      ...data,
      date: new Date().toLocaleDateString('en-GB'),
    };
    mutation.mutate(contactData);
    reset();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm liên hệ</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="number"
            {...register('userId', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập User ID"
          />
          <span className="text-red-700">{errors.userId?.message}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            {...register('mota', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập mô tả"
          />
          <span className="text-red-700">{errors.mota?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Thêm liên hệ
        </button>
      </form>
    </div>
  );
};

export default ContactAdd;

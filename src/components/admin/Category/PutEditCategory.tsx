import React from 'react';
import { useForm } from 'react-hook-form';
import { Icatagory } from '../../interface/category';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';

const PutEditCategory = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Icatagory>();
  const nav = useNavigate();
  const params = useParams();

  // ✅ Lấy dữ liệu danh mục hiện tại
  const { data } = useQuery({
    queryKey: ['category', params.id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:4000/category/${params.id}`);
      return data;
    },
    onSuccess: (data) => {
      reset(data); // Gán dữ liệu vào form
    }
  });

  // ✅ Mutation cập nhật danh mục
  const mutation = useMutation({
    mutationFn: async (formData: Icatagory) => {
      const res = await axios.put(`http://localhost:4000/category/${params.id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật danh mục thành công");
      nav('/admin/category/list'); // ✅ Sửa đúng đường dẫn
    },
    onError: () => {
      message.error("Cập nhật thất bại");
    }
  });

  const onSubmit = (data: Icatagory) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Cập nhật danh mục
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên danh mục
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('name', {
              required: 'Không để trống',
              minLength: { value: 5, message: 'Tối thiểu 5 ký tự' }
            })}
          />
          <span className="text-red-700">{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh minh hoạ (URL)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('image', {
              required: 'Không để trống',
              minLength: { value: 5, message: 'Tối thiểu 5 ký tự' }
            })}
          />
          <span className="text-red-700">{errors.image?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả danh mục
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('mota', {
              required: 'Không để trống',
              minLength: { value: 5, message: 'Tối thiểu 5 ký tự' }
            })}
          />
          <span className="text-red-700">{errors.mota?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Cập nhật
        </button>
      </form>
    </div>
  );
};

export default PutEditCategory;

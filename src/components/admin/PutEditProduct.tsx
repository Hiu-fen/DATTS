import React from 'react'
import { useForm } from 'react-hook-form'
import { IProduct } from '../../interface/product'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { message } from 'antd'

interface ICategory {
  id: number;
  name: string;
}

const PutEditProduct = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<IProduct>()
  const nav = useNavigate();
  const params = useParams();

  // Watch để preview ảnh
  const imagePreview = watch("image");
  const albumPreview = watch("album");

  // Lấy sản phẩm cần sửa
  const { data: productData } = useQuery({
    queryKey: ['products', params.id],
    queryFn: async () => {
      const { data: product } = await axios.get(`http://localhost:4000/products/${params.id}`)
      reset({
        ...product,
        album: Array.isArray(product.album) ? product.album.join(', ') : product.album
      });
      return product;
    }
  });

  // Lấy danh sách danh mục
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:4000/category`);
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: IProduct) => {
      const newData = {
        ...data,
        album: typeof data.album === 'string' ? data.album.split(',').map(item => item.trim()) : data.album
      };
      const res = await axios.put(`http://localhost:4000/products/${params.id}`, newData)
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật thành công")
      nav('/admin/phone/list')
    },
    onError: () => {
      message.error("Cập nhật thất bại")
    }
  });

  const onSubmit = (data: IProduct) => {
    mutation.mutate(data)
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
          <input
            type="text"
            {...register('name', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu 5 ký tự" } })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập tên sản phẩm"
          />
          <span className='text-red-700'>{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
          <input
            type="number"
            {...register('price', { required: "Không để trống", min: { value: 1, message: "Tối thiểu là 1" } })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập giá"
          />
          <span className='text-red-700'>{errors.price?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            rows={4}
            {...register('description', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập mô tả"
          />
          <span className='text-red-700'>{errors.description?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            {...register('category', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories?.map((cat: ICategory) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className='text-red-700'>{errors.category?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            {...register('status', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
          <span className='text-red-700'>{errors.status?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
          <input
            type="text"
            {...register("image", { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="URL ảnh đại diện"
          />
          <span className="text-red-700">{errors.image?.message}</span>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Ảnh đại diện"
              className="mt-2 w-40 h-40 object-cover border rounded-md"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Album ảnh (ngăn cách bằng dấu phẩy)</label>
          <input
            type="text"
            {...register("album")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="URL ảnh 1, URL ảnh 2, ..."
          />
          <span className="text-red-700">{errors.album?.message}</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {albumPreview && albumPreview.split(',').map((url, index) => (
              <img
                key={index}
                src={url.trim()}
                alt={`Ảnh ${index + 1}`}
                className="w-24 h-24 object-cover border rounded-md"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Cập nhật sản phẩm
        </button>
      </form>
    </div>
  )
}

export default PutEditProduct

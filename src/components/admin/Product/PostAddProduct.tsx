import React, { useEffect, useState } from "react";
import { IProduct } from "../../interface/product";
import { message } from "antd";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

interface ICategory {
  id: number;
  name: string;
}

const PostAddProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IProduct>();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [albumFields, setAlbumFields] = useState<string[]>([""]);
  const nav = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await axios.get("http://localhost:4000/category");
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: IProduct) => {
      const response = await axios.post("http://localhost:4000/products", data);
      return response.data;
    },
    onSuccess: () => {
      message.success("Thêm mới thành công");
      nav("/admin/phone/list");
    },
  });

  const handleAlbumChange = (index: number, value: string) => {
    const updated = [...albumFields];
    updated[index] = value;
    setAlbumFields(updated);
  };

  const addAlbumField = () => setAlbumFields([...albumFields, ""]);

  const removeAlbumField = (index: number) => {
    const updated = albumFields.filter((_, i) => i !== index);
    setAlbumFields(updated);
  };

  const onSubmit = (data: IProduct) => {
    data.album = albumFields.filter((url) => url.trim() !== "");
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Thêm sản phẩm
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên */}
        <div>
          <label className="block mb-1 font-medium">Tên</label>
          <input
            type="text"
            {...register("name", {
              required: "Không để trống",
              minLength: { value: 5, message: "Tối thiểu là 5 ký tự" },
            })}
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-red-600">{errors.name?.message}</p>
        </div>

        {/* Ảnh đại diện */}
        <div>
          <label className="block mb-1 font-medium">Ảnh đại diện</label>
          <input
            type="text"
            {...register("image", { required: "Không để trống" })}
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-red-600">{errors.image?.message}</p>

          {/* Preview ảnh đại diện */}
          {watch("image") && (
            <img
              src={watch("image")}
              alt="Ảnh đại diện"
              className="mt-2 w-40 h-40 object-cover border rounded"
            />
          )}
        </div>

        {/* Album ảnh */}
        <div>
          <label className="block mb-1 font-medium">Album ảnh</label>
          {albumFields.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => handleAlbumChange(index, e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder={`Ảnh ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeAlbumField(index)}
                className="px-2 text-red-600 font-bold"
              >
                ✖
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAlbumField}
            className="mt-1 text-sm text-blue-600"
          >
            + Thêm ảnh
          </button>

          {/* Preview Album */}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {albumFields.map(
            (url, index) =>
              url.trim() !== "" && (
                <div
                  key={index}
                  className="w-20 h-20 p-1 border rounded-md bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Ảnh ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )
          )}
        </div>

        {/* Giá */}
        <div>
          <label className="block mb-1 font-medium">Giá</label>
          <input
            type="number"
            {...register("price", {
              required: "Không để trống",
              min: { value: 1, message: "Tối thiểu là 1 vnd" },
            })}
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-red-600">{errors.price?.message}</p>
        </div>

        {/* Số lượng */}
        <div>
          <label className="block mb-1 font-medium">Số lượng</label>
          <input
            type="number"
            {...register("quantity", {
              required: "Không để trống",
              min: { value: 1, message: "Tối thiểu là 1 sản phẩm" },
            })}
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-red-600">{errors.quantity?.message}</p>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea
            rows={4}
            {...register("description", { required: "Không để trống" })}
            className="w-full border px-3 py-2 rounded"
          ></textarea>
          <p className="text-red-600">{errors.description?.message}</p>
        </div>

        {/* Danh mục */}
        <div>
          <label className="block mb-1 font-medium">Danh mục</label>
          <select
            {...register("category", { required: "Không để trống" })}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-red-600">{errors.category?.message}</p>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block mb-1 font-medium">Trạng thái</label>
          <select
            {...register("status", { required: "Không để trống" })}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
          <p className="text-red-600">{errors.status?.message}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Thêm mới
        </button>
      </form>
    </div>
  );
};

export default PostAddProduct;

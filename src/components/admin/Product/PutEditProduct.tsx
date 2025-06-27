import React, { useEffect, useState } from "react";
import { message, Select, InputNumber, Button } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

interface ICategory {
  id: number;
  name: string;
}

interface IVariantValue {
  value: string;
  key: number;
}

interface IVariantForm {
  ram: string;
  color: string;
  quantity: number;
  price: number;
}

interface IProduct {
  id?: number;
  name: string;
  image: string;
  album: string[];
  price: number;
  quantity: number;
  description: string;
  category: number;
  status: string;
  type: "simple" | "variable" | "variation";
  parent?: number;
  score?: number;
  variants?: IVariantForm[];
}

const PutEditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<IProduct>({
    defaultValues: {
      score: 0,
      parent: 0,
      type: "simple",
      album: [],
      price: 1,
      quantity: 1,
    },
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [albumFields, setAlbumFields] = useState<string[]>([""]);
  const [variantValues, setVariantValues] = useState<
    Record<string, IVariantValue[]>
  >({});
  const [variantForms, setVariantForms] = useState<IVariantForm[]>([]);
  const [variantNames, setVariantNames] = useState<string[]>([]);
  const nav = useNavigate();

  // Load product, categories, variantNames/Values
  useEffect(() => {
    axios
      .get<ICategory[]>("http://localhost:4000/category")
      .then((res) => setCategories(res.data))
      .catch(() => message.error("Lỗi tải danh mục"));

    axios
      .get<IVariantValue[]>("http://localhost:4000/variants")
      .then((res) => {
        if (res.data[0]) {
          // Giả sử db trả: { id, ram: [..], color: [..] }
          const v = res.data[0] as any;
          setVariantNames(["ram", "color"]);
          setVariantValues({
            ram: v.ram.map((r: string, i: number) => ({ value: r, key: i })),
            color: v.color.map((c: string, i: number) => ({
              value: c,
              key: i,
            })),
          });
        }
      })
      .catch(() => message.error("Lỗi tải biến thể"));

    // Fetch product
    axios
      .get<IProduct>(`http://localhost:4000/products/${id}`)
      .then((res) => {
        const p = res.data;
        reset(p);
        setAlbumFields(p.album && p.album.length > 0 ? p.album : [""]);
        setVariantForms(p.variants || []);
      })
      .catch(() => message.error("Lỗi tải sản phẩm"));
  }, [id, reset]);

  // Album handlers
  const handleAlbumChange = (i: number, v: string) => {
    const a = [...albumFields];
    a[i] = v;
    setAlbumFields(a);
  };
  const addAlbumField = () => setAlbumFields([...albumFields, ""]);
  const removeAlbumField = (i: number) =>
    setAlbumFields(albumFields.filter((_, idx) => idx !== i));

  // Variant handlers
  const addVariant = () =>
    setVariantForms([
      ...variantForms,
      { ram: "", color: "", quantity: 1, price: 1 },
    ]);
  const updateVariant = (i: number, field: keyof IVariantForm, val: any) => {
    const v = [...variantForms];
    (v[i] as any)[field] = val;
    setVariantForms(v);
  };
  const removeVariant = (i: number) =>
    setVariantForms(variantForms.filter((_, idx) => idx !== i));

  // Submit
  const onSubmit = async (data: IProduct) => {
    // Gán album
    data.album = albumFields.filter((u) => u.trim() !== "");
    // Xác định variants hợp lệ
    const valids = variantForms.filter(
      (v) => v.ram && v.color && v.quantity > 0 && v.price > 0
    );
    data.type = valids.length ? "variable" : "simple";
    data.parent = 0;
    data.score = 0;

    // Payload một PUT duy nhất
    const payload = {
      ...data,
      variants: valids.map((v) => ({
        ram: v.ram,
        color: v.color,
        quantity: v.quantity,
        price: v.price,
      })),
    };

    try {
      await axios.put(`http://localhost:4000/products/${id}`, payload);
      message.success("Cập nhật sản phẩm thành công");
      nav("/admin/phone/list");
    } catch (err: any) {
      message.error("Cập nhật thất bại: " + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Sửa sản phẩm</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tên */}
        <div>
          <label className="block mb-1">Tên sản phẩm</label>
          <input
            {...register("name", {
              required: "Tên sản phẩm là bắt buộc",
              minLength: {
                value: 5,
                message: "Tên sản phẩm phải có ít nhất 5 ký tự",
              },
              maxLength: {
                value: 100,
                message: "Tên sản phẩm không được vượt quá 100 ký tự",
              },
            })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        {/* Ảnh */}
        <div>
          <label className="block mb-1">Ảnh đại diện</label>
          <input
            {...register("image", {
              required: "Ảnh đại diện là bắt buộc",
            })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.image && (
            <p className="text-red-500">{errors.image.message}</p>
          )}
          {watch("image") && (
            <img
              src={watch("image")}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover"
            />
          )}
        </div>

        {/* Album ảnh */}
        <div>
          <label className="block mb-1 font-medium">Album ảnh</label>

          <div className="space-y-3">
            {albumFields.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={url}
                  onChange={(e) => handleAlbumChange(index, e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder={`Ảnh ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeAlbumField(index)}
                  className="text-red-600 text-xl font-bold"
                  title="Xoá ảnh"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Nút thêm ảnh */}
          <button
            type="button"
            onClick={() => addAlbumField("")}
            className="mt-3 text-blue-600 text-sm hover:underline"
          >
            + Thêm ảnh
          </button>

          {/* Hiển thị ảnh preview  */}
          {albumFields.some((url) => url.trim()) && (
            <div className="mt-4 flex flex-wrap gap-4">
              {albumFields.map(
                (url, index) =>
                  url.trim() && (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-28 h-28 object-cover rounded border"
                    />
                  )
              )}
            </div>
          )}
        </div>

        {/* Giá & SL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Giá (VND)</label>
            <input
              type="number"
              {...register("price", {
                required: "Giá là bắt buộc",
                min: {
                  value: 1000,
                  message: "Giá phải lớn hơn hoặc bằng 1,000 VND",
                },
                valueAsNumber: true,
              })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label>Số lượng</label>
            <input
              type="number"
              {...register("quantity", {
                required: "Số lượng là bắt buộc",
                min: {
                  value: 1,
                  message: "Số lượng phải lớn hơn hoặc bằng 1",
                },
                valueAsNumber: true,
              })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.quantity && (
              <p className="text-red-500">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1">Mô tả</label>
          <textarea
            {...register("description", {
              required: "Mô tả là bắt buộc",
              minLength: {
                value: 10,
                message: "Mô tả phải có ít nhất 10 ký tự",
              },
              maxLength: {
                value: 500,
                message: "Mô tả không được vượt quá 500 ký tự",
              },
            })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Danh mục</label>
            <select
              {...register("category", {
                required: "Vui lòng chọn danh mục",
                valueAsNumber: true,
              })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">--Chọn danh mục--</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500">{errors.category.message}</p>
            )}
          </div>
          <div>
            <label>Trạng thái</label>
            <select
              {...register("status", {
                required: "Vui lòng chọn trạng thái",
              })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">--Chọn trạng thái--</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
            {errors.status && (
              <p className="text-red-500">{errors.status.message}</p>
            )}
          </div>
        </div>
        {/* Biến thể */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Biến thể (RAM & Color)</label>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              + Thêm biến thể
            </button>
          </div>
          {variantForms.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 mb-3 border rounded bg-gray-50"
            >
              {/* RAM */}
              <Select
                placeholder="Chọn RAM"
                value={v.ram || undefined}
                onChange={(val) => updateVariant(i, "ram", val)}
              >
                {variantValues.ram?.map((opt) => (
                  <Select.Option key={opt.key} value={opt.value}>
                    {opt.value}
                  </Select.Option>
                ))}
              </Select>
              {/* Color */}
              <Select
                placeholder="Chọn Color"
                value={v.color || undefined}
                onChange={(val) => updateVariant(i, "color", val)}
              >
                {variantValues.color?.map((opt) => (
                  <Select.Option key={opt.key} value={opt.value}>
                    {opt.value}
                  </Select.Option>
                ))}
              </Select>
              {/* Quantity */}
              <InputNumber
                min={1}
                value={v.quantity}
                onChange={(val) => updateVariant(i, "quantity", val || 1)}
                className="w-full"
                placeholder="Số lượng"
              />
              {/* Price */}
              <InputNumber
                min={1}
                value={v.price}
                onChange={(val) => updateVariant(i, "price", val || 1)}
                className="w-full"
                placeholder="Giá"
              />
              {/* Remove */}
              <Button danger onClick={() => removeVariant(i)}>
                Xóa
              </Button>
            </div>
          ))}
        </div>
        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded mt-4"
        >
          Cập nhật sản phẩm
        </button>
      </form>
    </div>
  );
};

export default PutEditProduct;

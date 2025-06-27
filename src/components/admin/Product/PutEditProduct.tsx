import React, { useEffect, useState } from "react";
import { message, Select, InputNumber, Button } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

interface ICategory { id: number; name: string; }
interface IVariantValue { value: string; key: number; }

interface IVariantForm {
  id?: number;
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
    setValue // ✅ Thêm setValue để cập nhật số lượng tự động
  } = useForm<IProduct>({
    defaultValues: {
      score: 0,
      parent: 0,
      type: "simple",
      album: [],
      price: 1,
      quantity: 0, // ✅ Mặc định là 0
    },
  });

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [albumFields, setAlbumFields] = useState<string[]>([""]);
  const [variantValues, setVariantValues] = useState<Record<string, IVariantValue[]>>({});
  const [variantForms, setVariantForms] = useState<IVariantForm[]>([]);
  const nav = useNavigate();

  // Load data
  useEffect(() => {
    axios.get<ICategory[]>("http://localhost:4000/category")
      .then(res => setCategories(res.data))
      .catch(() => message.error("Lỗi tải danh mục"));

    axios.get<any[]>("http://localhost:4000/variants")
      .then(res => {
        const v = res.data[0];
        setVariantValues({
          ram: v.ram.map((r: string, i: number) => ({ value: r, key: i })),
          color: v.color.map((c: string, i: number) => ({ value: c, key: i }))
        });
      })
      .catch(() => message.error("Lỗi tải biến thể"));

    axios.get<IProduct>(`http://localhost:4000/products/${id}`)
      .then(res => {
        const p = res.data;
        reset(p);
        setAlbumFields(p.album?.length ? p.album : [""]);
        setVariantForms(p.variants || []);
      })
      .catch(() => message.error("Lỗi tải sản phẩm"));
  }, [id, reset]);

  // ✅ Tính tổng số lượng từ biến thể
  useEffect(() => {
    const total = variantForms.reduce((sum, v) => sum + (v.quantity || 0), 0);
    setValue("quantity", total);
  }, [variantForms, setValue]);

  // Album
  const handleAlbumChange = (i: number, v: string) => {
    const updated = [...albumFields];
    updated[i] = v;
    setAlbumFields(updated);
  };
  const addAlbumField = () => setAlbumFields([...albumFields, ""]);
  const removeAlbumField = (i: number) =>
    setAlbumFields(albumFields.filter((_, idx) => idx !== i));

  // Variants
  const addVariant = () =>
    setVariantForms([...variantForms, { ram: "", color: "", quantity: 1, price: 1 }]);
  const updateVariant = <K extends keyof IVariantForm>(
  i: number,
  field: K,
  val: IVariantForm[K]
) => {
  const updated = [...variantForms];
  updated[i] = { ...updated[i], [field]: val };
  setVariantForms(updated);
};

  const removeVariant = (i: number) =>
    setVariantForms(variantForms.filter((_, idx) => idx !== i));

  // Submit
  const onSubmit = async (data: IProduct) => {
    data.album = albumFields.filter(u => u.trim() !== "");
    const validVariants = variantForms.filter(v =>
      v.ram && v.color && v.quantity > 0 && v.price > 0
    );
    data.type = validVariants.length ? "variable" : "simple";
    data.parent = 0;
    data.score = 0;

    const payload = {
      ...data,
      variants: validVariants
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
            {...register("name", { required: true, minLength: 5 })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && <p className="text-red-500">Phải ít nhất 5 ký tự</p>}
        </div>
        {/* Ảnh */}
        <div>
          <label className="block mb-1">Ảnh đại diện</label>
          <input
            {...register("image", { required: true })}
            className="w-full border px-3 py-2 rounded"
          />
          {watch("image") && (
            <img src={watch("image")} alt="" className="mt-2 w-32 h-32 object-cover" />
          )}
        </div>
        {/* Album */}
        <div>
          <label className="block mb-1">Album ảnh</label>
          {albumFields.map((u, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={u}
                onChange={e => handleAlbumChange(i, e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              />
              <button type="button" onClick={() => removeAlbumField(i)} className="text-red-500">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addAlbumField} className="text-blue-600">
            + Thêm ảnh
          </button>
        </div>
        {/* Giá & Số lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Giá (VND)</label>
            <input
              type="number"
              {...register("price", { required: true, min: 1, valueAsNumber: true })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label>Số lượng (tự tính từ biến thể)</label>
            <input
              type="number"
              {...register("quantity", { required: true })}
              className="w-full border px-3 py-2 rounded bg-gray-100"
              readOnly
              disabled
            />
          </div>
        </div>
        {/* Mô tả */}
        <div>
          <label className="block mb-1">Mô tả</label>
          <textarea
            {...register("description", { required: true })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>
        {/* Danh mục & Trạng thái */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Danh mục</label>
            <select
              {...register("category", { required: true, valueAsNumber: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">--Chọn--</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Trạng thái</label>
            <select
              {...register("status", { required: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">--Chọn--</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
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
              <Select
                placeholder="Chọn RAM"
                value={v.ram || undefined}
                onChange={val => updateVariant(i, "ram", val)}
              >
                {variantValues.ram?.map(opt => (
                  <Select.Option key={opt.key} value={opt.value}>
                    {opt.value}
                  </Select.Option>
                ))}
              </Select>
              <Select
                placeholder="Chọn Color"
                value={v.color || undefined}
                onChange={val => updateVariant(i, "color", val)}
              >
                {variantValues.color?.map(opt => (
                  <Select.Option key={opt.key} value={opt.value}>
                    {opt.value}
                  </Select.Option>
                ))}
              </Select>
              <InputNumber
                min={1}
                value={v.quantity}
                onChange={val => updateVariant(i, "quantity", val || 1)}
                className="w-full"
                placeholder="Số lượng"
              />
              <InputNumber
                min={1}
                value={v.price}
                onChange={val => updateVariant(i, "price", val || 1)}
                className="w-full"
                placeholder="Giá"
              />
              <Button danger onClick={() => removeVariant(i)}>
                Xóa
              </Button>
            </div>
          ))}
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded mt-4">
          Cập nhật sản phẩm
        </button>
      </form>
    </div>
  );
};

export default PutEditProduct;

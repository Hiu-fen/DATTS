import React, { useEffect, useState } from "react";
import { message, Select, InputNumber, Button } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

interface ICategory {
  id: number;
  name: string;
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
  variants?: any[];
}

interface IVariantForm {
  ram: string;
  color: string;
  quantity: number;
  price: number;
}

interface IVariantValues {
  id: number;
  ram: string[];
  color: string[];
}

// New interface for variant errors
interface IVariantError {
  ram?: string;
  color?: string;
  quantity?: string;
  price?: string;
  duplicate?: string;
}

const PostAddProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<IProduct>({
    defaultValues: {
      score: 0,
      parent: 0,
      type: "simple",
      album: [],
      price: 1,
      quantity: 0,
    },
  });

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [albumFields, setAlbumFields] = useState<string[]>([""]);
  const [variantValues, setVariantValues] = useState<IVariantValues | null>(null);
  const [variantForms, setVariantForms] = useState<IVariantForm[]>([]);
  const [variantErrors, setVariantErrors] = useState<IVariantError[]>([]); // New state for errors
  const nav = useNavigate();

  // Load categories + variant options
  useEffect(() => {
    axios
      .get<ICategory[]>("http://localhost:4000/category")
      .then((res) => setCategories(res.data))
      .catch(() => message.error("Lỗi tải danh mục"));

    axios
      .get<IVariantValues[]>("http://localhost:4000/variants")
      .then((res) => res.data.length && setVariantValues(res.data[0]))
      .catch(() => message.error("Lỗi tải biến thể"));
  }, []);

  // Tính tổng số lượng từ các biến thể
  useEffect(() => {
    const total = variantForms.reduce((sum, v) => sum + (v.quantity || 0), 0);
    setValue("quantity", total);
  }, [variantForms, setValue]);

  // Validate variants
  const validateVariants = (variants: IVariantForm[]): IVariantError[] => {
    const errors: IVariantError[] = variants.map((variant, index) => {
      const error: IVariantError = {};
      // Validate RAM
      if (!variant.ram) {
        error.ram = "Vui lòng chọn RAM";
      } else if (
        variantValues &&
        !variantValues.ram.includes(variant.ram)
      ) {
        error.ram = "RAM không hợp lệ";
      }
      // Validate Color
      if (!variant.color) {
        error.color = "Vui lòng chọn màu";
      } else if (
        variantValues &&
        !variantValues.color.includes(variant.color)
      ) {
        error.color = "Màu không hợp lệ";
      }
      // Validate Quantity
      if (!variant.quantity || variant.quantity <= 0) {
        error.quantity = "Số lượng phải lớn hơn 0";
      }
      // Validate Price
      if (!variant.price || variant.price <= 0) {
        error.price = "Giá phải lớn hơn 0";
      }
      // Check for duplicate RAM + Color combination
      const isDuplicate = variants.some(
        (v, i) =>
          i !== index &&
          v.ram === variant.ram &&
          v.color === variant.color
      );
      if (isDuplicate) {
        error.duplicate = "Biến thể này đã tồn tại";
      }
      return error;
    });
    return errors;
  };

  // Update variant errors whenever variantForms change
  useEffect(() => {
    setVariantErrors(validateVariants(variantForms));
  }, [variantForms, variantValues]);

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
    // Validate variants before submission
    const currentErrors = validateVariants(variantForms);
    setVariantErrors(currentErrors);

    // Check if there are any errors
    const hasErrors = currentErrors.some((error) =>
      Object.keys(error).length > 0
    );
    if (hasErrors) {
      message.error("Vui lòng kiểm tra lại các biến thể");
      return;
    }

    data.album = albumFields.filter((u) => u.trim() !== "");
    const valids = variantForms.filter(
      (v) => v.ram && v.color && v.quantity > 0 && v.price > 0
    );
    data.type = valids.length ? "variable" : "simple";
    data.parent = 0;
    data.score = 0;

    const variantsPayload = valids.map((v, i) => ({
      id: i + 1,
      ram: v.ram,
      color: v.color,
      price: v.price,
      quantity: v.quantity,
    }));

    const payload = { ...data, variants: variantsPayload };

    try {
      await axios.post("http://localhost:4000/products", payload);
      message.success("Thêm sản phẩm thành công");
      nav("/admin/phone/list");
    } catch (err: any) {
      message.error("Thất bại: " + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Thêm sản phẩm mới</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-1">Tên sản phẩm</label>
          <input
            {...register("name", {
              required: "Tên không được để trống",
              minLength: {
                value: 5,
                message: "Tên sản phẩm phải lớn hơn 5 ký tự",
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

        {/* Image */}
        <div>
          <label className="block mb-1">Ảnh đại diện</label>
          <input
            {...register("image", { required: "Vui lòng chọn ảnh đại diện" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.image && (
            <p className="text-red-500">{errors.image.message}</p>
          )}
          {watch("image") && (
            <img
              src={watch("image")}
              alt=""
              className="mt-2 w-32 h-32 object-cover"
            />
          )}
        </div>

        {/* Album */}
        <div>
          <label className="block mb-1">Album ảnh</label>
          <div className="space-y-3">
            {albumFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleAlbumChange(index, e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder={`Ảnh ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeAlbumField(index)}
                  className="text-red-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAlbumField}
            className="mt-3 text-blue-600 text-sm hover:underline"
          >
            + Thêm ảnh
          </button>
          {albumFields.some((url) => url.trim()) && (
            <div className="mt-4 flex flex-wrap gap-4">
              {albumFields.map(
                (url, index) =>
                  url.trim() && (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                  )
              )}
            </div>
          )}
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Giá (VND)</label>
            <input
              type="number"
              {...register("price", {
                required: "Vui lòng nhập giá",
                min: {
                  value: 1,
                  message: "Giá phải lớn hơn 0",
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
            <label>Tổng số lượng</label>
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
            {...register("description", { required: "Vui lòng nhập mô tả" })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>

        {/* Danh mục & Trạng thái */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Danh mục</label>
            <select
              {...register("category", { required: "Vui lòng chọn danh mục sản phẩm", valueAsNumber: true })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">--Chọn--</option>
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
              {...register("status", { required: "Vui lòng chọn trạng thái sản phẩm" })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">--Chọn--</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
            {errors.status && (
              <p className="text-red-500">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Variants */}
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
              <div>
                <Select
                  placeholder="Chọn RAM"
                  value={v.ram || undefined}
                  onChange={(val) => updateVariant(i, "ram", val)}
                >
                  {variantValues?.ram.map((r) => (
                    <Select.Option key={r} value={r}>
                      {r}
                    </Select.Option>
                  ))}
                </Select>
                {variantErrors[i]?.ram && (
                  <p className="text-red-500 text-sm">{variantErrors[i].ram}</p>
                )}
              </div>
              <div>
                <Select
                  placeholder="Chọn Color"
                  value={v.color || undefined}
                  onChange={(val) => updateVariant(i, "color", val)}
                >
                  {variantValues?.color.map((c) => (
                    <Select.Option key={c} value={c}>
                      {c}
                    </Select.Option>
                  ))}
                </Select>
                {variantErrors[i]?.color && (
                  <p className="text-red-500 text-sm">{variantErrors[i].color}</p>
                )}
              </div>
              <div>
                <InputNumber
                  min={1}
                  value={v.quantity}
                  onChange={(val) => updateVariant(i, "quantity", val || 1)}
                  className="w-full"
                  placeholder="Số lượng"
                />
                {variantErrors[i]?.quantity && (
                  <p className="text-red-500 text-sm">
                    {variantErrors[i].quantity}
                  </p>
                )}
              </div>
              <div>
                <InputNumber
                  min={1}
                  value={v.price}
                  onChange={(val) => updateVariant(i, "price", val || 1)}
                  className="w-full"
                  placeholder="Giá (VND)"
                />
                {variantErrors[i]?.price && (
                  <p className="text-red-500 text-sm">{variantErrors[i].price}</p>
                )}
              </div>
              <div className="flex flex-col items-center">
                <Button danger onClick={() => removeVariant(i)}>
                  Xóa
                </Button>
                {variantErrors[i]?.duplicate && (
                  <p className="text-red-500 text-sm mt-2">
                    {variantErrors[i].duplicate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded mt-4"
        >
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
};

export default PostAddProduct;
import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { message, Select, InputNumber } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
=======
import { useForm } from "react-hook-form";
import { IProduct } from "../../interface/product";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a

interface ICategory {
  id: number;
  name: string;
}

<<<<<<< HEAD
interface IVariantValue {
  value: string;
  key: number;
}

interface IVariant {
  id?: number; // Added to track existing variant IDs
  attributes: Record<string, string>;
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
  attributes?: Record<string, string>;
  variants?: IVariant[]; // Added to handle fetched variants
}

const PutEditProduct = () => {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
=======
const PutEditProduct = () => {
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
  const {
    register,
    handleSubmit,
    formState: { errors },
<<<<<<< HEAD
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
  const [variantNames, setVariantNames] = useState<string[]>([]);
  const [variantValues, setVariantValues] = useState<
    Record<string, IVariantValue[]>
  >({});
  const [variantForms, setVariantForms] = useState<IVariant[]>([]);
  const nav = useNavigate();

  // Fetch product and categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/category");
        setCategories(data);
      } catch (error) {
        message.error("Lỗi khi tải danh mục: " + error.message);
      }
    };

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:4000/products/${id}`
        );
        // Populate form with product data
        reset({
          ...data,
          category: data.category,
          album: data.album || [""],
          type: data.type || "simple",
        });
        setAlbumFields(data.album?.length ? data.album : [""]);
        // Populate variants if they exist
        if (data.variants?.length) {
          setVariantForms(
            data.variants.map((v: any) => ({
              id: v.id,
              attributes: v.attributes || {},
              quantity: v.quantity,
              price: v.price,
            }))
          );
        }
      } catch (error) {
        message.error("Lỗi khi tải sản phẩm: " + error.message);
      }
    };

    fetchCategories();
    fetchProduct();

    const storedNames = localStorage.getItem("variantNames");
    const storedValues = localStorage.getItem("variantValues");

    if (storedNames) {
      setVariantNames(JSON.parse(storedNames));
    }
    if (storedValues) {
      setVariantValues(JSON.parse(storedValues));
    }
  }, [id, reset]);
=======
    reset,
    watch,
  } = useForm<IProduct>();
  const nav = useNavigate();
  const params = useParams();

  const [albumFields, setAlbumFields] = useState<string[]>([]);
  const imagePreview = watch("image");

  // Lấy sản phẩm cần sửa
  const { data: productData } = useQuery({
    queryKey: ["products", params.id],
    queryFn: async () => {
      const { data: product } = await axios.get(
        `http://localhost:4000/products/${params.id}`
      );
      reset(product);
      setAlbumFields(Array.isArray(product.album) ? product.album : []);
      return product;
    },
  });

  // Lấy danh mục
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:4000/category`);
      return data;
    },
  });

  // Mutation update
  const mutation = useMutation({
    mutationFn: async (data: IProduct) => {
      const newData = {
        ...data,
        album: albumFields.filter((url) => url.trim() !== ""),
      };
      const res = await axios.put(
        `http://localhost:4000/products/${params.id}`,
        newData
      );
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật thành công");
      nav("/admin/phone/list");
    },
    onError: () => {
      message.error("Cập nhật thất bại");
    },
  });

  const onSubmit = (data: IProduct) => {
    mutation.mutate(data);
  };
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a

  const handleAlbumChange = (index: number, value: string) => {
    const updated = [...albumFields];
    updated[index] = value;
    setAlbumFields(updated);
  };

  const addAlbumField = () => setAlbumFields([...albumFields, ""]);
<<<<<<< HEAD

  const removeAlbum = (index: number) => {
=======
  const removeAlbumField = (index: number) => {
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
    const updated = albumFields.filter((_, i) => i !== index);
    setAlbumFields(updated);
  };

<<<<<<< HEAD
  const addVariantForm = () => {
    setVariantForms([
      ...variantForms,
      { attributes: {}, quantity: 1, price: 1 },
    ]);
  };

  const updateVariantForm = (index: number, name: string, value: string) => {
    const updated = [...variantForms];
    const newAttributes = {
      ...updated[index].attributes,
      [name]: value,
    };

    const isFilled = variantNames.every((key) => newAttributes[key]);
    if (isFilled) {
      const duplicateIndex = variantForms.findIndex(
        (variant, i) =>
          i !== index &&
          JSON.stringify(variant.attributes) === JSON.stringify(newAttributes)
      );
      if (duplicateIndex !== -1) {
        message.warning("Biến thể này đã tồn tại. Dồn số lượng vào bản cũ.");
        updated[duplicateIndex].quantity += updated[index].quantity;
        updated.splice(index, 1);
        setVariantForms(updated);
        return;
      }
    }

    updated[index].attributes = newAttributes;
    setVariantForms(updated);
  };

  const updateVariantQuantity = (index: number, quantity: number) => {
    const updated = [...variantForms];
    updated[index].quantity = quantity;
    setVariantForms(updated);
  };

  const updateVariantPrice = (index: number, price: number) => {
    const updated = [...variantForms];
    updated[index].price = price;
    setVariantForms(updated);
  };

  const removeVariantForm = async (index: number) => {
    const variant = variantForms[index];
    if (variant.id) {
      try {
        // If variant exists on server, delete it
        await axios.delete(`http://localhost:4000/products/${variant.id}`);
      } catch (error) {
        message.error("Lỗi khi xóa biến thể: " + error.message);
      }
    }
    const updated = variantForms.filter((_, i) => i !== index);
    setVariantForms(updated);
  };

  const onSubmit = async (data: IProduct) => {
    data.album = albumFields.filter((url) => url.trim() !== "");
    data.score = 0;
    data.parent = 0;

    // Xác định biến thể hợp lệ
    const validVariants = variantForms.filter(
      (variant) =>
        Object.keys(variant.attributes).length > 0 &&
        Object.values(variant.attributes).every((v) => v) &&
        variant.price > 0 &&
        variant.quantity > 0
    );

    // Gán kiểu sản phẩm
    data.type = validVariants.length > 0 ? "variable" : "simple";

    try {
      // Cập nhật sản phẩm chính
      const mainProductPayload: IProduct = {
        ...data,
        type: data.type,
        parent: 0,
      };
      delete (mainProductPayload as any).id; // Ngừa rủi ro json-server dùng sai ID

      const mainProductResponse = await axios.put(
        `http://localhost:4000/products/${id}`,
        mainProductPayload
      );
      const mainProduct = mainProductResponse.data;

      // Lấy các ID biến thể hiện có từ mainProduct (nếu có)
      const existingVariants = (mainProduct.variants || []).map(
        (v: any) => v.id
      );
      const newVariantIds = validVariants.filter((v) => v.id).map((v) => v.id);
      const variantsToDelete = existingVariants.filter(
        (variantId) => !newVariantIds.includes(variantId)
      );

      // Xóa các biến thể không còn sử dụng
      await Promise.all(
        variantsToDelete.map((variantId) =>
          axios.delete(`http://localhost:4000/products/${variantId}`)
        )
      );

      // Xử lý tạo mới và cập nhật biến thể
      const variantPromises = validVariants.map(async (variant) => {
        const variantData: IProduct = {
          name: `${mainProduct.name} (${Object.values(variant.attributes).join(
            ", "
          )})`,
          image: mainProduct.image,
          album: mainProduct.album,
          price: variant.price,
          quantity: variant.quantity,
          description: mainProduct.description,
          category: mainProduct.category,
          status: mainProduct.status,
          type: "variation",
          parent: mainProduct.id,
          score: 0,
          attributes: variant.attributes,
        };

        if (variant.id) {
          // Cập nhật biến thể có ID
          return await axios.put(
            `http://localhost:4000/products/${variant.id}`,
            variantData
          );
        } else {
          // Tạo mới biến thể
          return await axios.post(
            "http://localhost:4000/products",
            variantData
          );
        }
      });

      await Promise.all(variantPromises);

      message.success("Cập nhật sản phẩm thành công");
      nav("/admin/phone/list");
    } catch (error: any) {
      console.error(error);
      message.error("Cập nhật sản phẩm thất bại: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-xl mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Sửa sản phẩm
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Tên sản phẩm
          </label>
=======
  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Chỉnh sửa sản phẩm
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Tên</label>
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
          <input
            type="text"
            {...register("name", {
              required: "Không để trống",
<<<<<<< HEAD
              minLength: { value: 5, message: "Tối thiểu là 5 ký tự" },
            })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên sản phẩm"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Ảnh đại diện
          </label>
          <input
            type="text"
            {...register("image", { required: "Không để trống" })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập URL ảnh đại diện"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
          )}
          {watch("image") && (
            <img
              src={watch("image")}
              alt="Ảnh đại diện"
              className="mt-3 w-40 h-40 object-cover border rounded-lg shadow-sm"
=======
              minLength: { value: 5, message: "Tối thiểu 5 ký tự" },
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
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Ảnh đại diện"
              className="mt-2 w-40 h-40 object-cover border rounded"
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
            />
          )}
        </div>

<<<<<<< HEAD
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Album ảnh
          </label>
          {albumFields.map((url, index) => (
            <div key={index} className="flex gap-3 mb-3 items-center">
=======
        {/* Album ảnh */}
        <div>
          <label className="block mb-1 font-medium">Album ảnh</label>
          {albumFields.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
              <input
                type="text"
                value={url}
                onChange={(e) => handleAlbumChange(index, e.target.value)}
<<<<<<< HEAD
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`URL ảnh ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeAlbum(index)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ✕
=======
                className="w-full border px-3 py-2 rounded"
                placeholder={`Ảnh ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeAlbumField(index)}
                className="px-2 text-red-600 font-bold"
              >
                ✖
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAlbumField}
<<<<<<< HEAD
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Thêm ảnh
          </button>
          <div className="flex flex-wrap gap-3 mt-4">
=======
            className="mt-1 text-sm text-blue-600"
          >
            + Thêm ảnh
          </button>

          {/* Preview album */}
          <div className="flex flex-wrap gap-1 mt-3">
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
            {albumFields.map(
              (url, index) =>
                url.trim() !== "" && (
                  <div
                    key={index}
<<<<<<< HEAD
                    className="w-20 h-20 p-1 border rounded-lg bg-gray-50"
=======
                    className="w-20 h-20 p-1 border rounded-md bg-gray-100"
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
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
        </div>

<<<<<<< HEAD
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Giá (VND)
          </label>
=======
        {/* Giá */}
        <div>
          <label className="block mb-1 font-medium">Giá</label>
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
          <input
            type="number"
            {...register("price", {
              required: "Không để trống",
<<<<<<< HEAD
              min: { value: 1, message: "Tối thiểu là 1 VND" },
              valueAsNumber: true,
            })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập giá sản phẩm"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Số lượng
          </label>
=======
              min: { value: 1, message: "Tối thiểu là 1" },
            })}
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-red-600">{errors.price?.message}</p>
        </div>

        {/* Số lượng */}
        <div>
          <label className="block mb-1 font-medium">Số lượng</label>
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
          <input
            type="number"
            {...register("quantity", {
              required: "Không để trống",
              min: { value: 1, message: "Tối thiểu là 1" },
<<<<<<< HEAD
              valueAsNumber: true,
            })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập số lượng sản phẩm"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            rows={4}
            {...register("description", { required: "Không để trống" })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mô tả sản phẩm"
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Danh mục
          </label>
          <select
            {...register("category", {
              required: "Không để trống",
              valueAsNumber: true,
            })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
=======
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
            {categories?.map((cat) => (
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
<<<<<<< HEAD
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            {...register("status", { required: "Không để trống" })}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
=======
          <p className="text-red-600">{errors.category?.message}</p>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block mb-1 font-medium">Trạng thái</label>
          <select
            {...register("status", { required: "Không để trống" })}
            className="w-full border px-3 py-2 rounded"
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
<<<<<<< HEAD
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Biến thể (Tùy chọn)
            </label>
            <button
              type="button"
              onClick={addVariantForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
            >
              + Thêm biến thể
            </button>
          </div>
          {variantForms.length > 0 ? (
            variantForms.map((variant, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg mb-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Biến thể {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeVariantForm(index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {variantNames.map((name) => (
                    <div key={name}>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        {name}
                      </label>
                      <Select
                        placeholder={`Chọn ${name}`}
                        style={{ width: "100%" }}
                        onChange={(value: string) =>
                          updateVariantForm(index, name, value)
                        }
                        value={variant.attributes[name]}
                        options={(variantValues[name] || []).map((item) => ({
                          label: item.value,
                          value: item.value,
                        }))}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Số lượng
                    </label>
                    <InputNumber
                      min={1}
                      value={variant.quantity}
                      onChange={(value) =>
                        updateVariantQuantity(index, value || 1)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Giá (VND)
                    </label>
                    <InputNumber
                      min={1}
                      value={variant.price}
                      onChange={(value) =>
                        updateVariantPrice(index, value || 1)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              Chưa có biến thể nào được thêm. Bạn có thể bỏ qua nếu sản phẩm
              không có biến thể.
            </p>
          )}
        </div>

        {variantForms.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Danh sách biến thể
            </h3>
            <div className="grid gap-2">
              {variantForms.map((variant, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                >
                  <span className="text-sm text-gray-700">
                    {Object.entries(variant.attributes)
                      .map(([name, value]) => `${name}: ${value}`)
                      .join(", ")}
                    {Object.keys(variant.attributes).length > 0 && " - "}
                    Số lượng: {variant.quantity}, Giá: {variant.price} VND
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariantForm(index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          Cập nhật sản phẩm
=======
          <p className="text-red-600">{errors.status?.message}</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Cập nhật
>>>>>>> 94668ba2cec1f5b9c61000e02e45c9578e55421a
        </button>
      </form>
    </div>
  );
};

export default PutEditProduct;

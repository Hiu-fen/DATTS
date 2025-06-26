// src/interface/product.ts

export interface IProduct {
  id?: number;
  name: string;
  category: number;
  price: number;
  status: string;
  description: string;
  type: "simple" | "variable";
  parent: number;
  score: number;
  quantity: number;
  image: string;
  album: string[]; // luôn là mảng
  attributes?: Record<string, string>; // dùng cho sản phẩm con
  variants?: IVariantForm[]; // mảng biến thể
}

export interface IVariantOption {
  name: string;
  values: string[];
}

// Định nghĩa cho từng biến thể
export interface IVariantForm {
  id?: number;                    // Thêm id để nhận dạng
  attributes: Record<string, string>;
  quantity: number;
  price: number;
}

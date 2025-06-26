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
}

export interface IVariantOption {
  name: string;
  values: string[];
}

export interface IVariantForm {
  attributes: Record<string, string>;
  quantity: number;
  price: number;
}

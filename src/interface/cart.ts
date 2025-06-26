import { IProduct } from "./product";

export interface ICartItem {
  id?: string; // ID của item trong giỏ hàng, có thể undefined nếu là item mới
  productId: IProduct; // chứa đầy đủ thông tin sản phẩm
  quantity: number;
  color: string;
  storage: string;
}

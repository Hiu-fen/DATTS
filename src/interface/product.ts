export interface IProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  status:string;
  description:string;
  type: string;
  parent: number;
  score:number
  quantity: number;
  image: string;
  album: string | string[];
}
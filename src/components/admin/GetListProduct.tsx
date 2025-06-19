import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, message, Popconfirm, Table } from 'antd'
import axios from 'axios'
import React from 'react'
import { IProduct } from '../../interface/product'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'


interface ICategory {
  id: number;
  name: string;
}

const GetListProduct = () => {
  const nav = useNavigate();

  const { data: products, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get(`http://localhost:4000/products`)).data
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get(`http://localhost:4000/category`)).data
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => await axios.delete(`http://localhost:4000/products/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công");
      refetch();
    }
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };


  const getCategoryName = (id: number) => {
    const category = categories?.find((cat: ICategory) => cat.id === id);
    return category ? category.name : "Không có danh mục";
  };

  const columns = [
    {
      title: "Stt",
      key: 'stt',
      render: (_: any, __: IProduct, index: number) => index + 1
    },
    {
      title: "Name",
      key: 'name',
      dataIndex: 'name',
    },
     {
      title:"Ảnh sản phẩm",
      key:'image',
      dataIndex:'image',
      render:(img:string)=> <img src={img} width={100}></img>
    },
    
    {
      title: "Giá",
      key: 'price',
      render: (_: any, record: IProduct) => (
        <span>{record.price.toLocaleString()} VND</span>
      )
    },
    {
      title: "Mô tả",
      key: 'description',
      dataIndex: 'description',
    },
    {
      title: "Danh mục",
      key: 'category',
      render: (_: any, record: IProduct) => getCategoryName(Number(record.category))
    },
    {
      title: "Trạng thái",
      key: 'status',
      render: (_: any, record: IProduct) => (
        <span style={{ color: record.status === 'Còn hàng' ? 'green' : 'red' }}>
          {record.status}
        </span>
      )
    },
    
    
    {
      title: "Thao tác",
      key: 'id',
      dataIndex: 'id',
      render: (id: string) => <>
        <Button onClick={() => nav(`/admin/phone/${id}/edit`)}><EditOutlined /></Button>
         <Button onClick={() => nav(`/admin/phone/${id}`)}>Xem</Button>{' '}
        <Popconfirm
          title="Thông báo"
          description="Bạn chắc chắn muốn xóa?"
          icon={<DeleteOutlined />}
          onConfirm={() => onDelete(id)}
          okText="OK"
          cancelText="NO"
        >
          <Button danger><DeleteOutlined /></Button>
        </Popconfirm>
      </>
    },
  ];

  return (
    <div>
      <h1>Danh sách sản phẩm</h1><>
        <Table dataSource={products} columns={columns} rowKey="id" />

      
      
      </>
    </div>
  );
}

export default GetListProduct;

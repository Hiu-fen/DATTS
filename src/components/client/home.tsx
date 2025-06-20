import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, Button, Popconfirm, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

const Home = () => {
  const nav = useNavigate()

  // Fetch sản phẩm từ API
  const { data: products, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:4000/products')).data,
  })

  // Fetch danh mục từ API
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:4000/category')).data,
  })

  // Hàm xóa sản phẩm
  const onDeleteProduct = (id: string) => {
    axios
      .delete(`http://localhost:4000/products/${id}`)
      .then(() => {
        message.success('Xóa sản phẩm thành công')
        refetch()
      })
      .catch(() => message.error('Xóa sản phẩm thất bại'))
  }

  // Hàm xóa danh mục
  const onDeleteCategory = (id: string) => {
    axios
      .delete(`http://localhost:4000/category/${id}`)
      .then(() => message.success('Xóa danh mục thành công'))
      .catch(() => message.error('Xóa danh mục thất bại'))
  }

  // Các cột cho Table sản phẩm
  const productColumns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ảnh sản phẩm',
      dataIndex: 'image',
      key: 'image',
      render: (img: string) => <img src={img} width={100} alt="product" />,
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_: any, record: any) => `${record.price.toLocaleString()} VND`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (_: any, record: any) => {
        const category = categories?.find((cat: any) => cat.id === record.category)
        return category ? category.name : 'Không có danh mục'
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => (
        <span style={{ color: record.status === 'Còn hàng' ? 'green' : 'red' }}>
          {record.status}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'id',
      render: (id: string) => (
        <>
          <Button onClick={() => nav(`/admin/phone/${id}/edit`)} icon={<EditOutlined />} />
          <Button
            onClick={() => nav(`/admin/phone/${id}`)}
            style={{ margin: '0 8px' }}
          >
            Xem
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa sản phẩm?"
            onConfirm={() => onDeleteProduct(id)}
            okText="Có"
            cancelText="Không"
            icon={<DeleteOutlined />}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ]

  // Các cột cho Table danh mục
  const categoryColumns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ảnh minh họa',
      dataIndex: 'image',
      key: 'image',
      render: (img: string) => <img src={img} width={100} alt="category" />,
    },
    {
      title: 'Mô tả danh mục',
      dataIndex: 'mota',
      key: 'mota',
    },
    {
      title: 'Thao tác',
      key: 'id',
      render: (id: string) => (
        <>
          <Button onClick={() => nav(`/category/phone/${id}/edit`)} icon={<EditOutlined />} />
          <Popconfirm
            title="Bạn chắc chắn muốn xóa danh mục?"
            onConfirm={() => onDeleteCategory(id)}
            okText="Có"
            cancelText="Không"
            icon={<DeleteOutlined />}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>
      <Table dataSource={products} columns={productColumns} rowKey="id" />

      <h1>Danh mục sản phẩm</h1>
      <Table dataSource={categories} columns={categoryColumns} rowKey="id" />
    </div>
  )
}

export default Home

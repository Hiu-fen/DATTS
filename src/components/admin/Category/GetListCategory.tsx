import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Icatagory } from '../../interface/category';

const GetListCategory = () => {
  const nav = useNavigate();

  // 🔁 Lấy danh sách danh mục
  const { data: categories, refetch, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:4000/category')).data,
  });

  // ❌ Mutation xóa danh mục
  const mutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.delete(`http://localhost:4000/category/${id}`),
    onSuccess: () => {
      message.success('Xóa danh mục thành công!');
      refetch();
    },
    onError: () => {
      message.error('Xóa thất bại!');
    },
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  // 📊 Cột bảng
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: Icatagory, index: number) => index + 1,
    },
    {
      title: 'Tên danh mục',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Ảnh minh họa',
      key: 'image',
      dataIndex: 'image',
      render: (img: string) =>
        img ? (
          <img src={img} width={80} height={60} style={{ objectFit: 'cover' }} />
        ) : (
          'Không có'
        ),
    },
    {
      title: 'Mô tả',
      key: 'mota',
      dataIndex: 'mota',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Icatagory) => (
        <>
          <Button
            onClick={() => nav(`/admin/category/${record.id}/edit`)}
            style={{ marginRight: 8 }}
            icon={<EditOutlined />}
          />
          <Popconfirm
            title="Xác nhận xoá"
            description="Bạn có chắc muốn xoá danh mục này?"
            onConfirm={() => onDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            icon={<DeleteOutlined />}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Danh sách danh mục
      </h2>

      <Button
        type="primary"
        onClick={() => nav('/admin/category/add')}
        style={{ marginBottom: 16 }}
      >
        + Thêm danh mục
      </Button>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={categories}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default GetListCategory;

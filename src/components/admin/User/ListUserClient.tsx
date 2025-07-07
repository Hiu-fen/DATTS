import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, message, Popconfirm, Table, Tag, Switch } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { User } from '../../../interface/user';
import { useNavigate } from 'react-router-dom';

const GetClient = () => {
  const nav = useNavigate();
  const [searchText, setSearchText] = useState('');

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ Lấy danh sách từ JSON Server
  const { data: users = [], refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () =>
      (await axios.get(`http://localhost:4000/users`)).data,
  });

  // ✅ Cập nhật trạng thái hoạt động
  const updateStatus = useMutation({
    mutationFn: async ({ user, status }: { user: User; status: boolean }) => {
      return await axios.patch(`http://localhost:4000/users/${user.id}`, {
        active: status,
      });
    },
    onSuccess: (_, variables) => {
      if (
        variables.status === false &&
        currentUser &&
        currentUser.id === variables.user.id
      ) {
        message.error("Tài khoản của bạn đã bị tạm dừng");
        localStorage.removeItem("user");
        nav("/admin/login");
      }
      message.success(
        variables.status ? "Mở lại tài khoản thành công" : "Tạm dừng tài khoản thành công"
      );
      refetch();
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi cập nhật tài khoản');
    },
  });

  // ✅ Cập nhật role
  const updateRole = useMutation({
    mutationFn: async ({ user, role }: { user: User; role: string }) => {
      return await axios.patch(`http://localhost:4000/users/${user.id}`, {
        role,
      });
    },
    onSuccess: () => {
      message.success('Cập nhật vai trò thành công');
      refetch();
    },
    onError: () => {
      message.error('Lỗi khi cập nhật vai trò');
    },
  });

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: User, index: number) => index + 1,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ảnh đại diện',
      key: 'avatar',
      render: (_: any, record: User) => (
        <img
          src={record.avatar || 'https://via.placeholder.com/40'}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
      ),
    },
    {
      title: 'Số điện thoại',
      key: 'sdt',
      render: (_: any, record: User) => {
        const phone = record.sdt || '';
        if (phone.length >= 6) {
          const hidden = '*'.repeat(6);
          const visible = phone.slice(0, phone.length - 6);
          return visible + hidden;
        }
        return '*'.repeat(phone.length);
      },
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (_: any, record: User) => record.address || 'Chưa có',
    },
    {
      title: 'Trạng thái',
      key: 'active',
      render: (_: any, record: User) =>
        record.active !== false ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Bị tạm dừng</Tag>
        ),
    },
    {
      title: 'Tài khoản',
      key: 'role',
      render: (_: any, record: User) => (
        <Switch
          checked={record.role === 'admin'}
          onChange={(checked) =>
            updateRole.mutate({
              user: record,
              role: checked ? 'admin' : 'user',
            })
          }
          checkedChildren={<span style={{ color: '#fff' }}>Admin</span>}
          unCheckedChildren="User"
          style={{
            backgroundColor: record.role === 'admin' ? '#52c41a' : undefined,
          }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) =>
        record.id === currentUser?.id ? null : record.active !== false ? (
          <Popconfirm
            title="Bạn có chắc muốn tạm dừng tài khoản này không?"
            onConfirm={() =>
              updateStatus.mutate({ user: record, status: false })
            }
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Tạm dừng</Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Bạn có chắc muốn mở lại tài khoản này không?"
            onConfirm={() =>
              updateStatus.mutate({ user: record, status: true })
            }
            okText="Mở lại"
            cancelText="Hủy"
          >
            <Button type="primary" ghost>
              Mở lại
            </Button>
          </Popconfirm>
        ),
    },
  ];

  // ✅ Lọc người dùng role user
  const filteredUsers = users
    ?.filter((user: User) => user.role === 'user')
    ?.filter((u: User) => {
      const text = `${u.id} ${u.email} ${u.address ?? ''} ${u.sdt ?? ''}`.toLowerCase();
      return text.includes(searchText.toLowerCase());
    })
    ?.sort((a: User, b: User) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div>
      <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
          placeholder="Tìm kiếm theo email, sdt, địa chỉ..."
          className="mb-4"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default GetClient;

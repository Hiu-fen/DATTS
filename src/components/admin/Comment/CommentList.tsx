import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface IContact {
  id: number;
  userId: number;
  date: string;
  mota: string;
}

const ContactList = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/contacts');
        setContacts(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy liên hệ:', error);
        message.error('Không thể lấy liên hệ, vui lòng thử lại sau.');
      }
    };

    fetchContacts();
  }, []);

  const mutation = useMutation({
    mutationFn: async (id: number) => await axios.delete(`http://localhost:3000/contacts/${id}`),
    onSuccess: (_data, id) => {
      message.success("Xóa thành công");
      setContacts(prev => prev.filter(contact => contact.id !== id));
    },
    onError: (error: any) => {
      message.error("Xóa liên hệ thất bại");
      console.error("Lỗi khi xóa liên hệ:", error);
    },
  });

  const onDelete = (id: number) => {
    mutation.mutate(id);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'User ID', dataIndex: 'userId' },
    { title: 'Ngày', dataIndex: 'date' },
    { title: 'Mô tả', dataIndex: 'mota' },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: (id: number) => (
        <Popconfirm
          title="Xác nhận xóa"
          description="Bạn có chắc muốn xóa liên hệ này?"
          onConfirm={() => onDelete(id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách liên hệ</h2>
        <Link to="/admin/contacts/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm liên hệ
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={contacts}
        rowKey="id"
      />
    </div>
  );
};

export default ContactList;

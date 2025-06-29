import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';

interface IContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: boolean;
}

const ContactAdmin = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/contacts');
        setContacts(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy liên hệ:', error);
        message.error('Không thể lấy liên hệ, vui lòng thử lại sau.');
      }
    };
    fetchContacts();
  }, []);

  const mutation = useMutation({
    mutationFn: async (id: number) => await axios.delete(`http://localhost:4000/contacts/${id}`),
    onSuccess: (_, id) => {
      setContacts(prev => prev.filter(contact => contact.id !== id));
      message.success("Xóa liên hệ thành công");
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
    { title: 'Họ tên', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    { title: 'Tin nhắn', dataIndex: 'message' },
    { title: 'Ngày liên hệ', dataIndex: 'date' },
    {
      title: 'Thao tác',
      dataIndex: 'id',
      render: (id: number) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa?"
          onConfirm={() => onDelete(id)}
          okText="OK"
          cancelText="Không"
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách liên hệ</h2>
      <Table columns={columns} dataSource={contacts} rowKey="id" />
    </div>
  );
};

export default ContactAdmin;

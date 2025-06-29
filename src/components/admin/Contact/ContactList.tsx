import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';

interface IContact {
  id: number;
  userId: number;
  date: string;
  mota: string;
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
    { title: 'User ID', dataIndex: 'userId' },
    { title: 'Ngày', dataIndex: 'date' },
    { title: 'Mô tả', dataIndex: 'mota' },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: (id: number) => (
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
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách liên hệ</h2>
      <Table
        columns={columns}
        dataSource={contacts}
        rowKey="id"
      />
    </div>
  );
};

export default ContactAdmin;

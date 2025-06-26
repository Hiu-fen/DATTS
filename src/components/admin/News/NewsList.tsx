import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message, Switch, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface INews {
  id: number;
  title: string;
  content: string;
  image: string;
  address: string;
  createdAt: string;
  expiredAt: string;
  likes: number;
  status: boolean;
}

const NewsAdmin = () => {
  const [newsList, setNewsList] = useState<INews[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('http://localhost:3000/news');
        setNewsList(res.data);
      } catch (err) {
        message.error('Không thể lấy dữ liệu tin tức');
        console.error(err);
      }
    };
    fetchNews();
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await axios.delete(`http://localhost:3000/news/${id}`),
    onSuccess: (_, id) => {
      setNewsList(prev => prev.filter(item => item.id !== id));
      message.success("Xóa tin tức thành công");
    },
    onError: () => message.error("Xóa tin tức thất bại"),
  });

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await axios.patch(`http://localhost:3000/news/${id}`, {
        status: !currentStatus,
      });
      setNewsList(prev =>
        prev.map(item => (item.id === id ? { ...item, status: res.data.status } : item))
      );
      message.success("Cập nhật trạng thái thành công");
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Nội dung', dataIndex: 'content' },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      render: (url: string) => <Image width={80} src={url} />,
    },
    { title: 'Địa chỉ', dataIndex: 'address' },
    { title: 'Ngày đăng', dataIndex: 'createdAt' },
    { title: 'Ngày kết thúc', dataIndex: 'expiredAt' },
    { title: 'Lượt thích', dataIndex: 'likes' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_: any, record: INews) => (
        <Switch
          checked={record.status}
          onChange={() => toggleStatus(record.id, record.status)}
        />
      ),
    },
    {
      title: 'Thao tác',
      dataIndex: 'id',
      render: (id: number) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa?"
          onConfirm={() => deleteMutation.mutate(id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
    {
  title: 'Sửa',
  dataIndex: 'id',
  render: (id: number) => <Link to={`/admin/news/edit/${id}`}><Button type="primary">Sửa</Button></Link>
},

  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách Tin tức</h2>
      <Table columns={columns} dataSource={newsList} rowKey="id" />
    </div>
  );
};

export default NewsAdmin;

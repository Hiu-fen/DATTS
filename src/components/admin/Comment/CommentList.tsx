import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface IComment {
  id: number;
  user: string;
  content: string;
  createdAt: string;
  status: boolean;
  productId?: string;
}

interface IProduct {
  id: number;
  name: string;
}

const CommentList = () => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get('http://localhost:4000/comments');
        setComments(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy bình luận:', error);
        message.error('Không thể lấy bình luận, vui lòng thử lại sau.');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        message.error('Không thể lấy sản phẩm, vui lòng thử lại sau.');
      }
    };

    fetchComments();
    fetchProducts();
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await axios.delete(`http://localhost:4000/comments/${id}`),
    onSuccess: (_data, id) => {
      message.success("Xóa bình luận thành công");
      setComments(prev => prev.filter(comment => comment.id !== id));
    },
    onError: (error: any) => {
      message.error("Xóa bình luận thất bại");
      console.error("Lỗi khi xóa bình luận:", error);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.patch(`http://localhost:4000/comments/${id}`, { status: true });
      return response.data;
    },
    onSuccess: (updatedComment: IComment) => {
      message.success("Duyệt bình luận thành công");
      setComments(prev =>
        prev.map(comment => comment.id === updatedComment.id ? updatedComment : comment)
      );
    },
    onError: (error: any) => {
      message.error("Duyệt bình luận thất bại");
      console.error("Lỗi khi duyệt bình luận:", error);
    },
  });

  const onDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const onApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const getProductName = (productId?: string) => {
    const product = products.find(p => p.id === Number(productId));
    return product ? product.name : 'Không xác định';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Người dùng', dataIndex: 'user' },
    { title: 'Nội dung', dataIndex: 'content' },
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      render: (productId: string) => getProductName(productId)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: boolean) => (
        status
          ? <span className="text-green-600">Đã duyệt</span>
          : <span className="text-red-600">Chưa duyệt</span>
      )
    },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: (id: number, record: IComment) => (
        <div className="flex gap-2">
          {!record.status && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onApprove(id)}
            >
              Duyệt
            </Button>
          )}
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa bình luận này?"
            onConfirm={() => onDelete(id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách bình luận</h2>
        <Link to="/admin/comments/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm bình luận
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default CommentList;

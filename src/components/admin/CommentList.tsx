import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { IComment } from '../../interface/comments';

const CommentAdmin = () => {
  const [comments, setComments] = useState<IComment[]>([]);

  // Lấy danh sách bình luận và ép kiểu status thành boolean
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get('http://localhost:4000/comments');
        const fixedComments = response.data.map((comment: IComment) => ({
          ...comment,
          status: Boolean(comment.status),    
        }));
        setComments(fixedComments);
      } catch (error) {
        console.error('Lỗi khi lấy bình luận:', error);
        message.error('Không thể lấy bình luận, vui lòng thử lại sau.');
      }
    };

    fetchComments();
  }, []);

  // Hàm thay đổi trạng thái bình luận
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await axios.patch(`http://localhost:4000/comments/${id}`, {
        status: !currentStatus,
      });
  
      // Cập nhật lại danh sách comment trong state
      const updatedComments = comments.map(comment =>
        comment.id === id ? res.data : comment
      );
      setComments(updatedComments);
  
      message.success("Cập nhật trạng thái thành công");
    } catch (error: any) {
      // Lỗi được bắt và thông báo chi tiết
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  // Xóa bình luận
  const mutation = useMutation({
    mutationFn: async (id: any) => await axios.delete(`http://localhost:4000/comments/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công");
      window.location.reload()
    },
    onError: (error: any) => {
      message.error("Xóa bình luận thất bại");
      console.error("Lỗi khi xóa bình luận:", error);
    },
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  // Cấu hình bảng hiển thị
  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Người dùng', dataIndex: 'user' },
    { title: 'Sản phẩm', dataIndex: 'product' },
    { title: 'Nội dung', dataIndex: 'content' },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: IComment) => (
        <Button onClick={() => toggleStatus(record.id, record.status)}>
          {record.status ? 'Hiện' : 'Ẩn'}
        </Button>
      ),
    },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: (id: string) => (
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
      <h2 className="text-xl font-bold mb-4">Danh sách bình luận</h2>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
      />
    </div>
  );
};

export default CommentAdmin;

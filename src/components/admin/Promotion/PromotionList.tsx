import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { IPromotion } from '../../interface/promotion';

const PromotionList = () => {
  const navigate = useNavigate();
  const { data, refetch } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => (await axios.get('http://localhost:4000/promotions')).data
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => await axios.delete(`http://localhost:4000/promotions/${id}`),
    onSuccess: () => {
      message.success('Xóa thành công');
      refetch();
    }
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  const columns = [
    { title: 'STT', render: (_: any, __: IPromotion, index: number) => index + 1 },
    { title: 'Mã khuyến mãi', dataIndex: 'code' },
    { title: 'Ngày', dataIndex: 'date' },
    { title: 'Điều kiện', dataIndex: 'condition' },
    { title: 'Ngày bắt đầu', dataIndex: 'startDate' },
    { title: 'Ngày kết thúc', dataIndex: 'endDate' },
    { title: 'Trạng thái', dataIndex: 'status' },
    {
      title: 'Thao tác',
      dataIndex: 'id',
      render: (id: string) => (
        <>
          <Button type="primary" onClick={() => navigate(`/admin/promotion/${id}/edit`)}>
            <EditOutlined />
          </Button>

          <Popconfirm
            title="Xóa khuyến mãi?"
            onConfirm={() => onDelete(id)}
            okText="OK"
            cancelText="Không"
          >
            <Button danger><DeleteOutlined /></Button>
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" >Danh sách khuyến mãi</h2>
      {/* <Button type="primary" onClick={() => navigate('/admin/promotion/add')}>Thêm khuyến mãi</Button> */}
      <Table dataSource={data} columns={columns} rowKey="id" />
    </div>
  );
};

export default PromotionList;
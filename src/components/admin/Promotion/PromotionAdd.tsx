import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, DatePicker, Select, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PromotionAdd = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post('http://localhost:4000/promotions', data);
    },
    onSuccess: () => {
      message.success('Thêm khuyến mãi thành công');
      navigate('/admin/promotion/list');
    }
  });

  const onFinish = (values: any) => {
    const data = {
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD')
    };
    mutation.mutate(data);
  };

  return (
    <div>
      <h1>Thêm khuyến mãi</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="code" label="Mã khuyến mãi" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="date" label="Ngày tạo" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="condition" label="Điều kiện" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select options={[
            { value: 'Hoạt động', label: 'Hoạt động' },
            { value: 'Hết hạn', label: 'Hết hạn' }
          ]} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Thêm</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PromotionAdd;
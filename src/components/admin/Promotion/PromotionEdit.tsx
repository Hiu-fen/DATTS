import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Form, Input, DatePicker, Select, message } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const PromotionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data } = useQuery({
    queryKey: ['promotion', id],
    queryFn: async () => (await axios.get(`http://localhost:4000/promotions/${id}`)).data
  });

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        date: dayjs(data.date),
        startDate: dayjs(data.startDate),
        endDate: dayjs(data.endDate)
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        date: values.date.format('YYYY-MM-DD')
      };
      await axios.put(`http://localhost:4000/promotions/${id}`, payload);
    },
    onSuccess: () => {
      message.success('Cập nhật thành công');
      navigate('/admin/promotion/list');
    }
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <div>
      <h1>Sửa khuyến mãi</h1>
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
          <Button type="primary" htmlType="submit">Cập nhật</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PromotionEdit;
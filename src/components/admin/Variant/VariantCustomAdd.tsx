import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';

const VariantCustomAdd = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: { name: string }) => {
    const oldNames = JSON.parse(localStorage.getItem('variantNames') || '[]');
    if (oldNames.some((item: string) => item.toLowerCase() === values.name.trim().toLowerCase())) {
      message.error('Tên biến thể đã tồn tại!');
      return;
    }
    const newNames = [...oldNames, values.name.trim()];
    localStorage.setItem('variantNames', JSON.stringify(newNames));
    message.success('Đã thêm tên biến thể!');
    form.resetFields();
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 22 }}>Thêm tên biến thể</span>}
        bordered={false}
        style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Tên biến thể"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên biến thể!' }]}
          >
            <Input placeholder="Ví dụ: Chất liệu, Kích thước, ..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Thêm tên biến thể
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default VariantCustomAdd;
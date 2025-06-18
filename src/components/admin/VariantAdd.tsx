import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Select } from 'antd';

const VariantAdd = () => {
  const [form] = Form.useForm();
  const [variantNames, setVariantNames] = useState<string[]>([]);

  useEffect(() => {
    const names = JSON.parse(localStorage.getItem('variantNames') || '[]');
    setVariantNames(names);
  }, []);

  const handleFinish = (values: { name: string; value: string }) => {
    const oldData = JSON.parse(localStorage.getItem('variantValues') || '{}');
    const list = oldData[values.name] || [];
    // Kiểm tra trùng giá trị (không phân biệt hoa thường, loại bỏ khoảng trắng)
    const existedValues = list.map((item: any) => item.value.trim().toLowerCase());
    const newValue = values.value.trim();
    if (existedValues.includes(newValue.toLowerCase())) {
      message.error('Giá trị này đã tồn tại trong biến thể!');
      return;
    }
    const newList = [
      ...list,
      { value: newValue, key: Date.now() + Math.random() }
    ];
    const newData = { ...oldData, [values.name]: newList };
    localStorage.setItem('variantValues', JSON.stringify(newData));
    message.success('Đã thêm giá trị cho biến thể!');
    form.resetFields();
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 22 }}>Thêm giá trị biến thể</span>}
        bordered={false}
        style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Tên biến thể"
            name="name"
            rules={[{ required: true, message: 'Vui lòng chọn tên biến thể!' }]}
          >
            <Select placeholder="Chọn tên biến thể">
              {variantNames.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Giá trị"
            name="value"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
          >
            <Input placeholder="Nhập giá trị cho biến thể" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Thêm giá trị
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default VariantAdd;
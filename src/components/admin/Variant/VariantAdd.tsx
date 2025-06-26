import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const VariantAdd = () => {
  const [form] = Form.useForm();
  const [variantData, setVariantData] = useState<{ ram: string[]; color: string[] }>({
    ram: [],
    color: [],
  });

  useEffect(() => {
    // Lấy dữ liệu variant hiện tại từ server
    const fetchVariants = async () => {
      try {
        const res = await axios.get('http://localhost:4000/variants');
        if (res.data && res.data.length > 0) {
          setVariantData(res.data[0]);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu biến thể:', err);
      }
    };
    fetchVariants();
  }, []);

  const handleFinish = async (values: { ram: string; color: string }) => {
    const ram = values.ram.trim();
    const color = values.color.trim();

    const updatedRam = variantData.ram.includes(ram) ? variantData.ram : [...variantData.ram, ram];
    const updatedColor = variantData.color.includes(color)
      ? variantData.color
      : [...variantData.color, color];

    const updatedData = {
      ram: updatedRam,
      color: updatedColor,
    };

    try {
      if (variantData.ram.length || variantData.color.length) {
        // Đã có dữ liệu -> cập nhật (PATCH hoặc PUT)
        const res = await axios.get('http://localhost:4000/variants');
        const id = res.data[0]?.id;
        if (id) {
          await axios.put(`http://localhost:4000/variants/${id}`, updatedData);
        }
      } else {
        // Chưa có -> thêm mới
        await axios.post('http://localhost:4000/variants', updatedData);
      }

      message.success('Thêm giá trị thành công!');
      setVariantData(updatedData);
      form.resetFields();
    } catch (err) {
      console.error('Lỗi khi thêm biến thể:', err);
      message.error('Thêm thất bại');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 22 }}>Thêm giá trị biến thể</span>}
        bordered={false}
        style={{ width: 460, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item label="RAM" name="ram" rules={[{ required: true, message: 'Vui lòng nhập RAM' }]}>
            <Input placeholder="VD: 8GB, 16GB..." />
          </Form.Item>

          <Form.Item label="Color" name="color" rules={[{ required: true, message: 'Vui lòng nhập Color' }]}>
            <Input placeholder="VD: Đen, Xanh..." />
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

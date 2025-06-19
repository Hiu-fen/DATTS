import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  InputNumber,
  Card,
  Select,
  Checkbox,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

// Hàm tạo mã đơn hàng như DH4Z8K9
const generateOrderCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "DH";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const AddOrder = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Bạn chưa đăng nhập.");
        setLoading(false);
        return;
      }

      const item = {
        productId: "p" + Date.now(), // random ID
        productName: values.productName,
        soluong: values.quantity,
        price: values.price,
        snapshot: {
          name: values.productName,
          price: values.price,
          color: values.color,
          storage: values.storage,
        },
      };

      const total = values.price * values.quantity;

      const orderData = {
        orderCode: generateOrderCode(),
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        date: new Date().toISOString(),
        status: values.status,
        isPaid: values.isPaid || false,
        paymentMethod: values.paymentMethod,
        returnStatus: "",
        statusHistory: [],
        items: [item],
        total,
      };

      await axios.post("http://localhost:4000/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("Tạo đơn hàng thành công!");
      navigate("/admin/orders");
    } catch (err) {
      console.error("POST error:", err);
      message.error("Lỗi khi tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Tạo đơn hàng mới" style={{ maxWidth: 700, margin: "0 auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên khách hàng" name="customerName" rules={[{ required: true }]}>
          <Input placeholder="VD: Lê Văn C" />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
          <Input placeholder="VD: 0987654321" />
        </Form.Item>
        <Form.Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
          <Input placeholder="VD: 789 Trần Phú, Đà Nẵng" />
        </Form.Item>
        <Form.Item label="Tên sản phẩm" name="productName" rules={[{ required: true }]}>
          <Input placeholder="VD: Laptop Dell XPS" />
        </Form.Item>
        <Form.Item label="Màu sắc" name="color">
          <Input placeholder="VD: Bạc" />
        </Form.Item>
        <Form.Item label="Dung lượng" name="storage">
          <Input placeholder="VD: 1TB SSD" />
        </Form.Item>
        <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Đơn giá (VND)" name="price" rules={[{ required: true }]}>
          <InputNumber min={1000} step={1000} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Phương thức thanh toán" name="paymentMethod" rules={[{ required: true }]}>
          <Select placeholder="Chọn phương thức">
            <Option value="COD">COD</Option>
            <Option value="Chuyển khoản">Chuyển khoản</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Đã thanh toán?" name="isPaid" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Trạng thái đơn hàng" name="status" rules={[{ required: true }]}>
          <Select placeholder="Chọn trạng thái">
            <Option value="Chờ xác nhận">Chờ xác nhận</Option>
            <Option value="Đang xử lý">Đang xử lý</Option>
            <Option value="Đang giao">Đang giao</Option>
            <Option value="Giao thành công">Giao thành công</Option>
            <Option value="Hoàn thành">Hoàn thành</Option>
            <Option value="Đã huỷ">Đã huỷ</Option>
            <Option value="Trả hàng/Hoàn tiền">Trả hàng/Hoàn tiền</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Tạo đơn hàng
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};


export default AddOrder;

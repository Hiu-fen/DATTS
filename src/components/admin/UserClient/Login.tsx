import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/login", {
        email: values.email,
        password: values.password,
      });

      const token = res.data.accessToken;

      // Lưu token vào localStorage (hoặc sessionStorage)
      localStorage.setItem("token", token);

      message.success("Đăng nhập thành công!");
      navigate("/admin/orders"); // hoặc chuyển tới dashboard của bạn
    } catch (err) {
      console.error("Login failed:", err);
      message.error("Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <Card title="Đăng nhập" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập tài khoản khách hàng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};


export default Login;

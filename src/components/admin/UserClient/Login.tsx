import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bcrypt from 'bcryptjs';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/users?email=${values.email}`);
      
      if (res.data.length === 0) {
        throw new Error('Email không tồn tại');
      }

      const user = res.data[0];

      const isPasswordValid = bcrypt.compareSync(values.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Mật khẩu không đúng');
      }

      if (!user.active) {
        throw new Error('Tài khoản đã bị khóa');
      }

      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));
      
      localStorage.setItem("token", "fake-jwt-token"); 

      message.success("Đăng nhập thành công!");
      
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      message.error(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      justifyContent: "center", 
      alignItems: "center",
      background: "#f0f2f5"
    }}>
      <Card 
        title="Đăng nhập" 
        style={{ 
          width: 400, 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "8px"
        }}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input 
              placeholder="Nhập email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
            ]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              size="large"
              style={{ height: "40px" }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Button 
              type="link" 
              onClick={() => navigate("/register")}
            >
              Chưa có tài khoản? Đăng ký ngay
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
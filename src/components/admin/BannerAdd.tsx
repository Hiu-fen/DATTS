import { useState } from "react";
import { Button, Form, Input, DatePicker, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const BannerAdd = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    const newBanner = {
      image: values.image,
      startDate: values.dateRange[0].format("YYYY-MM-DD"),
      endDate: values.dateRange[1].format("YYYY-MM-DD"),
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:4000/banners", newBanner);
      message.success("Thêm banner thành công!");
      nav("/admin/banner/list");
    } catch (error) {
      console.error("Lỗi khi thêm banner:", error);
      message.error("Thêm banner thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Thêm Banner Mới</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ image: "", dateRange: [dayjs(), dayjs().add(7, "day")] }}
      >
        <Form.Item
          name="image"
          label="URL Hình ảnh"
          rules={[{ required: true, message: "Vui lòng nhập URL hình ảnh" }]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Khoảng thời gian hiển thị"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu và kết thúc" }]}
        >
          <DatePicker.RangePicker format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm banner
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => nav("/admin/banner")}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BannerAdd;

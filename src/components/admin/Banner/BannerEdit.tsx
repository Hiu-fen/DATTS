import { useEffect, useState } from "react";
import { Button, Form, Input, DatePicker, message, Spin } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { IBanner } from "../../interface/banner";

const BannerEdit = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  // Load dữ liệu banner theo ID
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/banners/${id}`);
        const banner: IBanner = res.data;
        form.setFieldsValue({
          image: banner.image,
          dateRange: [dayjs(banner.startDate), dayjs(banner.endDate)],
        });
      } catch (error) {
        console.error("Lỗi khi tải banner:", error);
        message.error("Không tìm thấy banner!");
        nav("/admin/banner/list");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id, form, nav]);

  const onFinish = async (values: any) => {
    const updatedBanner = {
      image: values.image,
      startDate: values.dateRange[0].format("YYYY-MM-DD"),
      endDate: values.dateRange[1].format("YYYY-MM-DD"),
    };

    try {
      await axios.patch(`http://localhost:4000/banners/${id}`, updatedBanner);
      message.success("Cập nhật banner thành công!");
      nav("/admin/banner/list");
    } catch (error) {
      console.error("Lỗi khi cập nhật banner:", error);
      message.error("Cập nhật thất bại!");
    }
  };

  if (loading) return <Spin fullscreen tip="Đang tải dữ liệu..." />;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Cập nhật Banner</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="URL Hình ảnh"
          name="image"
          rules={[{ required: true, message: "Vui lòng nhập URL hình ảnh" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Khoảng thời gian hiển thị"
          name="dateRange"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu và kết thúc" }]}
        >
          <DatePicker.RangePicker format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => nav("/admin/banner/list")}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BannerEdit;

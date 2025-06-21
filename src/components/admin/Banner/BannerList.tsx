import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Popconfirm, message, Image, Space } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { IBanner } from "../../interface/banner";
import { useNavigate } from "react-router-dom";

const BannerAdmin = () => {
  const [banners, setBanners] = useState<IBanner[]>([]);
 const nav = useNavigate();

  // Lấy danh sách banner
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:4000/banners");
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy banner:", error);
        message.error("Không thể tải danh sách banner.");
      }
    };

    fetchBanners();
  }, []);

  // Xoá banner
  const mutation = useMutation({
    mutationFn: async (id: number) =>
      await axios.delete(`http://localhost:4000/banners/${id}`),
    onSuccess: (_, id) => {
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
      message.success("Xóa banner thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi xóa banner:", error);
      message.error("Xóa banner thất bại");
    },
  });

  const onDelete = (id: number) => {
    mutation.mutate(id);
  };

  // Xử lý xem chi tiết
  const handleView = (record: IBanner) => {
    message.info(`Xem chi tiết Banner ID: ${record.id}`);
    // Có thể mở modal, hoặc điều hướng sang trang chi tiết
  };

  // Xử lý chỉnh sửa
  const handleEdit = (record: IBanner) => {
    message.info(`Sửa Banner ID: ${record.id}`);
    // Có thể mở modal hoặc điều hướng đến form sửa
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      render: (url: string) => <Image src={url} width={100} />,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
    },
    {
  title: "Thao tác",
  key: "actions",
  render: (_: any, record: IBanner) => (
    <Space>
      <Button onClick={() => nav(`/admin/banner/${record.id}`)}>
        Xem
      </Button>
      <Button
        icon={<EditOutlined />}
        onClick={() => nav(`/admin/banner/${record.id}/edit`)}
        type="primary"
      />
      <Popconfirm
        title="Xác nhận xoá"
        description="Bạn có chắc muốn xoá banner này không?"
        onConfirm={() => onDelete(record.id)}
        okText="Xoá"
        cancelText="Huỷ"
      >
        <Button danger icon={<DeleteOutlined />} />
      </Popconfirm>
    </Space>
  ),
}

  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách Banner</h2>
      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default BannerAdmin;

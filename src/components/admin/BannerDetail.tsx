import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { IBanner } from "../../interface/banner";
import { Card, Button, Spin, message } from "antd";

const BannerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState<IBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/banners/${id}`);
        setBanner(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy banner:", error);
        message.error("Không tìm thấy banner.");
        navigate("/admin/banner/list");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id, navigate]);

  if (loading) return <Spin fullscreen tip="Đang tải..." />;

  if (!banner) return null;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card
        title={`Chi tiết Banner ID: ${banner.id}`}
        extra={
          <Button onClick={() => navigate("/admin/banner/list")}>
            Quay lại danh sách
          </Button>
        }
      >
        <div className="mb-4">
          <img
            src={banner.image}
            alt="Banner"
            style={{ maxWidth: "100%", borderRadius: "8px" }}
          />
        </div>
        <p><strong>Ngày bắt đầu:</strong> {banner.startDate}</p>
        <p><strong>Ngày kết thúc:</strong> {banner.endDate}</p>
      </Card>
    </div>
  );
};

export default BannerDetail;

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Divider } from "antd";
import axios from "axios";
import { Bar, Pie, Line } from "@ant-design/charts";

const DashboardAdmin = () => {
  // State tổng hợp
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [ordersRes, productsRes, usersRes, promotionsRes] = await Promise.all([
        axios.get("http://localhost:4000/orders"),
        axios.get("http://localhost:4000/products"),
        axios.get("http://localhost:4000/users"),
        axios.get("http://localhost:4000/promotions"),
        // axios.get("http://localhost:4000/suppliers"), // nếu có
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
      setPromotions(promotionsRes.data);
      // setSuppliers(suppliersRes.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // 1. Tổng quan
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProfit = totalRevenue * 0.15; // demo: lợi nhuận 15%
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalPromotions = promotions.length;

  // 2. Đơn hàng theo trạng thái
  const statusCount = orders.reduce((acc: any, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // 3. Doanh thu theo ngày
  const revenueByDate: Record<string, number> = {};
  orders.forEach((order) => {
    const date = new Date(order.date).toLocaleDateString();
    revenueByDate[date] = (revenueByDate[date] || 0) + (order.total || 0);
  });
  const revenueChartData = Object.entries(revenueByDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 4. Top sản phẩm bán chạy
  const productSales: Record<number, number> = {};
  orders.forEach((order) => {
    order.items?.forEach((item: any) => {
      if (!item.productId) return;
      productSales[item.productId] = (productSales[item.productId] || 0) + (item.soluong || 1);
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([id, qty]) => {
      const prod = products.find((p: any) => p.id === Number(id));
      return { name: prod?.name || `ID ${id}`, qty };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 5. Top khách hàng mua nhiều nhất
  const userSales: Record<number, number> = {};
  orders.forEach((order) => {
    if (!order.userId) return;
    userSales[order.userId] = (userSales[order.userId] || 0) + (order.total || 0);
  });
  const topUsers = Object.entries(userSales)
    .map(([id, total]) => {
      const user = users.find((u: any) => u.id === Number(id));
      return { name: user?.name || `ID ${id}`, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 6. Sản phẩm tồn kho thấp (demo)
  const lowStockProducts = products.filter((p: any) => p.stock <= 10);

  // 7. Sản phẩm mới thêm gần đây
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, 5);

  // 8. Khuyến mãi đang hoạt động
  const activePromotions = promotions.filter((p: any) => p.status === "Hoạt động");

  // 9. Đơn hàng giao trễ (demo: status = "Đã hủy")
  const lateOrders = orders.filter((o) => o.status === "Đã hủy");

  return (
    <div className="p-6">
      {/* 1. Tổng quan */}
      <Row gutter={24}>
        <Col span={4}><Card><Statistic title="Đơn hàng" value={totalOrders} loading={loading} /></Card></Col>
        <Col span={4}><Card><Statistic title="Doanh thu" value={totalRevenue.toLocaleString()} suffix="VNĐ" loading={loading} /></Card></Col>
        <Col span={4}><Card><Statistic title="Lợi nhuận" value={totalProfit.toLocaleString()} suffix="VNĐ" loading={loading} /></Card></Col>
        <Col span={4}><Card><Statistic title="Sản phẩm" value={totalProducts} loading={loading} /></Card></Col>
        <Col span={4}><Card><Statistic title="Khách hàng" value={totalUsers} loading={loading} /></Card></Col>
        <Col span={4}><Card><Statistic title="Khuyến mãi" value={totalPromotions} loading={loading} /></Card></Col>
      </Row>

      <Divider />

      {/* 2. Biểu đồ doanh thu theo ngày */}
      <Row>
        <Col span={24}>
          <Card title="Biểu đồ doanh thu theo ngày">
            <Line
              data={revenueChartData}
              xField="date"
              yField="total"
              color="#1677ff"
              height={300}
              xAxis={{ label: { autoHide: false, autoRotate: true } }}
              yAxis={{ label: { formatter: (v: any) => `${Number(v).toLocaleString()} VNĐ` } }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 3. Các bảng nhỏ chia 2 bên */}
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Đơn hàng theo trạng thái">
            <Table
              dataSource={Object.entries(statusCount).map(([status, count]) => ({ status, count }))}
              columns={[
                { title: "Trạng thái", dataIndex: "status", key: "status" },
                { title: "Số lượng", dataIndex: "count", key: "count" },
              ]}
              pagination={false}
              rowKey="status"
              size="small"
            />
          </Card>
          <Divider />
          <Card title="Top 5 sản phẩm bán chạy">
            <Table
              dataSource={topProducts}
              columns={[
                { title: "Sản phẩm", dataIndex: "name", key: "name" },
                { title: "Số lượng bán", dataIndex: "qty", key: "qty" },
              ]}
              pagination={false}
              rowKey="name"
              size="small"
            />
          </Card>
          <Divider />
          <Card title="Sản phẩm tồn kho thấp">
            <Table
              dataSource={lowStockProducts}
              columns={[
                { title: "Tên", dataIndex: "name", key: "name" },
                { title: "Tồn kho", dataIndex: "stock", key: "stock" },
              ]}
              pagination={false}
              rowKey="name"
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 5 khách hàng chi tiêu nhiều nhất">
            <Table
              dataSource={topUsers}
              columns={[
                { title: "Khách hàng", dataIndex: "name", key: "name" },
                { title: "Tổng chi tiêu", dataIndex: "total", key: "total" },
              ]}
              pagination={false}
              rowKey="name"
              size="small"
            />
          </Card>
          <Divider />
          <Card title="Sản phẩm mới thêm gần đây">
            <Table
              dataSource={recentProducts}
              columns={[
                { title: "Tên", dataIndex: "name", key: "name" },
                { title: "Ngày thêm", dataIndex: "createdAt", key: "createdAt" },
              ]}
              pagination={false}
              rowKey="name"
              size="small"
            />
          </Card>
          <Divider />
          <Card title="Khuyến mãi đang hoạt động">
            <Table
              dataSource={activePromotions}
              columns={[
                { title: "Tên", dataIndex: "name", key: "name" },
                { title: "Mã", dataIndex: "code", key: "code" },
                { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate" },
                { title: "Ngày kết thúc", dataIndex: "endDate", key: "endDate" },
              ]}
              pagination={false}
              rowKey="code"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 4. Đơn hàng giao trễ/đã hủy */}
      <Row>
        <Col span={24}>
          <Card title="Đơn hàng giao trễ/đã hủy">
            <Table
              dataSource={lateOrders}
              columns={[
                { title: "Mã đơn", dataIndex: "orderCode", key: "orderCode" },
                { title: "Khách hàng", dataIndex: "customerName", key: "customerName" },
                { title: "Trạng thái", dataIndex: "status", key: "status" },
              ]}
              pagination={false}
              rowKey="orderCode"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAdmin;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');

const vnpayRouter = require("./routers/vnpayRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
app.use("/uploads", express.static("uploads"));

// VNPAY routes
app.use("/api/vnpay", vnpayRouter);

// 👉 Dùng json-server
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
app.use("/api", middlewares, router);

// Cron job (nếu có)
// require('./cron');

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

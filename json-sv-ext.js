import jsonServer from "json-server";
import auth from "json-server-auth";
import { jwtDecode } from "jwt-decode";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import axios from "axios";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const port = 4000;
server.db = router.db;
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(auth);

const GetMaxID = (collection) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const data = db[collection];
  if (!data || data.length === 0) {
    return 0;
  }
  return Math.max(...data.map(item => item.id));
};
const GetEndpoint = () => {
  const db = router.db; // Truy cập database từ router json-server
  const endpoints = Object.keys(db.getState()).map((key) => ({
    url: `http://localhost:${port}/${key}`,
  }));

  console.log(`📚 Danh sách các endpoint hiện có:`);
  endpoints.forEach((ep) => console.log(ep.url));
};


const Permission = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Vui lòng đăng nhập" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwtDecode(token);
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const user = db.users.find((u) => u.email === decoded.email);
    if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token không đúng" });
  }
};

// PRODUCTS (thay thế)
server.post("/products", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const newId = GetMaxID("products") + 1;
  const variants = Array.isArray(req.body.variants) ? req.body.variants : [];
  const newProduct = {
    id: newId,
    ...req.body,
    type: variants.length > 0 ? "variable" : "simple",
    parent: 0,
  };
  db.products.push(newProduct);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json(newProduct);
});

server.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const idx = db.products.findIndex((p) => p.id === Number(id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const incoming = Array.isArray(req.body.variants) ? req.body.variants : [];
  const existingVariants = db.products[idx].variants || [];
  const maxExistingId = existingVariants.reduce((max, v) => (v.id > max ? v.id : max), 0);
  let nextId = maxExistingId + 1;

  const updatedVariants = incoming.map((v) => {
  // Nếu v.id là số => dùng lại, nếu không thì tạo mới
  if (typeof v.id === "number") {
    return {
      id: v.id,
      ram: v.ram,
      color: v.color,
      quantity: v.quantity,
      price: v.price,
    };
  } else {
    return {
      id: nextId++,
      ram: v.ram,
      color: v.color,
      quantity: v.quantity,
      price: v.price,
    };
  }
});


  const updated = {
    ...db.products[idx],
    ...req.body,
    type: updatedVariants.length > 0 ? "variable" : "simple",
    parent: 0,
    variants: updatedVariants,
  };

  db.products[idx] = updated;
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.json(updated);
});

server.get("/products", (req, res) => {
  const { products } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const list = products.filter((p) => p.parent === 0);
  res.json(list);
});

server.get("/products/:id", (req, res) => {
  const { products } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const prod = products.find((p) => p.id == req.params.id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  res.json(prod);
});

server.delete("/products/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { products } = db;
  const { id } = req.params;
  db.products = products.filter(item => item.id != id && item.parent != id);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(200).json({ message: "Delete success!" });
});

// ORDERS (thay thế)
server.post("/orders", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const userId = req.user.id;
  const data = req.body;

  if (!Array.isArray(data.items) || data.items.length === 0)
    return res.status(400).json({ error: "Thiếu danh sách sản phẩm (items)" });
  if (!data.orderCode)
    return res.status(400).json({ error: "Thiếu mã đơn hàng (orderCode)" });

  const newOrder = {
    id: GetMaxID("orders") + 1,
    userId,
    ...data,
    items: data.items.map(it => ({
      productId: typeof it.productId === "object" ? it.productId.id : it.productId,
      productName: it.productName,
      soluong: it.soluong,
      price: it.price,
      color: it.color || "",
      storage: it.storage || ""
    }))
  };

  db.orders.push(newOrder);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  return res.status(201).json({ message: "Đặt hàng thành công!", data: newOrder });
});

server.get("/orders/user/:userId", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const userId = req.user.id;
  const myOrders = (db.orders || []).filter(o => o.userId === userId);
  return res.status(200).json(myOrders);
});

server.get("/orders/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const order = db.orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  res.json(order);
});


// Router
server.post("/create-collection", (req, res) => {
  const collections = ["products", "variants", "carts", "orders"]
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    let isUpdated = false;
    for (const item of collections) {
      if (!db[item]) {
        db[item] = [];
        isUpdated = true;
      }
    }
    if (isUpdated) {
      fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    }

    res.status(201).json({ message: "Collections created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update db.json", details: error.message });
  }
})
// PRODUCTS (thay thế)
server.post("/products", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const newId = GetMaxID("products") + 1;
  const variants = Array.isArray(req.body.variants) ? req.body.variants : [];
  const newProduct = {
    id: newId,
    ...req.body,
    type: variants.length > 0 ? "variable" : "simple",
    parent: 0,
  };
  db.products.push(newProduct);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json(newProduct);
});

server.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const idx = db.products.findIndex((p) => p.id === Number(id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const incoming = Array.isArray(req.body.variants) ? req.body.variants : [];
  const existingVariants = db.products[idx].variants || [];
  const maxExistingId = existingVariants.reduce((max, v) => (v.id > max ? v.id : max), 0);
  let nextId = maxExistingId + 1;

  const updatedVariants = incoming.map((v) => {
    const variantId = typeof v.id === "number" ? v.id : nextId++;
    return { id: variantId, ram: v.ram, color: v.color, quantity: v.quantity, price: v.price };
  });

  const updated = {
    ...db.products[idx],
    ...req.body,
    type: updatedVariants.length > 0 ? "variable" : "simple",
    parent: 0,
    variants: updatedVariants,
  };

  db.products[idx] = updated;
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.json(updated);
});

server.get("/products", (req, res) => {
  const { products } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const list = products.filter((p) => p.parent === 0);
  res.json(list);
});

server.get("/products/:id", (req, res) => {
  const { products } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const prod = products.find((p) => p.id == req.params.id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  res.json(prod);
});

server.delete("/products/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { products } = db;
  const { id } = req.params;
  db.products = products.filter(item => item.id != id && item.parent != id);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(200).json({ message: "Delete success!" });
});

// Cart
server.post("/carts", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { id: userId } = req.user;
  const { product, quantity } = req.body;

  if (!product?.id) {
    return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
  }

  let cartIndex = db.carts.findIndex((item) => item.userId == userId);

  const cartItem = {
    productId: product, // Lưu toàn bộ object sản phẩm
    quantity,
  };

  if (cartIndex === -1) {
    const newCart = {
      id: GetMaxID("carts") + 1,
      userId,
      items: [cartItem],
    };

    db.carts.push(newCart);
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    return res.status(201).json({ message: "Tạo giỏ hàng thành công!", data: newCart });
  }

  const cart = db.carts[cartIndex];
  const existingItemIndex = cart.items.findIndex((item) => item.productId.id == product.id);

  if (existingItemIndex !== -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push(cartItem);
  }

  db.carts[cartIndex] = cart;
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");

  return res.status(200).json({ message: "Thêm vào giỏ hàng thành công!", data: cart });
});

server.get("/carts", Permission, (req, res) => {
  const { carts } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { id: userId } = req.user;

  if (!userId) {
    return res.status(401).json({ message: "Chưa đăng nhập!" });
  }

  const cartByUser = carts.find((item) => item.userId == userId);

  if (!cartByUser) {
    return res.status(404).json({ message: "Chưa có sản phẩm nào trong giỏ hàng!" });
  }

  res.status(200).json({ data: cartByUser });
});

server.put("/carts/:id", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { id: userId } = req.user;
  const { items: incoming } = req.body;

  const cartIndex = db.carts.findIndex(c => c.userId == userId);
  if (cartIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
  }

  // Lấy mảng items hiện tại
  const existing = db.carts[cartIndex].items;

  // Đổi thành array mới, nhưng giữ full object productId
  const merged = incoming.map(i => {
    // tìm xem trong existing có object cũ không
    const old = existing.find(e => e.productId.id == i.productId);
    return {
      productId: old
        ? old.productId        // giữ nguyên object cũ
        : { id: i.productId },  // fallback chỉ id nếu không tìm thấy
      quantity: i.quantity,
      color: i.color,
      storage: i.storage
    };
  });

  db.carts[cartIndex].items = merged;
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(200).json({
    message: "Cập nhật giỏ hàng thành công",
    data: db.carts[cartIndex]
  });
});



// Phải đảm bảo bạn đã import fs, jwtDecode, Permission… ở đầu file
server.get("/carts/:userId", Permission, (req, res) => {
  const { userId } = req.params;
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

  // Tìm cart của user, nếu chưa có thì tạo tạm với items = []
  const cart = db.carts.find((c) => c.userId == userId) || {
    id: GetMaxID("carts") + 1,
    userId: Number(userId),
    items: []
  };

  // Với mỗi item, luôn đảm bảo có color và storage
  const itemsWithVariant = cart.items.map(item => ({
    productId: item.productId,          // full object product
    quantity: item.quantity,
    color: item.color ??          // ưu tiên màu lưu trong cart
      (item.productId.color ?? ""),
    storage: item.storage ??          // ưu tiên dung lượng lưu trong cart
      (item.productId.ram ?? "")
  }));

  return res.status(200).json({
    data: {
      ...cart,
      items: itemsWithVariant
    }
  });
});


// Xóa toàn bộ giỏ hàng của user
server.delete("/carts/:id", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const userId = req.user.id;      // userId lấy từ token
  const cartIndex = db.carts.findIndex(c => c.userId == userId);

  if (cartIndex >= 0) {
    // Nếu có giỏ thì xóa entry
    db.carts.splice(cartIndex, 1);
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    return res.status(200).json({ message: "Giỏ hàng đã được xóa" });
  } else {
    // Nếu không có giỏ, vẫn trả về 200 OK để client khỏi báo lỗi
    return res.status(200).json({ message: "Giỏ hàng đã trống" });
  }
});



// Route đặt hàng
// Route đặt hàng
// ORDERS (thay thế)
server.post("/orders", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const userId = req.user.id;
  const data = req.body;

  if (!Array.isArray(data.items) || data.items.length === 0)
    return res.status(400).json({ error: "Thiếu danh sách sản phẩm (items)" });
  if (!data.orderCode)
    return res.status(400).json({ error: "Thiếu mã đơn hàng (orderCode)" });

  const newOrder = {
    id: GetMaxID("orders") + 1,
    userId,
    ...data,
    items: data.items.map(it => ({
      productId: typeof it.productId === "object" ? it.productId.id : it.productId,
      productName: it.productName,
      quantity: it.quantity,
      price: it.price,
      color: it.color || "",
      storage: it.storage || "",
    })),
  };

  // 🔥 TRỪ SỐ LƯỢNG BIẾN THỂ
  for (let item of newOrder.items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) continue;

    const variant = (product.variants || []).find(
      v =>
        v.color?.toLowerCase() === item.color?.toLowerCase() &&
        v.ram?.toLowerCase() === item.storage?.toLowerCase()
    );

    if (variant) {
      if (variant.quantity < item.quantity) {
        return res.status(400).json({
          message: `Không đủ hàng: ${product.name} - ${variant.ram}/${variant.color}`,
        });
      }
      variant.quantity -= item.quantity;
    } else {
      return res.status(400).json({
        message: `Không tìm thấy biến thể cho sản phẩm: ${product.name}`,
      });
    }
  }

  db.orders.push(newOrder);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  return res.status(201).json({ message: "Đặt hàng thành công!", data: newOrder });
});


server.get("/orders/user/:userId", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const userId = req.user.id;
  const myOrders = (db.orders || []).filter(o => o.userId === userId);
  return res.status(200).json(myOrders);
});

server.get("/orders/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const order = db.orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  res.json(order);
});

// Bạn có thể thêm các route còn lại tại đây như carts, users, comments, contacts, news...




///////

// server.post("/checkout", Permission, (req, res) => {
//   const db = getDB();
//   const { items } = req.body; // danh sách sản phẩm [{ productId, soluong }]

//   for (let item of items) {
//     const product = db.products.find((p) => p.id === item.productId);
//     if (!product) {
//       return res.status(400).json({ message: `Không tìm thấy sản phẩm ID ${item.productId}` });
//     }
//     if (product.stock < item.soluong) {
//       return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng` });
//     }
//     product.stock -= item.soluong;
//   }

//   saveDB(db);
//   return res.status(200).json({ message: "Đã mua hàng, đã trừ số lượng" });
// });

// // Hàm huỷ hàng - cộng lại số lượng
// server.patch("/cancel/:orderId", Permission, (req, res) => {
//   const db = getDB();
//   const order = db.orders.find((o) => o.id === req.params.orderId);

//   if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
//   if (order.status !== "Chờ xác nhận") {
//     return res.status(400).json({ message: "Chỉ được huỷ đơn hàng khi đang chờ xác nhận" });
//   }

//   for (let item of order.items) {
//     const product = db.products.find((p) => p.id === item.productId);
//     if (product) {
//       product.stock += item.soluong;
//     }
//   }

//   order.status = "Đã huỷ";
//   saveDB(db);
//   return res.status(200).json({ message: "Đơn hàng đã huỷ, đã cộng lại số lượng" });
// });


// Xử lý khi thêm bình luận mới
server.post("/comments", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { text, userId } = req.body;

  const newComment = {
    id: GetMaxID("comments") + 1,
    text: text,
    userId: userId,
    status: false,  // Mặc định trạng thái là false khi thêm mới
    createdAt: new Date().toISOString(),
  };

  db.comments.push(newComment);

  // Lưu lại db.json
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json(newComment);
});



// Custom API để sửa trạng thái
server.patch('/comments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'utf8'));

  const comment = db.comments.find(c => c.id === parseInt(id));

  if (comment) {
    comment.status = status;
    fs.writeFileSync(path.resolve(__dirname, 'db.json'), JSON.stringify(db, null, 2));
    res.json(comment);
  } else {
    res.status(404).send({ error: 'Bình luận không tồn tại' });
  }
});

server.post("/contacts", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

  const newContact = {
    id: GetMaxID("contacts") + 1,
    ...req.body,
    date: new Date().toISOString(), // Ghi ngày tạo
  };

  db.contacts = db.contacts || []; // đảm bảo tồn tại mảng contacts
  db.contacts.push(newContact);

  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json(newContact);
});

server.get("/contacts", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  db.contacts = db.contacts || []; // nếu mảng chưa tồn tại

  res.status(200).json(db.contacts);
});

server.delete("/contacts/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { id } = req.params;

  db.contacts = db.contacts?.filter(contact => contact.id != id) || [];

  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(200).json({ message: "Xóa liên hệ thành công" });
});


/// sửa lý đăng nhập 
server.post("/users/login", (req, res) => {
  const { email, password } = req.body;
  const db = JSON.parse(fs.readFileSync("db.json", "utf8"));
  const user = db.users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "Email không tồn tại" });
  }

  const isMatch = bcrypt.compareSync(password, user.password); // so sánh hash
  if (!isMatch) {
    return res.status(400).json({ message: "Mật khẩu không đúng" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, "secret_key", {
    expiresIn: "1d",
  });

  res.status(200).json({ user, token });
});

/// register 
server.post("/users/register", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf8"));
  const { email, password, name, role = "user", active = true } = req.body;

  // Kiểm tra trùng email
  const existed = db.users.find((u) => u.email === email);
  if (existed) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: GetMaxID("users") + 1,
    email,
    password: hashedPassword,
    name,
    role,
    active,
  };

  db.users.push(newUser);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf8");

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, "secret_key", {
    expiresIn: "1d",
  });

  res.status(201).json({ user: newUser, token });
});

server.get("/news", (req, res) => {
  const { news } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  res.status(200).json(news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});







/// DÒNG NÀY LUÔN LUÔN NẰM CUỐI TRANG NHA LÀM THÌ LÀM THÊM TRÊN NÀY NHA ^
server.use(router);
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
   console.log(`📌 Tạo mới collection: POST http://localhost:${port}/create-collection`);
  GetEndpoint(); // <- thêm dòng này
});


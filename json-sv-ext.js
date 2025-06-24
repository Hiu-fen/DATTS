import jsonServer from "json-server"
import auth from "json-server-auth"; 
import {jwtDecode} from "jwt-decode"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

import fs from "fs"
server.use(middlewares);
server.use(jsonServer.bodyParser);
const port = 4000;
server.db = router.db
server.use(auth)
// Hàm xử lý logic
const GetMaxID = (collection) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const data = db[collection];
  if (!data || data.length === 0) {
    return 0; 
  }
  const max = Math.max(...data.map(item => item.id));
  return max;
};
const GetInfoById = (id,collection)=>{
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const data = db[collection];
  return data.filter(item=>item.id==id).shift()
}
const GetInfoVariantProduct = (product)=>{
  if (product?.variant){
    const variant = product.variant.map(item=>{
      const info = GetInfoById(item.type,"variants")
      info.items = undefined
      return {...item, type:info}
    })
    return {...product,variant}
  }
  else return product
}
const Permission = (req,res,next)=>{
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Vui lòng đăng nhập" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwtDecode(token);
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const user = db.users.find((u) => u.email === decoded.email);
    if (!user) {
      return res.status(404).json({error:"Không tìm thấy user"});
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Token không đúng, vui lòng đăng nhập"+error });
  }
}
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
server.post("/products", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const newProduct = {
    id: GetMaxID("products") + 1,
    ...req.body,
    // Respect type and parent from client, with defaults if not provided
    type: req.body.type || "simple",
    parent: req.body.parent || 0,
  };

  // Remove any unexpected fields
  delete newProduct.variants;

  db.products = [...db.products, newProduct];
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json(newProduct);
});

server.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { products } = db;
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Xác định type hợp lệ dựa trên req.body.type
  const validTypes = ["simple", "variable", "variation"];
  const currentProduct = products[index];
  let newType = currentProduct.type; // Giữ nguyên type hiện tại nếu không có thay đổi

  if (req.body.type && validTypes.includes(req.body.type)) {
    newType = req.body.type;
  } else if (!req.body.type) {
    // Nếu client không gửi type, giữ nguyên type hiện tại
    newType = currentProduct.type;
  } else {
    // Nếu type không hợp lệ, trả về lỗi
    return res.status(400).json({ error: "Invalid product type" });
  }

  // Kiểm tra logic cho biến thể
  const newParent = req.body.parent !== undefined ? Number(req.body.parent) : currentProduct.parent || 0;
  if (newType === "variation" && newParent === 0) {
    return res.status(400).json({ error: "Variation product must have a parent ID" });
  }
  if (newType !== "variation" && newParent !== 0) {
    return res.status(400).json({ error: "Only variation products can have a parent ID" });
  }

  const updatedProduct = {
    ...currentProduct,
    ...req.body,
    type: newType,
    parent: newParent,
  };

  // Xóa các trường không mong muốn
  delete updatedProduct.variants;

  db.products[index] = updatedProduct;
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(200).json(updatedProduct);
});

server.get("/products", (req, res) => {
  const { products } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const result = products.filter(item => item.parent === 0).map(item => {
const children = products.filter(child => child.parent === item.id && child.type === "variation");

    if (children.length > 0) {
      const pricearr = children.map(child => child.price);
      return {
        ...item,
        price: pricearr.length > 1 ? `${Math.min(...pricearr)}-${Math.max(...pricearr)}` : Math.min(...pricearr),
        variants: children,
      };
    }
    return item;
  });
  res.status(200).send(result);
});

server.get("/products/:id", (req, res) => {
  const { products } = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const { id } = req.params;
  const product = products.find(item => item.id == id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const children = products.filter(child => child.parent == id && child.type === "variation");

  if (children.length > 0) {
    // Gán vào field phụ, KHÔNG đụng đến price gốc
    product.variants = children;
    product.priceRange = children.length > 1
      ? `${Math.min(...children.map(c => c.price))}-${Math.max(...children.map(c => c.price))}`
      : children[0].price;
  }

  res.status(200).json(product);
});

server.delete("/products/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const {products} = db;
  const {id} = req.params
  const newproducts = products.filter(item=>item.id!=id).filter(item=>item.parent!=id)
  db.products = [...newproducts]
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(200).json({message:"Delete success!"});
})
const GetEndpoint = () => {
  const db = router.db; // Truy cập database json-server
  const endpoints = Object.keys(db.getState()).map((key) => ({
    url: `http://localhost:${port}/${key}`,
  }));

  console.log(`Danh sách các Endpoint:`,endpoints);
}
// Cart
server.post("/carts",Permission,(req,res)=>{
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const {id:userId} = req.user
  const {productId,quantity} = req.body
  const index = db.carts.findIndex(item => item.userId ==userId);
  if (index==-1){
     const newcart = {
      id:GetMaxID("carts")+1,
      userId: userId,
      Items:[{productId,quantity}]
     }
     db.carts = [...db.carts,newcart]
     fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
     res.status(200).json({message:"Thêm giỏ hàng thành công!",data:newcart}); 
  }
  else {
    const item = db.carts[index].Items.filter(item=>item.productId==productId)
    if (item.length>0){
      db.carts[index].Items = db.carts[index].Items.map(item=>(item.productId==productId)?{...item,quantity:Number(item.quantity)+Number(quantity)}:item)
    }
    else {
      db.carts[index].Items = [...db.carts[index].Items,{productId,quantity}]
    }
    const data = {...db.carts[index]}
     fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
     res.status(201).json({message:"Thêm giỏ hàng thành công!",data}); 
  }
})
server.get("/carts",Permission,(req,res)=>{
  const {carts} = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const {id:userId} = req.user
  const cartByUser = carts.filter(item=>item.userId ==userId).shift()
  if (!userId) {
    res.status(404).json({message:"Chưa đăng nhập!"}); 
  }
  if (!cartByUser){
    res.status(404).json({message:"Chưa có sản phẩm nào trong giỏ hàng!"}); 
  }
  cartByUser.Items = cartByUser.Items.map(item=>{
    return {...item,productId:GetInfoVariantProduct(GetInfoById(item.productId,"products"))}
  })
  res.status(200).json({data:cartByUser}); 
})
server.put("/carts",Permission,(req,res)=>{
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const {id:userId} = req.user
  const {items} = req.body
  const index = db.carts.findIndex(item => item.userId ==userId); 
  db.carts[index]= {...db.carts[index],Items:items}
  res.status(200).json({data:db.carts[index],message:"Cập nhật thành công"}); 
})
server.post("/orders", Permission, (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const userId = req.user.id; // ✅ Lấy từ token decode sẵn

  const index = db.carts.findIndex(item => item.userId == userId);

  const data = req.body;
  if (!data.items || !Array.isArray(data.items)) {
    return res.status(400).json({ error: "Thiếu danh sách sản phẩm (items)" });
  }

  const itemOrder = data.items.map(item => item.productId);
  const orderSet = new Set(itemOrder);

  if (index >= 0) {
    const newItemCart = db.carts[index].Items.filter(item => {
      return !orderSet.has(item.productId);
    });
    db.carts[index].Items = [...newItemCart];
  }

  data.items = data.items.map(item => {
    return {
      ...item,
      productId: GetInfoVariantProduct(GetInfoById(item.productId, "products")),
    };
  });

  const newOrder = {
    id: GetMaxID("orders") + 1,
    userId, // ✅ Thêm userId vào đơn hàng
    ...data,
  };

  db.orders = [...db.orders, newOrder];
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json({ message: "Đặt hàng thành công!", data: newOrder });
});

server.use(router);
server.listen(port, () => {
  console.log(`Endpoint: http://localhost:${port}`);
  console.log(`Tạo mới collection: http://localhost:${port}/create-collection =>Method: POST`);  
  GetEndpoint()
});
// POST để tạo bình luận mới
server.post("/comments", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const newComment = {
    id: GetMaxID("comments") + 1, // Lấy ID tối đa và cộng thêm 1
    ...req.body,
    status: false,  // Trạng thái mặc định là false
  };

  db.comments.push(newComment);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
  res.status(201).json(newComment); // Trả về bình luận vừa tạo
});

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


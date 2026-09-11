# Key Craft — Express.js & MongoDB Atlas Backend 🚀

โครงสร้าง Backend มาตรฐานระดับ Production สำหรับเว็บแอปพลิเคชัน **Key Craft** จัดการคำสั่งซื้อ (Orders), การชำระเงิน (Payments), สินค้า (Products) และการเข้าสู่ระบบด้วย Google (OAuth 2.0).

---

## 📁 โครงสร้างโฟลเดอร์ (Backend Architecture)

```
server/
├── config/
│   └── db.js                 # เชื่อมต่อกับ MongoDB Atlas ผ่าน Mongoose
├── controllers/
│   ├── authController.js     # ระบบ Login, Register, Google OAuth 2.0
│   ├── orderController.js    # จัดการ Order และ Lifecycle Status (6 ขั้นตอน)
│   ├── paymentController.js  # สร้าง PromptPay Dynamic QR & ตรวจสอบสลิป
│   └── productController.js  # ดึงข้อมูลสินค้าและสเปกคีย์บอร์ด
├── models/
│   ├── User.js               # โครงสร้างตารางผู้ใช้งาน + Bcrypt Hash
│   ├── Order.js              # โครงสร้างตารางคำสั่งซื้อ + สถานะจัดส่ง
│   └── Product.js            # โครงสร้างตารางสินค้า
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── orderRoutes.js        # /api/orders
│   ├── paymentRoutes.js      # /api/payment
│   └── productRoutes.js      # /api/products
├── middlewares/
│   ├── authMiddleware.js     # ตรวจสอบ JWT Bearer Token
│   └── errorHandler.js       # จัดการ Error 404 และ Server 500
├── .env.example              # ตัวอย่างการตั้งค่า Environment Variables
├── package.json              # รายการ Dependencies
└── server.js                 # Entrypoint หลักของ Express Server
```

---

## 🛠️ ขั้นตอนการเริ่มใช้งาน Backend (Setup Guide)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์ `server`:
```bash
cd server
npm install
```

### 2. ตั้งค่าไฟล์ `.env`
สร้างไฟล์ `.env` ในโฟลเดอร์ `server` โดยคัดลอกมาจาก `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/keycraft?retryWrites=true&w=majority
JWT_SECRET=super_secret_key_craft_jwt_token_2026_dev
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
PROMPTPAY_ACCOUNT_ID=0812345678
```

> **💡 วิธีรับ MongoDB Atlas URI:**
> 1. ไปที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) และสมัครสมาชิกฟรี
> 2. สร้าง Free Shared Cluster (M0 Sandbox ฟรีตลอดชีพ)
> 3. กดปุ่ม **Connect** $\rightarrow$ **Drivers (Node.js)**
> 4. คัดลอก Connection String มาวางในช่อง `MONGODB_URI`

### 3. รัน Server
```bash
# โหมดพัฒนา (Auto-reload ด้วย nodemon)
npm run dev

# โหมด Production
npm start
```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — สมัครสมาชิกใหม่
* `POST /api/auth/login` — เข้าสู่ระบบด้วย Email/Password
* `POST /api/auth/google` — เข้าสู่ระบบด้วย Google ID Token

### 📦 Orders (`/api/orders`)
* `POST /api/orders` — สร้างคำสั่งซื้อใหม่พร้อมสเปกคีย์บอร์ด
* `GET /api/orders` — ดึงรายการคำสั่งซื้อทั้งหมด
* `GET /api/orders/:id` — ดึงรายละเอียดคำสั่งซื้อเดี่ยว
* `PATCH /api/orders/:id/status` — อัปเดตสถานะคำสั่งซื้อ (เช่น `machining`, `soldering_lubing`, `in_transit`)
* `DELETE /api/orders/:id` — ยกเลิกคำสั่งซื้อ

### 💳 Payments (`/api/payment`)
* `POST /api/payment/promptpay/generate` — สร้าง Dynamic QR Code พร้อมเพย์ตามยอดเงินจริง
* `POST /api/payment/verify-slip` — ตรวจสอบสถานะการชำระเงิน

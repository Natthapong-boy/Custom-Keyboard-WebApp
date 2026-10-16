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
PROMPTPAY_ACCOUNT_ID=<PromptPay phone number or national ID registered to the shop>
SLIPOK_URL=<SlipOK verification endpoint>
SLIPOK_API_KEY=<SlipOK API key>
```

> **💡 วิธีรับ MongoDB Atlas URI:**
> 1. ไปที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) และสมัครสมาชิกฟรี
> 2. สร้าง Free Shared Cluster (M0 Sandbox ฟรีตลอดชีพ)
> 3. กดปุ่ม **Connect** $\rightarrow$ **Drivers (Node.js)**
> 4. คัดลอก Connection String มาวางในช่อง `MONGODB_URI`

> **💳 PromptPay:** ตั้ง `PROMPTPAY_ACCOUNT_ID` เป็นเบอร์โทรศัพท์ เลขประจำตัว หรือ e-Wallet ID ที่ลงทะเบียนกับ PromptPay ของร้านจริง ระบบใช้ค่านี้สร้าง QR ส่วน `log: true` ให้ SlipOK ตรวจบัญชีรับเงินที่ผูกกับสาขา API เอง เนื่องจาก SlipOK ปิดบังเลข PromptPay ที่ส่งกลับไป จึงไม่สามารถเทียบเลขเต็มจาก response ได้
>
> **🔎 SlipOK:** ตั้ง `SLIPOK_URL` เป็น endpoint ของสาขา เช่น `https://api.slipok.com/api/line/apikey/<branch-id>` และ `SLIPOK_API_KEY` เป็น API key สำหรับส่งใน header การเปิด endpoint ใน browser เป็น GET ไม่ใช่วิธีทดสอบ API ซึ่งรับคำขอ POST จากระบบ

### Product Image Storage
Product images uploaded from the admin page are stored in MongoDB GridFS and served through `GET /api/products/images/:id`. They are not written into `public/images`. On backend startup, previously uploaded timestamped images referenced by products are migrated to GridFS and their generated local files are removed after the database references are updated. Seed images under `public/images` remain static assets.

### 3. รัน Server
```bash
# โหมดพัฒนา (Auto-reload ด้วย nodemon)
npm run dev

# โหมด Production
npm start
```

### สร้างบัญชีเจ้าของร้านคนแรก
ลงทะเบียนบัญชีผ่านหน้าเว็บก่อน หรือกำหนดข้อมูลบัญชีเจ้าของใน `server/.env` โดยใช้ `OWNER_NAME`, `OWNER_EMAIL` และ `OWNER_PASSWORD` (รหัสผ่านอย่างน้อย 12 ตัวอักษร) จากนั้นรัน:
```bash
npm run create-owner
```
คำสั่งนี้จะสร้างบัญชีเจ้าของใหม่หากยังไม่มีเจ้าของ หรือหากมีเจ้าของแล้ว จะตั้งรหัสผ่านใหม่ให้ได้เฉพาะเมื่อ `OWNER_EMAIL` ตรงกับอีเมลของเจ้าของเดิมเท่านั้น (ไม่เปลี่ยนอีเมลหรือข้อมูลอื่น) หากต้องการสร้างเจ้าของจากบัญชีเดิมที่ยังไม่ใช่เจ้าของ ต้องใช้อีเมลและรหัสผ่านปัจจุบันของบัญชีนั้น หลังสำเร็จให้นำค่า `OWNER_PASSWORD` ออกจาก `.env` แล้วเข้าสู่ระบบด้วยอีเมล/รหัสผ่านที่ตั้งไว้ จากหน้าเจ้าของสามารถกำหนดสิทธิ์พนักงานได้

การอ่านรายชื่อผู้ใช้และการเปลี่ยน role ถูกจำกัดไว้สำหรับเจ้าของ (`owner`) หรือ CEO (`ceo`) ที่ผ่านการยืนยัน JWT เท่านั้น

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — สมัครสมาชิกใหม่
* `POST /api/auth/login` — เข้าสู่ระบบด้วย Email/Password
* `POST /api/auth/google` — เข้าสู่ระบบด้วย Google ID Token

### 📦 Orders (`/api/orders`)
* `POST /api/orders` — สร้างคำสั่งซื้อใหม่พร้อมสเปกคีย์บอร์ด
* `GET /api/orders` — ลูกค้าเห็นเฉพาะคำสั่งซื้อของบัญชีตนเอง; พนักงานและเจ้าของเห็นรายการทั้งหมด
* `GET /api/orders/:id` — ดึงรายละเอียดคำสั่งซื้อที่บัญชีมีสิทธิ์เข้าถึง
* `PATCH /api/orders/:id/status` — อัปเดตสถานะคำสั่งซื้อ (เช่น `machining`, `soldering_lubing`, `in_transit`)
* `DELETE /api/orders/:id` — ยกเลิกคำสั่งซื้อ

### 💳 Payments (`/api/payment`)
* `POST /api/payment/promptpay/generate` — สร้าง Dynamic QR Code พร้อมเพย์ตามยอดเงินจริง
* `POST /api/payment/verify-slip` — ตรวจสอบสถานะการชำระเงิน

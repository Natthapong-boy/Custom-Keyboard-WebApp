import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Product from '../models/Product.js'

await connectDB()

const defaultCases = [
  {
    name: 'Aluminum Case - Black (ดำ)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1890,
    stock: 25,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'Aluminum',
    image: '/images/case-aluminum-black.svg',
    description: 'เคสอลูมิเนียม CNC 6063 ชุบอโนไดซ์สีดำ สัมผัสแน่น เสียง Deep Clack หรูหราพรีเมียม'
  },
  {
    name: 'Aluminum Case - Silver (เงิน)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1890,
    stock: 25,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'Aluminum',
    image: '/images/case-aluminum-silver.svg',
    description: 'เคสอลูมิเนียม CNC 6063 ชุบอโนไดซ์สีเงิน Sandblasted สัมผัสหรูหรา เสียง Clack คมชัด'
  },
  {
    name: 'Aluminum Case - Navy (กรมท่า)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1990,
    stock: 20,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'Aluminum',
    image: '/images/case-aluminum-navy.svg',
    description: 'เคสอลูมิเนียม CNC 6063 สีน้ำเงินเข้มขรึม Deep Navy สไตล์ผู้บริหาร เรียบหรู'
  },
  {
    name: 'Aluminum Case - Maroon (แดงเข้ม)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1990,
    stock: 20,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'Aluminum',
    image: '/images/case-aluminum-maroon.svg',
    description: 'เคสอลูมิเนียม CNC 6063 สีไวน์แดงเบอร์กันดี เมทัลลิกเงางาม มีเสน่ห์เฉพาะตัว'
  },
  {
    name: 'Polycarbonate (PC) Case - Frosted White (ขาวขุ่น)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1290,
    stock: 30,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'PC',
    image: '/images/case-pc-frosted.svg',
    description: 'เคส Polycarbonate โปร่งแสง สีขาวขุ่น สัมผัสนุ่มนวล ซับแรงดีเยี่ยม เสียง Thock ทุ้มละมุน'
  },
  {
    name: 'Polycarbonate (PC) Case - Clear (ใส)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1290,
    stock: 30,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'PC',
    image: '/images/case-pc-clear.svg',
    description: 'เคส Polycarbonate ใส Crystal Clear โชว์แผงวงจรและแสงไฟ RGB 360 องศาสว่างสดใส'
  },
  {
    name: 'Polycarbonate (PC) Case - Translucent Purple (ม่วงใส)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1390,
    stock: 25,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'PC',
    image: '/images/case-pc-purple.svg',
    description: 'เคส Polycarbonate สีม่วงใส นีออนไซเบอร์พังก์ เล่นกับไฟคีย์บอร์ดได้อย่างลงตัว'
  },
  {
    name: 'ABS Plastic Case - Retro Beige (เบจคลาสสิก)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 890,
    stock: 35,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'ABS',
    image: '/images/case-abs-beige.svg',
    description: 'เคสพลาสติก ABS สีเบจเรโทร สไตล์คลาสสิกวินเทจยุค 90s พิมพ์สบาย น้ำหนักเบา'
  },
  {
    name: 'ABS Plastic Case - Matte White (ขาวด้าน)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 890,
    stock: 35,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'ABS',
    image: '/images/case-abs-white.svg',
    description: 'เคสพลาสติก ABS สีขาวด้าน คลีนมินิมอล โทนสะอาดตา จับคู่กับคีย์แคปได้หลากหลาย'
  },
  {
    name: 'ABS Plastic Case - Matte Black (ดำด้าน)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 890,
    stock: 35,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'ABS',
    image: '/images/case-abs-black.svg',
    description: 'เคสพลาสติก ABS สีดำด้าน ดุดัน ทรงเรียบหรู ดูแลรักษาง่าย ไม่เป็นรอยนิ้วมือง่าย'
  },
  {
    name: 'Solid Wood Case - Walnut (ไม้วอลนัท)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1690,
    stock: 20,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'Wood',
    image: '/images/case-wood-walnut.svg',
    description: 'เคสไม้แท้วอลนัทธรรมชาติ ขัดเงาผิวสัมผัสนุ่มนวล ลายไม้เอกลักษณ์เฉพาะตัว เสียงกังวานอบอุ่น'
  },
  {
    name: 'Solid Wood Case - Rosewood (ไม้โรสวูด)',
    category: 'Case Material & Color',
    brand: 'Key Craft Labs',
    price: 1790,
    stock: 20,
    inStock: true,
    layout: 'Universal',
    partType: 'case',
    caseMaterial: 'Wood',
    image: '/images/case-wood-rosewood.svg',
    description: 'เคสไม้แท้โรสวูด สีน้ำตาลอมแดงเข้ม ทรงคุณค่า ทนทาน ลายไม้ละเอียดพรีเมียม'
  }
]

// Delete any existing cases with category 'Case Material & Color' to avoid duplicates
await Product.deleteMany({ category: 'Case Material & Color' })

const inserted = await Product.insertMany(defaultCases)
console.log(`✅ Seeded ${inserted.length} case products into "Case Material & Color"!`)

const allCases = await Product.find({ category: 'Case Material & Color' })
allCases.forEach(c => console.log(`- ${c.name} [${c.caseMaterial}] (฿${c.price})`))

await mongoose.disconnect()

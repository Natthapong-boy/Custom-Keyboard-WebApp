import Product from '../models/Product.js'

export async function seedDefaults() {
  try {
    const switchCount = await Product.countDocuments({ category: 'Switches' })
    if (switchCount === 0) {
      console.log('🌱 [Seed] Category "Switches" is empty. Seeding default switches...')
      const defaultSwitches = [
        {
          name: 'Red Switch',
          category: 'Switches',
          brand: 'Key Craft Labs',
          price: 0,
          stock: 50,
          inStock: true,
          image: '/images/key1.jpg',
          layout: 'N/A',
          partType: 'switch',
          switchType: 'Linear (Red)',
          switchSound: 'linear',
          switchFeel: 'กดลื่น เสียงเบา',
          switchOperatingForce: '45 ± 15 gf',
          switchPreTravel: '2.0mm',
          switchTotalTravel: '4.0mm',
          switchSoundTone: 'Smooth Linear (เสียงเบานุ่ม)',
          switchLubed: false,
          description: 'สวิตช์จังหวะเดียว สัมผัสลื่นมือ ไร้แรงต้าน เสียงเงียบนุ่มนวล ตอบสนองฉับไว เหมาะสำหรับเล่นเกม Fast-Paced และทำงาน'
        },
        {
          name: 'Black Switch',
          category: 'Switches',
          brand: 'Key Craft Labs',
          price: 150,
          stock: 50,
          inStock: true,
          image: '/images/key1.jpg',
          layout: 'N/A',
          partType: 'switch',
          switchType: 'Linear (Black)',
          switchSound: 'linear',
          switchFeel: 'กดลื่น เสียงเบา',
          switchOperatingForce: '60 ± 15 gf',
          switchPreTravel: '2.0mm',
          switchTotalTravel: '4.0mm',
          switchSoundTone: 'Deep Linear (ทุ้มแน่น หนักแน่น)',
          switchLubed: false,
          description: 'สวิตช์ Linear น้ำหนักกดแน่น มั่นคง ป้องกันการกดพลาด เหมาะสำหรับผู้ชอบสวิตช์หนัก'
        },
        {
          name: 'Yellow Switch',
          category: 'Switches',
          brand: 'Key Craft Labs',
          price: 250,
          stock: 50,
          inStock: true,
          image: '/images/key1.jpg',
          layout: 'N/A',
          partType: 'switch',
          switchType: 'Linear (Yellow)',
          switchSound: 'thock',
          switchFeel: 'กดลื่น เสียงเบา',
          switchOperatingForce: '50 ± 15 gf',
          switchPreTravel: '2.0mm',
          switchTotalTravel: '4.0mm',
          switchSoundTone: 'Creamy Thock (ลื่นละมุน ทุ้มเบา)',
          switchLubed: false,
          description: 'สวิตช์น้ำหนักกดสมดุลกำลังดี ลื่นไหลสบายมือต่อเนื่อง ลดอาการเมื่อยล้า'
        },
        {
          name: 'Brown Switch',
          category: 'Switches',
          brand: 'Key Craft Labs',
          price: 150,
          stock: 50,
          inStock: true,
          image: '/images/key1.jpg',
          layout: 'N/A',
          partType: 'switch',
          switchType: 'Tactile (Brown)',
          switchSound: 'soft',
          switchFeel: 'มีแรงต้าน เสียงปานกลาง',
          switchOperatingForce: '55 ± 10 gf',
          switchPreTravel: '2.0mm',
          switchTotalTravel: '4.0mm',
          switchSoundTone: 'Gentle Bump (เสียงปานกลาง นุ่มหู)',
          switchLubed: false,
          description: 'สวิตช์ 2 จังหวะยอดนิยม มีแรงต้านสะดุดนิ้วเบาๆ ยืนยันจังหวะพิมพ์ พิมพ์สนุก'
        },
        {
          name: 'Blue Switch',
          category: 'Switches',
          brand: 'Key Craft Labs',
          price: 0,
          stock: 50,
          inStock: true,
          image: '/images/key1.jpg',
          layout: 'N/A',
          partType: 'switch',
          switchType: 'Clicky (Blue)',
          switchSound: 'click',
          switchFeel: 'เสียงคลิกดังชัดเจน',
          switchOperatingForce: '60 ± 15 gf',
          switchPreTravel: '2.2mm',
          switchTotalTravel: '4.0mm',
          switchSoundTone: 'Crisp Click (คลิกใส คมชัด)',
          switchLubed: false,
          description: 'สวิตช์ Clicky แท้ มีเสียงคลิกแหลมใส ชัดเจนทุกจังหวะ สไตล์คลาสสิกพิมพ์ดีด'
        },
        {
          name: 'Green Switch',
          category: 'Switches',
          brand: 'Key Craft Labs',
          price: 250,
          stock: 50,
          inStock: true,
          image: '/images/key1.jpg',
          layout: 'N/A',
          partType: 'switch',
          switchType: 'Clicky (Green)',
          switchSound: 'click',
          switchFeel: 'เสียงคลิกดังชัดเจน',
          switchOperatingForce: '70 ± 15 gf',
          switchPreTravel: '2.2mm',
          switchTotalTravel: '4.0mm',
          switchSoundTone: 'Heavy Loud Click (คลิกแน่น หนักแน่น)',
          switchLubed: false,
          description: 'สวิตช์ Clicky แรงต้านสูง เสียงคลิกดังสะใจ หนักแน่นทุกจังหวะสัมผัส'
        }
      ]
      await Product.insertMany(defaultSwitches)
      console.log('✅ [Seed] Successfully seeded default switches into database')
    }

    const keycapCount = await Product.countDocuments({ category: 'Keycaps' })
    if (keycapCount === 0) {
      console.log('🌱 [Seed] Category "Keycaps" is empty. Seeding default keycaps...')
      const defaultKeycaps = [
        { name: 'Lilac Dream (ม่วงพาสเทล)', category: 'Keycaps', price: 200, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคป PBT Dye-Sub ธีม Lilac Dream สีม่วงพาสเทล' },
        { name: 'Carbon Matrix (เทาดำ)', category: 'Keycaps', price: 300, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปโทนเทาดำ Carbon Matrix ลุคดุดัน พรีเมียม' },
        { name: 'Retro Cream (ครีมคลาสสิก)', category: 'Keycaps', price: 200, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปสีครีมคลาสสิก ย้อนยุคสไตล์วินเทจ' },
        { name: 'Cyberpunk Neon (นีออน)', category: 'Keycaps', price: 450, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปสีนีออนสไตล์ Cyberpunk โดดเด่นสะดุดตา' },
        { name: 'Kuro/Shiro (ขาวฟอนต์ญี่ปุ่น)', category: 'Keycaps', price: 350, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปสีขาวฟอนต์ซับญี่ปุ่น สไตล์มินิมอล' },
        { name: 'Pudding Black (พุดดิ้งดำ)', category: 'Keycaps', price: 200, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปทรงพุดดิ้งฐานโปร่งแสง ไฟ RGB ลอดผ่านสวยงาม' },
        { name: 'Side-Printed Gradient (ไล่สีเทา)', category: 'Keycaps', price: 400, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปสกรีนด้านข้างแบบไล่เฉดสี สะอาดตา' },
        { name: 'Vintage SA (เครื่องพิมพ์ดีดคลาสสิก)', category: 'Keycaps', price: 550, stock: 50, inStock: true, image: '/images/key1.jpg', description: 'คีย์แคปทรง SA โปรไฟล์สูง สไตล์เครื่องพิมพ์ดีดยุคคลาสสิก' }
      ]
      await Product.insertMany(defaultKeycaps)
      console.log('✅ [Seed] Successfully seeded default keycaps into database')
    }

    const accessoriesCount = await Product.countDocuments({ category: { $in: ['Plate Material', 'Accessories'] } })
    if (accessoriesCount === 0) {
      console.log('🌱 [Seed] Category "Plate Material" is empty. Seeding default plate accessories...')
      const defaultAccessories = [
        {
          name: 'FR4 Matte Black Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 200,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-fr4.svg',
          description: 'แผ่นเพลต FR4 ผิวด้านสีดำ สัมผัสยืดหยุ่นปานกลาง พิมพ์สนุก ไม่เมื่อยนิ้ว โทนเสียงกลมกล่อม (Balanced Thock)'
        },
        {
          name: 'Polycarbonate (PC) Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 250,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-pc.svg',
          description: 'แผ่นเพลต Polycarbonate โปร่งแสง สัมผัสยืดหยุ่นสูง ซับแรงได้ดี พิมพ์สบายนิ้ว โทนเสียงทุ้มละมุน (Thock)'
        },
        {
          name: 'POM Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 300,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-pom.svg',
          description: 'แผ่นเพลต POM สีขาวขุ่น สัมผัสลื่น ยืดหยุ่นนุ่มนวล ลดแรงสะท้อน โทนเสียงทุ้มลึก (Deep Thock)'
        },
        {
          name: 'CNC Aluminum Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 200,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-aluminum.svg',
          description: 'แผ่นเพลตอลูมิเนียม CNC ชุบอโนไดซ์ สัมผัสแน่น มั่นคง แม่นยำสูง โทนเสียงใส คมชัดสไตล์โมเดิร์น (Clack)'
        },
        {
          name: 'Polished Brass Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 450,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-brass.svg',
          description: 'แผ่นเพลตทองเหลืองขัดเงาพรีเมียม สัมผัสแข็งแกร่ง หนักแน่น โทนเสียงแหลมสูง กังวาน (High-Pitch Clack)'
        },
        {
          name: 'Carbon Fiber Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 350,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-carbon.svg',
          description: 'แผ่นเพลตคาร์บอนไฟเบอร์ลายทอ สัมผัสแข็งแรงแต่น้ำหนักเบา ไร้แรงสะเทือน โทนเสียงคมใส หนักแน่น (Crisp Clack)'
        },
        {
          name: 'Copper Plate (ทองแดง)',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 600,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-copper.svg',
          description: 'แผ่นเพลตทองแดงบริสุทธิ์ สัมผัสมั่นคง น้ำหนักถ่วงสูง พิมพ์สะใจ โทนเสียงแน่นหนา คมก้อง (Solid Clack)'
        },
        {
          name: 'Stainless Steel Plate',
          category: 'Plate Material',
          brand: 'Key Craft Labs',
          price: 350,
          stock: 50,
          inStock: true,
          layout: 'Universal',
          partType: 'plate',
          image: '/images/plate-steel.svg',
          description: 'แผ่นเพลตสแตนเลสสตีล สัมผัสแข็งสูงสุด มั่นคงไร้การยุบตัว โทนเสียงกังวานใส ชัดเจน (Bright Clack)'
        }
      ]
      await Product.insertMany(defaultAccessories)
      console.log('✅ [Seed] Successfully seeded default plate accessories into database')
    }

    const casesCount = await Product.countDocuments({ category: 'Case Material & Color' })
    if (casesCount === 0) {
      console.log('🌱 [Seed] Category "Case Material & Color" is empty. Seeding default keyboard cases...')
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
      await Product.insertMany(defaultCases)
      console.log('✅ [Seed] Successfully seeded default keyboard cases into database')
    }
  } catch (error) {
    console.error('⚠️ [Seed Error]:', error.message)
  }
}

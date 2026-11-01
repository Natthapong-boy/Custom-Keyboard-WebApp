/**
 * Master List of Product Categories for KeyCraft
 * Single source of truth across Admin forms and Storefront filters
 */

// 1. หมวดหมู่สินค้าสำหรับหลังบ้าน (Admin Form / Modal เพิ่ม-แก้ไขสินค้า)
// ตัด "Custom Keyboard" ออก เพื่อป้องกันการลงสินค้าผิดประเภท
// เพราะระบบประกอบเองจะไปทำงานผ่าน 3D Designer โดยตรง
export const ADMIN_PRODUCT_CATEGORIES = [
  {
    id: 'prebuilt_keyboard',
    value: 'Pre-built Keyboard',
    labelTh: 'คีย์บอร์ดสำเร็จรูป',
    labelEn: 'Pre-built Keyboard',
    display: 'คีย์บอร์ดสำเร็จรูป (Pre-built Keyboard)',
    icon: 'package',
    partType: 'keyboard',
    hasLayout: true
  },
  {
    id: 'case_material',
    value: 'Case Material & Color',
    labelTh: 'เคสคีย์บอร์ด',
    labelEn: 'Case Material & Color',
    display: 'เคสคีย์บอร์ด (Case Material & Color)',
    icon: 'box',
    partType: 'case',
    hasLayout: false
  },
  {
    id: 'plate_material',
    value: 'Plate Material',
    labelTh: 'เพลตซับเสียง',
    labelEn: 'Plate Material',
    display: 'เพลตซับเสียง (Plate Material)',
    icon: 'layers',
    partType: 'plate',
    hasLayout: false
  },
  {
    id: 'switches',
    value: 'Switches',
    labelTh: 'สวิตช์',
    labelEn: 'Switches',
    display: 'สวิตช์ (Switches)',
    icon: 'activity',
    partType: 'switch',
    hasLayout: false
  },
  {
    id: 'keycaps',
    value: 'Keycaps',
    labelTh: 'คีย์แคป',
    labelEn: 'Keycaps',
    display: 'คีย์แคป (Keycaps)',
    icon: 'palette',
    partType: 'keycap',
    hasLayout: false
  }
]

// 2. หมวดหมู่สินค้าสำหรับหน้าร้านค้า (Storefront)
// รวมทั้งปุ่มลิงก์ระบบประกอบเอง 3D Designer และหมวดหมู่อื่นๆ
export const PRODUCT_CATEGORIES = [
  {
    id: 'custom_keyboard',
    value: 'Custom Keyboard',
    labelTh: 'คีย์บอร์ดประกอบเอง',
    labelEn: 'Custom Keyboard',
    display: 'คีย์บอร์ดประกอบเอง (Custom Keyboard)',
    icon: 'keyboard',
    partType: 'keyboard',
    isDesignerLink: true,
    hasLayout: true
  },
  ...ADMIN_PRODUCT_CATEGORIES
]

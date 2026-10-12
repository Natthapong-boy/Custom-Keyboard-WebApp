export function prepareImageForUpload(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพ'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('อ่านไฟล์รูปภาพไม่สำเร็จ'))
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('รูปภาพไม่ถูกต้อง'))
        return
      }

      const image = new Image()
      image.onerror = () => reject(new Error('เปิดไฟล์รูปภาพไม่สำเร็จ'))
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'))
          return
        }

        try {
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          reject(new Error('ไม่สามารถบีบอัดรูปภาพได้'))
        }
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

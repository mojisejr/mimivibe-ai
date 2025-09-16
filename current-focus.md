# Current Focus

**Updated**: 2025-09-16 16:51:49

## ปรับปรุง Error Messages ในส่วน Ask หลัก

เน้นการแก้ไขเฉพาะส่วนของ ask ที่เป็นส่วนหลักก่อน โดยมุ่งเน้นที่:

### เป้าหมายหลัก
- ปรับปรุง error messages ให้ชัดเจนและเป็นมิตรกับผู้ใช้
- แทนที่ข้อความ "reading failed" ที่เป็นแบบทั่วไป
- เพิ่ม actionable suggestions ในแต่ละ error message
- ปรับปรุง error UI ให้แสดงข้อมูลที่เป็นประโยชน์มากขึ้น

### ขอบเขตการทำงาน
- มุ่งเน้นที่ `/ask` page และ API route `/api/readings/ask`
- ปรับปรุงการจัดการ error ในส่วนหลักก่อน
- สร้างระบบ error dictionary ที่เป็นมิตรกับผู้ใช้
- เพิ่มการแสดง error messages ที่ชัดเจนและมีประโยชน์

### สถานะปัจจุบัน
- วิเคราะห์ระบบ error handling ที่มีอยู่เสร็จแล้ว
- ออกแบบ error message dictionary เสร็จแล้ว
- พร้อมเริ่มการ implementation ในส่วนหลัก
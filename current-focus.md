# Current Focus - 2025-09-12 12:43:49

## ปัญหา Card Data Mismatch ระหว่าง cards และ selectedCards fields

### สถานการณ์ปัจจุบัน
- ผู้ใช้รายงานปัญหาการแสดงผล card images ใน AnimatedArticleDisplay component
- พบว่า component ใช้ `readingData.cards` แต่ควรใช้ `readingData.selectedCards`
- เพิ่งแก้ไขเปลี่ยนจาก `readingData.cards.map()` เป็น `readingData.selectedCards.map()` ใน desktop และ mobile card rendering

### ปัญหาที่พบ
1. **Data Structure Inconsistency**: API response มี 2 fields สำหรับ card data:
   - `cards`: simplified card objects จาก `reading.cards_reading` (imageUrl เป็น filename เช่น "the_magician.png")
   - `selectedCards`: complete database records (imageUrl เป็น full URL จาก Supabase)

2. **Image URL Issues**: 
   - `cards` field มี incomplete imageUrl ทำให้ต้องใช้ fallback logic ใน `getCardImageUrl()`
   - `selectedCards` field มี complete Supabase URLs ที่ทำงานได้ทันที

3. **Component Logic**: AnimatedArticleDisplay เดิมใช้ `cards` field ซึ่งไม่เหมาะสม

### การแก้ไขที่ทำ
- เปลี่ยน desktop cards rendering จาก `readingData.cards.map()` เป็น `readingData.selectedCards.map()`
- เปลี่ยน mobile cards rendering จาก `readingData.cards.map()` เป็น `readingData.selectedCards.map()`

### สิ่งที่ต้องติดตาม
- ตรวจสอบว่า TypeScript types เข้ากันหรือไม่
- ทดสอบการแสดงผล card images บน UI
- ตรวจสอบว่า card modal ทำงานปกติหรือไม่

### ข้อมูลเทคนิค
- **File แก้ไข**: `/src/app/ask/components/AnimatedArticleDisplay.tsx`
- **API Route**: `/src/app/api/readings/ask/route.ts` (lines 200, 204)
- **Workflow**: `/src/lib/langgraph/workflow-with-db.ts`
- **Types**: `/src/types/reading.ts`

### Data Structure ที่ควรใช้
```typescript
// ✅ ถูกต้อง - selectedCards มี complete data
readingData.selectedCards: {
  id: number,
  name: string,
  displayName: string,
  imageUrl: "https://...supabase.co/.../card.png", // Complete URL
  position: number,
  // ... other fields
}

// ❌ ไม่เหมาะสม - cards มี incomplete imageUrl  
readingData.cards: {
  id: number,
  name: string, 
  displayName: string,
  imageUrl: "the_magician.png", // Just filename
  // ... other fields
}
```
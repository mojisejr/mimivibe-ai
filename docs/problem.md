#Issue and Requirement on manual test by developer

##Issue and Requirement List

1. ตอนกด delete ที่ /history แล้ว ReadingCard ไม่หายไป update แต่ Review your past tarot readings and insights

Total readings: 0

ต้องไป tab อื่นแล้วกลับมาถึงจะ update

2. ถามจากในหน้า /ask แต่ไม่ได้กดบันทึก กด "ถามใหม่ แต่ บันทึกให้ และ ข้อมูลขึ้นใน history

3. การอ่านไพ่ ถ้าเกินเวลา 59 วินาที ให้ขึ้น ลองใหม่อีกครั้ง และ ไม่ตัดแต้ม (ตรงนี้สำคัญ เนื่องจากผมใช้ vercel hobbies อาจจะทำให้ เกิด error ที่ unhandled ได้ครับ)

4. บน navbar ขณะโหลด point indicator ไม่มี loading indicator ทำให้ menu เกิดอาการ เด้งไปมามีผลต่อ ux ควรจะแก้ไขส่วนนี้ให้ ux/ui ดีขึ้น

5. ใน block นี้ <div class="flex items-center justify-center space-x-4 mb-8" style="opacity: 1; transform: none;"><div class="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300"><span class="text-warning text-xl">⭐</span><span class="font-semibold text-base-content">5</span></div><div class="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-secondary/20 hover:shadow-2xl transition-all duration-300"><span class="text-secondary text-xl">🎁</span><span class="font-semibold text-base-content">1</span></div></div>
   ในหน้า /ask ไม่มี loading indicator เช่นกัน ทำให้ ui เกิดอาการ เด้ง แก้ไขส่วนนี้ด้วย

6. ในส่วน input box ที่เป็น text area ในหน้า /ask
   <textarea placeholder="เช่น: ความรักของฉันจะเป็นอย่างไรในช่วงนี้..." class="textarea w-full h-32 text-lg resize-none bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-neutral-content/60" maxlength="180"></textarea>
   อยากให้กด enter เพื่อเริ่มทำนายได้ด้วยครับ

7. เมื่อเกิดข้อผิดพลาด ตอนกด ลองใหม่อีกครั้งในหน้า /ask เหมือนว่าจะไม่มีการ หยิบไพ่ หรือ pickcard เกิดขึ้นใช่หรือเปล่า ตรงส่วนนี้ ต้องแก้ไข ครับถ้าใช่ เพราะ อาจจะทำให้การแสดงผลผิดพลาด ใช่หรือไม่ และหรือ อาจจะไม่สามารถ ส่งคำตอบได้ครับ

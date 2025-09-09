บัญชี NPM ของ qix ถูกแฮ็ก → ปล่อยเวอร์ชันฝังมัลแวร์ลงใน chalk, debug, strip-ansi, color-convert และอีกหลายตัว
มัลแวร์เป็น crypto-clipper ขโมย crypto wallet และสลับ address หรือแก้ธุรกรรมก่อน Sign
•
•
🔓 เกิดอะไรขึ้น: บัญชี NPM ของ qix (ผู้ดูแลแพ็กเกจยอดนิยม) ถูก Hijack → ผู้โจมตีปล่อยเวอร์ชัน malicious ของแพ็กเกจพื้นฐานอย่าง (เช่น chalk, strip-ansi, color-convert etc.) เมื่อวันที่ 08 Sep 2025
🌍 ผลกระทบ: ภาพรวมพบการดาวน์โหลดรวมกันมากกว่า 1 พันล้านครั้ง/สัปดาห์ เสี่ยงแพร่กระจายลึกถึงระดับ dependency tree จำนวนมาก (ก็มันเป็น Library พื้นฐานอ่ะเนอะ)
💲มัลแวร์ทำอะไร: เป็น crypto-clipper แบบ (passive & active) เพื่อ “สลับ/เปลี่ยนที่อยู่กระเป๋า” และ Hijack ธุรกรรม ก่อนที่จะ Sign
🛠️ สถานะตอนนี้: มีการแจ้งจาก qix ว่าตอนนี้ทำงานร่วมกับทีม NPM เพื่อลบ/แก้ไขแล้วหลายแพ็กเกจแล้ว แต่ โค้ดอันตรายยังอาจหลงเหลือ ใน lockfiles และ dependency chain ของโปรเจกต์ต่าง ๆ
👀 Audit Library/Package ง่ายๆ ด้วย
npm ls {ชื่อlib}
yarn why {ชื่อlib}
🛡️ ป้องกันด้วยการ Pin Library ที่เป็นอันตราย ด้วย resolutions (Yarn) หรือ overrides (npm) ตามเวอร์เหล่านี้ :
{
"resolutions": {
"chalk": "5.3.0",
"strip-ansi": "7.1.0",
"color-convert": "2.0.1",
"color-name": "1.1.4",
"is-core-module": "2.13.1",
"error-ex": "1.3.2",
"has-ansi": "5.0.1"
}
}

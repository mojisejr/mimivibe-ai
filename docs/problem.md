#Problem From Manual Tesing by developer
developer manual testing by run dev server and manually using the application and investigate if any problem and these are what we have found

##Error Logs
Unhandled Runtime Error
IntegrationError: In order to create a payment element, you must pass a clientSecret or mode when creating the Elements group.

e.g. stripe.elements({clientSecret: "{{CLIENT_SECRET}}"})

Call Stack
Go
https://js.stripe.com/basil/stripe.js (1:350419)
Ii
https://js.stripe.com/basil/stripe.js (1:400371)
new t
https://js.stripe.com/basil/stripe.js (1:406631)
t.<anonymous>
https://js.stripe.com/basil/stripe.js (1:429643)
t.create
https://js.stripe.com/basil/stripe.js (1:72216)
eval
node_modules/@stripe/react-stripe-js/dist/react-stripe.umd.js (870:1)

##Problem Description
error เกิดขึ้นหลังจากที่ได้ทดสอบ กด เพื่อซื้อ package ใน local dev server ครับ

##Addition Requirement
คุณจะช่วยผมวิเคราะห์ปัญหาที่เกิดขึ้น โดยวิเคราะห์ ทั้ง payment flow จากนั้น หากมีคำถามเพิ่มเติม หรือความต้องการ ข้อมูลเพิ่มเติมให้ ถามก่อน refactoring หรือ bug fixing ครับ
คุณจะวางแผนอย่างรอบคอบและ ทำตาม best practice
และ convention ของโปรเจคเสมอครับ

##Notice
ก่อนที่คุณจะแก้ไขส่วนต่างๆ ให้ตรวจเชคการทำงานก่อน ว่าเป็นไปตามความต้องการหรือยัง หากเป็นไปตามต้องการแล้ว ไม่ต้องแก่้ไข ให้แก้ **เฉพาะ** ส่วนที่ต้องแก้ไขเท่านั้น

#Issue On Vercel Build

##Error Message

> Build error occurred
> Error: Failed to collect page data for /api/campaigns/active

    at /vercel/path0/node_modules/next/dist/build/utils.js:1269:15
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {

type: 'Error'
}
Error: Command "npm run build" exited with 1

##Situation
เหตุการณ์เกิดขึ้นระหว่างการ build project บน vercel

##Requirement
แก้ไขปัญหานี้ และ ตรวจสอบปัญหา build on vercel ให้ครอบคลุม และตรวจสอบ build script ด้วยครับ ว่าตกหล่นตรงไหนหรือไม่

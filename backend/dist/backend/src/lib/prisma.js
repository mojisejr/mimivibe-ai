"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
function createPrismaInstance() {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return new client_1.PrismaClient({
        log: isDevelopment ? ['query', 'info', 'warn'] : ['warn', 'error'],
    });
}
exports.prisma = globalForPrisma.prisma ?? createPrismaInstance();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map
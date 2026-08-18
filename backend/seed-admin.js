"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = 'admin@srishtique.com';
        const plainPassword = 'Admin@123';
        const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, 10);
        const admin = yield prisma.user.upsert({
            where: { email },
            update: {
                role: 'SUPER_ADMIN',
                password: hashedPassword,
                isEmailVerified: true, // Auto-verify the seeded admin
            },
            create: {
                email,
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                isEmailVerified: true,
            },
        });
        console.log('Super Admin user created/updated successfully!');
        console.log('--------------------------------------------');
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${plainPassword}`);
        console.log(`Role: ${admin.role}`);
        console.log('--------------------------------------------');
        console.log('You can now log in with these credentials.');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));

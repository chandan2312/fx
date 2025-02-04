import { PrismaClient } from "@prisma/client";

// declare global {
//   var prisma: PrismaClient;
// }

let prisma;

if (process.env.NODE_ENV === "production") {
	prisma = global.prisma || new PrismaClient();
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	prisma = global.prisma;
}

export default prisma;

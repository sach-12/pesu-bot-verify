import { PrismaClient } from '@prisma/client';

// Singleton Prisma Client
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to MongoDB via Prisma successfully");
    return prisma;
  } catch (error) {
    console.error("Error connecting to MongoDB via Prisma:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("Disconnected from MongoDB via Prisma successfully");
  } catch (error) {
    console.error("Error disconnecting from MongoDB via Prisma:", error);
    throw error;
  }
};

export default prisma;
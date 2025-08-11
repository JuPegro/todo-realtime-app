import { PrismaService } from '@/common/services/prisma.service';

let prisma: PrismaService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

export { prisma };
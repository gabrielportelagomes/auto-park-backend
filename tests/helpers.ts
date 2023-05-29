import { prisma } from '../src/config';

export async function cleanDb() {
  await prisma.user.deleteMany({});
}

import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { prisma } from '../../src/config';

export async function createUser(params: Partial<User> = {}): Promise<User> {
  const incomingPassword =
    params.password ||
    faker.internet.password({
      length: 8,
      prefix: 'H9a',
    });
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);

  return prisma.user.create({
    data: {
      email: params.email || faker.internet.email(),
      password: hashedPassword,
    },
  });
}

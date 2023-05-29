import { Session } from '@prisma/client';
import { createUser } from './';
import { prisma } from '../../src/config';

export async function createSession(token: string): Promise<Session> {
  const user = await createUser();

  return prisma.session.create({
    data: {
      token: token,
      user_id: user.id,
    },
  });
}

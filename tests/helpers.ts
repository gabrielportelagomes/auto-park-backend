import * as jwt from 'jsonwebtoken';

import { prisma } from '../src/config';
import { createSession, createUser } from './factories';
import { User } from '@prisma/client';

export async function cleanDb() {
  await prisma.vehicleRegister.deleteMany({});
  await prisma.vehicleType.deleteMany({});
  await prisma.cashRegister.deleteMany({});
  await prisma.cashItem.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ user_id: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}

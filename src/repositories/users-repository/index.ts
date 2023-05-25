import { CreateUserParams } from 'protocols';
import { prisma } from '../../config';

async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

async function create(data: CreateUserParams) {
  return await prisma.user.create({
    data,
  });
}

const usersRepository = {
  findByEmail,
  create,
};

export default usersRepository;

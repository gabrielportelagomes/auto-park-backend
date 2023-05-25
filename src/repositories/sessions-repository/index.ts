import { CreateSessionParams } from '../../protocols';
import { prisma } from '../../config';

async function create(data: CreateSessionParams) {
  return prisma.session.create({
    data,
  });
}

const sessionsRepository = {
  create,
};

export default sessionsRepository;

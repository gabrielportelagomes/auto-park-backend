import bcrypt from 'bcrypt';

import usersRepository from '../../repositories/users-repository';
import { conflictError } from '../../errors';
import { CreateUserParams, SignUpResponse } from '../../protocols';

export async function createUser({ email, password }: CreateUserParams): Promise<SignUpResponse> {
  await validateUniqueEmailOrFail(email);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await usersRepository.create({ email, password: hashedPassword });

  return {
    id: user.id,
    email: user.email,
  };
}

async function validateUniqueEmailOrFail(email: string) {
  const isEmailAlreadyRegistered = await usersRepository.findByEmail(email);

  if (isEmailAlreadyRegistered) {
    throw conflictError('There is already an user with given email!');
  }
}

const usersService = {
  createUser,
};

export default usersService;

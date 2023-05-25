import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import usersRepository from '../../repositories/users-repository';
import { SignInParams, SignInResponse } from '../../protocols';
import { invalidCredentialsError } from '../../errors';
import sessionsRepository from '../../repositories/sessions-repository';

async function postSignIn({ email, password }: SignInParams): Promise<SignInResponse> {
  const user = await findUser(email);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return { user_id: user.id, email: user.email, token };
}

async function findUser(email: string) {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw invalidCredentialsError();
  }

  return user;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);

  if (!isPasswordValid) {
    throw invalidCredentialsError();
  }
}

async function createSession(user_id: number) {
  const token = jwt.sign({ user_id }, process.env.JWT_SECRET);

  await sessionsRepository.create({ token, user_id });

  return token;
}

const authenticationService = {
  postSignIn,
};

export default authenticationService;

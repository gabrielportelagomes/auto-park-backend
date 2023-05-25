import { User } from '@prisma/client';

export type ApplicationError = {
  name: string;
  message: string;
};

export type CreateUserParams = {
  email: string;
  password: string;
};

export type SignUpResponse = Pick<User, 'id' | 'email'>;

export type SignInParams = CreateUserParams;

export type SignInResponse = {
  user_id: number;
  email: string;
  token: string;
};

import { UserRole } from '../types';

export const INITIAL_USERS = [
  {
    username: 'admin',
    password_plaintext: 'admin123',
    role: UserRole.ADMIN,
  },
  {
    username: 'user',
    password_plaintext: 'user123',
    role: UserRole.SALES,
  },
];

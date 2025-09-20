import { hashSync } from 'bcryptjs';
const userId = '7ee16b6c-bda4-4a07-a2a8-30f0b80ede45';
const userId2 = '7ee16b6c-bda4-4a07-a2a8-30f0b80ede46';
const users = [
  {
    id: userId,
    email: 'ali-h@hotmail.com',
    password: hashSync('ali123', 14),
  },
  {
    id: userId2,
    email: 'ali-hisham@hotmail.com',
    password: hashSync('ali123', 14),
  },
];

export { users, userId, userId2 };

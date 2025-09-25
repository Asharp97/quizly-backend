import { hashSync } from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const userCount = 50;
const userIds = [...Array.from({ length: userCount }, () => uuid())];

const users = [
  {
    id: userIds[0],
    email: 'ali-h@hotmail.com',
    password: hashSync('ali123', 14),
  },
  {
    id: userIds[1],
    email: 'ali-hisham@hotmail.com',
    password: hashSync('ali123', 14),
  },
  ...Array.from({ length: userCount - 2 }, (_, i) => ({
    id: userIds[i + 2],
    email: `user${Math.floor(Math.random() * 10000)}@example.com`,
    password: hashSync('ali123', 14),
  })),
];

export { users, userIds };

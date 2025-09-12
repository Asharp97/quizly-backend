import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from 'types/user/user.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  getUser(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  deleteUser(id: string): Promise<User | null> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User | null> {
    return this.prisma.user.update(params);
  }

  createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }
}

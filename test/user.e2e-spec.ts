import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('User (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;
  let accessToken: string;
  let refreshToken: string;
  const testEmail = `e2e.test.${Date.now()}@example.com`;
  const deleteTestEmail = `delete.test.${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up any existing test users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'e2e.test',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test users
    try {
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: testEmail },
            { email: deleteTestEmail },
            { email: { contains: 'e2e.test' } },
          ],
        },
      });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }

    // Close all connections properly
    await app.close();
    await prisma.$disconnect();
  }, 30000);

  describe('SignUp', () => {
    it('should create a new user and return tokens', async () => {
      const signUpMutation = `
        mutation SignUp($data: signUpRequestDTO!) {
          SignUp(data: $data) {
            user {
              id
              email
              role
              createdAt
              updatedAt
            }
            accessToken
            refreshToken
          }
        }
      `;

      const variables = {
        data: {
          email: testEmail,
          password: 'SecurePassword123!',
        },
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signUpMutation, variables })
        .expect(200);

      if (res.body.errors) {
        console.error('SignUp errors:', res.body.errors);
      }

      expect(res.body.data.SignUp).toBeDefined();
      expect(res.body.data.SignUp.user.email).toBe(testEmail);
      expect(res.body.data.SignUp.user.role).toBe('USER');
      expect(res.body.data.SignUp.accessToken).toBeDefined();
      expect(res.body.data.SignUp.refreshToken).toBeDefined();

      testUserId = res.body.data.SignUp.user.id;
      accessToken = res.body.data.SignUp.accessToken;
      refreshToken = res.body.data.SignUp.refreshToken;
    });

    it('should fail to create user with duplicate email', async () => {
      const signUpMutation = `
        mutation SignUp($data: signUpRequestDTO!) {
          SignUp(data: $data) {
            user {
              id
              email
              role
            }
            accessToken
            refreshToken
          }
        }
      `;

      const variables = {
        data: {
          email: testEmail,
          password: 'AnotherPassword123!',
        },
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signUpMutation, variables })
        .expect(200);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const loginMutation = `
        mutation Login($email: String!, $password: String!) {
          Login(email: $email, password: $password) {
            user {
              id
              email
              role
            }
            accessToken
            refreshToken
          }
        }
      `;

      const variables = {
        email: testEmail,
        password: 'SecurePassword123!',
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: loginMutation, variables })
        .expect(200);

      if (res.body.errors) {
        console.error('Login errors:', res.body.errors);
      }

      expect(res.body.data.Login).toBeDefined();
      expect(res.body.data.Login.user.email).toBe(testEmail);
      expect(res.body.data.Login.user.role).toBe('USER');
      expect(res.body.data.Login.accessToken).toBeDefined();
      expect(res.body.data.Login.refreshToken).toBeDefined();

      accessToken = res.body.data.Login.accessToken;
      refreshToken = res.body.data.Login.refreshToken;
    });

    it('should fail to login with invalid credentials', async () => {
      const loginMutation = `
        mutation Login($email: String!, $password: String!) {
          Login(email: $email, password: $password) {
            user {
              id
              email
            }
            accessToken
          }
        }
      `;

      const variables = {
        email: testEmail,
        password: 'WrongPassword',
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: loginMutation, variables })
        .expect(200);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Me', () => {
    it('should return current user when authenticated', async () => {
      const meQuery = `
        query Me {
          Me {
            id
            email
            name
            role
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: meQuery })
        .expect(200);

      if (res.body.errors) {
        console.error('Me errors:', res.body.errors);
      }

      expect(res.body.data.Me).toBeDefined();
      expect(res.body.data.Me.id).toBe(testUserId);
      expect(res.body.data.Me.email).toBe(testEmail);
    });

    it('should fail without authentication', async () => {
      const meQuery = `
        query Me {
          Me {
            id
            email
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: meQuery })
        .expect(200);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GetUser', () => {
    it('should get user by id when authenticated', async () => {
      const getUserQuery = `
        query GetUser($id: String!) {
          GetUser(id: $id) {
            id
            email
            name
            role
          }
        }
      `;

      const variables = {
        id: testUserId,
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: getUserQuery, variables })
        .expect(200);

      if (res.body.errors) {
        console.error('GetUser errors:', res.body.errors);
      }

      expect(res.body.data.GetUser).toBeDefined();
      expect(res.body.data.GetUser.id).toBe(testUserId);
      expect(res.body.data.GetUser.email).toBe(testEmail);
    });
  });

  describe('GetUsers', () => {
    it('should get all users when authenticated', async () => {
      const getUsersQuery = `
        query GetUsers {
          GetUsers {
            id
            email
            name
            role
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: getUsersQuery })
        .expect(200);

      expect(res.body.data.GetUsers).toBeDefined();
      expect(Array.isArray(res.body.data.GetUsers)).toBe(true);
      expect(res.body.data.GetUsers.length).toBeGreaterThan(0);
    });
  });

  describe('GetUserByEmail', () => {
    it('should get user by email when authenticated', async () => {
      const getUserByEmailQuery = `
        query GetUserByEmail($email: String!) {
          GetUserByEmail(email: $email) {
            id
            email
            name
            role
          }
        }
      `;

      const variables = {
        email: testEmail,
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: getUserByEmailQuery, variables })
        .expect(200);

      if (res.body.errors) {
        console.error('GetUserByEmail errors:', res.body.errors);
      }

      expect(res.body.data.GetUserByEmail).toBeDefined();
      expect(res.body.data.GetUserByEmail.email).toBe(testEmail);
    });
  });

  describe('UpdateUser', () => {
    it('should update user name when authenticated', async () => {
      const updateUserMutation = `
        mutation UpdateUser($id: String!, $data: UserUpdateInput!) {
          UpdateUser(id: $id, data: $data) {
            id
            email
            role
          }
        }
      `;

      const variables = {
        id: testUserId,
        data: {
          name: { set: 'Updated E2E User' },
        },
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: updateUserMutation, variables })
        .expect(200);

      expect(res.body.data.UpdateUser).toBeDefined();
      expect(res.body.data.UpdateUser.id).toBe(testUserId);
    });
  });

  describe('RefreshToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshTokenMutation = `
        mutation RefreshToken($refreshToken: String!) {
          RefreshToken(refreshToken: $refreshToken) {
            user {
              id
              email
              role
            }
            accessToken
            refreshToken
          }
        }
      `;

      const variables = {
        refreshToken,
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: refreshTokenMutation, variables })
        .expect(200);

      expect(res.body.data.RefreshToken).toBeDefined();
      expect(res.body.data.RefreshToken.accessToken).toBeDefined();
      expect(res.body.data.RefreshToken.refreshToken).toBeDefined();
      expect(res.body.data.RefreshToken.user.id).toBe(testUserId);
      expect(res.body.data.RefreshToken.user.role).toBe('USER');
    });

    it('should fail to refresh with invalid token', async () => {
      const refreshTokenMutation = `
        mutation RefreshToken($refreshToken: String!) {
          RefreshToken(refreshToken: $refreshToken) {
            user {
              id
            }
            accessToken
          }
        }
      `;

      const variables = {
        refreshToken: 'invalid-token',
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: refreshTokenMutation, variables })
        .expect(200);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const logoutMutation = `
        mutation Logout {
          Logout {
            message
            success
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ query: logoutMutation })
        .expect(200);

      expect(res.body.data.Logout).toBeDefined();
      expect(res.body.data.Logout.success).toBe(true);
    });
  });

  describe('DeleteUser', () => {
    it('should delete user when authenticated', async () => {
      // Create a fresh user for deletion test
      const signUpMutation = `
        mutation SignUp($data: signUpRequestDTO!) {
          SignUp(data: $data) {
            user {
              id
              email
              role
            }
            accessToken
          }
        }
      `;

      const signUpVars = {
        data: {
          email: deleteTestEmail,
          password: 'DeletePassword123!',
        },
      };

      const signUpRes = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signUpMutation, variables: signUpVars })
        .expect(200);

      const userIdToDelete = signUpRes.body.data.SignUp.user.id;
      const deleteUserToken = signUpRes.body.data.SignUp.accessToken;

      // Now delete the user
      const deleteUserMutation = `
        mutation DeleteUser($id: String!) {
          DeleteUser(id: $id) {
            id
            email
            deletedAt
          }
        }
      `;

      const deleteVars = {
        id: userIdToDelete,
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${deleteUserToken}`)
        .send({ query: deleteUserMutation, variables: deleteVars })
        .expect(200);

      expect(res.body.data.DeleteUser).toBeDefined();
      expect(res.body.data.DeleteUser.id).toBe(userIdToDelete);
      expect(res.body.data.DeleteUser.deletedAt).toBeDefined();
    });
  });
});

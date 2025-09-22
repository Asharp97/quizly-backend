# Quizly Backend

A scalable backend for a quiz application built with NestJS, Prisma, GraphQL, and PostgreSQL.

## Features

- **NestJS**: Modular architecture for maintainable code.
- **GraphQL API**: Flexible queries and mutations for quizzes, questions, answers, and users.
- **Prisma ORM**: Type-safe database access for PostgreSQL.
- **Authentication**: JWT-based auth with Redis session management.
- **Google OAuth**: Login/signup via Google.
- **Seeding**: Populate the database with sample users, quizzes, questions, and answers.
- **Environment Config**: Easily configurable via `.env`.

## Project Structure

- `src/`
  - `quiz/`, `question/`, `answer/`, `user/`: Main modules with resolvers, services, repositories.
  - `common/`: Decorators, guards, types, and utilities.
  - `prisma/`: Prisma service, schema, and seed scripts.
  - `middlewares/`: Custom middleware (e.g., JWT).
- `types/`: Shared TypeScript types for GraphQL models and inputs.
- `.env`: Environment variables (DB, JWT, Google OAuth, etc.)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- [pnpm](https://pnpm.io/) package manager

### Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Configure your `.env` file:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/quizly?schema=public"
   NODE_ENV="development"
   API_JWT_SECRET="your_jwt_secret"
   API_JWT_ISSUER="quizly-api"
   GOOGLE_SECRET="your_google_secret"
   GOOGLE_CLIENT_ID="your_google_client_id"
   DOMAIN="http://localhost:3000"
   PORT=3002
   AUTH_STRATEGY="bearerToken"
   ```

3. Generate Prisma client and push schema:

   ```bash
   pnpm run gen
   pnpm run push
   ```

4. Seed the database:
   ```bash
   pnpm run seed
   ```

### Running the Server

- Development:
  ```bash
  pnpm run start
  ```
- Watch mode:
  ```bash
  pnpm run dev
  ```
- Production:
  ```bash
  pnpm run start:prod
  ```

### Testing

- Unit tests:
  ```bash
  pnpm run test
  ```
- E2E tests:
  ```bash
  pnpm run test:e2e
  ```
- Coverage:
  ```bash
  pnpm run test:cov
  ```

## API Overview

- GraphQL Playground: Available at `/graphql` when `NODE_ENV=development`.
- Main entities: `Quiz`, `Question`, `Answer`, `User`.
- Auth endpoints: Signup, login, logout, refresh token (see `UserResolver`).

## Deployment

See [NestJS deployment docs](https://docs.nestjs.com/deployment) for best practices.

## License

MIT (see LICENSE file)

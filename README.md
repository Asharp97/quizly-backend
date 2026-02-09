# Quizly Backend

A production-oriented backend for a quiz application, built to practice real-world backend concerns such as modular architecture, relational data modeling, authentication, and testing strategies.

Built with **NestJS**, **GraphQL**, **Prisma**, and **PostgreSQL**.

---

## Tech Stack

* **NestJS** – Modular backend framework
* **GraphQL** – Flexible API for clients
* **Prisma ORM** – Type-safe database access
* **PostgreSQL** – Relational data store
* **Redis** – Session / refresh token storage
* **JWT** – Authentication
* **pnpm** – Package manager

---

## Architecture

The backend follows a layered, modular NestJS architecture:

* **GraphQL Resolvers**

  * Handle API input, guards, and response shaping
  * Keep logic thin and delegate work to services

* **Services**

  * Contain business logic (quiz creation, submissions, scoring, auth flows)
  * Designed to be unit-testable

* **Prisma Layer**

  * Handles all database access
  * Enforces schema constraints and relations

* **Auth Layer**

  * JWT access tokens
  * Redis-backed refresh/session handling
  * Google OAuth support

This separation improves maintainability, testability, and clarity of responsibilities.

---

## Project Structure

```
src/
├─ quiz/              # Quiz domain (resolver, service)
├─ question/          # Questions logic
├─ answer/            # Answers logic
├─ user/              # Users and authentication
├─ common/             # Guards, decorators, utilities
├─ prisma/             # Prisma service, schema, seeds
├─ middlewares/        # JWT middleware
types/                 # Generated GraphQL types
```

---

## Database Model Overview

### Core Entities

* **User**

  * Can create many quizzes
  * Can submit quizzes

* **Quiz**

  * Belongs to a user
  * Has many questions
  * Has a public, shareable `link`

* **Question**

  * Belongs to a quiz
  * Supports multiple question types

    * MULTIPLE_CHOICE
    * TRUE_FALSE
    * SHORT_ANSWER

* **Answer**

  * Belongs to a question
  * Used for MCQ / True-False questions

* **QuizSubmission**

  * Represents a user’s attempt at a quiz
  * Stores score, time taken, submission time

* **AnswerSubmission**

  * Stores the user’s answer per question
  * Uses `answerId` for MCQ/TF
  * Uses free-text `text` for short answers

### Constraints and Integrity

* `Quiz.link` is unique (used for public access)
* `Answer` enforces uniqueness per question:

  ```
  @@unique([questionId, text])
  ```
* `AnswerSubmission` enforces one answer per question per submission:

  ```
  @@unique([submittedQuizId, questionId])
  ```

The database acts as the final layer of data integrity, while business rules are enforced at the service layer.

---

## Deletion Strategy

All models include a `deletedAt` field to support **soft deletes**.

* Intended usage:

  * Soft delete for user-initiated deletes
  * Hard deletes reserved for admin or test environments

Some relations use `onDelete: Cascade` for controlled cleanup scenarios.

> A future improvement would be centralized soft-delete filtering using Prisma middleware.

---

## Authentication

* JWT access tokens for API authorization
* Refresh/session state stored in Redis
* Google OAuth for signup/login
* Passwords are hashed before storage

---

## Testing Strategy

### Unit Tests

* Focus on service-level business logic
* External dependencies (Prisma, Redis) are mocked
* Validate rules such as quiz creation, scoring logic, and auth behavior

### E2E Tests

* Exercise the full request lifecycle:

  * GraphQL resolver
  * Service logic
  * Prisma + database
* Validate real interactions such as:

  * authentication flows
  * quiz creation
  * quiz submissions

> Goal: ensure correctness of isolated logic (unit) and correctness of real system behavior (e2e).

---

## Getting Started

### Prerequisites

* Node.js v18+
* PostgreSQL
* pnpm

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/quizly?schema=public"
NODE_ENV="development"

API_JWT_SECRET="your_jwt_secret"
API_JWT_ISSUER="quizly-api"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_SECRET="your_google_secret"

DOMAIN="http://localhost:3000"
PORT=3002
AUTH_STRATEGY="bearerToken"
```

3. Generate Prisma client and apply schema:

```bash
pnpm run gen
pnpm run push
```

4. Seed the database:

```bash
pnpm run seed
```

---

## Running the Server

* Development:

```bash
pnpm run start
```

* Watch mode:

```bash
pnpm run dev
```

* Production:

```bash
pnpm run start:prod
```

---

## GraphQL Playground

Available when `NODE_ENV=development`:

```
http://localhost:3002/graphql
```

Example query:

```graphql
query GetQuiz($link: String!) {
  quizByLink(link: $link) {
    id
    title
    questions {
      id
      text
      answers {
        id
        text
        isCorrect
      }
    }
  }
}
```

---

## Design Tradeoffs and Next Improvements

* Introduce global soft-delete filtering via Prisma middleware
* Add explicit idempotency keys for submission mutations
* Optimize GraphQL queries to avoid N+1 patterns
* Add rate limiting to auth mutations
* Expand integration coverage for edge cases

---

## License

MIT

---

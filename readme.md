# TaskFlow API

A backend-focused task management API built with Node.js, Express, PostgreSQL, Prisma, Redis, and Docker.

TaskFlow provides authentication, project and task management, comments, caching, rate limiting, background email processing, activity logging, validation, and automated tests.

> This project was built as a portfolio and hands-on learning project, with a focus on applying real-world backend concepts and exploring different approaches to building maintainable APIs.

---

## ✨ Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Short-lived access tokens
- Refresh token rotation
- Refresh token hashing before storing in the database
- HTTP-only refresh token cookies
- Password hashing with bcrypt
- Password reset/change flow
- Protected routes
- Role-based authorization foundation

### Projects, Tasks & Comments

- Create, read, update, and delete projects
- Create, read, update, and delete tasks
- Task status and priority management
- Optional task due dates
- Nested project → tasks relationships
- Nested task → comments relationships
- User ownership checks for resources
- Pagination, filtering, sorting, and search

### Validation & Error Handling

- Request validation using Zod
- Centralized validation middleware
- Global error handling
- Custom application errors
- Prisma error handling
- Different error responses for development and production

### Redis

Redis is used for several backend concerns:

- Response caching
- Cache invalidation after mutations
- IP-based rate limiting
- Redis-backed infrastructure for background jobs

### Background Jobs & Email

Email processing is handled asynchronously using BullMQ and Redis.

Instead of sending emails directly during the request lifecycle:

```text
API Request
    ↓
Add Job to Queue
    ↓
Redis / BullMQ
    ↓
Background Worker
    ↓
Email Provider
```

This keeps potentially slow email operations outside the main request lifecycle.

### Activity Logging

Important resource mutations are recorded in an ActivityLog table.
The logs can contain:
- Action
- Entity type
- Entity ID
- Previous data
- New data
- User ID
- IP address
- User agent
- Timestamp
This provides a foundation for auditing user actions.

### Testing

The project includes tests using:
- Vitest
- Supertest
- Mocked dependencies
Test coverage currently focuses on authentication behavior, authentication routes, and API query utilities.

### Docker

The project can be run using Docker Compose with separate containers for:
- Node.js application
- PostgreSQL
- Redis
The application container runs Prisma migrations before starting the server.

🛠 Tech Stack

Backend
- Node.js
- Express
- JavaScript (ES Modules)

Database
- PostgreSQL
- Prisma ORM

Authentication & Security
- JSON Web Tokens
- bcrypt
- HTTP-only cookies
- Zod validation
- Redis rate limiting

Infrastructure
- Redis
- BullMQ
- Docker
- Docker Compose

Testing
- Vitest
- Supertest

Email
- Nodemailer
- SendGrid-compatible production transport
- SMTP development transport

# 🏗 Project Structure
The project follows a modular structure:
```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   └── comments/
│
├── shared/
│   ├── config/
│   └── utils/
│
├── tests/
│
├── app.js
└── server.js

prisma/
└── migrations/

Dockerfile
docker-compose.yml
``` 

# 🔐 Authentication Flow
TaskFlow uses separate access and refresh tokens.
Login
```text
Client
  │
  ├── username + password
  ↓
Express API
  │
  ├── Validate request
  ├── Verify password
  ├── Create access token
  ├── Create refresh token
  └── Store hashed refresh token
  ↓
Client
  ├── Access Token
  └── HTTP-only Refresh Token Cookie
```
Access tokens are used to authenticate API requests, while refresh tokens are used to obtain new access tokens.
Refresh tokens are hashed before being persisted, so the raw token is not stored in the database.

# ⚡ Caching
Frequently accessed resources can be cached in Redis.
The API also invalidates relevant cache entries after create, update, and delete operations.
Example:
```text
Request
   ↓
Check Redis
   │
   ├── Cache Hit → Return cached data
   │
   └── Cache Miss
          ↓
       PostgreSQL
          ↓
       Store in Redis
          ↓
       Return response
``` 

# 🚦 Rate Limiting
The API implements IP-based rate limiting using Redis.
General API requests are rate limited, while authentication endpoints such as login use a stricter limit.
This helps reduce brute-force attempts and excessive requests.

# 🔎 API Query Features
List endpoints support common query operations such as:
Filtering
```text
?status=DONE
```
Searching
```text
?search=backend
```
Sorting
```text
?sort=-createdAt
```
Pagination
```text
?page=2
```
The query-building logic is encapsulated in a reusable ApiFeature utility.


# 📦 Background Jobs
BullMQ is used to process asynchronous jobs.
For example, email delivery can be moved out of the request lifecycle:
```text
await emailQueue.add("email", {
  url,
  user,
});
```
A separate worker consumes the job and sends the email.
This pattern allows potentially slow operations to be processed asynchronously.


# 🗄️ Database Design
The database is managed using Prisma migrations and PostgreSQL.

# 🧪 Running Tests
Install dependencies:
```text
npm install
```
Run the test suite:
```text
npm test
```

# 🚀 Getting Started
Prerequisites
You can run the project locally with:
- Node.js
- PostgreSQL
- Redis

Install dependencies
```text
npm install
```
Run Prisma migrations
```text
npx prisma migrate dev
```
Start the development server
```text
npm start
```
The API will be available at:
```text
http://localhost:3000
```


# 🐳 Running with Docker
Start the application and its dependencies:
```text
docker compose up --build
```
Docker Compose starts:
```text
Node.js API
    │
    ├── PostgreSQL
    │
    └── Redis
```
The application container also runs the Prisma migrations before starting the server.

# 📚 What I Learned
This project was an opportunity to move beyond basic CRUD APIs and work with several backend concepts in a single application.
Some of the main areas I explored were:
- Designing REST APIs with Express
- JWT authentication and refresh-token flows
- Secure password handling
- HTTP-only cookies
- Request validation
- Centralized error handling
- Prisma relational data modeling
- PostgreSQL
- Redis caching
- Cache invalidation
- Rate limiting
- Background jobs and workers
- Asynchronous email processing
- Activity/audit logging
- Reusable controller/factory patterns
- Pagination, filtering, searching, and sorting
- Unit and API testing
- Dockerized local development
- Database migrations

# 🔮 Possible Improvements
There are several areas that could be improved if the project were taken further toward production use.
Potential improvements include:
- More comprehensive test coverage
- Improved authorization and role management
- More granular cache invalidation
- Structured logging and monitoring
- API documentation with OpenAPI/Swagger
- CI/CD pipeline
- More robust background-job retry and failure handling
- Improved production configuration and secret management
- More extensive integration and end-to-end tests

# 📌 Project Status
This is an evolving portfolio project.
The primary goal was to gain hands-on experience with backend architecture and infrastructure concepts while building a realistic API rather than focusing only on basic CRUD functionality.


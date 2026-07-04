# Example CLAUDE.md for Groundwork

This is an example CLAUDE.md file that demonstrates what Groundwork can extract.

## Technology Stack

- Built with **Next.js** and **React**
- Using **TypeScript** for type safety
- Database: **PostgreSQL** with **Prisma** ORM
- Authentication: **JWT** tokens with **NextAuth**
- API: **tRPC** for type-safe APIs
- Testing with **Jest** and **Playwright**

## Architecture

- REST API endpoints under `/api`
- Database uses camelCase for JavaScript, snake_case for database columns
- All API responses return JSON with consistent error handling

## Development

- Node.js 18+ required
- PostgreSQL 15+ with pgvector extension

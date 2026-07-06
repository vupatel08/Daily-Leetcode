# Groundwork Development Setup

## Quick Start

### 1. Start PostgreSQL with pgvector

```bash
# Start the database
docker-compose up -d

# Verify it's running
docker-compose ps

# View logs
docker-compose logs -f postgres
```

The database will be available at:
- **Host**: localhost
- **Port**: 5432
- **Database**: groundwork
- **User**: groundwork
- **Password**: groundwork_dev

### 2. Install Dependencies

```bash
# Install all packages
npm install

# Install for each workspace
npm install --workspaces
```

### 3. Build All Packages

```bash
# Shared types must build first (also runs automatically on npm install)
npm run build:shared
npm run build
```

### 4. Development Workflow

**MCP Server:**
```bash
cd packages/mcp-server
npm run dev  # Watch mode with auto-rebuild
```

**CLI:**
```bash
cd packages/cli
npm run dev
```

**Run the CLI:**
```bash
# Link it globally for testing
cd packages/cli
npm link

# Now you can use it
groundwork --version
groundwork init
```

## Project Structure

```
groundwork/
├── packages/
│   ├── mcp-server/       # Local MCP agent
│   │   ├── src/
│   │   │   ├── index.ts              # Main MCP server
│   │   │   ├── services/             # Business logic
│   │   │   ├── extractors/           # Decision extractors
│   │   │   └── injection/            # Injection engine
│   │   └── package.json
│   │
│   ├── cli/              # Command-line tool
│   │   ├── src/
│   │   │   └── cli.ts                # CLI commands
│   │   └── package.json
│   │
│   ├── github-action/    # GitHub Action for PR checks
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared/           # Shared types and utilities
│       ├── src/
│       │   └── types.ts              # TypeScript interfaces
│       └── package.json
│
├── database/
│   └── schema.sql        # PostgreSQL schema with pgvector
│
├── docs/                 # Comprehensive documentation
│   ├── PRODUCT.md        # Product vision
│   ├── ARCHITECTURE.md   # Technical architecture
│   ├── MVP.md            # Implementation plan
│   ├── BUSINESS.md       # Business model
│   └── SDD_INTEGRATION.md
│
└── docker-compose.yml    # Local database setup
```

## Development Tasks

### Phase 1: Foundation (Current)
- [x] Database schema created
- [x] Docker Compose setup
- [ ] MCP server connection to database
- [ ] First extractor (CLAUDE.md)
- [ ] Basic CLI init command

### Testing

```bash
# Run all tests
npm test

# Test specific package
npm test --workspace=@groundwork/mcp-server
```

### Database Operations

**Connect to database:**
```bash
docker exec -it groundwork-postgres psql -U groundwork -d groundwork
```

**Reset database:**
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recreate with fresh schema
```

**View tables:**
```sql
\dt
\d decisions
```

## Environment Variables

Create `.env` in the root:

```env
# Database
DATABASE_URL=postgresql://groundwork:groundwork_dev@localhost:5432/groundwork

# OpenAI (for embeddings and extraction)
OPENAI_API_KEY=your_key_here

# Groundwork Cloud (for syncing)
GROUNDWORK_API_KEY=your_api_key_here
GROUNDWORK_PROJECT_ID=your_project_id_here
```

## Next Steps

1. **Implement database service** - Create `packages/mcp-server/src/services/database.ts`
2. **Build first extractor** - `packages/mcp-server/src/extractors/claude-md-extractor.ts`
3. **Create extraction pipeline** - Wire up extractors to process files
4. **Test locally** - Run on a sample project with CLAUDE.md file

## Useful Commands

```bash
# Clean all build artifacts
npm run clean

# Rebuild everything
npm run build

# Watch mode for development
npm run dev

# Format code
npm run format

# Lint code
npm run lint
```

## Troubleshooting

**Port 5432 already in use:**
```bash
# Stop any existing PostgreSQL
sudo service postgresql stop

# Or change port in docker-compose.yml
```

**pgvector extension not found:**
```bash
# Ensure you're using the ankane/pgvector image
docker-compose down
docker-compose pull
docker-compose up -d
```

**TypeScript errors:**
```bash
# Rebuild shared types first
cd packages/shared && npm run build
cd ../..
npm run build
```

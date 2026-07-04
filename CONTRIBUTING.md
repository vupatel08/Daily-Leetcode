# Contributing to Groundwork

Thank you for your interest in contributing to Groundwork! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** with clear commit messages
5. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/vupatel08/Daily-Leetcode.git
cd Daily-Leetcode

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Project Structure

```
groundwork/
├── packages/
│   ├── mcp-server/       # Local MCP server (Apache 2.0)
│   ├── cli/              # CLI tool (MIT)
│   ├── github-action/    # GitHub Action for PR checks (MIT)
│   ├── dashboard/        # Web dashboard (coming soon)
│   └── shared/           # Shared types and utilities (MIT)
├── docs/                 # Documentation
└── README.md
```

## Code Style

- **TypeScript**: All new code should be written in TypeScript
- **Formatting**: Use Prettier (config included)
- **Linting**: Use ESLint (config included)
- **Tests**: Write tests for new features

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass** before submitting
4. **Update the README.md** if adding new features
5. **One feature per PR** - keep changes focused

## Commit Messages

Follow the conventional commits specification:

- `feat: Add new decision extractor for Python`
- `fix: Resolve injection latency issue`
- `docs: Update architecture documentation`
- `test: Add tests for conflict detection`
- `chore: Update dependencies`

## Areas We Need Help With

### High Priority
- [ ] Additional extractors (Python, Go, Java, Rust)
- [ ] Windsurf and Copilot MCP integration
- [ ] Graph database migration (Neo4j)
- [ ] Dashboard UI improvements
- [ ] Performance optimizations

### Medium Priority
- [ ] Linear and Jira integrations
- [ ] GitLab support
- [ ] Meeting transcript extraction
- [ ] Coverage heatmap visualization
- [ ] Decision templates by tech stack

### Documentation
- [ ] Integration guides for more SDD tools
- [ ] Video tutorials
- [ ] Example projects
- [ ] API documentation

## Bug Reports

When filing a bug report, please include:

1. **Groundwork version** you're using
2. **AI coding tool** you're using (Claude Code, Cursor, etc.)
3. **Operating system** and version
4. **Steps to reproduce** the issue
5. **Expected behavior** vs actual behavior
6. **Logs** if available

## Feature Requests

We love feature requests! Please include:

1. **Clear description** of the feature
2. **Use case** - what problem does it solve?
3. **Proposed solution** if you have one
4. **Alternatives considered**

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Assume good intentions

## Questions?

- Open a GitHub issue with your question
- Join our Discord community (coming soon)
- Email: hello@groundwork.dev

## License

By contributing to Groundwork, you agree that your contributions will be licensed under the same license as the respective package:

- MCP Server: Apache 2.0
- CLI, GitHub Action, Dashboard: MIT

---

Thank you for contributing to Groundwork! Together we're building the infrastructure that makes AI coding work at team scale.

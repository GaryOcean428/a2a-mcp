# Contributing to MCP Integration Platform

Thank you for your interest in contributing to the MCP Integration Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Making Contributions](#making-contributions)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that establishes expectations for participation in our community. We expect all contributors to uphold this code. At its core, we value:

- **Respectful Communication**: Treat all contributors with respect and professionalism
- **Inclusive Environment**: Welcome contributors of all backgrounds and experience levels
- **Constructive Feedback**: Provide helpful, specific feedback in code reviews
- **Focus on Improvement**: Aim to make the project better, not prove superiority

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v18 or later
- npm v7 or later
- PostgreSQL (for development with a local database)
- Git

### Setting Up the Project

1. Fork the repository to your GitHub account
2. Clone your fork to your local machine:
   ```bash
   git clone https://github.com/your-username/mcp-integration-platform.git
   cd mcp-integration-platform
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/original-owner/mcp-integration-platform.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Development Environment

### Project Structure

```
├── client/            # Frontend React application
├── server/            # Backend Express server
├── shared/            # Shared code (types, schemas, utilities)
├── scripts/           # Development and build scripts
├── docs/              # Documentation
├── public/            # Static assets
└── .env.example       # Example environment variables
```

### Key Files and Directories

- `server/routes.ts`: API routes definition
- `server/auth.ts`: Authentication system
- `server/db.ts`: Database connection
- `shared/schema.ts`: Data models and types
- `client/src/App.tsx`: Main React component

## Making Contributions

We welcome contributions in several areas:

### Bug Fixes

1. Check if the bug is already reported in the Issues section
2. If not, create a new issue describing the bug in detail
3. Fork the repository and create a bugfix branch: `git checkout -b fix/bug-description`
4. Fix the bug and add appropriate tests
5. Submit a pull request referencing the issue

### Feature Additions

1. Discuss the feature in the Issues section before implementing
2. Once approved, fork the repository and create a feature branch: `git checkout -b feature/feature-name`
3. Implement the feature with appropriate tests and documentation
4. Submit a pull request with a detailed description

### Documentation Improvements

1. Fork the repository and create a docs branch: `git checkout -b docs/description`
2. Make your documentation changes
3. Submit a pull request with a summary of changes

## Coding Standards

### General Guidelines

- Write clean, readable code with meaningful variable and function names
- Follow the existing code style and patterns
- Keep functions small and focused on a single responsibility
- Comment complex sections of code, but prefer self-documenting code where possible
- Use TypeScript's type system effectively

### TypeScript Style

- Use explicit types over `any` whenever possible
- Use interfaces for object shapes, especially in shared code
- Use type guards and assertions appropriately
- Follow functional programming patterns where appropriate

### React Guidelines

- Use functional components with hooks
- Keep components small and composable
- Use appropriate state management (React Query for server state, local state for UI)
- Follow the project's component organization pattern

### Node.js/Express Guidelines

- Use async/await for asynchronous operations
- Handle errors properly with try/catch blocks
- Use middleware for cross-cutting concerns
- Keep controllers thin, pushing business logic to services

## Testing

### Types of Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components or API endpoints
- **End-to-End Tests**: Test complete user flows

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage report
npm run test:coverage
```

### Writing Tests

- Write tests that cover both success and failure scenarios
- Mock external dependencies appropriately
- Structure tests with clear arrange-act-assert patterns
- Keep test code as simple and readable as possible

## Documentation

Good documentation is crucial for the project's usability and contributor onboarding.

### Types of Documentation

- **API Documentation**: Document all API endpoints with examples
- **Component Documentation**: Document React components and hooks
- **Setup Documentation**: Keep setup instructions current
- **Tutorials**: Create step-by-step guides for common workflows

### Documentation Style

- Use clear, concise language
- Include code examples where appropriate
- Use headings to organize content
- Update documentation when you change code

## Pull Request Process

1. **Prepare**: Ensure your code meets all standards and passes all tests
2. **Create**: Submit your pull request to the `main` branch
3. **Describe**: Fill out the pull request template with:
   - A summary of changes
   - Related issue numbers
   - Any breaking changes
   - Testing steps
4. **Respond**: Address review feedback promptly
5. **Update**: Rebase your branch if needed to stay current with main
6. **Merge**: Once approved, a maintainer will merge your PR

### Review Process

All pull requests go through a review process:

1. Automated checks (CI/CD, linting, tests)
2. Peer review by at least one other contributor
3. Maintainer review and approval

## Community

### Where to Get Help

- **Issues**: For bug reports and feature discussions
- **Discussions**: For general questions and community conversation
- **Pull Requests**: For code review and specific implementation discussions

### Recognition

All contributors are recognized in the project's contributors list. We value every contribution, from code to documentation to bug reports.

### Communication Channels

- GitHub Issues and Discussions
- Community forums (see project website)
- Regular virtual meetups (announced on the project website)

## Thank You

Thank you for contributing to the MCP Integration Platform. Your efforts help make this project better for everyone!
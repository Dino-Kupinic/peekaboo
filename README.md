# Peekaboo - Nginx Log Viewer

A monorepo containing a full-stack application for viewing and analyzing Nginx logs.

## Project Structure

This project is set up as a TypeScript monorepo with the following packages:

- `frontend`: React-based web application
- `backend`: Bun server API
- `packages/shared`: Shared types, utilities, and constants

## Setup

### Prerequisites

- [Bun](https://bun.sh/) (for package management and running the application)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd peekaboo

# Install dependencies for all packages
bun install

# Build shared package
bun run build:shared
```

## Development

```bash
# Start all services in development mode
bun run dev

# Or start individual services
bun run dev:frontend  # Start frontend only
bun run dev:backend   # Start backend only
bun run dev:shared    # Watch and build shared package
```

### Frontend

The frontend will be available at http://localhost:5173 (default Vite port).

### Backend

The backend API will be available at http://localhost:3000.

## Building for Production

```bash
# Build all packages
bun run build
```

## Adding Dependencies

```bash
# Add a dependency to a specific package
cd frontend
bun add <package-name>

# Or from the root
bun add <package-name> --cwd frontend
```

## License

MIT

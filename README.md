# team1-front-app
Team 1 Frontend Application Feb/March 2026

## Quick Start
```bash
npm install  
cp .env.example .env
npm run dev
```

Frontend dev server runs on http://localhost:${PORT} (default is http://localhost:3000 when `PORT` is not set or is 3000 in `.env`). The backend API (configured via `API_BASE_URL`) defaults to http://localhost:3001 unless otherwise specified.

## Running with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed and running.

The backend must also be running (either locally on port 3001, or via its own Docker container).

```bash
docker compose up -d        # Build image and start container in background
docker compose logs -f      # Follow logs
docker compose down         # Stop and remove container
```

Frontend will be available at http://localhost:3000.

> **Note:** The container reads your `.env` file. Make sure you have one — copy `.env.example` if not.

---

## Linting

This project uses **Biome** for fast, comprehensive code linting and formatting.
- Configuration file: `biome.json`
- Lints TypeScript files in the `/src/` directory
- Follows recommended rules with consistent formatting
- Integrates with CI/CD pipeline

Available Commands:
```bash
npm run check        # Check for linting issues
npm run check:fix    # Automatically fix linting issues
```

## Testing
This project uses **Vitest** and **Supertest** for unit and coverage tests
Tests are located in the `/test/` directory and mirror the `/src/` structure:

Available Commands:
```bash
npm run test             # Run all tests and output results
npm run test:coverage    # Run all tests and display coverage report with 80% thresholds
```
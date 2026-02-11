# team1-front-app
Team 1 Frontend Application Feb/March 2026

## Quick Start
```bash
npm install  
cp .env.example .env
npm run dev
```

Server runs on http://localhost:${PORT} (default is http://localhost:3001 when `PORT` is not set or is 3001 in `.env`)
Uses Nunjucks templates + Tailwind CSS (CDN)

## Linting

This project uses **Biome** for fast, comprehensive code linting and formatting.
- Configuration file: `biome.json`
- Lints TypeScript files in the `/src/` directory
- Follows recommended rules with consistent formatting
- Integrates with CI/CD pipeline

### Available Commands
```bash
npm run check        # Check for linting issues
npm run check:fix    # Automatically fix linting issues
```

## Testing

Tests are located in the `/test/` directory and mirror the `/src/` structure:
- Unit tests use Vitest + Supertest
- Run `npm test` for single test run
- Run `npm run test:coverage` for coverage report with 80% thresholds
- Coverage reports generated in `/coverage/`
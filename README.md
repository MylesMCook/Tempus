# TempusTotal

A powerful natural language date parser for React applications. Transform expressions like "3 weeks from now" or "next friday" into JavaScript Date objects.

## Features

- Natural language date parsing
- Ready-to-use React components
- Full TypeScript support
- Date math operations
- Relative date expressions
- Fractional time units
- REST API endpoint
- Timezone support
- Debug mode for parsing visualization

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run validate` | Run all checks |

## Supported Expressions

### Relative Dates

```
now
today
yesterday
tomorrow
```

### Time Offsets

```
in 3 days
2 weeks from now
3 months ago
1 year from now
in 5 hours
30 minutes ago
```

### Weekdays

```
friday                  # The upcoming Friday
next friday             # Friday of next week
last monday             # The previous Monday
```

### Date Math

```
today plus 2 weeks
tomorrow minus 3 days
2 weeks plus 3 days
next friday minus 1 day
```

### Fractional Units

```
1.5 days from now
2.5 weeks ago
0.5 year from now
half day from now
```

### Advanced Expressions

```
6 months before sep 14
2 weeks after dec 25
3 days before next friday
1 month after january 1
```

### Month and Day

```
may 1
december 25
jan 15
september 14 2025
```

### Word Numbers

```
two days from now
three weeks ago
five hours from now
```

## API Reference

### Endpoint

```
GET /api/parse
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `expression` | string | Yes | The date expression to parse |
| `format` | string | No | Output format (date-fns format tokens) |
| `timezone` | string | No | IANA timezone (default: UTC) |
| `preserveDayOfMonth` | boolean | No | Preserve day when adding months/years |

### Example Request

```bash
curl "https://your-domain.com/api/parse?expression=2%20weeks%20from%20now"
```

### Example Response

```json
{
  "expression": "2 weeks from now",
  "date": "2025-01-29T12:00:00.000Z",
  "timestamp": 1738152000000,
  "meta": {
    "type": "relative",
    "components": ["2", "weeks", "from", "now"],
    "timezone": "UTC"
  }
}
```

### Error Response

```json
{
  "error": "Invalid expression",
  "code": "PARSE_ERROR",
  "message": "Could not parse the provided expression"
}
```

### Rate Limiting

- **Public clients**: 60 requests per minute per IP
- **Same-origin requests**: No limit

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until reset (Unix timestamp)

## Project Structure

```
TempusTotal/
├── app/
│   ├── api/parse/          # API endpoint
│   ├── components/         # React components
│   │   ├── date-picker.tsx # Main date picker
│   │   ├── api-docs.tsx    # API playground
│   │   └── ui/             # shadcn/ui components
│   ├── context/            # React contexts
│   ├── lib/                # Utilities
│   │   ├── date-parser.ts  # Core parsing logic
│   │   └── rate-limit.ts   # Rate limiting
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/ui/          # Shared components
├── hooks/                  # Custom hooks
├── lib/                    # Global utilities
├── __tests__/             # Test files
└── public/                # Static assets
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, shadcn/ui, Tailwind CSS
- **Date Handling**: date-fns, date-fns-tz
- **Validation**: Zod
- **Testing**: Vitest, Testing Library

## Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Settings

The date picker supports the following configurable settings:

- **Date Format**: ISO 8601, Unix timestamp, custom formats
- **Timezone**: Browser default or specific IANA timezone
- **Preserve Day of Month**: Keep day when adding months/years

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run validation: `npm run validate`
5. Commit with conventional commits: `git commit -m "feat: add feature"`
6. Push and create a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

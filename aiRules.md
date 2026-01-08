# AI Development Rules for TempusTotal

This document provides guidelines for AI assistants working on this codebase. For comprehensive contributing guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Project Overview

TempusTotal is a natural language date parser providing both a web UI and REST API built with Next.js 15, React 19, and TypeScript.

## Project Structure

```
TempusTotal/
├── app/                    # Next.js App Router
│   ├── api/parse/         # Date parsing API endpoint
│   ├── components/        # Page-specific components
│   │   └── ui/           # shadcn/ui components
│   ├── context/          # React Context providers
│   ├── lib/              # App utilities (date-parser, rate-limit)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/ui/         # Shared base components
├── hooks/                 # Custom React hooks
├── lib/                   # Global utilities
├── __tests__/            # Test files
└── public/               # Static assets
```

## Core Files

- `app/lib/date-parser.ts` - Core date parsing logic
- `app/api/parse/route.ts` - API endpoint
- `app/components/date-picker.tsx` - Main date picker component
- `app/context/settings-context.tsx` - User settings state

## Code Style Rules

### TypeScript
- Use strict TypeScript with explicit types
- No `any` type - use `unknown` if necessary
- Use `type` imports for type-only imports
- Handle null/undefined explicitly

### React
- Use functional components with hooks
- Keep components under 300 lines
- Extract complex logic into custom hooks
- Use proper prop types with interfaces

### Formatting
- 2 spaces for indentation
- Double quotes for strings
- Semicolons required
- Trailing commas in multiline

## Date Parser Rules

### Supported Expressions
1. **Relative**: now, today, yesterday, tomorrow
2. **Time offsets**: "in 3 days", "2 weeks from now", "3 months ago"
3. **Date math**: "today plus 2 weeks", "tomorrow minus 3 days"
4. **Fractional**: "1.5 days from now", "2.5 weeks ago"
5. **Advanced**: "6 months before sep 14", "2 weeks after dec 25"
6. **Weekdays**: "next friday", "last monday"

### Edge Cases to Handle
- Invalid/empty inputs → return null
- Ambiguous dates → use reasonable defaults
- Month overflow (e.g., Feb 30) → clamp to valid date
- Malicious input → validate and sanitize

## Testing Requirements

- All date parsing logic must have tests
- Use Vitest with fake timers for date tests
- Test edge cases and error handling
- Maintain >70% coverage on core logic

## API Guidelines

- Validate all input with Zod schemas
- Return consistent error responses
- Include rate limiting
- Set appropriate cache headers

## Performance Guidelines

- Memoize expensive calculations
- Avoid unnecessary re-renders
- Keep bundle size minimal
- Use lazy loading for heavy components

## Security Guidelines

- Sanitize all user input
- No XSS vulnerabilities
- Proper CORS configuration
- Never expose secrets in code

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run validate     # Run all checks
```

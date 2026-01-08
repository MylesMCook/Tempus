# TempusTotal Contributing Guidelines

This document outlines the coding standards, architectural patterns, and best practices for contributing to TempusTotal.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Code Style](#code-style)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [React & Component Guidelines](#react--component-guidelines)
6. [API Guidelines](#api-guidelines)
7. [Testing Standards](#testing-standards)
8. [Performance Guidelines](#performance-guidelines)
9. [Security Guidelines](#security-guidelines)
10. [Git Workflow](#git-workflow)

---

## Project Overview

TempusTotal is a natural language date parser providing both a web UI and REST API. The project uses:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 19, shadcn/ui, Tailwind CSS
- **Date Handling**: date-fns, date-fns-tz
- **Validation**: Zod

---

## Architecture

### Directory Structure

```
TempusTotal/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── parse/                # Date parsing endpoint
│   ├── components/               # Page-specific components
│   │   └── ui/                   # shadcn/ui components
│   ├── context/                  # React Context providers
│   ├── lib/                      # App-specific utilities
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Shared components
│   └── ui/                       # Base UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Global utilities
├── public/                       # Static assets
├── __tests__/                    # Test files
└── types/                        # Global type definitions
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `date-picker.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-media-query.ts` |
| Utilities | kebab-case | `date-parser.ts` |
| Context | kebab-case with `-context` suffix | `settings-context.tsx` |
| Types | kebab-case | `api-types.ts` |
| Tests | same as source with `.test` | `date-parser.test.ts` |

### Import Order

Organize imports in this order, separated by blank lines:

```typescript
// 1. React/Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { format } from "date-fns";
import { z } from "zod";

// 3. Internal components
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/app/components/date-picker";

// 4. Internal utilities/hooks
import { cn } from "@/lib/utils";
import { useSettings } from "@/app/context/settings-context";

// 5. Types
import type { DateParseResult } from "@/types/api";
```

---

## Code Style

### General Principles

1. **Readability over cleverness** - Write code that is easy to understand
2. **Single responsibility** - Each function/component should do one thing well
3. **DRY (Don't Repeat Yourself)** - Extract common logic into utilities
4. **Explicit over implicit** - Be clear about types and intentions

### Formatting

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Required in multiline
- **Max line length**: 100 characters
- **Max file length**: 500 lines (split larger files)

### Naming Conventions

```typescript
// Constants: SCREAMING_SNAKE_CASE
const MAX_EXPRESSION_LENGTH = 200;
const API_RATE_LIMIT = 60;

// Variables/functions: camelCase
const currentDate = new Date();
function parseExpression(input: string) {}

// Components: PascalCase
function DatePicker() {}
function ApiDocumentation() {}

// Types/Interfaces: PascalCase
interface ParseResult {}
type DateFormat = "iso" | "unix" | "formatted";

// Private/internal: prefix with underscore
function _tokenize(input: string) {}
const _cache = new Map();

// Boolean variables: use is/has/should prefix
const isValid = true;
const hasError = false;
const shouldPreserveDayOfMonth = true;
```

### Comments

```typescript
// Single-line comments for brief explanations
const offset = getTimezoneOffset(); // Returns offset in minutes

/**
 * Multi-line JSDoc for functions and complex logic.
 * @param expression - The natural language date expression
 * @param options - Configuration options
 * @returns Parsed date result or null if invalid
 */
function parseDate(expression: string, options?: ParseOptions): ParseResult | null {
  // Implementation
}

// TODO: Brief description of what needs to be done
// FIXME: Description of the bug that needs fixing
// NOTE: Important information about the code
```

---

## TypeScript Guidelines

### Strict Mode Requirements

The project uses TypeScript strict mode. All code must:

- Have explicit type annotations for function parameters
- Handle `null` and `undefined` explicitly
- Avoid `any` type (use `unknown` if truly necessary)
- Use type guards for narrowing

### Type Definitions

```typescript
// Prefer interfaces for objects that may be extended
interface ParseOptions {
  format?: string;
  timezone?: string;
  preserveDayOfMonth?: boolean;
}

// Use type for unions, primitives, and computed types
type ExpressionType = "relative" | "weekday" | "date-math" | "advanced";
type DateInput = string | Date | number;

// Use readonly for immutable data
interface Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
}

// Use const assertions for literal types
const SUPPORTED_FORMATS = ["iso", "unix", "rfc2822"] as const;
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];
```

### Avoid These Patterns

```typescript
// ❌ Avoid any
function process(data: any) {}

// ✅ Use proper types or unknown
function process(data: unknown) {
  if (isValidData(data)) {
    // data is now typed
  }
}

// ❌ Avoid non-null assertions (!.)
const value = obj.prop!;

// ✅ Handle null explicitly
const value = obj.prop ?? defaultValue;

// ❌ Avoid type assertions unless necessary
const result = data as ParseResult;

// ✅ Use type guards
function isParseResult(data: unknown): data is ParseResult {
  return typeof data === "object" && data !== null && "date" in data;
}
```

---

## React & Component Guidelines

### Component Structure

```typescript
"use client"; // Only if needed for client-side features

import { useState, useCallback, useMemo } from "react";
import type { ComponentProps } from "react";

// Types at the top
interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
}

// Constants
const DEFAULT_FORMAT = "yyyy-MM-dd";

// Component definition
export function DatePicker({
  value,
  onChange,
  disabled = false,
  className,
}: DatePickerProps) {
  // 1. Hooks (state, refs, context)
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();

  // 2. Derived state / memoized values
  const formattedValue = useMemo(
    () => value ? format(value, settings.format) : "",
    [value, settings.format]
  );

  // 3. Callbacks
  const handleSelect = useCallback((date: Date) => {
    onChange(date);
    setIsOpen(false);
  }, [onChange]);

  // 4. Effects (if any)

  // 5. Early returns for edge cases
  if (disabled) {
    return <div className={className}>{formattedValue}</div>;
  }

  // 6. Render
  return (
    <div className={cn("date-picker", className)}>
      {/* Component JSX */}
    </div>
  );
}
```

### Component Best Practices

1. **Keep components focused** - Under 200 lines ideally, 300 max
2. **Extract logic into hooks** - Complex state logic should be in custom hooks
3. **Use composition** - Prefer composition over prop drilling
4. **Memoize expensive operations** - Use `useMemo` and `useCallback` appropriately
5. **Handle loading and error states** - Always account for async operations

### Accessibility Requirements

```typescript
// All interactive elements must be accessible
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-expanded={isOpen}
  disabled={isDisabled}
>
  <CloseIcon aria-hidden="true" />
</button>

// Form inputs must have labels
<label htmlFor="date-input">Date</label>
<input
  id="date-input"
  type="text"
  aria-describedby="date-hint"
  aria-invalid={hasError}
/>
<span id="date-hint">Enter a date in MM/DD/YYYY format</span>

// Use semantic HTML
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

---

## API Guidelines

### Endpoint Structure

```typescript
// app/api/[endpoint]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema validation
const RequestSchema = z.object({
  expression: z.string().min(1).max(200),
  format: z.string().optional(),
});

// Response types
interface SuccessResponse {
  success: true;
  data: ParseResult;
  meta?: ResponseMeta;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse and validate input
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const validated = RequestSchema.safeParse(params);

    if (!validated.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request parameters",
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // 2. Process request
    const result = await processRequest(validated.data);

    // 3. Return success response
    return NextResponse.json<SuccessResponse>(
      { success: true, data: result },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    // 4. Handle errors
    console.error("[API Error]", error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `PARSE_ERROR` | 400 | Could not parse expression |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing Standards

### Test File Structure

```typescript
// __tests__/date-parser.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { parseExpression } from "@/app/lib/date-parser";

describe("parseExpression", () => {
  beforeEach(() => {
    // Reset mocks, set fixed date, etc.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("relative expressions", () => {
    it("should parse 'today' correctly", () => {
      const result = parseExpression("today");
      expect(result).toEqual(expect.objectContaining({
        type: "relative",
        date: expect.any(Date),
      }));
    });

    it("should handle invalid input gracefully", () => {
      const result = parseExpression("not a date");
      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it.each([
      ["", null],
      ["   ", null],
      ["<script>alert(1)</script>", null],
    ])("should return null for input: %s", (input, expected) => {
      expect(parseExpression(input)).toBe(expected);
    });
  });
});
```

### Test Coverage Requirements

- **Unit tests**: All utility functions and hooks
- **Integration tests**: API endpoints
- **Component tests**: Critical UI components
- **Minimum coverage**: 80% for core logic (`date-parser.ts`, `rate-limit.ts`)

### Testing Patterns

```typescript
// Use descriptive test names
it("should parse 'next friday' as the upcoming Friday when today is Monday", () => {});

// Group related tests
describe("when preserveDayOfMonth is true", () => {
  it("should keep day 31 when adding months", () => {});
  it("should handle February edge cases", () => {});
});

// Test error cases
it("should throw ParseError when expression exceeds max length", () => {
  expect(() => parseExpression("a".repeat(201))).toThrow(ParseError);
});

// Mock external dependencies
vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));
```

---

## Performance Guidelines

### Optimization Strategies

1. **Memoization** - Cache expensive computations

```typescript
// Memoize complex calculations
const parsedDate = useMemo(
  () => parseExpression(expression),
  [expression]
);

// Memoize callbacks passed to children
const handleChange = useCallback(
  (value: string) => setExpression(value),
  []
);
```

2. **Code Splitting** - Lazy load heavy components

```typescript
import dynamic from "next/dynamic";

const ApiDocs = dynamic(
  () => import("@/app/components/api-docs"),
  { loading: () => <Skeleton /> }
);
```

3. **Debouncing** - Rate limit user input processing

```typescript
const debouncedParse = useMemo(
  () => debounce((expr: string) => {
    const result = parseExpression(expr);
    setResult(result);
  }, 300),
  []
);
```

### Bundle Size Guidelines

- Keep individual component files under 50KB
- Use tree-shakeable imports: `import { format } from "date-fns"`
- Avoid importing entire libraries
- Monitor bundle size with `next build` output

---

## Security Guidelines

### Input Validation

```typescript
// Always validate and sanitize user input
const ExpressionSchema = z.string()
  .min(1, "Expression is required")
  .max(200, "Expression too long")
  .refine(
    (val) => !/[<>{}]/.test(val),
    "Invalid characters in expression"
  );

// Sanitize before storing or displaying
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 200);
}
```

### API Security

1. **Rate limiting** - Enforce per-IP limits
2. **Input validation** - Validate all parameters with Zod
3. **CORS** - Configure appropriate origins
4. **Headers** - Set security headers via middleware

### Secrets Management

- Never commit secrets to git
- Use environment variables for sensitive data
- Document required env vars in `.env.example`

---

## Git Workflow

### Branch Naming

```
feature/add-timezone-support
fix/parse-negative-offset
refactor/extract-tokenizer
docs/api-examples
test/date-parser-edge-cases
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes nor adds
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(parser): add support for fractional time units

fix(api): handle timezone offset edge case
Fixes #123

refactor(components): extract date input into separate component

test(parser): add edge case tests for month boundaries
```

### Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why, not how
3. **Size**: Keep PRs focused and under 400 lines when possible
4. **Tests**: Include tests for new functionality
5. **Documentation**: Update docs if behavior changes

---

## Quick Reference

### Do's ✅

- Write TypeScript with proper types
- Use Zod for runtime validation
- Write tests for new features
- Follow component structure patterns
- Handle errors gracefully
- Keep functions small and focused

### Don'ts ❌

- Use `any` type
- Skip input validation
- Leave `console.log` in production code
- Create files over 500 lines
- Commit secrets or credentials
- Ignore TypeScript errors

---

*Last updated: January 2025*

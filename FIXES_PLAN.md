# TempusTotal Code Fixes Plan

This document outlines the planned fixes for issues identified in the codebase review.

---

## Issue #1: Race Condition in Rate Limiter

**File:** `app/api/parse/route.ts` (lines 86 and 216)

### Root Cause
The rate limiter's `check()` method is called twice for non-same-origin requests:
1. **Line 86:** To enforce the rate limit and reject if exceeded
2. **Line 216:** To get the `remaining` count for response headers

Each call to `check()` increments the usage counter (line 39 in `rate-limit.ts`), meaning external users consume 2 of their 60 allowed requests per actual API call. They effectively get only 30 requests per minute instead of 60.

### Fix Strategy
Store the result from the first `check()` call and reuse it for the response headers instead of calling `check()` again:

```typescript
// Before the rate limit check
let rateLimitResult: RateLimitResult | null = null

// During enforcement (line 86)
if (!isSameOrigin) {
  try {
    rateLimitResult = await publicLimiter.check(60, clientIp)
  } catch (err: any) {
    rateLimitResult = err  // Store the rejection result too
    // ... return 429 response
  }
}

// In success response (line 216-222)
// Remove the second check() call entirely, use stored rateLimitResult
const remainingRequests = rateLimitResult?.remaining ?? 200
```

### Risks
- Need to ensure the error object from the rejection has the same shape as success result
- The `RateLimitResult` type is already properly defined, so this should be type-safe

### Testing Needed
- Make external API calls and verify rate limit headers show correct remaining count
- Verify 60 requests are allowed per minute (not 30)

### Complexity: **Simple**

---

## Issue #2: localStorage in Server Context

**File:** `app/lib/date-parser.ts` (lines 45-58)

### Root Cause
The `getPreserveDayOfMonthSetting()` function attempts to read from `localStorage`, which doesn't exist in server-side contexts. While there is a `typeof window === "undefined"` guard, this pattern is problematic because:

1. The parser is used both client-side (UI) and server-side (API route)
2. The API route already passes settings via options, making the localStorage call unnecessary
3. Mixing browser storage access with core parsing logic violates separation of concerns
4. The unused `originalSetting` variable on line 672 suggests incomplete refactoring

### Fix Strategy
Make the parser a pure function that takes all configuration as explicit arguments:

1. **Remove `getPreserveDayOfMonthSetting()`** - Delete the function entirely
2. **Update `getPreserveDayOfMonth()` method** - Only use the override value
3. **Default to `true`** when no override is provided (current behavior)
4. **Remove the unused variable** on line 672

The parser should be deterministic and testable without any browser dependencies.

```typescript
// Remove this function entirely
// function getPreserveDayOfMonthSetting(): boolean { ... }

// Update the class method
private getPreserveDayOfMonth(): boolean {
  return this.preserveDayOfMonthOverride ?? true
}
```

### Risks
- Client-side usage currently relies on localStorage for persisting settings between sessions
- Need to verify that all callers pass the setting explicitly when needed
- The UI components already manage state via React context, so this shouldn't break anything

### Testing Needed
- API calls with `preserveDayOfMonth=true` and `preserveDayOfMonth=false`
- UI behavior when toggling the setting in the date picker
- Verify default behavior (should default to `true`)

### Complexity: **Simple**

---

## Issue #4: Memory Leak in Security Monitor

**File:** `lib/security-monitor.ts` (lines 18-25)

### Root Cause
The `SecurityMonitor` class creates an interval in its constructor that runs every 15 minutes:

```typescript
constructor() {
  setInterval(() => {
    this.pruneOldEvents()
  }, 15 * 60 * 1000)
}
```

Problems:
1. The interval is never cleared - no `clearInterval()` call exists
2. The class is instantiated as a module-level singleton (line 94)
3. In serverless/edge environments, this may cause issues with function cold starts
4. In long-running processes, the interval keeps the event loop alive unnecessarily

### Fix Strategy
Replace the interval-based cleanup with lazy cleanup - prune old events only when adding new events:

```typescript
private lastPruneTime = Date.now()
private readonly pruneInterval = 15 * 60 * 1000

addEvent(event: SecurityEvent) {
  // Lazy pruning - only prune if enough time has passed
  const now = Date.now()
  if (now - this.lastPruneTime > this.pruneInterval) {
    this.pruneOldEvents()
    this.lastPruneTime = now
  }

  this.events.push(event)
  // ... rest of method
}
```

This approach:
- Eliminates the memory leak
- Works correctly in serverless environments
- Only does cleanup work when the monitor is actually being used
- Follows Joe Armstrong's principle: do work when needed, not speculatively

### Risks
- Old events may persist slightly longer if no new events are added
- This is acceptable since the monitor is only used for logging/alerting

### Testing Needed
- Verify events are still pruned after 15+ minutes of activity
- Check that old events don't accumulate indefinitely

### Complexity: **Simple**

---

## Issue #6: Remove Unused Dependencies

**File:** `package.json` (lines 61-65)

### Root Cause
The package.json contains dependencies for frameworks not used in this Next.js/React project:

```json
"@remix-run/react": "latest",
"@sveltejs/kit": "latest",
"svelte": "latest",
"vue": "latest",
"vue-router": "latest",
```

These are likely copy-paste artifacts or remnants from framework exploration. They:
- Increase `npm install` time
- Bloat `node_modules` directory
- Could cause version conflicts with actual dependencies
- Use `"latest"` which is dangerous for reproducible builds

### Fix Strategy
Simply remove these lines from package.json:

```json
// REMOVE these lines:
"@remix-run/react": "latest",
"@sveltejs/kit": "latest",
"svelte": "latest",
"vue": "latest",
"vue-router": "latest",
```

Also consider pinning `"crypto": "latest"` to a specific version (though `crypto` is a Node.js built-in and this dependency may be unnecessary).

### Risks
- Extremely low risk - these packages are not imported anywhere
- Running a grep for imports will confirm they're unused

### Testing Needed
- Run `npm install` to regenerate lock file
- Run `npm run build` to verify no missing dependencies
- Grep codebase for any imports from these packages (should find none)

### Complexity: **Simple**

---

## Issue #8: Add Missing ARIA Labels

**File:** `app/components/date-expression-tabs.tsx` (lines 52-62)

### Root Cause
The example expression buttons lack accessible names that describe their purpose:

```typescript
<button
  key={expression}
  onClick={() => onExampleClick(expression)}
  className="..."
>
  <span className="text-sm">{expression}</span>
</button>
```

While the visible text shows the expression (e.g., "3 weeks from now"), screen reader users won't understand that clicking fills the input. The buttons need:
1. An `aria-label` describing the action
2. A `type="button"` attribute (explicit is better than implicit)

### Fix Strategy
Add descriptive ARIA labels to the buttons:

```typescript
<button
  type="button"
  key={expression}
  onClick={() => onExampleClick(expression)}
  aria-label={`Use example: ${expression}`}
  className="..."
>
  <span className="text-sm">{expression}</span>
</button>
```

### Risks
- None - purely additive change for accessibility

### Testing Needed
- Test with screen reader (VoiceOver, NVDA) to verify announcement
- Verify button still works as expected

### Complexity: **Simple**

---

## Issue #9: Replace Inline Styles with Tailwind

**File:** `app/components/api-docs.tsx` (lines 283, 313-314, 516)

### Root Cause
The component uses inline styles that bypass Tailwind's design system:

```typescript
// Line 283
<Card className="w-full" style={{ maxWidth: "100%", overflowX: "hidden" }}>

// Lines 313-314
<div
  className="absolute left-0 right-0 border-b w-full"
  style={{ marginLeft: "-1rem", marginRight: "-1rem", width: "calc(100% + 2rem)" }}
></div>

// Line 516
style={{ maxWidth: "100%", wordBreak: "break-word" }}
```

Problems:
- Inline styles have highest CSS specificity, making them hard to override
- They don't respond to Tailwind's responsive prefixes
- Mix of systems makes the code harder to maintain
- The negative margin hack (lines 313-314) is especially fragile

### Fix Strategy
Replace with Tailwind utility classes:

```typescript
// Line 283 - Tailwind already has these utilities
<Card className="w-full max-w-full overflow-x-hidden">

// Lines 313-314 - Use negative margin utilities
<div className="absolute left-0 right-0 border-b -mx-4 w-[calc(100%+2rem)]" />

// Line 516 - Use Tailwind utilities
<pre className="... max-w-full break-words">
```

Note: The divider hack on lines 311-315 might be better solved by restructuring the component layout or using a full-width divider pattern.

### Risks
- The calculated width might need fine-tuning
- The visual appearance should be verified to match current behavior

### Testing Needed
- Visual regression testing on mobile and desktop
- Check the divider extends correctly
- Verify JSON response doesn't overflow container

### Complexity: **Simple**

---

## Issue #11: Await Async headers() Call

**File:** `app/lib/rate-limit.ts` (lines 52-53, 67-70, 78-82)

### Root Cause
In Next.js 15, the `headers()` function returns a `Promise<ReadonlyHeaders>` and must be awaited. The current code treats it synchronously:

```typescript
getClientIdentifier: (req: Request): string => {
  const headersList = headers()  // Returns Promise, not awaited!
  const forwardedFor = headersList.get("x-forwarded-for")  // Undefined behavior
  // ...
}
```

This appears to work currently because:
- Next.js may have backwards compatibility shims
- The headers object might be proxy-wrapped to work synchronously
- But this is undocumented behavior that will break

### Fix Strategy
Make all the helper methods async and await the headers:

```typescript
getClientIdentifier: async (req: Request): Promise<string> => {
  const headersList = await headers()
  // ... rest unchanged
},

getUniqueIdentifier: async (req: Request): Promise<string> => {
  const headersList = await headers()
  // ... rest unchanged
},

isSameOrigin: async (req: Request): Promise<boolean> => {
  const headersList = await headers()
  // ... rest unchanged
},
```

Then update the API route to await these calls:

```typescript
// In route.ts
const clientIp = await publicLimiter.getClientIdentifier(request)
const uniqueClient = await publicLimiter.getUniqueIdentifier(request)
const isSameOrigin = await publicLimiter.isSameOrigin(request)
```

### Risks
- Need to update all callers of these methods
- The API route is already async, so this is straightforward
- TypeScript will catch any missed await statements

### Testing Needed
- Verify rate limiting still works for external requests
- Check that same-origin detection works correctly
- Test in both development and production builds

### Complexity: **Moderate** (requires changes in multiple files)

---

## Summary

| Issue | Complexity | Files Changed | Risk Level |
|-------|------------|---------------|------------|
| #1 Rate Limiter Race Condition | Simple | 1 | Low |
| #2 localStorage in Server Context | Simple | 1 | Low |
| #4 Memory Leak in Security Monitor | Simple | 1 | Low |
| #6 Unused Dependencies | Simple | 1 | Very Low |
| #8 Missing ARIA Labels | Simple | 1 | None |
| #9 Inline Styles | Simple | 1 | Low |
| #11 Async headers() | Moderate | 2 | Low |

**Recommended Order of Implementation:**
1. Issue #6 (Unused Dependencies) - Quick win, zero risk
2. Issue #8 (ARIA Labels) - Quick win, improves accessibility
3. Issue #4 (Memory Leak) - Simple fix, prevents resource issues
4. Issue #2 (localStorage) - Clean architecture improvement
5. Issue #9 (Inline Styles) - CSS consistency
6. Issue #1 (Rate Limiter) - Important bug fix
7. Issue #11 (Async headers) - Future-proofing for Next.js

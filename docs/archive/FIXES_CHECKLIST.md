# Code Fixes Checklist

> Archived Next.js-era checklist. Companion: [FIXES_PLAN.md](FIXES_PLAN.md). Paths are obsolete.

Track progress on implementing the fixes identified in `FIXES_PLAN.md`.

## Fixes to Implement

- [x] **Issue #6: Remove unused dependencies** (`package.json`)
  - Remove Remix, Svelte, Vue dependencies
  - Run `npm install` to update lock file
  - Verify build succeeds

- [x] **Issue #8: Add missing ARIA labels** (`app/components/date-expression-tabs.tsx`)
  - Add `aria-label` to example buttons
  - Add `type="button"` attribute
  - Test with screen reader

- [x] **Issue #4: Fix memory leak in security monitor** (`lib/security-monitor.ts`)
  - Remove setInterval from constructor
  - Implement lazy pruning in addEvent()
  - Verify events are still cleaned up

- [x] **Issue #2: Fix localStorage in server context** (`app/lib/date-parser.ts`)
  - Remove getPreserveDayOfMonthSetting() function
  - Update getPreserveDayOfMonth() to use override only
  - Remove unused variable on line 672
  - Test API and UI behavior

- [x] **Issue #9: Replace inline styles with Tailwind** (`app/components/api-docs.tsx`)
  - Line 283: Replace Card inline styles
  - Lines 311-315: Replace divider inline styles
  - Line 516: Replace pre inline styles
  - Visual verification

- [x] **Issue #1: Fix rate limiter race condition** (`app/api/parse/route.ts`)
  - Store first check() result
  - Remove second check() call
  - Use stored result for headers
  - Test rate limit behavior

- [x] **Issue #11: Await async headers() call** (`app/lib/rate-limit.ts`, `app/api/parse/route.ts`)
  - Make getClientIdentifier async
  - Make getUniqueIdentifier async
  - Make isSameOrigin async
  - Update route.ts to await calls
  - Test rate limiting works

## Security Fixes (Added After Review)

- [x] **S1: Fix X-Forwarded-For header spoofing** (`app/lib/rate-limit.ts`)
  - Use LAST IP in chain (added by trusted proxy) not FIRST (attacker-controlled)

- [x] **S2: Fix same-origin bypass** (`app/lib/rate-limit.ts`)
  - Only trust NODE_ENV for development detection
  - Never trust client-supplied headers (Origin, Host, Referer)

- [x] **S3: Add API_KEY_SALT production check** (`lib/api-auth.ts`)
  - Throw error if API_KEY_SALT missing in production
  - Prevent weak default salt in deployed environments

- [x] **S4: Remove unused variable** (`app/api/parse/route.ts`)
  - Removed unused `uniqueClient` variable

- [x] **S5: Sanitize Zod validation errors** (`app/api/parse/route.ts`)
  - Only expose field name and message, not internal schema details

---

## Deferred Issues (TODO Comments Added)

These require more extensive refactoring. TODO comments added to relevant files:

- [ ] **Issue #3: Direct DOM manipulation** (`app/page.tsx:60-75`)
  - Replace document.querySelector hack with React state
  - Lift input value state to parent component

- [ ] **Issue #5: Duplicate files** (multiple locations)
  - `app/components/ui/tabs.tsx` vs `components/ui/tabs.tsx`
  - `hooks/use-toast.ts` vs `components/ui/use-toast.ts`
  - `hooks/use-mobile.tsx` vs `components/ui/use-mobile.tsx`
  - `app/globals.css` vs `styles/globals.css`
  - Action: Consolidate to standard shadcn/ui locations

- [ ] **Issue #7: DatePicker component too large** (`app/components/date-picker.tsx:1-7`)
  - 1274 lines - split into DatePickerInput, TimeSelector, DebugPanel, DatePickerSettings

- [ ] **Issue #10: Duplicated style jsx global** (`app/components/api-docs.tsx:542-544`)
  - Move syntax highlighting CSS to globals.css

---

## Verification Log

| Issue | Fixed | Verified | Commit |
| ----- | ----- | -------- | ------ |
| #6    |       |          |        |
| #8    |       |          |        |
| #4    |       |          |        |
| #2    |       |          |        |
| #9    |       |          |        |
| #1    |       |          |        |
| #11   |       |          |        |

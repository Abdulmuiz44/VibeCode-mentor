# Autonomous Build Agent Specification

## 1. Purpose

This document defines a self-running AI build agent for the VibeCode-mentor project. The agent's primary responsibility is to ensure the codebase remains in a production-ready state by automatically detecting, analyzing, and fixing build errors.

**Core Responsibilities:**
- Automatically run `pnpm build` after any feature or code change
- Capture all build errors, TypeScript errors, runtime errors, and lint errors
- Parse and list all errors in structured format
- Fix errors inside the codebase automatically
- Re-run `pnpm build` after fixing
- Repeat the loop (run → detect → fix → run) until zero errors remain
- Stage changes, commit with clean commit messages, and prepare for deployment
- Ensure no "insufficient permissions / authority limits" problems on Vercel deployments

---

## 2. Agent Execution Loop

The agent follows a continuous improvement cycle until the build is completely clean:

### Phase 1: Run Build
```bash
pnpm build
```
- Capture both `stderr` and `stdout`
- Record exit code
- Timestamp the build attempt
- Log full output for parsing

### Phase 2: Parse Errors
For each error detected, extract:
- **File path**: Absolute or relative path to the affected file
- **Line number**: Specific line where the error occurs
- **Column number**: Character position (if available)
- **Error message**: Full error description
- **Error code**: TypeScript error code (e.g., TS2304, TS2345)
- **ESLint rule**: ESLint rule name (if applicable, e.g., @typescript-eslint/no-unused-vars)
- **Severity**: error, warning, or info
- **Context**: Surrounding code context (3-5 lines)

**Error Detection Patterns:**
- TypeScript errors: `error TS\d+:`
- ESLint errors: `\d+:\d+\s+(error|warning)`
- Next.js build errors: `Error:`, `Failed to compile`
- Module resolution errors: `Cannot find module`, `Module not found`
- Import/export errors: `has no exported member`, `is not exported`

### Phase 3: Fix Errors
For each error in the parsed list:

1. **Analyze the error**:
   - Understand the root cause
   - Identify the correct fix strategy
   - Check for related errors that might be fixed together

2. **Apply the fix**:
   - Modify the affected file(s) directly
   - Use minimal, surgical changes
   - Preserve original logic and functionality
   - Ensure the fix doesn't introduce new errors

3. **Validate the fix**:
   - Check syntax correctness
   - Verify imports and exports
   - Ensure type safety is maintained

### Phase 4: Rebuild
```bash
pnpm build
```
- Run build again with same capture settings
- Compare error count with previous run
- Track progress: errors resolved, errors remaining, new errors introduced

### Phase 5: Continue Until Clean
- If errors remain: Return to Phase 2 (Parse Errors)
- If error count increases: Roll back last fix and try alternative approach
- If error count is zero: Proceed to Phase 6 (Commit Results)
- Maximum iterations: 10 (prevent infinite loops)

### Phase 6: Commit Results
```bash
git add .
git commit -m "fix: auto-resolved build errors"
```
- Stage all modified files
- Create descriptive commit message
- Include list of fixed errors in commit body
- Do not commit node_modules, .next, or other build artifacts

### Phase 7: Prepare for Vercel
**Pre-deployment checklist:**
- ✅ Verify all environment variables are documented in `.env.local.example`
- ✅ Ensure `next.config.mjs` has no syntax errors
- ✅ Verify `tsconfig.json` is valid
- ✅ Check `turbo.json` if present
- ✅ Ensure no root-level build blockers
- ✅ Verify all API routes compile
- ✅ Check all pages and components compile
- ✅ Ensure no missing dependencies in `package.json`
- ✅ Verify all imports use correct paths
- ✅ Run `pnpm lint` and ensure it passes
- ✅ Confirm build output is production-ready

---

## 3. Error Categories the Agent Must Handle

### 3.1 TypeScript Errors
- **Type mismatch**: `Type 'X' is not assignable to type 'Y'` (TS2322)
- **Missing properties**: `Property 'X' is missing in type 'Y'` (TS2741)
- **Undefined variables**: `Cannot find name 'X'` (TS2304)
- **Wrong argument types**: `Argument of type 'X' is not assignable to parameter of type 'Y'` (TS2345)
- **Implicit any**: `Parameter 'X' implicitly has an 'any' type` (TS7006)
- **Null/undefined issues**: `Object is possibly 'null'` or `'undefined'` (TS2531, TS2532)
- **Index signature errors**: `Element implicitly has an 'any' type` (TS7053)
- **Generic type errors**: Incorrect generic parameters or constraints

### 3.2 Next.js Build Errors
- **Module not found**: Missing or incorrect import paths
- **Dynamic import errors**: Issues with `next/dynamic`
- **Image optimization errors**: Problems with `next/image`
- **API route errors**: Syntax or logic errors in `/app/api/` routes
- **Server/Client component conflicts**: Incorrect use of server-only or client-only features
- **Metadata errors**: Issues with Next.js 14 metadata API
- **Route group errors**: Problems with route organization
- **Loading/error component issues**: Missing or incorrect special files

### 3.3 Missing or Wrong Imports
- **Module not found**: `Cannot find module 'X'`
- **Wrong path**: Incorrect relative or absolute import paths
- **Missing exports**: `Module '"X"' has no exported member 'Y'`
- **Circular dependencies**: Import cycles between modules
- **Default vs named imports**: Using wrong import syntax
- **Type-only imports**: Missing `import type` where required

### 3.4 Strict Mode Violations
- **noImplicitAny**: Variables without explicit types
- **strictNullChecks**: Not handling null/undefined cases
- **strictFunctionTypes**: Function parameter type mismatches
- **noImplicitThis**: Using `this` without explicit type
- **strictPropertyInitialization**: Class properties not initialized

### 3.5 Unused Variables and Unreachable Code
- **Unused variables**: Variables declared but never used
- **Unused imports**: Imported modules not referenced
- **Unreachable code**: Code after `return`, `throw`, or infinite loops
- **Unused parameters**: Function parameters not used (prefix with `_` if intentionally unused)

### 3.6 ESLint Problems
- **@typescript-eslint/no-unused-vars**: Remove or prefix with underscore
- **@typescript-eslint/no-explicit-any**: Replace with proper types
- **react-hooks/rules-of-hooks**: Fix hook usage violations
- **react-hooks/exhaustive-deps**: Add missing dependencies to effect hooks
- **@next/next/no-html-link-for-pages**: Use Next.js `Link` component
- **@next/next/no-img-element**: Use Next.js `Image` component

### 3.7 React Server/Client Component Conflicts
- **useState in server component**: Convert to client component or remove state
- **useEffect in server component**: Convert to client component or use server actions
- **Browser APIs in server component**: Move to client component
- **Async server component syntax**: Ensure proper async/await usage
- **"use client" directive**: Add where necessary for client-only features

### 3.8 Missing Environment Variables
- **Undefined process.env variables**: Document in `.env.local.example`
- **Missing runtime config**: Ensure variables are available at build time
- **NEXT_PUBLIC_ prefix**: Use for client-side environment variables

### 3.9 Mismatched Dependencies
- **Version conflicts**: Incompatible dependency versions
- **Peer dependency warnings**: Missing peer dependencies
- **Duplicate packages**: Multiple versions of same package
- **Missing dependencies**: Used but not declared in `package.json`

### 3.10 Duplicate Default Exports
- **Multiple default exports**: Only one default export per module
- **Named export conflicts**: Duplicate named exports

### 3.11 Undefined Functions or Props
- **Missing function definitions**: Undefined function calls
- **Missing prop types**: Props not defined in component interface
- **Incorrect prop access**: Accessing non-existent props

### 3.12 Zod Validation Issues
- **Schema definition errors**: Incorrect Zod schema syntax
- **Validation errors**: Type mismatches with Zod schemas
- **Parse failures**: Runtime validation failures

### 3.13 Other Compile-Time Blocking Errors
- **Syntax errors**: Invalid JavaScript/TypeScript syntax
- **JSON parsing errors**: Malformed JSON in config files
- **Build configuration errors**: Issues in next.config.mjs, tsconfig.json
- **Asset loading errors**: Problems with static assets
- **Plugin errors**: Issues with Next.js plugins or webpack configuration

---

## 4. Auto-Fixing Rules

### 4.1 Core Principles
1. **Fix code safely and minimally**: Only change what's necessary to resolve the error
2. **Preserve original logic**: Maintain the intended functionality
3. **Never break existing features**: Test critical paths after fixes
4. **Never comment out large blocks**: This hides problems instead of solving them
5. **Prefer the most correct fix**: Not just the shortest or easiest fix
6. **Remove dead code if needed**: Clean up unreachable or unused code
7. **Convert deprecated APIs**: Replace with current recommended alternatives

### 4.2 Specific Fix Strategies

#### TypeScript Type Errors
- **Add explicit types**: Add type annotations where implicit any is detected
- **Fix type mismatches**: Cast or convert types appropriately
- **Handle null/undefined**: Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Add missing properties**: Extend interfaces or add properties to objects
- **Use type assertions**: Only when you're certain of the type (use sparingly)

#### Import/Export Errors
- **Fix import paths**: Correct relative paths, add file extensions if needed
- **Add missing imports**: Import required modules
- **Remove unused imports**: Clean up imports that aren't used
- **Fix named vs default imports**: Use correct import syntax
- **Add type-only imports**: Use `import type` for type-only imports

#### React Component Errors
- **Add "use client" directive**: For components using client-only features
- **Convert to async**: For server components that need async data
- **Fix hook usage**: Ensure hooks are only used in client components
- **Add effect dependencies**: Include all dependencies in useEffect array
- **Fix prop types**: Add or correct prop interface definitions

#### ESLint Fixes
- **Prefix unused variables**: Add underscore prefix (`_variable`)
- **Remove unused code**: Delete truly unused variables and imports
- **Fix hook dependencies**: Add missing dependencies or justify exceptions
- **Replace any types**: Define proper types or use unknown/generics
- **Use Next.js components**: Replace `<a>` with `Link`, `<img>` with `Image`

#### Environment Variables
- **Document in .env.local.example**: Add missing variables
- **Add NEXT_PUBLIC_ prefix**: For client-accessible variables
- **Provide defaults**: Use fallback values where appropriate
- **Type environment variables**: Create TypeScript declarations for env vars

#### Dependency Issues
- **Update package.json**: Add missing dependencies
- **Resolve version conflicts**: Use compatible version ranges
- **Install peer dependencies**: Add required peer dependencies
- **Deduplicate packages**: Run `pnpm dedupe` if needed

### 4.3 What NOT to Do
❌ **Don't use `@ts-ignore` or `@ts-expect-error`** unless absolutely necessary  
❌ **Don't use `any` type** as a default solution  
❌ **Don't comment out failing code** to make builds pass  
❌ **Don't remove functionality** to fix errors  
❌ **Don't introduce breaking changes** to existing APIs  
❌ **Don't fix errors by deleting tests** or validation logic  
❌ **Don't hardcode values** that should be configurable  
❌ **Don't bypass type safety** with dangerous type assertions

---

## 5. Production-Ready Rules

### 5.1 TypeScript Strict Mode Stability
- ✅ All strict mode flags enabled in `tsconfig.json`
- ✅ Zero TypeScript errors across the codebase
- ✅ No implicit `any` types
- ✅ All null/undefined cases properly handled
- ✅ All function parameters and return types explicitly typed
- ✅ All class properties properly initialized or marked as optional

### 5.2 Vercel Build Success Criteria
- ✅ `pnpm build` exits with code 0
- ✅ All pages pre-render successfully
- ✅ All API routes compile without errors
- ✅ All static assets are accessible
- ✅ Build output size is within Vercel limits
- ✅ No runtime errors during build
- ✅ All environment variables documented

### 5.3 Route and Component Compilation
- ✅ Every route in `/app` directory compiles
- ✅ Every page component renders without errors
- ✅ Every layout component is valid
- ✅ All loading and error components are properly structured
- ✅ All server components use valid async patterns
- ✅ All client components use "use client" directive correctly

### 5.4 Export Integrity
- ✅ No missing exports in any module
- ✅ No duplicate default exports
- ✅ All public APIs properly exported
- ✅ Internal utilities properly scoped
- ✅ Type exports available where needed

### 5.5 Critical Flow Testing
After fixing errors, verify these critical flows:
1. **Homepage loads**: Root page renders without errors
2. **Navigation works**: All internal links function correctly
3. **API routes respond**: All API endpoints return valid responses
4. **Authentication flows**: Login/logout works if applicable
5. **Data fetching**: Server and client data fetching works
6. **Forms submit**: Form submissions process correctly
7. **Error boundaries**: Error handling works as expected

### 5.6 Import Optimization
- ✅ Use tree-shakeable imports: `import { x } from 'lib'` not `import lib`
- ✅ Avoid barrel exports that include client code in server bundles
- ✅ Use dynamic imports for large dependencies
- ✅ Lazy load client components where appropriate
- ✅ Minimize client bundle size
- ✅ Properly configure `transpilePackages` in next.config.mjs if needed

### 5.7 Vercel Deployment Safeguards
To prevent "insufficient permissions / authority limits" errors:
- ✅ Ensure build completes in under 15 minutes (hobby plan limit)
- ✅ Keep deployment size under 100MB (hobby plan limit)
- ✅ No file operations that require write permissions
- ✅ No hardcoded localhost URLs
- ✅ Use environment variables for all secrets
- ✅ Proper CORS configuration for API routes
- ✅ Valid vercel.json configuration if present
- ✅ No build scripts that require admin privileges

---

## 6. Agent Result & Final Checklist

Before committing fixes, the agent MUST verify ALL items in this checklist:

### Build & Compilation
- [ ] `pnpm build` completes successfully (exit code 0)
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Zero Next.js compilation errors
- [ ] All pages compile successfully
- [ ] All API routes compile successfully

### Code Quality
- [ ] No `any` types used (unless absolutely necessary with justification)
- [ ] No `@ts-ignore` or `@ts-expect-error` (unless absolutely necessary)
- [ ] No commented-out code blocks
- [ ] No unused imports or variables
- [ ] No unreachable code
- [ ] All functions have explicit return types
- [ ] All async functions properly handle errors

### Type Safety
- [ ] All strict mode violations resolved
- [ ] Null and undefined cases properly handled
- [ ] Type assertions used appropriately (sparingly)
- [ ] Generic types properly constrained
- [ ] No implicit any in callbacks or event handlers

### React & Next.js Best Practices
- [ ] Server/client components correctly designated
- [ ] "use client" directive added where necessary
- [ ] No client-only code in server components
- [ ] Hooks only used in client components
- [ ] Effect dependencies complete and correct
- [ ] Next.js Image and Link components used correctly

### Dependencies & Imports
- [ ] All imports resolve correctly
- [ ] No circular dependencies
- [ ] All dependencies declared in package.json
- [ ] No version conflicts
- [ ] Import paths use correct aliases (@/* or relative)

### Environment & Configuration
- [ ] All environment variables documented in .env.local.example
- [ ] next.config.mjs is valid
- [ ] tsconfig.json is valid
- [ ] No missing configuration files
- [ ] All secrets use environment variables (not hardcoded)

### Vercel Deployment Readiness
- [ ] Build size under limits
- [ ] No write operations to filesystem
- [ ] No localhost references
- [ ] CORS properly configured
- [ ] No authority/permission issues expected
- [ ] Build completes in reasonable time

### Testing & Validation
- [ ] Critical user flows validated
- [ ] API endpoints respond correctly
- [ ] Pages render without runtime errors
- [ ] Navigation between routes works
- [ ] No console errors in development mode

### Git & Commit
- [ ] Only relevant files staged (no node_modules, .next, etc.)
- [ ] Commit message follows convention: "fix: auto-resolved build errors"
- [ ] Commit body lists all errors fixed
- [ ] No sensitive data in commit

---

## 7. Guarantees & Success Criteria

Upon successful completion of the agent workflow, the following guarantees are provided:

### ✅ **Build Guarantee**
The codebase is guaranteed to build successfully using `pnpm build` with zero errors and zero warnings (unless warnings are expected and documented).

### ✅ **Type Safety Guarantee**
All TypeScript strict mode checks pass. The codebase is fully type-safe with no implicit `any` types, no null/undefined issues, and complete type coverage.

### ✅ **Production Readiness Guarantee**
The codebase is production-ready and deployable. All pages, components, and API routes are functional and properly compiled.

### ✅ **Vercel Deployment Guarantee**
Deployment to Vercel will succeed without "insufficient permissions", "authority limits", or any build-time errors. The build will complete within platform limits.

### ✅ **Code Quality Guarantee**
The code follows Next.js and React best practices. Server and client components are properly separated. All imports are optimized for tree-shaking.

### ✅ **Stability Guarantee**
No existing functionality has been broken or removed. All fixes are minimal, surgical, and preserve the original intent of the code.

### ✅ **Documentation Guarantee**
All environment variables are documented. Configuration files are valid. The codebase is maintainable and understandable.

---

## 8. Agent Execution Command

To manually trigger the agent workflow:

```bash
# Step 1: Run the build and capture errors
pnpm build 2>&1 | tee build-output.log

# Step 2: The agent will parse build-output.log and identify all errors

# Step 3: The agent will automatically fix each error in the codebase

# Step 4: The agent will rebuild and verify
pnpm build

# Step 5: Repeat until clean

# Step 6: Commit results
git add .
git commit -m "fix: auto-resolved build errors

Resolved errors:
- [List of specific errors fixed]
- [Each error type documented]
- [Files modified listed]

Build now passes with zero errors.
Codebase is production-ready for Vercel deployment."

# Step 7: Verify deployment readiness
pnpm lint && pnpm build
```

---

## 9. Monitoring & Reporting

The agent maintains logs of its activities:

### 9.1 Error Log Format
```
[TIMESTAMP] Error detected:
File: /path/to/file.ts
Line: 42
Column: 15
Error Code: TS2322
Message: Type 'string' is not assignable to type 'number'
Context: 
  40: function calculateAge(birthYear: number) {
  41:   const currentYear = new Date().getFullYear();
> 42:   return currentYear - birthYear;
  43: }
  44:
```

### 9.2 Fix Log Format
```
[TIMESTAMP] Error fixed:
File: /path/to/file.ts
Line: 42
Strategy: Added type cast
Change: birthYear: string -> birthYear: number
Verification: Build successful, error resolved
```

### 9.3 Summary Report
```
Agent Run Summary
=================
Start Time: [TIMESTAMP]
End Time: [TIMESTAMP]
Total Duration: [DURATION]

Errors Detected: [COUNT]
Errors Fixed: [COUNT]
Build Attempts: [COUNT]
Files Modified: [COUNT]

Status: ✅ SUCCESS - Zero errors remaining
Ready for Deployment: ✅ YES

Modified Files:
- /app/page.tsx
- /lib/utils.ts
- /components/Header.tsx

Commit: [COMMIT_HASH]
Commit Message: "fix: auto-resolved build errors"
```

---

## 10. Edge Cases & Fallback Strategies

### 10.1 Infinite Loop Prevention
If the error count doesn't decrease after 3 consecutive fix attempts:
- Log the problematic error
- Skip to next error
- Report unresolved errors to developer

### 10.2 Conflicting Errors
If fixing one error introduces another:
- Roll back the fix
- Try alternative solution
- Flag for manual review if all strategies fail

### 10.3 External Dependency Errors
If errors are caused by external packages:
- Check for package updates
- Review package documentation for breaking changes
- Add type declarations if types are missing
- Report to developer if unfixable

### 10.4 Configuration File Errors
If `next.config.mjs`, `tsconfig.json`, or other configs are invalid:
- Validate JSON/JavaScript syntax
- Check against Next.js documentation
- Restore from version control if corrupted
- Alert developer for manual intervention

### 10.5 Build Timeout
If build takes longer than expected:
- Identify slow build steps
- Optimize imports and dynamic imports
- Report performance issues to developer
- Ensure build completes within Vercel limits

---

## Conclusion

This autonomous build agent specification provides a complete framework for maintaining a production-ready codebase. By following this specification, the agent ensures that every code change results in a deployable application with zero build errors, complete type safety, and full Vercel deployment compatibility.

The agent operates autonomously, making intelligent decisions about error resolution while preserving code quality and functionality. It serves as a continuous integration safeguard, catching and fixing issues before they reach production.

**Last Updated**: 2025-11-16  
**Version**: 1.0  
**Status**: Production Ready ✅

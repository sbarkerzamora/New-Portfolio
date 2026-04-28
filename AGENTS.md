# AGENTS.md - Agent Coding Guidelines

This file provides guidelines for AI agents operating in this codebase.

## Project Overview

- **Project Name**: New Portfolio Astro (AI Chat Portfolio)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with dark theme
- **Testing**: Vitest with React Testing Library
- **Package Manager**: Bun
- **AI SDK**: Vercel AI SDK v5
- **Profile Data**: Stored in `docs/profile.json`

## Build / Lint / Test Commands

```bash
# Development
bun run dev          # Start Next.js dev server on localhost:3000

# Build
bun run build        # Production build
bun run start        # Start production server

# Linting
bun run lint         # Run ESLint

# Testing
bun run test         # Run all tests
bun run test -- --run  # Run tests once (no watch mode)
bun run test:ui      # Run tests with Vitest UI
bun test <file>      # Run single test file
bun test -- <pattern>  # Run tests matching pattern
```

### Running a Single Test

```bash
# Run specific test file
bun test components/__tests__/MinimalChat.test.tsx

# Run tests matching a name pattern
bun test -- -t "test name"

# Run with coverage
bun test --coverage
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - all TypeScript rules enforced
- Use explicit types for function parameters and return types
- Use `type` for unions/interfaces, `interface` for object shapes
- Never use `any` - use `unknown` when type is truly unknown
- Use `path` aliases (`@/*`) for imports (e.g., `@/components/ui`)

### React / Next.js

- Use Server Components by default; add `'use client'` only when needed
- Use `next/dynamic` for lazy-loading heavy components
- Follow Vercel React best practices (see `.agents/skills/vercel-react-best-practices/AGENTS.md`)
- Avoid barrel file imports from large libraries
- Use `React.cache()` for server-side request deduplication
- Parallelize independent data fetches with `Promise.all()`
- Use Suspense boundaries strategically for faster initial paint

### Component Structure

- Place components in `components/` directory
- UI components go in `components/ui/`
- Group related components together
- Use descriptive component names (PascalCase)
- Export components as named exports

### Imports

```typescript
// Order: external → alias → relative
import React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SomeComponent } from './SomeComponent'
```

### Naming Conventions

- **Components**: PascalCase (e.g., `MinimalChat.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for magic numbers, camelCase otherwise
- **Props**: Descriptive names, use `interface` for prop types

### Error Handling

- Use try-catch for async operations
- Never expose API keys in error messages
- Return appropriate HTTP status codes in API routes
- Log errors appropriately (avoid logging sensitive data)
- Validate all API inputs with Zod schemas

### CSS / Tailwind

- Use Tailwind utility classes for styling
- Use `cn()` utility (`lib/utils.ts`) for conditional classes
- Avoid custom CSS when Tailwind suffices
- Follow dark theme (this is a dark-only portfolio)

### Testing

- Tests go in `__tests__` folder or alongside components with `.test.tsx`
- Use `@testing-library/react` for component tests
- Use `vitest.setup.ts` for test configuration
- Mock external dependencies appropriately
- Test both success and error cases

### File Organization

```
app/
  api/           # API routes
  page.tsx       # Main page
  layout.tsx     # Root layout
  globals.css    # Global styles
components/
  ui/            # shadcn/ui components
  *.tsx          # Feature components
lib/
  utils.ts       # Utility functions
  profile.ts    # Profile data loader
contexts/       # React contexts
docs/
  profile.json   # Profile data source
```

### Environment Variables

- Never commit secrets to repository
- Use `.env.local` for local development
- Copy `.env.example` as template for new variables
- Required variables:
  - `OPENROUTER_API_KEY` — from https://openrouter.ai/keys
  - `OPENROUTER_MODEL` — optional, defaults to `openai/gpt-4o-mini`

### API Routes

- Validate all inputs using Zod
- Return proper error responses with status codes
- Use `NextResponse` for responses
- Handle async operations with proper error catching

### Animations

- This project uses GSAP, Motion, and Three.js for animations
- Follow existing animation patterns in components
- Use `useGSAP` hook from `@gsap/react` for React-safe GSAP

## Available Skills

This project has skills installed for:
- **Vercel React Best Practices** - Performance optimization rules
- **Frontend Design** - UI/UX guidelines
- **Remotion** - Video generation (if needed)

See `.agents/skills/` directory for details.

## Key Files

- `docs/profile.json` - Profile data (name, experience, projects, skills)
- `app/api/chat/route.ts` - AI chat endpoint
- `app/api/cv/route.ts` - PDF CV generation
- `components/MinimalChat.tsx` - Main chat component
- `lib/profile.ts` - Profile data loader
